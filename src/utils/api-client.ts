import { TwoCheckoutAuth } from '../auth/authentication.js';
import {
  TwoCheckoutConfig,
  JsonRpcRequest,
  JsonRpcResponse,
  ApiResponse,
  ApiError
} from '../types/2checkout.js';

export class TwoCheckoutApiClient {
  private auth: TwoCheckoutAuth;
  private requestId: number = 1;

  constructor(config: TwoCheckoutConfig) {
    this.auth = new TwoCheckoutAuth(config);
  }

  /**
   * Make a REST API request
   */
  async restRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const url = `${this.auth.getRestUrl()}${endpoint}`;
    const authHeader = this.auth.formatAuthHeaderString();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Avangate-Authentication': authHeader
        }
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json() as Record<string, unknown>;

      if (!response.ok) {
        return {
          success: false,
          error: {
            Code: String(response.status),
            Message: (data.message as string) || (data.error_message as string) || response.statusText
          }
        };
      }

      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      return {
        success: false,
        error: {
          Code: 'NETWORK_ERROR',
          Message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Make a JSON-RPC API request
   */
  async rpcRequest<T>(
    method: string,
    params: unknown[] = []
  ): Promise<ApiResponse<T>> {
    try {
      const sessionId = await this.auth.getSessionId();
      const url = this.auth.getJsonRpcUrl();

      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method,
        params: [sessionId, ...params]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            Code: String(response.status),
            Message: response.statusText
          }
        };
      }

      const result = await response.json() as JsonRpcResponse<T>;

      if (result.error) {
        // Handle session expiry
        if (result.error.code === -32001 || result.error.message.includes('session')) {
          this.auth.clearSession();
        }

        return {
          success: false,
          error: {
            Code: String(result.error.code),
            Message: result.error.message
          }
        };
      }

      return {
        success: true,
        data: result.result
      };
    } catch (error) {
      return {
        success: false,
        error: {
          Code: 'NETWORK_ERROR',
          Message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get authentication handler
   */
  getAuth(): TwoCheckoutAuth {
    return this.auth;
  }
}

// Error code mappings for user-friendly messages
export const ERROR_MESSAGES: Record<string, string> = {
  'INVALID_CUSTOMER': 'Customer information is invalid or missing required fields',
  'INVALID_PRODUCT': 'Product code is invalid or product not found',
  'INVALID_PAYMENT': 'Payment information is invalid',
  'TOKEN_EXPIRED': 'Payment token has expired (tokens are valid for 30 minutes)',
  'INSUFFICIENT_FUNDS': 'Payment declined due to insufficient funds',
  'CARD_DECLINED': 'Credit card was declined by the issuing bank',
  'INVALID_CVV': 'Card security code (CVV) is invalid',
  'EXPIRED_CARD': 'Credit card has expired',
  'SUBSCRIPTION_NOT_FOUND': 'Subscription reference not found',
  'ORDER_NOT_FOUND': 'Order reference not found',
  'INVALID_PROMOTION': 'Promotion code is invalid or expired',
  'FRAUD_DETECTED': 'Transaction flagged for potential fraud',
  'DUPLICATE_ORDER': 'Duplicate order detected',
  'CURRENCY_MISMATCH': 'Payment currency does not match order currency'
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(code: string, defaultMessage: string): string {
  return ERROR_MESSAGES[code] || defaultMessage;
}
