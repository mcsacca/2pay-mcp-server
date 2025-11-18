#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { TwoCheckoutApiClient } from './utils/api-client.js';
import { TwoCheckoutConfig, Order, BillingDetails, OrderItem, Customer, Promotion } from './types/2checkout.js';
import { OrderTools, orderToolDefinitions } from './tools/orders.js';
import { SubscriptionTools, subscriptionToolDefinitions } from './tools/subscriptions.js';
import { CustomerTools, customerToolDefinitions } from './tools/customers.js';
import { ProductTools, productToolDefinitions } from './tools/products.js';
import { PromotionTools, promotionToolDefinitions } from './tools/promotions.js';

// Get configuration from environment variables
function getConfig(): TwoCheckoutConfig {
  const merchantCode = process.env.TWOCHECKOUT_MERCHANT_CODE;
  const secretKey = process.env.TWOCHECKOUT_SECRET_KEY;

  if (!merchantCode || !secretKey) {
    throw new Error(
      'Missing required environment variables: TWOCHECKOUT_MERCHANT_CODE and TWOCHECKOUT_SECRET_KEY'
    );
  }

  return {
    merchantCode,
    secretKey,
    sandbox: process.env.TWOCHECKOUT_SANDBOX === 'true',
    baseUrl: process.env.TWOCHECKOUT_BASE_URL
  };
}

// Initialize API client and tools
let apiClient: TwoCheckoutApiClient;
let orderTools: OrderTools;
let subscriptionTools: SubscriptionTools;
let customerTools: CustomerTools;
let productTools: ProductTools;
let promotionTools: PromotionTools;

try {
  const config = getConfig();
  apiClient = new TwoCheckoutApiClient(config);
  orderTools = new OrderTools(apiClient);
  subscriptionTools = new SubscriptionTools(apiClient);
  customerTools = new CustomerTools(apiClient);
  productTools = new ProductTools(apiClient);
  promotionTools = new PromotionTools(apiClient);
} catch (error) {
  console.error('Failed to initialize 2Checkout API client:', error);
  process.exit(1);
}

// Create MCP server
const server = new Server(
  {
    name: '2pay-mcp-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    }
  }
);

