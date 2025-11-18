import { TwoCheckoutAuth } from '../auth/authentication.js';
import {
  TwoCheckoutConfig,
  JsonRpcRequest,
  JsonRpcResponse,
  ApiResponse,
  ApiError
} from '../types/2checkout.js';

// Default configuration values
const DEFAULT_TIMEOUT = 30000;      // 30 seconds
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;   // 1 second

// Errors that should trigger a retry
const RETRYABLE_ERRORS = [
  'NETWORK_ERROR',
  'TIMEOUT_ERROR',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND'
];

export class TwoCheckoutApiClient {
  private auth: TwoCheckoutAuth;
  private requestId: number = 1;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config: TwoCheckoutConfig) {
    this.auth = new TwoCheckoutAuth(config);
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY;
  }

  /**
   * Make a REST API request with timeout and retry support
   */
  async restRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const url = `${this.auth.getRestUrl()}${endpoint}`;
    const authHeader = this.auth.formatAuthHeaderString();

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

    return this.executeWithRetry<T>(async () => {
      const response = await this.fetchWithTimeout(url, options);
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

      // Validate response structure
      const validationError = this.validateRestResponse(data);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      return {
        success: true,
        data: data as T
      };
    });
  }

  /**
   * Make a JSON-RPC API request with timeout and retry support
   */
  async rpcRequest<T>(
    method: string,
    params: unknown[] = []
  ): Promise<ApiResponse<T>> {
    return this.executeWithRetry<T>(async () => {
      const sessionId = await this.auth.getSessionId();
      const url = this.auth.getJsonRpcUrl();

      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method,
        params: [sessionId, ...params]
      };

      const response = await this.fetchWithTimeout(url, {
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

      // Validate JSON-RPC response structure
      const validationError = this.validateRpcResponse(result);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

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
    });
  }

  /**
   * Execute a request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    let lastError: ApiError = {
      Code: 'UNKNOWN_ERROR',
      Message: 'Unknown error occurred'
    };

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await requestFn();

        // Don't retry if request succeeded or error is not retryable
        if (result.success || !this.isRetryableError(result.error?.Code)) {
          return result;
        }

        lastError = result.error!;
      } catch (error) {
        lastError = this.createErrorFromException(error);

        // Don't retry non-retryable errors
        if (!this.isRetryableError(lastError.Code)) {
          return {
            success: false,
            error: lastError
          };
        }
      }

      // Wait before retrying (except on last attempt)
      if (attempt < this.maxRetries) {
        await this.sleep(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
      }
    }

    return {
      success: false,
      error: {
        Code: lastError.Code,
        Message: `${lastError.Message} (after ${this.maxRetries + 1} attempts)`
      }
    };
  }

  /**
   * Fetch with timeout support
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(code?: string): boolean {
    if (!code) return false;
    return RETRYABLE_ERRORS.some(retryable =>
      code.includes(retryable) || code === retryable
    );
  }

  /**
   * Create ApiError from exception
   */
  private createErrorFromException(error: unknown): ApiError {
    if (error instanceof Error) {
      // Check for timeout
      if (error.message.includes('timeout')) {
        return {
          Code: 'TIMEOUT_ERROR',
          Message: error.message
        };
      }
      // Check for network errors
      if (error.message.includes('ECONNREFUSED') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('fetch failed')) {
        return {
          Code: 'NETWORK_ERROR',
          Message: error.message
        };
      }
      return {
        Code: 'REQUEST_ERROR',
        Message: error.message
      };
    }
    return {
      Code: 'UNKNOWN_ERROR',
      Message: 'Unknown error occurred'
    };
  }

  /**
   * Validate REST API response structure
   */
  private validateRestResponse(data: unknown): ApiError | null {
    if (data === null || data === undefined) {
      return {
        Code: 'INVALID_RESPONSE',
        Message: 'API returned null or undefined response'
      };
    }

    if (typeof data !== 'object') {
      return {
        Code: 'INVALID_RESPONSE',
        Message: `Expected object response, got ${typeof data}`
      };
    }

    return null;
  }

  /**
   * Validate JSON-RPC response structure
   */
  private validateRpcResponse<T>(result: JsonRpcResponse<T>): ApiError | null {
    if (!result) {
      return {
        Code: 'INVALID_RESPONSE',
        Message: 'API returned empty response'
      };
    }

    if (result.jsonrpc !== '2.0') {
      return {
        Code: 'INVALID_RESPONSE',
        Message: `Invalid JSON-RPC version: ${result.jsonrpc}`
      };
    }

    if (result.id === undefined) {
      return {
        Code: 'INVALID_RESPONSE',
        Message: 'JSON-RPC response missing id field'
      };
    }

    // Must have either result or error
    if (result.result === undefined && !result.error) {
      return {
        Code: 'INVALID_RESPONSE',
        Message: 'JSON-RPC response missing both result and error'
      };
    }

    return null;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get authentication handler
   */
  getAuth(): TwoCheckoutAuth {
    return this.auth;
  }

  /**
   * Get current timeout setting
   */
  getTimeout(): number {
    return this.timeout;
  }

  /**
   * Get current max retries setting
   */
  getMaxRetries(): number {
    return this.maxRetries;
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
  'CURRENCY_MISMATCH': 'Payment currency does not match order currency',
  'NETWORK_ERROR': 'Network error occurred while connecting to the API',
  'TIMEOUT_ERROR': 'Request timed out',
  'INVALID_RESPONSE': 'Invalid response received from API'
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(code: string, defaultMessage: string): string {
  return ERROR_MESSAGES[code] || defaultMessage;
}
