#!/bin/bash
set -e

PROFILE="${AWS_PROFILE:-production}"
DB_IDENTIFIER="reckn-production-postgres"
BASTION_NAME="reckn-production-bastion"

# Get bastion instance ID
BASTION_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=$BASTION_NAME" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text \
  --profile "$PROFILE")

# Get RDS address
RDS_ADDRESS=$(aws rds describe-db-instances \
  --db-instance-identifier "$DB_IDENTIFIER" \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text \
  --profile "$PROFILE")

# Get DB password
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id reckn-production/database/credentials \
  --query 'SecretString' \
  --output text \
  --profile "$PROFILE" | jq -r '.password')

echo "Bastion: $BASTION_ID"
echo "RDS: $RDS_ADDRESS"
echo "Password: $DB_PASSWORD"
echo ""
echo "Tunneling localhost:5432 -> $RDS_ADDRESS:5432"
echo ""
echo "Connect with: PGPASSWORD='$DB_PASSWORD' psql -h localhost -p 5432 -U postgres_admin -d reckn"
echo ""

aws ec2-instance-connect ssh \
  --instance-id "$BASTION_ID" \
  --os-user ec2-user \
  --local-forwarding "5432:$RDS_ADDRESS:5432" \
  --profile "$PROFILE"
