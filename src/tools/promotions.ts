import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  Promotion,
  PromotionResponse,
  SearchResponse,
  ApiResponse,
  PaginationOptions
} from '../types/2checkout.js';

export class PromotionTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Create a new promotion
   */
  async createPromotion(promotion: Promotion): Promise<ApiResponse<PromotionResponse>> {
    const result = await this.client.rpcRequest<PromotionResponse>('createPromotion', [promotion]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get promotion by code
   */
  async getPromotion(promotionCode: string): Promise<ApiResponse<PromotionResponse>> {
    const result = await this.client.rpcRequest<PromotionResponse>('getPromotion', [promotionCode]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Update a promotion
   */
  async updatePromotion(promotionCode: string, promotion: Partial<Promotion>): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('updatePromotion', [promotionCode, promotion]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Delete a promotion
   */
  async deletePromotion(promotionCode: string): Promise<ApiResponse<boolean>> {
    return this.client.rpcRequest<boolean>('deletePromotion', [promotionCode]);
  }

  /**
   * Search promotions
   */
  async searchPromotions(options: PaginationOptions & { enabled?: boolean }): Promise<ApiResponse<SearchResponse<PromotionResponse>>> {
    const result = await this.client.rpcRequest<SearchResponse<PromotionResponse>>('searchPromotions', [options]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Generate coupons for a promotion
   */
  async generateCoupons(promotionCode: string, numberOfCoupons: number): Promise<ApiResponse<string[]>> {
    return this.client.rpcRequest<string[]>('generatePromotionCoupons', [promotionCode, numberOfCoupons]);
  }

  /**
   * Get coupons for a promotion
   */
  async getCoupons(promotionCode: string, options?: PaginationOptions): Promise<ApiResponse<SearchResponse<string>>> {
    return this.client.rpcRequest<SearchResponse<string>>('getPromotionCoupons', [promotionCode, options]);
  }
}

// Tool definitions for MCP
export const promotionToolDefinitions = [
  {
    name: 'create_promotion',
    description: 'Create a new promotion or discount',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Promotion name'
        },
        description: {
          type: 'string',
          description: 'Promotion description'
        },
        startDate: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)'
        },
        endDate: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)'
        },
        discountType: {
          type: 'string',
          enum: ['PERCENT', 'FIXED'],
          description: 'Type of discount'
        },
        discountValue: {
          type: 'number',
          description: 'Discount value (percentage or fixed amount)'
        },
        couponType: {
          type: 'string',
          enum: ['SINGLE', 'MULTIPLE'],
          description: 'Coupon type (single code or multiple)'
        },
        couponCode: {
          type: 'string',
          description: 'Coupon code (for single type)'
        },
        productCodes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product codes to apply promotion to'
        },
        maximumOrders: {
          type: 'number',
          description: 'Maximum number of orders'
        },
        applyRecurring: {
          type: 'boolean',
          description: 'Apply to recurring charges'
        }
      },
      required: ['name', 'startDate', 'endDate', 'discountType', 'discountValue']
    }
  },
  {
    name: 'get_promotion',
    description: 'Get promotion details by code',
    inputSchema: {
      type: 'object',
      properties: {
        promotionCode: {
          type: 'string',
          description: 'Promotion code'
        }
      },
      required: ['promotionCode']
    }
  },
  {
    name: 'update_promotion',
    description: 'Update a promotion',
    inputSchema: {
      type: 'object',
      properties: {
        promotionCode: {
          type: 'string',
          description: 'Promotion code to update'
        },
        name: {
          type: 'string',
          description: 'Updated name'
        },
        description: {
          type: 'string',
          description: 'Updated description'
        },
        endDate: {
          type: 'string',
          description: 'Updated end date'
        },
        enabled: {
          type: 'boolean',
          description: 'Enable/disable promotion'
        },
        discountValue: {
          type: 'number',
          description: 'Updated discount value'
        }
      },
      required: ['promotionCode']
    }
  },
  {
    name: 'delete_promotion',
    description: 'Delete a promotion',
    inputSchema: {
      type: 'object',
      properties: {
        promotionCode: {
          type: 'string',
          description: 'Promotion code to delete'
        }
      },
      required: ['promotionCode']
    }
  },
  {
    name: 'search_promotions',
    description: 'Search for promotions',
    inputSchema: {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          description: 'Filter by enabled status'
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
    name: 'generate_coupons',
    description: 'Generate coupon codes for a promotion',
    inputSchema: {
      type: 'object',
      properties: {
        promotionCode: {
          type: 'string',
          description: 'Promotion code'
        },
        numberOfCoupons: {
          type: 'number',
          description: 'Number of coupons to generate'
        }
      },
      required: ['promotionCode', 'numberOfCoupons']
    }
  },
  {
    name: 'get_coupons',
    description: 'Get coupon codes for a promotion',
    inputSchema: {
      type: 'object',
      properties: {
        promotionCode: {
          type: 'string',
          description: 'Promotion code'
        },
        page: {
          type: 'number',
          description: 'Page number'
        },
        limit: {
          type: 'number',
          description: 'Results per page'
        }
      },
      required: ['promotionCode']
    }
  }
];
