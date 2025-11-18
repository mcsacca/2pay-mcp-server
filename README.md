# 2Pay MCP Server

A Model Context Protocol (MCP) server for the 2Checkout/Verifone 2Pay.js payment API. This server enables AI assistants to interact with payment processing, subscription management, and order operations.

## Features

- **Order Management**: Place orders with 2Pay.js tokens, retrieve order details, search orders, process refunds
- **Subscription Management**: Manage subscriptions, update payment methods, handle renewals and upgrades
- **Customer Management**: Create, update, and manage customer records
- **Product Catalog**: Query and manage products and pricing
- **Promotions**: Create and manage discounts and coupon codes

## Prerequisites

- Node.js 18+
- 2Checkout merchant account
- API credentials (merchant code and secret key)

## Installation

### Option 1: npm (Recommended)

```bash
npm install -g @mcsacca/2pay-mcp-server
```

### Option 2: From Source

1. Clone the repository:

```bash
git clone https://github.com/mcsacca/2pay-mcp-server.git
cd 2pay-mcp-server
```

2. Install dependencies and build:

```bash
npm install
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

Or for development:

```bash
npm run dev
```

### Configuring with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

## Available Tools

### Order Tools

- `place_order` - Place a new order using a 2Pay.js payment token
- `get_order` - Retrieve order details by reference number
- `search_orders` - Search for orders with filters
- `refund_order` - Process a refund (full or partial)
- `get_payment_methods` - Get available payment methods for a country
- `validate_order_reference` - Validate order for 1-click purchase
- `get_invoice` - Get invoice for an order

### Subscription Tools

- `get_subscription` - Retrieve subscription details
- `search_subscriptions` - Search subscriptions with filters
- `enable_subscription` / `disable_subscription` - Toggle subscription status
- `cancel_subscription` - Cancel a subscription
- `update_subscription_payment` - Update payment method with 2Pay.js token
- `get_next_renewal_price` - Preview next billing amount
- `get_subscription_history` - Get transaction history
- `upgrade_subscription` - Upgrade to a different product
- `place_renewal_order` - Manual renewal
- `convert_trial` - Convert trial to paid

### Customer Tools

- `create_customer` - Create a new customer record
- `get_customer` - Get customer by reference
- `get_customer_by_email` - Get customer by email
- `update_customer` - Update customer information
- `get_customer_subscriptions` - List all customer subscriptions
- `delete_customer` - Delete a customer record

### Product Tools

- `get_product` - Get product by code
- `get_product_by_id` - Get product by ID
- `search_products` - Search product catalog
- `enable_product` / `disable_product` - Toggle product availability
- `get_product_pricing` - Get pricing configurations
- `get_price_options` - Get price options

### Promotion Tools

- `create_promotion` - Create a new promotion/discount
- `get_promotion` - Get promotion details
- `update_promotion` - Update a promotion
- `delete_promotion` - Delete a promotion
- `search_promotions` - Search promotions
- `generate_coupons` - Generate coupon codes
- `get_coupons` - Get coupons for a promotion

## Resources

- `2pay://config` - Current configuration status
- `2pay://error-codes` - Error code reference

## Prompts

- `create-order` - Guided workflow for creating an order
- `manage-subscription` - Guided workflow for subscription management
- `troubleshoot-payment` - Diagnose payment issues

## Example Usage

### Place an Order

```
Use the place_order tool with:
- token: "190f2d9c-0bbc-4ad0-a902-770adb8e7f90"
- currency: "USD"
- country: "US"
- items: [{ "code": "PRODUCT_CODE", "quantity": 1 }]
- billingDetails: {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "address1": "123 Main St",
    "city": "New York",
    "zip": "10001",
    "countryCode": "US"
  }
```

### Search Subscriptions

```
Use search_subscriptions with:
- customerEmail: "customer@example.com"
- status: "Active"
- limit: 10
```

### Update Subscription Payment

```
Use update_subscription_payment with:
- subscriptionReference: "SUB123456"
- eesToken: "new-payment-token"
```

## Security Notes

- Never log or expose secret keys
- Use sandbox mode for testing
- Tokens expire after 30 minutes
- EES_TOKEN_PAYMENT does not have a test mode - use production-ready tokens

## API Documentation

- [2Pay.js Documentation](https://verifone.cloud/docs/2checkout/API-Integration/2Pay.js-payments-solution)
- [JSON-RPC API 6.0 Reference](https://verifone.cloud/docs/2checkout/API-Integration/JSON-RPC_API_6.0/Reference)
- [REST API 6.0 Reference](https://verifone.cloud/docs/2checkout/API-Integration/REST_API_6.0)

## License

MIT
