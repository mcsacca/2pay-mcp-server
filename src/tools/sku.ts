import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  SKUCode,
  SKUSearchOptions,
  SearchResponse,
  ApiResponse
} from '../types/2checkout.js';

export class SKUTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Set SKU code for a product
   */
  async setSKUCode(skuCode: SKUCode): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('setSKUCode', [skuCode]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Search SKU codes
   */
  async searchSKUCodes(options?: SKUSearchOptions): Promise<ApiResponse<SearchResponse<SKUCode>>> {
    const result = await this.client.rpcRequest<SearchResponse<SKUCode>>('searchSKUCode', [options || {}]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Delete SKU code
   */
  async deleteSKUCode(productCode: string, sku: string): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('deleteSKUCode', [productCode, sku]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Generate SKU schema for a product
   */
  async generateSKUSchema(productCode: string): Promise<ApiResponse<unknown>> {
    const result = await this.client.rpcRequest('generateSKUSchema', [productCode]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }
}

// Tool definitions for MCP
export const skuToolDefinitions = [
  {
    name: 'set_sku_code',
    description: 'Set SKU code for a product with specific price options',
    inputSchema: {
      type: 'object',
      properties: {
        productCode: {
          type: 'string',
          description: 'Product code'
        },
        priceOptionCodes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Price option codes'
        },
        sku: {
          type: 'string',
          description: 'SKU identifier'
        },
        currency: {
          type: 'string',
          description: 'Currency code (optional)'
        }
      },
      required: ['productCode', 'priceOptionCodes', 'sku']
    }
  },
  {
    name: 'search_sku_codes',
    description: 'Search SKU codes',
    inputSchema: {
      type: 'object',
      properties: {
        productCode: {
          type: 'string',
          description: 'Filter by product code'
        },
        sku: {
          type: 'string',
          description: 'Filter by SKU'
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
    name: 'delete_sku_code',
    description: 'Delete a SKU code',
    inputSchema: {
      type: 'object',
      properties: {
        productCode: {
          type: 'string',
          description: 'Product code'
        },
        sku: {
          type: 'string',
          description: 'SKU to delete'
        }
      },
      required: ['productCode', 'sku']
    }
  },
  {
    name: 'generate_sku_schema',
    description: 'Generate SKU schema for a product',
    inputSchema: {
      type: 'object',
      properties: {
        productCode: {
          type: 'string',
          description: 'Product code'
        }
      },
      required: ['productCode']
    }
  }
];
