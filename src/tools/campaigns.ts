import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  CrossSellCampaign,
  CrossSellCampaignResponse,
  CrossSellSearchOptions,
  UpsellCampaign,
  UpsellCampaignResponse,
  UpsellSearchOptions,
  SearchResponse,
  ApiResponse
} from '../types/2checkout.js';

export class CampaignTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  // Cross-sell Campaign Methods

  /**
   * Create a cross-sell campaign
   */
  async createCrossSellCampaign(campaign: CrossSellCampaign): Promise<ApiResponse<CrossSellCampaignResponse>> {
    const result = await this.client.rpcRequest<CrossSellCampaignResponse>('createCrossSellCampaign', [campaign]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get a cross-sell campaign by code
   */
  async getCrossSellCampaign(campaignCode: string): Promise<ApiResponse<CrossSellCampaignResponse>> {
    const result = await this.client.rpcRequest<CrossSellCampaignResponse>('getCrossSellCampaign', [campaignCode]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Update a cross-sell campaign
   */
  async updateCrossSellCampaign(campaignCode: string, campaign: Partial<CrossSellCampaign>): Promise<ApiResponse<CrossSellCampaignResponse>> {
    const result = await this.client.rpcRequest<CrossSellCampaignResponse>('updateCrossSellCampaign', [campaignCode, campaign]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Search cross-sell campaigns
   */
  async searchCrossSellCampaigns(options: CrossSellSearchOptions): Promise<ApiResponse<SearchResponse<CrossSellCampaignResponse>>> {
    const result = await this.client.rpcRequest<SearchResponse<CrossSellCampaignResponse>>('searchCrossSellCampaigns', [options]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  // Upsell Campaign Methods

  /**
   * Create an upsell campaign
   */
  async createUpsellCampaign(campaign: UpsellCampaign): Promise<ApiResponse<UpsellCampaignResponse>> {
    const result = await this.client.rpcRequest<UpsellCampaignResponse>('createUpsellCampaign', [campaign]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Update an upsell campaign
   */
  async updateUpsellCampaign(campaignCode: string, campaign: Partial<UpsellCampaign>): Promise<ApiResponse<UpsellCampaignResponse>> {
    const result = await this.client.rpcRequest<UpsellCampaignResponse>('updateUpsellCampaign', [campaignCode, campaign]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Delete an upsell campaign
   */
  async deleteUpsellCampaign(campaignCode: string): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('deleteUpsellCampaign', [campaignCode]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Search upsell campaigns
   */
  async searchUpsellCampaigns(options: UpsellSearchOptions): Promise<ApiResponse<SearchResponse<UpsellCampaignResponse>>> {
    const result = await this.client.rpcRequest<SearchResponse<UpsellCampaignResponse>>('searchUpsellCampaigns', [options]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }
}

// Tool definitions for MCP
export const campaignToolDefinitions = [
  // Cross-sell tools
  {
    name: 'create_cross_sell_campaign',
    description: 'Create a cross-sell campaign to recommend additional products',
    inputSchema: {
      type: 'object',
      properties: {
        campaignName: {
          type: 'string',
          description: 'Campaign name'
        },
        startDate: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)'
        },
        endDate: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)'
        },
        masterProducts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product codes that trigger the campaign'
        },
        displayProducts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product codes to recommend'
        },
        displayType: {
          type: 'string',
          description: 'Display type for the campaign'
        },
        autoDisplay: {
          type: 'boolean',
          description: 'Auto-display the campaign'
        }
      },
      required: ['campaignName', 'startDate', 'endDate', 'masterProducts', 'displayProducts']
    }
  },
  {
    name: 'get_cross_sell_campaign',
    description: 'Get a cross-sell campaign by code',
    inputSchema: {
      type: 'object',
      properties: {
        campaignCode: {
          type: 'string',
          description: 'Campaign code'
        }
      },
      required: ['campaignCode']
    }
  },
  {
    name: 'update_cross_sell_campaign',
    description: 'Update a cross-sell campaign',
    inputSchema: {
      type: 'object',
      properties: {
        campaignCode: {
          type: 'string',
          description: 'Campaign code to update'
        },
        campaignName: {
          type: 'string',
          description: 'New campaign name'
        },
        startDate: {
          type: 'string',
          description: 'New start date'
        },
        endDate: {
          type: 'string',
          description: 'New end date'
        },
        masterProducts: {
          type: 'array',
          items: { type: 'string' },
          description: 'New trigger products'
        },
        displayProducts: {
          type: 'array',
          items: { type: 'string' },
          description: 'New recommended products'
        }
      },
      required: ['campaignCode']
    }
  },
  {
    name: 'search_cross_sell_campaigns',
    description: 'Search cross-sell campaigns',
    inputSchema: {
      type: 'object',
      properties: {
        campaignName: {
          type: 'string',
          description: 'Filter by campaign name'
        },
        status: {
          type: 'string',
          description: 'Filter by status'
        },
        page: {
          type: 'number',
          description: 'Page number'
        },
        limit: {
          type: 'number',
          description: 'Results per page'
        }
      }
    }
  },
  // Upsell tools
  {
    name: 'create_upsell_campaign',
    description: 'Create an upsell campaign to upgrade customers to better products',
    inputSchema: {
      type: 'object',
      properties: {
        campaignName: {
          type: 'string',
          description: 'Campaign name'
        },
        startDate: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)'
        },
        endDate: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)'
        },
        primaryProducts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product codes that trigger the upsell'
        },
        recommendedProduct: {
          type: 'string',
          description: 'Product code to recommend as upgrade'
        },
        discountType: {
          type: 'string',
          enum: ['PERCENT', 'FIXED'],
          description: 'Discount type'
        },
        discount: {
          type: 'number',
          description: 'Discount value'
        }
      },
      required: ['campaignName', 'startDate', 'endDate', 'primaryProducts', 'recommendedProduct']
    }
  },
  {
    name: 'update_upsell_campaign',
    description: 'Update an upsell campaign',
    inputSchema: {
      type: 'object',
      properties: {
        campaignCode: {
          type: 'string',
          description: 'Campaign code to update'
        },
        campaignName: {
          type: 'string',
          description: 'New campaign name'
        },
        startDate: {
          type: 'string',
          description: 'New start date'
        },
        endDate: {
          type: 'string',
          description: 'New end date'
        },
        primaryProducts: {
          type: 'array',
          items: { type: 'string' },
          description: 'New trigger products'
        },
        recommendedProduct: {
          type: 'string',
          description: 'New recommended product'
        },
        discountType: {
          type: 'string',
          enum: ['PERCENT', 'FIXED'],
          description: 'New discount type'
        },
        discount: {
          type: 'number',
          description: 'New discount value'
        }
      },
      required: ['campaignCode']
    }
  },
  {
    name: 'delete_upsell_campaign',
    description: 'Delete an upsell campaign',
    inputSchema: {
      type: 'object',
      properties: {
        campaignCode: {
          type: 'string',
          description: 'Campaign code to delete'
        }
      },
      required: ['campaignCode']
    }
  },
  {
    name: 'search_upsell_campaigns',
    description: 'Search upsell campaigns',
    inputSchema: {
      type: 'object',
      properties: {
        campaignName: {
          type: 'string',
          description: 'Filter by campaign name'
        },
        status: {
          type: 'string',
          description: 'Filter by status'
        },
        page: {
          type: 'number',
          description: 'Page number'
        },
        limit: {
          type: 'number',
          description: 'Results per page'
        }
      }
    }
  }
];
