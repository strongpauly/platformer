provider "aws" {
  region  = "eu-west-2"
  version = "~> 2.6"
}

provider "aws" {
  alias   = "us"
  region  = "us-east-1"
  version = "~> 2.6"
}

module "app" {
  source = "./app-deployment"
  domain = "potsides.com"
  app_name = "platformer"
}