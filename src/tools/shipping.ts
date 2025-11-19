import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  ShippingMethod,
  ShippingInfo,
  ShippingSearchOptions,
  SearchResponse,
  ApiResponse
} from '../types/2checkout.js';

export class ShippingTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Mark an order as shipped
   */
  async markAsShipped(shippingInfo: ShippingInfo): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('markAsShipped', [shippingInfo]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Search shipping methods
   */
  async searchShippingMethods(options?: ShippingSearchOptions): Promise<ApiResponse<SearchResponse<ShippingMethod>>> {
    const result = await this.client.rpcRequest<SearchResponse<ShippingMethod>>('searchShippingMethods', [options || {}]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get shipping price for an order
   */
  async getShippingPrice(
    countryCode: string,
    productCodes: string[],
    shippingMethodCode?: string
  ): Promise<ApiResponse<unknown>> {
    const params = {
      CountryCode: countryCode,
      ProductCodes: productCodes,
      ShippingMethodCode: shippingMethodCode
    };

    const result = await this.client.rpcRequest('getShippingPrice', [params]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }
}

// Tool definitions for MCP
export const shippingToolDefinitions = [
  {
    name: 'mark_order_shipped',
    description: 'Mark an order as shipped with tracking information',
    inputSchema: {
      type: 'object',
      properties: {
        orderReference: {
          type: 'string',
          description: 'Order reference number'
        },
        trackingNumber: {
          type: 'string',
          description: 'Shipping tracking number'
        },
        trackingUrl: {
          type: 'string',
          description: 'URL to track the shipment'
        },
        shippingMethodCode: {
          type: 'string',
          description: 'Shipping method code'
        }
      },
      required: ['orderReference']
    }
  },
  {
    name: 'search_shipping_methods',
    description: 'Search available shipping methods',
    inputSchema: {
      type: 'object',
      properties: {
        country: {
          type: 'string',
          description: 'Filter by country code'
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
  {
    name: 'get_shipping_price',
    description: 'Get shipping price for products to a country',
    inputSchema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'Destination country code'
        },
        productCodes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product codes to ship'
        },
        shippingMethodCode: {
          type: 'string',
          description: 'Specific shipping method code'
        }
      },
      required: ['countryCode', 'productCodes']
    }
  }
];
