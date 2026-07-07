output "api_url" {
  description = "Base URL of the HTTP API"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "orders_table_name" {
  description = "DynamoDB orders table name"
  value       = aws_dynamodb_table.orders.name
}

output "order_events_topic_arn" {
  description = "SNS topic ARN for order events"
  value       = aws_sns_topic.order_events.arn
}

output "order_processing_queue_url" {
  description = "SQS queue URL for order processing"
  value       = aws_sqs_queue.order_processing.url
}

output "lambda_functions" {
  description = "Deployed Lambda function names"
  value       = { for k, v in aws_lambda_function.handlers : k => v.function_name }
}

output "frontend_bucket_name" {
  description = "S3 bucket for the Vue frontend"
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_url" {
  description = "CloudFront URL for the Vue frontend"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidation"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Cognito app client ID for the Vue frontend"
  value       = aws_cognito_user_pool_client.frontend.id
}

output "cognito_domain" {
  description = "Cognito hosted UI domain prefix"
  value       = aws_cognito_user_pool_domain.main.domain
}

output "demo_user_email" {
  description = "Pre-created demo login email"
  value       = aws_cognito_user.demo.username
}

output "vpc_id" {
  description = "Application VPC ID"
  value       = aws_vpc.main.id
}

output "private_subnet_id" {
  description = "Private subnet ID for future compute placement"
  value       = aws_subnet.private.id
}

output "security_group_ids" {
  description = "Tiered security group IDs"
  value = {
    management = aws_security_group.management.id
    compute    = aws_security_group.compute.id
    data       = aws_security_group.data.id
  }
}

output "waf_enabled" {
  description = "Whether AWS WAF is enabled"
  value       = var.enable_waf
}
