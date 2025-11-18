import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  Order,
  OrderResponse,
  OrderSearchOptions,
  SearchResponse,
  ApiResponse
} from '../types/2checkout.js';

export class OrderTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Place an order using a 2Pay.js token
   */
  async placeOrder(order: Order): Promise<ApiResponse<OrderResponse>> {
    const result = await this.client.rpcRequest<OrderResponse>('placeOrder', [order]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Retrieve order details by reference number
   */
  async getOrder(orderReference: string): Promise<ApiResponse<OrderResponse>> {
    const result = await this.client.rpcRequest<OrderResponse>('getOrder', [orderReference]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Search orders with filters
   */
  async searchOrders(options: OrderSearchOptions): Promise<ApiResponse<SearchResponse<OrderResponse>>> {
    const result = await this.client.rpcRequest<SearchResponse<OrderResponse>>('searchOrders', [options]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Refund an order
   */
  async refundOrder(
    orderReference: string,
    amount?: number,
    reason?: string,
    comment?: string
  ): Promise<ApiResponse<boolean>> {
    const refundOptions = {
      RefNo: orderReference,
      Amount: amount,
      Reason: reason || 'Customer request',
      Comment: comment
    };

    const result = await this.client.rpcRequest<boolean>('refundOrder', [refundOptions]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get available payment methods for a country
   */
  async getPaymentMethods(countryCode: string): Promise<ApiResponse<unknown>> {
    return this.client.rpcRequest('getPaymentMethods', [countryCode]);
  }

  /**
   * Validate order reference for 1-click purchase
   */
  async isValidOrderReference(orderReference: string): Promise<ApiResponse<boolean>> {
    return this.client.rpcRequest<boolean>('isValidOrderReference', [orderReference]);
  }

  /**
   * Get order invoice
   */
  async getInvoice(orderReference: string): Promise<ApiResponse<unknown>> {
    return this.client.rpcRequest('getInvoice', [orderReference]);
  }
}

// Tool definitions for MCP
export const orderToolDefinitions = [
  {
    name: 'place_order',
    description: 'Place a new order using a 2Pay.js payment token. Use this for processing payments with tokenized card data.',
    inputSchema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: '2Pay.js payment token (EES token)'
        },
        currency: {
          type: 'string',
          description: 'Order currency code (e.g., USD, EUR)'
        },
        country: {
          type: 'string',
          description: 'Customer country code (e.g., US, GB)'
        },
        customerIP: {
          type: 'string',
          description: 'Customer IP address'
        },
        items: {
          type: 'array',
          description: 'Array of order items',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', description: 'Product code (null for dynamic products)' },
              quantity: { type: 'number', description: 'Quantity' },
              name: { type: 'string', description: 'Product name (for dynamic products)' },
              price: { type: 'number', description: 'Unit price (for dynamic products)' },
              isDynamic: { type: 'boolean', description: 'True for dynamic/custom products' }
            },
            required: ['quantity']
          }
        },
        billingDetails: {
          type: 'object',
          description: 'Customer billing information',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            address1: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip: { type: 'string' },
            countryCode: { type: 'string' }
          },
          required: ['firstName', 'lastName', 'email', 'address1', 'city', 'zip', 'countryCode']
        },
        externalReference: {
          type: 'string',
          description: 'Your external order reference'
        }
      },
      required: ['token', 'currency', 'country', 'items', 'billingDetails']
    }
  },
  {
    name: 'get_order',
    description: 'Retrieve order details by reference number',
    inputSchema: {
      type: 'object',
      properties: {
        orderReference: {
          type: 'string',
          description: 'Order reference number (RefNo)'
        }
      },
      required: ['orderReference']
    }
  },
  {
    name: 'search_orders',
    description: 'Search for orders with various filters',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date for search range (YYYY-MM-DD)'
        },
        endDate: {
          type: 'string',
          description: 'End date for search range (YYYY-MM-DD)'
        },
        status: {
          type: 'string',
          description: 'Order status filter'
        },
        customerEmail: {
          type: 'string',
          description: 'Customer email filter'
        },
        externalReference: {
          type: 'string',
          description: 'External reference filter'
        },
        page: {
          type: 'number',
          description: 'Page number (default: 1)'
        },
        limit: {
          type: 'number',
          description: 'Results per page (default: 10, max: 200)'
        }
      }
    }
  },
  {
    name: 'refund_order',
    description: 'Refund an order (full or partial)',
    inputSchema: {
      type: 'object',
      properties: {
        orderReference: {
          type: 'string',
          description: 'Order reference number to refund'
        },
        amount: {
          type: 'number',
          description: 'Refund amount (omit for full refund)'
        },
        reason: {
          type: 'string',
          description: 'Refund reason'
        },
        comment: {
          type: 'string',
          description: 'Additional comment'
        }
      },
      required: ['orderReference']
    }
  },
  {
    name: 'get_payment_methods',
    description: 'Get available payment methods for a specific country',
    inputSchema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'Country code (e.g., US, GB, DE)'
        }
      },
      required: ['countryCode']
    }
  },
  {
    name: 'validate_order_reference',
    description: 'Validate an order reference for 1-click purchase eligibility',
    inputSchema: {
      type: 'object',
      properties: {
        orderReference: {
          type: 'string',
          description: 'Order reference to validate'
        }
      },
      required: ['orderReference']
    }
  },
  {
    name: 'get_invoice',
    description: 'Get invoice details for an order',
    inputSchema: {
      type: 'object',
      properties: {
        orderReference: {
          type: 'string',
          description: 'Order reference number'
        }
      },
      required: ['orderReference']
    }
  }
];
