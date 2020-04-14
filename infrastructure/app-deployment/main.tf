locals {
  appUrl = "${var.app_name}%{if terraform.workspace != "production"}.${terraform.workspace}%{endif}.${var.domain}"
}

provider "aws" {
  region  = "eu-west-2"
  version = "~> 2.6"
}

provider "aws" {
  alias   = "us"
  region  = "us-east-1"
  version = "~> 2.6"
}

data "aws_route53_zone" "zone" {
  name = var.domain
}

resource "aws_route53_record" "app" {
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = local.appUrl
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

# app s3 bucket
resource "aws_s3_bucket" "app_bucket" {
  bucket = local.appUrl

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  tags = {
    Environment = "${terraform.workspace}"
  }
}

data "aws_acm_certificate" "ssl" {
  provider    = aws.us // AWS requires SSL certificates to live in their first availability zone.
  domain      = var.domain
  statuses    = ["ISSUED"]
  most_recent = true
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = ["${local.appUrl}"]
  is_ipv6_enabled     = true

  
  origin {
    domain_name = aws_s3_bucket.app_bucket.website_endpoint
    origin_id   = "S3-${local.appUrl}"

    custom_origin_config {
      http_port                = "80"
      https_port               = "443"
      origin_keepalive_timeout = 5
      origin_protocol_policy   = "http-only"
      origin_ssl_protocols     = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.ssl.arn
    minimum_protocol_version = "TLSv1"
    ssl_support_method       = "sni-only"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${local.appUrl}"
    compress         = "true"

    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = terraform.workspace == "production" ? 86400 : 0
    max_ttl                = terraform.workspace == "production" ? 31536000 : 0
  }

  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 300
  }
}
