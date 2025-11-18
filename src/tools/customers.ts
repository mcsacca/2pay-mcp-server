import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  Customer,
  CustomerResponse,
  Subscription,
  SearchResponse,
  ApiResponse
} from '../types/2checkout.js';

export class CustomerTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Create a new customer
   */
  async createCustomer(customer: Customer): Promise<ApiResponse<CustomerResponse>> {
    const result = await this.client.rpcRequest<CustomerResponse>('createCustomer', [customer]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get customer by reference
   */
  async getCustomer(customerReference: string): Promise<ApiResponse<CustomerResponse>> {
    const result = await this.client.rpcRequest<CustomerResponse>('getCustomer', [customerReference]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string): Promise<ApiResponse<CustomerResponse>> {
    const result = await this.client.rpcRequest<CustomerResponse>('getCustomerByEmail', [email]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Update customer information
   */
  async updateCustomer(customerReference: string, customer: Partial<Customer>): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('updateCustomer', [customerReference, customer]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get all subscriptions for a customer
   */
  async getCustomerSubscriptions(customerReference: string): Promise<ApiResponse<Subscription[]>> {
    const result = await this.client.rpcRequest<Subscription[]>('getCustomerSubscriptions', [customerReference]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(customerReference: string): Promise<ApiResponse<boolean>> {
    return this.client.rpcRequest<boolean>('deleteCustomer', [customerReference]);
  }
}

// Tool definitions for MCP
export const customerToolDefinitions = [
  {
    name: 'create_customer',
    description: 'Create a new customer record',
    inputSchema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'Customer first name'
        },
        lastName: {
          type: 'string',
          description: 'Customer last name'
        },
        email: {
          type: 'string',
          description: 'Customer email'
        },
        phone: {
          type: 'string',
          description: 'Customer phone'
        },
        company: {
          type: 'string',
          description: 'Company name'
        },
        address1: {
          type: 'string',
          description: 'Street address'
        },
        city: {
          type: 'string',
          description: 'City'
        },
        state: {
          type: 'string',
          description: 'State/Province'
        },
        zip: {
          type: 'string',
          description: 'Postal code'
        },
        countryCode: {
          type: 'string',
          description: 'Country code (e.g., US, GB)'
        },
        externalCustomerReference: {
          type: 'string',
          description: 'Your external customer ID'
        }
      },
      required: ['firstName', 'lastName', 'email']
    }
  },
  {
    name: 'get_customer',
    description: 'Get customer details by reference',
    inputSchema: {
      type: 'object',
      properties: {
        customerReference: {
          type: 'string',
          description: 'Customer reference ID'
        }
      },
      required: ['customerReference']
    }
  },
  {
    name: 'get_customer_by_email',
    description: 'Get customer details by email address',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Customer email address'
        }
      },
      required: ['email']
    }
  },
  {
    name: 'update_customer',
    description: 'Update customer information',
    inputSchema: {
      type: 'object',
      properties: {
        customerReference: {
          type: 'string',
          description: 'Customer reference ID'
        },
        firstName: {
          type: 'string',
          description: 'Updated first name'
        },
        lastName: {
          type: 'string',
          description: 'Updated last name'
        },
        email: {
          type: 'string',
          description: 'Updated email'
        },
        phone: {
          type: 'string',
          description: 'Updated phone'
        },
        company: {
          type: 'string',
          description: 'Updated company'
        },
        address1: {
          type: 'string',
          description: 'Updated address'
        },
        city: {
          type: 'string',
          description: 'Updated city'
        },
        state: {
          type: 'string',
          description: 'Updated state'
        },
        zip: {
          type: 'string',
          description: 'Updated postal code'
        },
        countryCode: {
          type: 'string',
          description: 'Updated country code'
        }
      },
      required: ['customerReference']
    }
  },
  {
    name: 'get_customer_subscriptions',
    description: 'Get all subscriptions for a customer',
    inputSchema: {
      type: 'object',
      properties: {
        customerReference: {
          type: 'string',
          description: 'Customer reference ID'
        }
      },
      required: ['customerReference']
    }
  },
  {
    name: 'delete_customer',
    description: 'Delete a customer record',
    inputSchema: {
      type: 'object',
      properties: {
        customerReference: {
          type: 'string',
          description: 'Customer reference ID to delete'
        }
      },
      required: ['customerReference']
    }
  }
];
