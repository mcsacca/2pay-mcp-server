import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  Product,
  SearchResponse,
  ApiResponse,
  PaginationOptions
} from '../types/2checkout.js';

export class ProductTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Get product by code
   */
  async getProduct(productCode: string): Promise<ApiResponse<Product>> {
    const result = await this.client.rpcRequest<Product>('getProductByCode', [productCode]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<ApiResponse<Product>> {
    const result = await this.client.rpcRequest<Product>('getProductById', [productId]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Search products
   */
  async searchProducts(options: PaginationOptions & { name?: string; enabled?: boolean }): Promise<ApiResponse<SearchResponse<Product>>> {
    const result = await this.client.rpcRequest<SearchResponse<Product>>('searchProducts', [options]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Enable a product
   */
  async enableProduct(productCode: string): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('enableProduct', [productCode]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Disable a product
   */
  async disableProduct(productCode: string): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('disableProduct', [productCode]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get pricing configurations for a product
   */
  async getProductPricing(productCode: string): Promise<ApiResponse<unknown>> {
    return this.client.rpcRequest('getPricingConfigurations', [productCode]);
  }

  /**
   * Update product pricing
   */
  async updateProductPricing(productCode: string, pricing: unknown): Promise<ApiResponse<boolean>> {
    return this.client.rpcRequest<boolean>('updatePricingConfiguration', [productCode, pricing]);
  }

  /**
   * Get price options for a product
   */
  async getPriceOptions(productCode: string): Promise<ApiResponse<unknown>> {
    return this.client.rpcRequest('getPriceOptionGroup', [productCode]);
  }
}

// Tool definitions for MCP
export const productToolDefinitions = [
  {
    name: 'get_product',
    description: 'Get product details by code',
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
  },
  {
    name: 'get_product_by_id',
    description: 'Get product details by ID',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID'
        }
      },
      required: ['productId']
    }
  },
  {
    name: 'search_products',
    description: 'Search for products in the catalog',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Product name filter'
        },
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
    name: 'enable_product',
    description: 'Enable a product in the catalog',
    inputSchema: {
      type: 'object',
      properties: {
        productCode: {
          type: 'string',
          description: 'Product code to enable'
        }
      },
      required: ['productCode']
    }
  },
  {
    name: 'disable_product',
    description: 'Disable a product in the catalog',
    inputSchema: {
      type: 'object',
      properties: {
        productCode: {
          type: 'string',
          description: 'Product code to disable'
        }
      },
      required: ['productCode']
    }
  },
  {
    name: 'get_product_pricing',
    description: 'Get pricing configurations for a product',
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
  },
  {
    name: 'get_price_options',
    description: 'Get price options for a product',
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
