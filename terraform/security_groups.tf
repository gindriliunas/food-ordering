resource "aws_security_group" "management" {
  name        = "${var.project_name}-sg-management-${var.environment}"
  description = "Management tier - future bastion or CI runner access"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-sg-management-${var.environment}"
    Tier = "management"
  }
}

resource "aws_security_group" "data" {
  name        = "${var.project_name}-sg-data-${var.environment}"
  description = "Data tier - ingress from compute security group only"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-sg-data-${var.environment}"
    Tier = "data"
  }
}

resource "aws_security_group" "compute" {
  name        = "${var.project_name}-sg-compute-${var.environment}"
  description = "Compute tier - future Lambda ENI or container workloads"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-sg-compute-${var.environment}"
    Tier = "compute"
  }
}

resource "aws_security_group_rule" "management_egress_https" {
  type              = "egress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = [var.vpc_cidr]
  security_group_id = aws_security_group.management.id
  description       = "HTTPS within VPC"
}

resource "aws_security_group_rule" "compute_ingress_from_management" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.compute.id
  source_security_group_id = aws_security_group.management.id
  description              = "Admin access from management tier"
}

resource "aws_security_group_rule" "compute_egress_to_data" {
  type                     = "egress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.compute.id
  source_security_group_id = aws_security_group.data.id
  description              = "HTTPS to data tier"
}

resource "aws_security_group_rule" "data_ingress_from_compute" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.data.id
  source_security_group_id = aws_security_group.compute.id
  description              = "HTTPS from compute tier"
}
