resource "aws_sns_topic" "order_events" {
  name = "${var.project_name}-order-events-${var.environment}"
}

resource "aws_sqs_queue" "order_processing_dlq" {
  name = "${var.project_name}-order-processing-dlq-${var.environment}"
  message_retention_seconds = 1209600
}

resource "aws_sqs_queue" "order_processing" {
  name                       = "${var.project_name}-order-processing-${var.environment}"
  visibility_timeout_seconds = 60
  receive_wait_time_seconds  = 10

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.order_processing_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sns_topic_subscription" "order_events_to_sqs" {
  topic_arn = aws_sns_topic.order_events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.order_processing.arn
}

resource "aws_sqs_queue_policy" "order_processing" {
  queue_url = aws_sqs_queue.order_processing.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowSNSToSendMessage"
        Effect    = "Allow"
        Principal = { Service = "sns.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.order_processing.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.order_events.arn
          }
        }
      }
    ]
  })
}