// Combine all tool definitions
const allTools = [
  ...orderToolDefinitions,
  ...subscriptionToolDefinitions,
  ...customerToolDefinitions,
  ...productToolDefinitions,
  ...promotionToolDefinitions
];

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    let result: unknown;

    switch (name) {
      // Order tools
      case 'place_order': {
        const order = buildOrderFromArgs(args);
        result = await orderTools.placeOrder(order);
        break;
      }
      case 'get_order':
        result = await orderTools.getOrder(args.orderReference as string);
        break;
      case 'search_orders':
        result = await orderTools.searchOrders({
          StartDate: args.startDate as string,
          EndDate: args.endDate as string,
          Status: args.status as string,
          CustomerEmail: args.customerEmail as string,
          ExternalReference: args.externalReference as string,
          Page: args.page as number,
          Limit: args.limit as number
        });
        break;
      case 'refund_order':
        result = await orderTools.refundOrder(
          args.orderReference as string,
          args.amount as number,
          args.reason as string,
          args.comment as string
        );
        break;
      case 'get_payment_methods':
        result = await orderTools.getPaymentMethods(args.countryCode as string);
        break;
      case 'validate_order_reference':
        result = await orderTools.isValidOrderReference(args.orderReference as string);
        break;
      case 'get_invoice':
        result = await orderTools.getInvoice(args.orderReference as string);
        break;

      // Subscription tools
      case 'get_subscription':
        result = await subscriptionTools.getSubscription(args.subscriptionReference as string);
        break;
      case 'search_subscriptions':
        result = await subscriptionTools.searchSubscriptions({
          CustomerEmail: args.customerEmail as string,
          ExternalCustomerReference: args.externalCustomerReference as string,
          Status: args.status as 'Active' | 'Disabled' | 'Past',
          RecurringEnabled: args.recurringEnabled as boolean,
          ProductCodes: args.productCodes as string[],
          Page: args.page as number,
          Limit: args.limit as number
        });
        break;
      case 'enable_subscription':
        result = await subscriptionTools.enableSubscription(args.subscriptionReference as string);
        break;
      case 'disable_subscription':
        result = await subscriptionTools.disableSubscription(args.subscriptionReference as string);
        break;
      case 'cancel_subscription':
        result = await subscriptionTools.cancelSubscription(args.subscriptionReference as string);
        break;
      case 'update_subscription_payment':
        result = await subscriptionTools.updateSubscriptionPayment(
          args.subscriptionReference as string,
          args.eesToken as string,
          args.holderName as string
        );
        break;
      case 'get_next_renewal_price':
        result = await subscriptionTools.getNextRenewalPrice(args.subscriptionReference as string);
        break;
      case 'get_subscription_history':
        result = await subscriptionTools.getSubscriptionHistory(args.subscriptionReference as string);
        break;
      case 'upgrade_subscription':
        result = await subscriptionTools.upgradeSubscription(
          args.subscriptionReference as string,
          args.productCode as string,
          {
            priceOptions: args.priceOptions as string[],
            quantity: args.quantity as number
          }
        );
        break;
      case 'place_renewal_order':
        result = await subscriptionTools.placeRenewalOrder(args.subscriptionReference as string);
        break;
      case 'convert_trial':
        result = await subscriptionTools.convertTrial(args.subscriptionReference as string);
        break;

      // Customer tools
      case 'create_customer': {
        const customer: Customer = {
          FirstName: args.firstName as string,
          LastName: args.lastName as string,
          Email: args.email as string,
          Phone: args.phone as string,
          Company: args.company as string,
          Address1: args.address1 as string,
          City: args.city as string,
          State: args.state as string,
          Zip: args.zip as string,
          CountryCode: args.countryCode as string,
          ExternalCustomerReference: args.externalCustomerReference as string
        };
        result = await customerTools.createCustomer(customer);
        break;
      }
      case 'get_customer':
        result = await customerTools.getCustomer(args.customerReference as string);
        break;
      case 'get_customer_by_email':
        result = await customerTools.getCustomerByEmail(args.email as string);
        break;
      case 'update_customer': {
        const updates: Partial<Customer> = {};
        if (args.firstName) updates.FirstName = args.firstName as string;
        if (args.lastName) updates.LastName = args.lastName as string;
        if (args.email) updates.Email = args.email as string;
        if (args.phone) updates.Phone = args.phone as string;
        if (args.company) updates.Company = args.company as string;
        if (args.address1) updates.Address1 = args.address1 as string;
        if (args.city) updates.City = args.city as string;
        if (args.state) updates.State = args.state as string;
        if (args.zip) updates.Zip = args.zip as string;
        if (args.countryCode) updates.CountryCode = args.countryCode as string;
        result = await customerTools.updateCustomer(args.customerReference as string, updates);
        break;
      }
      case 'get_customer_subscriptions':
        result = await customerTools.getCustomerSubscriptions(args.customerReference as string);
        break;
      case 'delete_customer':
        result = await customerTools.deleteCustomer(args.customerReference as string);
        break;

      // Product tools
      case 'get_product':
        result = await productTools.getProduct(args.productCode as string);
        break;
      case 'get_product_by_id':
        result = await productTools.getProductById(args.productId as string);
        break;
      case 'search_products':
        result = await productTools.searchProducts({
          name: args.name as string,
          enabled: args.enabled as boolean,
          Page: args.page as number,
          Limit: args.limit as number
        });
        break;
      case 'enable_product':
        result = await productTools.enableProduct(args.productCode as string);
        break;
      case 'disable_product':
        result = await productTools.disableProduct(args.productCode as string);
        break;
      case 'get_product_pricing':
        result = await productTools.getProductPricing(args.productCode as string);
        break;
      case 'get_price_options':
        result = await productTools.getPriceOptions(args.productCode as string);
        break;

      // Promotion tools
      case 'create_promotion': {
        const promotion: Promotion = {
          Name: args.name as string,
          Description: args.description as string,
          StartDate: args.startDate as string,
          EndDate: args.endDate as string,
          Enabled: true,
          Type: 'REGULAR',
          Discount: {
            Type: args.discountType as 'PERCENT' | 'FIXED',
            Value: args.discountValue as number
          },
          Coupon: args.couponType ? {
            Type: args.couponType as 'SINGLE' | 'MULTIPLE',
            Code: args.couponCode as string
          } : undefined,
          Products: (args.productCodes as string[])?.map(code => ({ Code: code })),
          MaximumOrdersNumber: args.maximumOrders as number,
          ApplyRecurring: args.applyRecurring as boolean
        };
        result = await promotionTools.createPromotion(promotion);
        break;
      }
      case 'get_promotion':
        result = await promotionTools.getPromotion(args.promotionCode as string);
        break;
      case 'update_promotion': {
        const updates: Partial<Promotion> = {};
        if (args.name) updates.Name = args.name as string;
        if (args.description) updates.Description = args.description as string;
        if (args.endDate) updates.EndDate = args.endDate as string;
        if (args.enabled !== undefined) updates.Enabled = args.enabled as boolean;
        if (args.discountValue) updates.Discount = { Type: 'PERCENT', Value: args.discountValue as number };
        result = await promotionTools.updatePromotion(args.promotionCode as string, updates);
        break;
      }
      case 'delete_promotion':
        result = await promotionTools.deletePromotion(args.promotionCode as string);
        break;
      case 'search_promotions':
        result = await promotionTools.searchPromotions({
          enabled: args.enabled as boolean,
          Page: args.page as number,
          Limit: args.limit as number
        });
        break;
      case 'generate_coupons':
        result = await promotionTools.generateCoupons(
          args.promotionCode as string,
          args.numberOfCoupons as number
        );
        break;
      case 'get_coupons':
        result = await promotionTools.getCoupons(args.promotionCode as string, {
          Page: args.page as number,
          Limit: args.limit as number
        });
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
});

