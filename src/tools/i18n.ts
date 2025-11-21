import { TwoCheckoutApiClient, getErrorMessage } from '../utils/api-client.js';
import {
  PromotionTranslation,
  Translation,
  ApiResponse
} from '../types/2checkout.js';

export class I18nTools {
  private client: TwoCheckoutApiClient;

  constructor(client: TwoCheckoutApiClient) {
    this.client = client;
  }

  /**
   * Add translation for a promotion
   */
  async addPromotionTranslation(translation: PromotionTranslation): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('addPromotionTranslations', [translation]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Remove translations from a promotion
   */
  async removePromotionTranslations(promotionCode: string, languages?: string[]): Promise<ApiResponse<boolean>> {
    const params = languages ? [promotionCode, languages] : [promotionCode];
    const result = await this.client.rpcRequest<boolean>('deletePromotionTranslations', params);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Add/edit localized text for a cross-sell campaign
   */
  async setCrossSellCampaignText(
    campaignCode: string,
    language: string,
    text: string
  ): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('setCrossSellCampaignText', [
      campaignCode,
      language,
      text
    ]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Get localized texts for a cross-sell campaign
   */
  async getCrossSellCampaignTexts(campaignCode: string): Promise<ApiResponse<Translation[]>> {
    const result = await this.client.rpcRequest<Translation[]>('getCrossSellCampaignTexts', [campaignCode]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }

  /**
   * Set myAccount UI display language for SSO
   */
  async setSSOLanguage(ssoToken: string, language: string): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpcRequest<boolean>('setSSOLanguage', [ssoToken, language]);

    if (!result.success && result.error) {
      result.error.Message = getErrorMessage(result.error.Code, result.error.Message);
    }

    return result;
  }
}

// Tool definitions for MCP
export const i18nToolDefinitions = [
  {
    name: 'add_promotion_translation',
    description: 'Add a translation for a promotion in a specific language',
    inputSchema: {
      type: 'object',
      properties: {
        promotionCode: {
          type: 'string',
          description: 'Promotion code'
        },
        language: {
          type: 'string',
          description: 'Language code (e.g., "en", "fr", "es", "de")'
        },
        name: {
          type: 'string',
          description: 'Translated promotion name'
        },
        description: {
          type: 'string',
          description: 'Translated promotion description'
        }
      },
      required: ['promotionCode', 'language', 'name']
    }
  },
  {
    name: 'remove_promotion_translations',
    description: 'Remove translations from a promotion (all languages or specific ones)',
    inputSchema: {
      type: 'object',
      properties: {
        promotionCode: {
          type: 'string',
          description: 'Promotion code'
        },
        languages: {
          type: 'array',
          items: { type: 'string' },
          description: 'Language codes to remove (omit to remove all)'
        }
      },
      required: ['promotionCode']
    }
  },
  {
    name: 'set_cross_sell_campaign_text',
    description: 'Add or update localized text for a cross-sell campaign',
    inputSchema: {
      type: 'object',
      properties: {
        campaignCode: {
          type: 'string',
          description: 'Campaign code'
        },
        language: {
          type: 'string',
          description: 'Language code (e.g., "en", "fr", "es")'
        },
        text: {
          type: 'string',
          description: 'Localized campaign text'
        }
      },
      required: ['campaignCode', 'language', 'text']
    }
  },
  {
    name: 'get_cross_sell_campaign_texts',
    description: 'Get all localized texts for a cross-sell campaign',
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
    name: 'set_sso_language',
    description: 'Set the myAccount UI language for an SSO session',
    inputSchema: {
      type: 'object',
      properties: {
        ssoToken: {
          type: 'string',
          description: 'SSO token'
        },
        language: {
          type: 'string',
          description: 'Language code (e.g., "en", "fr", "es")'
        }
      },
      required: ['ssoToken', 'language']
    }
  }
];
