import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  Subscription,
  SubscriptionSearchOptions,
  SubscriptionUpdatePayment,
  SearchResponse,
  ApiResponse
} from '../types/2checkout.js';

export class SubscriptionTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Get subscription by reference
   */
  async getSubscription(subscriptionReference: string): Promise<ApiResponse<Subscription>> {
    const result = await this.client.rpcRequest<Subscription>('getSubscription', [subscriptionReference]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Search subscriptions with filters
   */
  async searchSubscriptions(options: SubscriptionSearchOptions): Promise<ApiResponse<SearchResponse<Subscription>>> {
    const result = await this.client.rpcRequest<SearchResponse<Subscription>>('searchSubscriptions', [options]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Enable a subscription
   */
  async enableSubscription(subscriptionReference: string): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('enableSubscription', [subscriptionReference]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Disable a subscription
   */
  async disableSubscription(subscriptionReference: string): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('disableSubscription', [subscriptionReference]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionReference: string): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('cancelSubscription', [subscriptionReference]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Update subscription payment information using 2Pay.js token
   */
  async updateSubscriptionPayment(
    subscriptionReference: string,
    eesToken: string,
    holderName?: string
  ): Promise<ApiResponse<boolean>> {
    const paymentInfo: SubscriptionUpdatePayment = {
      SubscriptionReference: subscriptionReference,
      PaymentMethod: {
        EesToken: eesToken,
        HolderName: holderName
      }
    };

    const result = await this.client.rpcRequest<boolean>('updateSubscriptionPaymentInformation', [paymentInfo]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get next renewal price
   */
  async getNextRenewalPrice(subscriptionReference: string): Promise<ApiResponse<unknown>> {
    return this.client.rpcRequest('getNextRenewalPrice', [subscriptionReference]);
  }

  /**
   * Get subscription history
   */
  async getSubscriptionHistory(subscriptionReference: string): Promise<ApiResponse<unknown>> {
    return this.client.rpcRequest('getSubscriptionHistory', [subscriptionReference]);
  }

  /**
   * Upgrade a subscription
   */
  async upgradeSubscription(
    subscriptionReference: string,
    productCode: string,
    options?: {
      priceOptions?: string[];
      quantity?: number;
    }
  ): Promise<ApiResponse<unknown>> {
    const upgradeInfo = {
      SubscriptionReference: subscriptionReference,
      ProductCode: productCode,
      ...options
    };

    return this.client.rpcRequest('upgradeSubscription', [upgradeInfo]);
  }

  /**
   * Place a renewal order
   */
  async placeRenewalOrder(subscriptionReference: string): Promise<ApiResponse<unknown>> {
    return this.client.rpcRequest('placeRenewalOrder', [subscriptionReference]);
  }

  /**
   * Convert trial to paid subscription
   */
  async convertTrial(subscriptionReference: string): Promise<ApiResponse<boolean>> {
    return this.client.rpcRequest<boolean>('convertTrial', [subscriptionReference]);
  }
}

// Tool definitions for MCP
export const subscriptionToolDefinitions = [
  {
    name: 'get_subscription',
    description: 'Retrieve subscription details by reference',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference ID'
        }
      },
      required: ['subscriptionReference']
    }
  },
  {
    name: 'search_subscriptions',
    description: 'Search for subscriptions with various filters',
    inputSchema: {
      type: 'object',
      properties: {
        customerEmail: {
          type: 'string',
          description: 'Customer email filter'
        },
        externalCustomerReference: {
          type: 'string',
          description: 'External customer reference'
        },
        status: {
          type: 'string',
          enum: ['Active', 'Disabled', 'Past'],
          description: 'Subscription status'
        },
        recurringEnabled: {
          type: 'boolean',
          description: 'Filter by recurring status'
        },
        productCodes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by product codes'
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
    name: 'enable_subscription',
    description: 'Enable a disabled subscription',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference to enable'
        }
      },
      required: ['subscriptionReference']
    }
  },
  {
    name: 'disable_subscription',
    description: 'Disable an active subscription',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference to disable'
        }
      },
      required: ['subscriptionReference']
    }
  },
  {
    name: 'cancel_subscription',
    description: 'Cancel a subscription',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference to cancel'
        }
      },
      required: ['subscriptionReference']
    }
  },
  {
    name: 'update_subscription_payment',
    description: 'Update subscription payment method using a 2Pay.js token',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference'
        },
        eesToken: {
          type: 'string',
          description: '2Pay.js payment token'
        },
        holderName: {
          type: 'string',
          description: 'Card holder name'
        }
      },
      required: ['subscriptionReference', 'eesToken']
    }
  },
  {
    name: 'get_next_renewal_price',
    description: 'Get the next renewal price for a subscription',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference'
        }
      },
      required: ['subscriptionReference']
    }
  },
  {
    name: 'get_subscription_history',
    description: 'Get transaction history for a subscription',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference'
        }
      },
      required: ['subscriptionReference']
    }
  },
  {
    name: 'upgrade_subscription',
    description: 'Upgrade a subscription to a different product',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference to upgrade'
        },
        productCode: {
          type: 'string',
          description: 'New product code'
        },
        quantity: {
          type: 'number',
          description: 'New quantity'
        },
        priceOptions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Price option codes'
        }
      },
      required: ['subscriptionReference', 'productCode']
    }
  },
  {
    name: 'place_renewal_order',
    description: 'Manually place a renewal order for a subscription',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference'
        }
      },
      required: ['subscriptionReference']
    }
  },
  {
    name: 'convert_trial',
    description: 'Convert a trial subscription to paid',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Trial subscription reference'
        }
      },
      required: ['subscriptionReference']
    }
  }
];
