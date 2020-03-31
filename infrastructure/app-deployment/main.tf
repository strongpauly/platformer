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

