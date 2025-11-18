import { TwoCheckoutApiClient, getErrorMessage, ERROR_MESSAGES } from '../utils/api-client.js';
import { TwoCheckoutConfig } from '../types/2checkout.js';

describe('TwoCheckoutApiClient', () => {
  const mockConfig: TwoCheckoutConfig = {
    merchantCode: 'TEST_MERCHANT',
    secretKey: 'test_secret_key_123',
    sandbox: true
  };

  let client: TwoCheckoutApiClient;

  beforeEach(() => {
    client = new TwoCheckoutApiClient(mockConfig);
  });

  describe('constructor', () => {
    it('should create client with config', () => {
      expect(client).toBeDefined();
      expect(client.getAuth()).toBeDefined();
    });
  });

  describe('getAuth', () => {
    it('should return auth handler', () => {
      const auth = client.getAuth();
      expect(auth).toBeDefined();
      expect(auth.getRestUrl()).toBe('https://api.avangate.com/rest/6.0');
    });
  });
});

describe('getErrorMessage', () => {
  it('should return mapped error message for known codes', () => {
    const message = getErrorMessage('INVALID_CUSTOMER', 'Default message');
    expect(message).toBe('Customer information is invalid or missing required fields');
  });

  it('should return mapped error for TOKEN_EXPIRED', () => {
    const message = getErrorMessage('TOKEN_EXPIRED', 'Default');
    expect(message).toBe('Payment token has expired (tokens are valid for 30 minutes)');
  });

  it('should return mapped error for CARD_DECLINED', () => {
    const message = getErrorMessage('CARD_DECLINED', 'Default');
    expect(message).toBe('Credit card was declined by the issuing bank');
  });

  it('should return default message for unknown codes', () => {
    const message = getErrorMessage('UNKNOWN_CODE', 'Default message');
    expect(message).toBe('Default message');
  });

  it('should handle all defined error codes', () => {
    const knownCodes = Object.keys(ERROR_MESSAGES);

    knownCodes.forEach(code => {
      const message = getErrorMessage(code, 'default');
      expect(message).not.toBe('default');
      expect(message).toBe(ERROR_MESSAGES[code]);
    });
  });
});

describe('ERROR_MESSAGES', () => {
  it('should have all expected error codes', () => {
    const expectedCodes = [
      'INVALID_CUSTOMER',
      'INVALID_PRODUCT',
      'INVALID_PAYMENT',
      'TOKEN_EXPIRED',
      'INSUFFICIENT_FUNDS',
      'CARD_DECLINED',
      'INVALID_CVV',
      'EXPIRED_CARD',
      'SUBSCRIPTION_NOT_FOUND',
      'ORDER_NOT_FOUND',
      'INVALID_PROMOTION',
      'FRAUD_DETECTED',
      'DUPLICATE_ORDER',
      'CURRENCY_MISMATCH'
    ];

    expectedCodes.forEach(code => {
      expect(ERROR_MESSAGES).toHaveProperty(code);
      expect(typeof ERROR_MESSAGES[code]).toBe('string');
    });
  });

  it('should have meaningful error messages', () => {
    Object.values(ERROR_MESSAGES).forEach(message => {
      expect(message.length).toBeGreaterThan(10);
    });
  });
});
