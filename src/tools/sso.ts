import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  SSOToken,
  SSOCustomerInfo,
  ApiResponse
} from '../types/2checkout.js';

export class SSOTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Generate SSO token for cart
   */
  async ssoCart(
    customerEmail: string,
    returnUrl: string,
    productCodes?: string[]
  ): Promise<ApiResponse<SSOToken>> {
    const params = {
      Email: customerEmail,
      ReturnUrl: returnUrl,
      ProductCodes: productCodes
    };

    const result = await this.client.rpcRequest<SSOToken>('ssoCart', [params]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Generate SSO token by customer reference
   */
  async ssoByCustomerReference(
    customerReference: string,
    returnUrl: string
  ): Promise<ApiResponse<SSOToken>> {
    const result = await this.client.rpcRequest<SSOToken>('ssoCustomerReference', [customerReference, returnUrl]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Generate SSO token by subscription reference
   */
  async ssoBySubscriptionReference(
    subscriptionReference: string,
    returnUrl: string
  ): Promise<ApiResponse<SSOToken>> {
    const result = await this.client.rpcRequest<SSOToken>('ssoSubscriptionReference', [subscriptionReference, returnUrl]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get customer info from SSO token
   */
  async getCustomerInfoByToken(ssoToken: string): Promise<ApiResponse<SSOCustomerInfo>> {
    const result = await this.client.rpcRequest<SSOCustomerInfo>('getSSOCustomerInfo', [ssoToken]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }
}

// Tool definitions for MCP
export const ssoToolDefinitions = [
  {
    name: 'sso_cart',
    description: 'Generate SSO token for cart access',
    inputSchema: {
      type: 'object',
      properties: {
        customerEmail: {
          type: 'string',
          description: 'Customer email address'
        },
        returnUrl: {
          type: 'string',
          description: 'URL to return after SSO'
        },
        productCodes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Products to add to cart'
        }
      },
      required: ['customerEmail', 'returnUrl']
    }
  },
  {
    name: 'sso_by_customer_reference',
    description: 'Generate SSO token using customer reference',
    inputSchema: {
      type: 'object',
      properties: {
        customerReference: {
          type: 'string',
          description: 'Customer reference ID'
        },
        returnUrl: {
          type: 'string',
          description: 'URL to return after SSO'
        }
      },
      required: ['customerReference', 'returnUrl']
    }
  },
  {
    name: 'sso_by_subscription_reference',
    description: 'Generate SSO token using subscription reference',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionReference: {
          type: 'string',
          description: 'Subscription reference ID'
        },
        returnUrl: {
          type: 'string',
          description: 'URL to return after SSO'
        }
      },
      required: ['subscriptionReference', 'returnUrl']
    }
  },
  {
    name: 'get_customer_info_by_sso_token',
    description: 'Get customer info from an SSO token',
    inputSchema: {
      type: 'object',
      properties: {
        ssoToken: {
          type: 'string',
          description: 'SSO token'
        }
      },
      required: ['ssoToken']
    }
  }
];
