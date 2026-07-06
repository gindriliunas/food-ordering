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
