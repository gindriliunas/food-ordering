variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "eu-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "food-ordering"
}

variable "demo_user_password" {
  description = "Password for the pre-created demo Cognito user"
  type        = string
  sensitive   = true
  default     = "DemoKitchen1!"
}

