terraform {
  backend "s3" {
    bucket = "platformer-potsides-com-terraform-state"
    key    = "terraform.tfstate"
    region = "eu-west-2"
  }
}
