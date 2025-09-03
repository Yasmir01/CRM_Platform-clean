#!/usr/bin/env bash
set -e

echo "🔍 Security & robustness checks starting..."

# 1. Check for raw dangerouslySetInnerHTML usage
if grep -R "dangerouslySetInnerHTML" src | grep -v "SafeHtml"; then
  echo "❌ Found unsafe dangerouslySetInnerHTML usage"
  exit 1
else
  echo "✅ No unsafe dangerouslySetInnerHTML"
fi

# 2. Check for missing required env vars
required=(SESSION_JWT_SECRET COOKIE_DOMAIN AWS_REGION S3_BUCKET ADMIN_API_TOKEN STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET)
for v in "${required[@]}"; do
  if [ -z "${!v}" ]; then
    echo "❌ Missing env var: $v"
    exit 1
  fi
done
echo "✅ All env vars present"

# 3. Check headers (needs deployed URL)
URL=${1:-"https://yourdomain.com"}
echo "🌐 Checking headers on $URL"
headers=$(curl -sI "$URL")

if echo "$headers" | grep -qi "content-security-policy"; then
  echo "✅ CSP present"
else
  echo "❌ CSP missing"
  exit 1
fi

if echo "$headers" | grep -qi "strict-transport-security"; then
  echo "✅ HSTS present"
else
  echo "❌ HSTS missing"
  exit 1
fi

# 4. Stripe webhook idempotency test (requires test DB + Stripe CLI)
# echo "Run: stripe trigger invoice.payment_succeeded twice and check only one payment is created"

echo "✅ All static checks passed"
