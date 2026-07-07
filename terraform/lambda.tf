locals {
  lambda_handlers = toset(["createOrder", "getOrder", "listOrders", "deleteOrder", "processOrder"])

  lambda_env = {
    ORDERS_TABLE_NAME      = aws_dynamodb_table.orders.name
    ORDER_EVENTS_TOPIC_ARN = aws_sns_topic.order_events.arn
  }
}

data "archive_file" "lambda" {
  for_each    = local.lambda_handlers
  type        = "zip"
  source_file = "${path.module}/../dist/${each.key}.js"
  output_path = "${path.module}/../dist/${each.key}.zip"
}

resource "aws_lambda_function" "handlers" {
  for_each = local.lambda_handlers

  function_name = "${var.project_name}-${each.key}-${var.environment}"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "${each.key}.handler"
  runtime       = "nodejs20.x"
  timeout       = each.key == "processOrder" ? 30 : 10
  memory_size   = 256

  filename         = data.archive_file.lambda[each.key].output_path
  source_code_hash = data.archive_file.lambda[each.key].output_base64sha256

  environment {
    variables = local.lambda_env
  }
}

resource "aws_lambda_event_source_mapping" "order_processing" {
  event_source_arn = aws_sqs_queue.order_processing.arn
  function_name    = aws_lambda_function.handlers["processOrder"].arn
  batch_size       = 5
  enabled          = true
}
