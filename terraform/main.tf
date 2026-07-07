terraform {
  required_version = ">= 1.0"

  backend "s3" {
    bucket         = "food-ordering-terraform-state-631026310596-us-east-1-an"
    key            = "food-ordering/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "food-ordering-terraform-locks"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "food-ordering-api"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

data "aws_caller_identity" "current" {}
