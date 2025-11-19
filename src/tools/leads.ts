import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  Lead,
  LeadResponse,
  LeadSearchOptions,
  SearchResponse,
  ApiResponse
} from '../types/2checkout.js';

export class LeadTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Create a new lead (cart abandonment tracking)
   */
  async createLead(lead: Lead): Promise<ApiResponse<LeadResponse>> {
    const result = await this.client.rpcRequest<LeadResponse>('addLead', [lead]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get a lead by code
   */
  async getLead(leadCode: string): Promise<ApiResponse<LeadResponse>> {
    const result = await this.client.rpcRequest<LeadResponse>('getLead', [leadCode]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Update an existing lead
   */
  async updateLead(leadCode: string, lead: Partial<Lead>): Promise<ApiResponse<LeadResponse>> {
    const result = await this.client.rpcRequest<LeadResponse>('updateLead', [leadCode, lead]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Search leads with filters
   */
  async searchLeads(options: LeadSearchOptions): Promise<ApiResponse<SearchResponse<LeadResponse>>> {
    const result = await this.client.rpcRequest<SearchResponse<LeadResponse>>('searchLeads', [options]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Mark leads as used and stop follow-ups
   */
  async markLeadsAsUsed(leadCodes: string[]): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('markLeadsAsUsed', [leadCodes]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }
}

// Tool definitions for MCP
export const leadToolDefinitions = [
  {
    name: 'create_lead',
    description: 'Create a lead for cart abandonment tracking',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Customer email address'
        },
        firstName: {
          type: 'string',
          description: 'Customer first name'
        },
        lastName: {
          type: 'string',
          description: 'Customer last name'
        },
        company: {
          type: 'string',
          description: 'Company name'
        },
        phone: {
          type: 'string',
          description: 'Phone number'
        },
        country: {
          type: 'string',
          description: 'Country code'
        },
        language: {
          type: 'string',
          description: 'Language code'
        },
        campaign: {
          type: 'string',
          description: 'Campaign identifier'
        },
        cartItems: {
          type: 'array',
          description: 'Products in the cart',
          items: {
            type: 'object',
            properties: {
              productCode: {
                type: 'string',
                description: 'Product code'
              },
              quantity: {
                type: 'number',
                description: 'Quantity'
              }
            },
            required: ['productCode', 'quantity']
          }
        }
      },
      required: ['email']
    }
  },
  {
    name: 'get_lead',
    description: 'Get a lead by its code',
    inputSchema: {
      type: 'object',
      properties: {
        leadCode: {
          type: 'string',
          description: 'Lead code'
        }
      },
      required: ['leadCode']
    }
  },
  {
    name: 'update_lead',
    description: 'Update an existing lead',
    inputSchema: {
      type: 'object',
      properties: {
        leadCode: {
          type: 'string',
          description: 'Lead code to update'
        },
        email: {
          type: 'string',
          description: 'Customer email'
        },
        firstName: {
          type: 'string',
          description: 'First name'
        },
        lastName: {
          type: 'string',
          description: 'Last name'
        },
        phone: {
          type: 'string',
          description: 'Phone number'
        },
        country: {
          type: 'string',
          description: 'Country code'
        }
      },
      required: ['leadCode']
    }
  },
  {
    name: 'search_leads',
    description: 'Search leads with filters',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Filter by email'
        },
        country: {
          type: 'string',
          description: 'Filter by country'
        },
        language: {
          type: 'string',
          description: 'Filter by language'
        },
        startDate: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)'
        },
        endDate: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)'
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
    name: 'mark_leads_as_used',
    description: 'Mark leads as used and stop follow-up emails',
    inputSchema: {
      type: 'object',
      properties: {
        leadCodes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of lead codes to mark as used'
        }
      },
      required: ['leadCodes']
    }
  }
];
