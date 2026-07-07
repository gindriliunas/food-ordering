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

variable "vpc_cidr" {
  description = "CIDR block for the application VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "enable_waf" {
  description = "Enable AWS WAF on CloudFront and API Gateway (adds ~$20+/mo)"
  type        = bool
  default     = false
}

variable "waf_rate_limit" {
  description = "WAF rate limit per IP (requests per 5 minutes) when enable_waf is true"
  type        = number
  default     = 2000
}

variable "allowed_cors_origins" {
  description = "Allowed CORS origins for the HTTP API"
  type        = list(string)
  default     = ["*"]
}