// Helper function to build order from tool arguments
function buildOrderFromArgs(args: Record<string, unknown>): Order {
  const billingArgs = args.billingDetails as Record<string, unknown>;
  const billingDetails: BillingDetails = {
    FirstName: billingArgs.firstName as string,
    LastName: billingArgs.lastName as string,
    Email: billingArgs.email as string,
    Phone: billingArgs.phone as string,
    Address1: billingArgs.address1 as string,
    Address2: billingArgs.address2 as string,
    City: billingArgs.city as string,
    State: billingArgs.state as string,
    Zip: billingArgs.zip as string,
    CountryCode: billingArgs.countryCode as string
  };

  const items: OrderItem[] = (args.items as Array<Record<string, unknown>>).map(item => ({
    Code: item.code as string,
    Quantity: item.quantity as number,
    Name: item.name as string,
    IsDynamic: item.isDynamic as boolean,
    Price: item.price ? {
      Amount: item.price as number,
      Type: 'CUSTOM'
    } : undefined
  }));

  return {
    Currency: args.currency as string,
    Country: args.country as string,
    CustomerIP: args.customerIP as string,
    ExternalReference: args.externalReference as string,
    Items: items,
    BillingDetails: billingDetails,
    PaymentDetails: {
      Type: 'EES_TOKEN_PAYMENT',
      Currency: args.currency as string,
      CustomerIP: args.customerIP as string,
      PaymentMethod: {
        EesToken: args.token as string
      }
    }
  };
}

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: '2pay://config',
        name: 'Configuration Status',
        description: 'Current 2Checkout API configuration and connection status',
        mimeType: 'application/json'
      },
      {
        uri: '2pay://error-codes',
        name: 'Error Codes Reference',
        description: 'Common 2Checkout API error codes and their meanings',
        mimeType: 'application/json'
      }
    ]
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case '2pay://config':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              merchantCode: process.env.TWOCHECKOUT_MERCHANT_CODE ? '***configured***' : 'not set',
              secretKey: process.env.TWOCHECKOUT_SECRET_KEY ? '***configured***' : 'not set',
              sandbox: process.env.TWOCHECKOUT_SANDBOX === 'true',
              baseUrl: apiClient.getAuth().getRestUrl()
            }, null, 2)
          }
        ]
      };

    case '2pay://error-codes':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              'INVALID_CUSTOMER': 'Customer information is invalid or missing required fields',
              'INVALID_PRODUCT': 'Product code is invalid or product not found',
              'INVALID_PAYMENT': 'Payment information is invalid',
              'TOKEN_EXPIRED': 'Payment token has expired (tokens are valid for 30 minutes)',
              'INSUFFICIENT_FUNDS': 'Payment declined due to insufficient funds',
              'CARD_DECLINED': 'Credit card was declined by the issuing bank',
              'SUBSCRIPTION_NOT_FOUND': 'Subscription reference not found',
              'ORDER_NOT_FOUND': 'Order reference not found',
              'INVALID_PROMOTION': 'Promotion code is invalid or expired'
            }, null, 2)
          }
        ]
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'create-order',
        description: 'Guided workflow for creating an order with 2Pay.js token',
        arguments: [
          {
            name: 'token',
            description: '2Pay.js payment token',
            required: true
          }
        ]
      },
      {
        name: 'manage-subscription',
        description: 'Guided workflow for managing a subscription',
        arguments: [
          {
            name: 'subscriptionReference',
            description: 'Subscription reference ID',
            required: true
          }
        ]
      },
      {
        name: 'troubleshoot-payment',
        description: 'Diagnose and troubleshoot payment issues',
        arguments: [
          {
            name: 'errorCode',
            description: 'Error code received',
            required: false
          },
          {
            name: 'orderReference',
            description: 'Order reference if available',
            required: false
          }
        ]
      }
    ]
  };
});

// Get prompt content
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'create-order':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I have a 2Pay.js payment token: ${args?.token || '[token not provided]'}

Please help me create an order with this token. I'll need to provide:
1. Customer billing details (name, email, address)
2. Order items (products or dynamic items)
3. Currency and country

Guide me through collecting this information and then use the place_order tool to complete the transaction.`
            }
          }
        ]
      };

    case 'manage-subscription':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I need to manage subscription: ${args?.subscriptionReference || '[reference not provided]'}

Please help me with one of these actions:
- View subscription details and history
- Update payment method
- Upgrade or downgrade the plan
- Enable, disable, or cancel the subscription
- Check next renewal price

First, retrieve the subscription details using get_subscription, then guide me through the available options.`
            }
          }
        ]
      };

    case 'troubleshoot-payment':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I'm experiencing a payment issue.
${args?.errorCode ? `Error code: ${args.errorCode}` : ''}
${args?.orderReference ? `Order reference: ${args.orderReference}` : ''}

Please help me diagnose and resolve this issue by:
1. Checking the error code meaning (use 2pay://error-codes resource)
2. If order reference provided, retrieve order details
3. Suggest possible solutions based on the error type
4. Recommend next steps to complete the payment`
            }
          }
        ]
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('2Pay MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
