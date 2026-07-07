locals {
  waf_enabled = var.enable_waf
}

resource "aws_wafv2_web_acl" "frontend" {
  count = local.waf_enabled ? 1 : 0

  provider = aws.us_east_1

  name        = "${var.project_name}-frontend-${var.environment}"
  description = "WAF for CloudFront frontend distribution"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimit"
    priority = 0

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = var.waf_rate_limit
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-frontend-rate-${var.environment}"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-frontend-common-${var.environment}"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-frontend-bad-inputs-${var.environment}"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-frontend-waf-${var.environment}"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "${var.project_name}-frontend-waf-${var.environment}"
  }
}

resource "aws_wafv2_web_acl" "api" {
  count = local.waf_enabled ? 1 : 0

  name        = "${var.project_name}-api-${var.environment}"
  description = "WAF for API Gateway HTTP API"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimit"
    priority = 0

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = var.waf_rate_limit
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-api-rate-${var.environment}"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-api-common-${var.environment}"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-api-bad-inputs-${var.environment}"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-api-waf-${var.environment}"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "${var.project_name}-api-waf-${var.environment}"
  }
}

resource "aws_cloudwatch_log_group" "waf_frontend" {
  count = local.waf_enabled ? 1 : 0

  provider = aws.us_east_1

  name              = "aws-waf-logs-${var.project_name}-frontend-${var.environment}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "waf_api" {
  count = local.waf_enabled ? 1 : 0

  name              = "/aws/waf/${var.project_name}-api-${var.environment}"
  retention_in_days = 14
}

resource "aws_wafv2_web_acl_logging_configuration" "frontend" {
  count = local.waf_enabled ? 1 : 0

  provider = aws.us_east_1

  log_destination_configs = [aws_cloudwatch_log_group.waf_frontend[0].arn]
  resource_arn            = aws_wafv2_web_acl.frontend[0].arn
}

resource "aws_wafv2_web_acl_logging_configuration" "api" {
  count = local.waf_enabled ? 1 : 0

  log_destination_configs = [aws_cloudwatch_log_group.waf_api[0].arn]
  resource_arn            = aws_wafv2_web_acl.api[0].arn
}

resource "aws_wafv2_web_acl_association" "api" {
  count = local.waf_enabled ? 1 : 0

  resource_arn = aws_apigatewayv2_stage.default.arn
  web_acl_arn  = aws_wafv2_web_acl.api[0].arn
}
