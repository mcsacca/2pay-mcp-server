import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  Usage,
  UsageResponse,
  UsageSearchOptions,
  SearchResponse,
  ApiResponse
} from '../types/2checkout.js';

export class UsageTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Report/update usage for a subscription (metered billing)
   */
  async reportUsage(usage: Usage): Promise<ApiResponse<UsageResponse>> {
    const result = await this.client.rpcRequest<UsageResponse>('updateSubscriptionUsage', [usage]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get usage records for a subscription
   */
  async getUsage(subscriptionReference: string, options?: UsageSearchOptions): Promise<ApiResponse<SearchResponse<UsageResponse>>> {
    const searchOptions = {
      SubscriptionReference: subscriptionReference,
      ...options
    };

    const result = await this.client.rpcRequest<SearchResponse<UsageResponse>>('getSubscriptionUsage', [searchOptions]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Delete a usage record
   */
  async deleteUsage(usageReference: string): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('deleteSubscriptionUsage', [usageReference]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Trigger immediate billing for usage (before the normal interval)
   */
  async triggerUsageBilling(subscriptionReference: string): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('markUsageSubscriptionToRenewNow', [subscriptionReference]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Import multiple usage records at once
   */
  async importUsage(usageRecords: Usage[]): Promise<ApiResponse<UsageResponse[]>> {
    const result = await this.client.rpcRequest<UsageResponse[]>('importSubscriptionUsage', [usageRecords]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }
}

// Tool definitions for MCP
export const usageToolDefinitions = [
  {
    name: 'report_usage',
    description: 'Report usage/consumption for a metered subscription. Use this for usage-based billing with overages.',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference ID'
        },
        optionCode: {
          type: 'string',
          description: 'Price option code for the usage metric (e.g., "API_CALLS", "STORAGE_GB")'
        },
        units: {
          type: 'number',
          description: 'Number of units consumed'
        },
        usageStart: {
          type: 'string',
          description: 'Usage period start date (YYYY-MM-DD)'
        },
        usageEnd: {
          type: 'string',
          description: 'Usage period end date (YYYY-MM-DD)'
        },
        description: {
          type: 'string',
          description: 'Optional description of the usage'
        }
      },
      required: ['subscriptionReference', 'optionCode', 'units', 'usageStart', 'usageEnd']
    }
  },
  {
    name: 'get_usage',
    description: 'Get usage records for a subscription',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference ID'
        },
        startDate: {
          type: 'string',
          description: 'Filter by start date (YYYY-MM-DD)'
        },
        endDate: {
          type: 'string',
          description: 'Filter by end date (YYYY-MM-DD)'
        },
        page: {
          type: 'number',
          description: 'Page number (default: 1)'
        },
        limit: {
          type: 'number',
          description: 'Results per page (default: 10, max: 200)'
        }
      },
      required: ['subscriptionReference']
    }
  },
  {
    name: 'delete_usage',
    description: 'Delete a usage record',
    inputSchema: {
      type: 'object',
      properties: {
        usageReference: {
          type: 'string',
          description: 'Usage record reference ID to delete'
        }
      },
      required: ['usageReference']
    }
  },
  {
    name: 'trigger_usage_billing',
    description: 'Trigger immediate billing for a subscription\'s usage before the normal billing interval. Use when all usage for the current cycle has been reported.',
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
    name: 'import_usage',
    description: 'Import multiple usage records at once for batch processing',
    inputSchema: {
      type: 'object',
      properties: {
        usageRecords: {
          type: 'array',
          description: 'Array of usage records to import',
          items: {
            type: 'object',
            properties: {
              subscriptionReference: {
                type: 'string',
                description: 'Subscription reference ID'
              },
              optionCode: {
                type: 'string',
                description: 'Price option code'
              },
              units: {
                type: 'number',
                description: 'Number of units'
              },
              usageStart: {
                type: 'string',
                description: 'Start date (YYYY-MM-DD)'
              },
              usageEnd: {
                type: 'string',
                description: 'End date (YYYY-MM-DD)'
              },
              description: {
                type: 'string',
                description: 'Optional description'
              }
            },
            required: ['subscriptionReference', 'optionCode', 'units', 'usageStart', 'usageEnd']
          }
        }
      },
      required: ['usageRecords']
    }
  }
];
