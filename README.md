# 2Pay MCP Server

[![npm version](https://badge.fury.io/js/@mcsacca%2F2pay-mcp-server.svg)](https://www.npmjs.com/package/@mcsacca/2pay-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for the 2Checkout/Verifone 2Pay.js payment API. This server enables AI assistants like Claude to interact with payment processing, subscription management, and order operations through natural language.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Available Tools](#available-tools)
- [Resources & Prompts](#resources--prompts)
- [Usage Examples](#usage-examples)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Order Management**: Place orders with 2Pay.js tokens, retrieve order details, search orders, process refunds
- **Subscription Management**: Full lifecycle management including renewals, upgrades, payment updates
- **Customer Management**: Create, update, and manage customer records and their subscriptions
- **Product Catalog**: Query and manage products, pricing configurations, and price options
- **Promotions**: Create discounts, generate coupon codes, manage promotional campaigns

## Prerequisites

- Node.js 18 or higher
- 2Checkout/Verifone merchant account
- API credentials (merchant code and secret key)
- For production: PCI DSS compliance awareness

## Installation

### Option 1: npm (Recommended)

```bash
npm install -g @mcsacca/2pay-mcp-server
```

### Option 2: Using npx (No Installation)

You can run directly with npx - see [Configuration](#configuration) below.

### Option 3: From Source

```bash
git clone https://github.com/mcsacca/2pay-mcp-server.git
cd 2pay-mcp-server
npm install
npm run build
```

## Configuration

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### Using npx (Recommended)

```json
{
  "mcpServers": {
    "2pay": {
      "command": "npx",
      "args": ["-y", "@mcsacca/2pay-mcp-server"],
      "env": {
        "TWOCHECKOUT_MERCHANT_CODE": "your_merchant_code",
        "TWOCHECKOUT_SECRET_KEY": "your_secret_key",
        "TWOCHECKOUT_SANDBOX": "true"
      }
    }
  }
}
```

#### Using Global Installation

```json
{
  "mcpServers": {
    "2pay": {
      "command": "2pay-mcp-server",
      "env": {
        "TWOCHECKOUT_MERCHANT_CODE": "your_merchant_code",
        "TWOCHECKOUT_SECRET_KEY": "your_secret_key",
        "TWOCHECKOUT_SANDBOX": "true"
      }
    }
  }
}
```

#### Using Local Build

```json
{
  "mcpServers": {
    "2pay": {
      "command": "node",
      "args": ["/path/to/2pay-mcp-server/dist/index.js"],
      "env": {
        "TWOCHECKOUT_MERCHANT_CODE": "your_merchant_code",
        "TWOCHECKOUT_SECRET_KEY": "your_secret_key",
        "TWOCHECKOUT_SANDBOX": "true"
      }
    }
  }
}
```

## Available Tools

### Order Tools (7)

| Tool | Description |
|------|-------------|
| `place_order` | Place a new order using a 2Pay.js payment token |
| `get_order` | Retrieve order details by reference number |
| `search_orders` | Search for orders with filters (date, status, customer) |
| `refund_order` | Process a full or partial refund |
| `get_payment_methods` | Get available payment methods for a country |
| `validate_order_reference` | Validate order reference for 1-click purchase |
| `get_invoice` | Get invoice details for an order |

### Subscription Tools (21)

| Tool | Description |
|------|-------------|
| `get_subscription` | Retrieve subscription details by reference |
| `search_subscriptions` | Search subscriptions with filters |
| `enable_subscription` | Enable a disabled subscription |
| `disable_subscription` | Disable an active subscription |
| `cancel_subscription` | Cancel a subscription |
| `update_subscription_payment` | Update payment method with 2Pay.js token |
| `get_next_renewal_price` | Preview next billing amount |
| `get_subscription_history` | Get transaction history |
| `upgrade_subscription` | Upgrade to a different product/plan |
| `place_renewal_order` | Manually trigger a renewal |
| `convert_trial` | Convert trial subscription to paid |
| `pause_subscription` | Temporarily pause a subscription |
| `resume_subscription` | Resume a paused subscription |
| `set_grace_period` | Set grace period days for payment failures |
| `enable_recurring_billing` | Enable automatic recurring billing |
| `disable_recurring_billing` | Disable automatic recurring billing |
| `get_subscription_payment_info` | Get current payment method details |
| `assign_subscription_to_customer` | Transfer subscription to different customer |
| `get_upgrade_options` | Get available upgrade paths |
| `set_next_renewal_price` | Override the next renewal price |
| `import_subscription` | Import subscription for migrations |

### Customer Tools (6)

| Tool | Description |
|------|-------------|
| `create_customer` | Create a new customer record |
| `get_customer` | Get customer by reference ID |
| `get_customer_by_email` | Get customer by email address |
| `update_customer` | Update customer information |
| `get_customer_subscriptions` | List all subscriptions for a customer |
| `delete_customer` | Delete a customer record |

### Product Tools (7)

| Tool | Description |
|------|-------------|
| `get_product` | Get product details by code |
| `get_product_by_id` | Get product details by ID |
| `search_products` | Search product catalog |
| `enable_product` | Enable a product |
| `disable_product` | Disable a product |
| `get_product_pricing` | Get pricing configurations |
| `get_price_options` | Get price options for a product |

### Promotion Tools (7)

| Tool | Description |
|------|-------------|
| `create_promotion` | Create a new promotion/discount |
| `get_promotion` | Get promotion details by code |
| `update_promotion` | Update a promotion |
| `delete_promotion` | Delete a promotion |
| `search_promotions` | Search promotions |
| `generate_coupons` | Generate coupon codes for a promotion |
| `get_coupons` | Get coupon codes for a promotion |

### Usage Tools (5)

| Tool | Description |
|------|-------------|
| `report_usage` | Report usage/consumption for metered billing subscriptions |
| `get_usage` | Retrieve usage records for a subscription |
| `delete_usage` | Delete a usage record |
| `trigger_usage_billing` | Trigger immediate billing before normal cycle |
| `import_usage` | Batch import multiple usage records |

### Lead Tools (5)

| Tool | Description |
|------|-------------|
| `create_lead` | Create a lead for cart abandonment tracking |
| `get_lead` | Get a lead by code |
| `update_lead` | Update an existing lead |
| `search_leads` | Search leads with filters |
| `mark_leads_as_used` | Mark leads as used and stop follow-ups |

### Campaign Tools (8)

| Tool | Description |
|------|-------------|
| `create_cross_sell_campaign` | Create a cross-sell campaign |
| `get_cross_sell_campaign` | Get cross-sell campaign by code |
| `update_cross_sell_campaign` | Update a cross-sell campaign |
| `search_cross_sell_campaigns` | Search cross-sell campaigns |
| `create_upsell_campaign` | Create an upsell campaign |
| `update_upsell_campaign` | Update an upsell campaign |
| `delete_upsell_campaign` | Delete an upsell campaign |
| `search_upsell_campaigns` | Search upsell campaigns |

### Shipping Tools (3)

| Tool | Description |
|------|-------------|
| `mark_order_shipped` | Mark order as shipped with tracking |
| `search_shipping_methods` | Search available shipping methods |
| `get_shipping_price` | Get shipping price for products |

### SKU Tools (4)

| Tool | Description |
|------|-------------|
| `set_sku_code` | Set SKU code for a product |
| `search_sku_codes` | Search SKU codes |
| `delete_sku_code` | Delete a SKU code |
| `generate_sku_schema` | Generate SKU schema for product |

### Account Tools (5)

| Tool | Description |
|------|-------------|
| `get_account_balance` | Get current account balance |
| `search_payouts` | Search historical payouts |
| `get_countries` | Get list of available countries |
| `get_currencies` | Get list of available currencies |
| `get_account_timezone` | Get account timezone |

### SSO Tools (4)

| Tool | Description |
|------|-------------|
| `sso_cart` | Generate SSO token for cart |
| `sso_by_customer_reference` | SSO by customer reference |
| `sso_by_subscription_reference` | SSO by subscription reference |
| `get_customer_info_by_sso_token` | Get customer info from SSO token |

## Resources & Prompts

### Resources

- `2pay://config` - Current configuration status and API endpoints
- `2pay://error-codes` - Common error codes and their meanings

### Prompts

- `create-order` - Guided workflow for creating an order with a 2Pay.js token
- `manage-subscription` - Guided workflow for subscription management operations
- `troubleshoot-payment` - Diagnose and resolve payment issues

## Usage Examples

### Place an Order with 2Pay.js Token

```json
{
  "token": "190f2d9c-0bbc-4ad0-a902-770adb8e7f90",
  "currency": "USD",
  "country": "US",
  "customerIP": "192.168.1.1",
  "items": [
    {
      "code": "PRODUCT_CODE",
      "quantity": 1
    }
  ],
  "billingDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "countryCode": "US"
  },
  "externalReference": "ORDER-12345"
}
```

### Place an Order with Dynamic Products

```json
{
  "token": "your-2pay-token",
  "currency": "USD",
  "country": "US",
  "items": [
    {
      "name": "Custom Service",
      "quantity": 1,
      "price": 99.99,
      "isDynamic": true
    }
  ],
  "billingDetails": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "address1": "456 Oak Ave",
    "city": "Los Angeles",
    "zip": "90001",
    "countryCode": "US"
  }
}
```

### Search Orders

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "customerEmail": "customer@example.com",
  "status": "COMPLETE",
  "page": 1,
  "limit": 50
}
```

### Search Subscriptions

```json
{
  "customerEmail": "customer@example.com",
  "status": "Active",
  "recurringEnabled": true,
  "page": 1,
  "limit": 10
}
```

### Update Subscription Payment Method

```json
{
  "subscriptionReference": "SUB123456789",
  "eesToken": "new-2pay-token-from-frontend",
  "holderName": "John Doe"
}
```

### Create a Promotion

```json
{
  "name": "Summer Sale 2024",
  "description": "20% off all products",
  "startDate": "2024-06-01",
  "endDate": "2024-08-31",
  "discountType": "PERCENT",
  "discountValue": 20,
  "couponType": "SINGLE",
  "couponCode": "SUMMER20",
  "productCodes": ["PROD1", "PROD2"],
  "maximumOrders": 1000,
  "applyRecurring": false
}
```

### Report Usage for Metered Billing

```json
{
  "subscriptionReference": "SUB123456789",
  "optionCode": "API_CALLS",
  "units": 1500,
  "usageStart": "2024-01-01",
  "usageEnd": "2024-01-31",
  "description": "January API usage"
}
```

### Pause a Subscription

```json
{
  "subscriptionReference": "SUB123456789",
  "pauseDays": 30
}
```

### Import a Subscription (Migration)

```json
{
  "customerEmail": "customer@example.com",
  "productCode": "PREMIUM_PLAN",
  "startDate": "2024-01-01",
  "expirationDate": "2025-01-01",
  "recurringEnabled": true,
  "quantity": 1,
  "externalCustomerReference": "LEGACY-CUST-123"
}
```

### Set Next Renewal Price

```json
{
  "subscriptionReference": "SUB123456789",
  "price": 19.99,
  "currency": "USD"
}
```

## Architecture

```
src/
├── index.ts              # MCP server entry point & tool handlers
├── auth/
│   └── authentication.ts # REST header & JSON-RPC session auth
├── tools/
│   ├── orders.ts         # Order management tools
│   ├── subscriptions.ts  # Subscription management tools
│   ├── customers.ts      # Customer management tools
│   ├── products.ts       # Product catalog tools
│   ├── promotions.ts     # Promotion management tools
│   ├── usage.ts          # Usage/metered billing tools
│   ├── leads.ts          # Lead management tools
│   ├── campaigns.ts      # Cross-sell/upsell campaigns
│   ├── shipping.ts       # Shipping management tools
│   ├── sku.ts            # SKU code management
│   ├── account.ts        # Account info tools
│   └── sso.ts            # Single sign-on tools
├── types/
│   └── 2checkout.ts      # TypeScript type definitions
└── utils/
    └── api-client.ts     # REST & JSON-RPC API client
```

### Authentication

The server supports two authentication methods:

1. **REST API**: Uses `X-Avangate-Authentication` header with HMAC-SHA256 hash
2. **JSON-RPC API**: Uses `login` method to obtain session ID (cached for 30 minutes)

Both methods use SHA-256 by default (MD5 deprecated).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TWOCHECKOUT_MERCHANT_CODE` | Yes | Your 2Checkout merchant code |
| `TWOCHECKOUT_SECRET_KEY` | Yes | Your 2Checkout API secret key |
| `TWOCHECKOUT_SANDBOX` | No | Set to `true` for sandbox environment |
| `TWOCHECKOUT_BASE_URL` | No | Override the API base URL |

## Security

### Important Security Considerations

- **Never expose secret keys** in client-side code or logs
- **Use environment variables** for credentials, never hardcode them
- **Tokens expire after 30 minutes** - generate fresh tokens for each transaction
- **EES_TOKEN_PAYMENT has no test mode** - tokens must be generated from valid card data
- **PCI DSS compliance** - Be aware of your compliance requirements when handling payment data

### Best Practices

1. Always use HTTPS endpoints
2. Implement proper error handling
3. Log transaction references, not payment details
4. Use sandbox mode during development
5. Regularly rotate API keys

## Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `TOKEN_EXPIRED` | 2Pay.js token older than 30 minutes | Generate a fresh token |
| `INVALID_PAYMENT` | Invalid payment details | Verify token and payment type |
| `SUBSCRIPTION_NOT_FOUND` | Invalid subscription reference | Check the reference ID |
| `CARD_DECLINED` | Bank declined the transaction | Customer should contact bank |
| `INSUFFICIENT_FUNDS` | Not enough balance | Customer needs different payment |

### Debug Mode

For development, check the configuration resource:
```
Use the 2pay://config resource to verify your setup
```

### Session Issues

If you encounter session-related errors, the client automatically handles session refresh. If problems persist, restart the MCP server.

## API Documentation

- [2Pay.js Integration Guide](https://verifone.cloud/docs/2checkout/API-Integration/2Pay.js-payments-solution)
- [JSON-RPC API 6.0 Reference](https://verifone.cloud/docs/2checkout/API-Integration/JSON-RPC_API_6.0/Reference)
- [REST API 6.0 Reference](https://verifone.cloud/docs/2checkout/API-Integration/REST_API_6.0)
- [API Authentication](https://verifone.cloud/docs/2checkout/API-Integration/01Start-using-the-2Checkout-API/API_Authentication)
- [Error Codes](https://knowledgecenter.2checkout.com/API-Integration/JSON-RPC_API_6.0/API-6.0-Error-Codes)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with the [Model Context Protocol](https://modelcontextprotocol.io) SDK.
