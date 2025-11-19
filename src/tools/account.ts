import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  AccountBalance,
  Payout,
  PayoutSearchOptions,
  Country,
  Currency,
  SearchResponse,
  ApiResponse
} from '../types/2checkout.js';

export class AccountTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<ApiResponse<AccountBalance>> {
    const result = await this.client.rpcRequest<AccountBalance>('getAccountBalance', []);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Search historical payouts
   */
  async searchPayouts(options?: PayoutSearchOptions): Promise<ApiResponse<SearchResponse<Payout>>> {
    const result = await this.client.rpcRequest<SearchResponse<Payout>>('searchPayouts', [options || {}]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get available countries
   */
  async getCountries(): Promise<ApiResponse<Country[]>> {
    const result = await this.client.rpcRequest<Country[]>('getCountries', []);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get available currencies
   */
  async getCurrencies(): Promise<ApiResponse<Currency[]>> {
    const result = await this.client.rpcRequest<Currency[]>('getCurrencies', []);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get account timezone
   */
  async getAccountTimezone(): Promise<ApiResponse<string>> {
    const result = await this.client.rpcRequest<string>('getAccountTimeZone', []);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }
}

// Tool definitions for MCP
export const accountToolDefinitions = [
  {
    name: 'get_account_balance',
    description: 'Get current account balance and pending amounts',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'search_payouts',
    description: 'Search historical payouts',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)'
        },
        endDate: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)'
        },
        status: {
          type: 'string',
          description: 'Payout status'
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
    name: 'get_countries',
    description: 'Get list of available countries',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_currencies',
    description: 'Get list of available currencies',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_account_timezone',
    description: 'Get account timezone setting',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];
