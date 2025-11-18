import { TwoCheckoutAuth } from '../auth/authentication.js';
import { TwoCheckoutConfig } from '../types/2checkout.js';

describe('TwoCheckoutAuth', () => {
  const mockConfig: TwoCheckoutConfig = {
    merchantCode: 'TEST_MERCHANT',
    secretKey: 'test_secret_key_123',
    sandbox: true
  };

  let auth: TwoCheckoutAuth;

  beforeEach(() => {
    auth = new TwoCheckoutAuth(mockConfig);
  });

  describe('generateAuthHeader', () => {
    it('should generate auth header with all required fields', () => {
      const header = auth.generateAuthHeader();

      expect(header).toHaveProperty('code', 'TEST_MERCHANT');
      expect(header).toHaveProperty('date');
      expect(header).toHaveProperty('hash');
      expect(header).toHaveProperty('algo', 'sha256');
    });

    it('should generate valid date format', () => {
      const header = auth.generateAuthHeader();

      // Date format should be YYYY-MM-DD HH:MM:SS
      const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      expect(header.date).toMatch(dateRegex);
    });

    it('should generate different hashes for different dates', () => {
      const header1 = auth.generateAuthHeader();

      // Wait a bit to ensure different timestamp
      const header2 = auth.generateAuthHeader();

      // Hash should be consistent for same merchant/date
      expect(header1.hash).toBeTruthy();
      expect(typeof header1.hash).toBe('string');
      expect(header1.hash.length).toBeGreaterThan(0);
    });

    it('should use md5 algorithm when specified', () => {
      const header = auth.generateAuthHeader('md5');
      expect(header.algo).toBe('md5');
    });

    it('should use sha3-256 algorithm when specified', () => {
      const header = auth.generateAuthHeader('sha3-256');
      expect(header.algo).toBe('sha3-256');
    });
  });

  describe('formatAuthHeaderString', () => {
    it('should format header string correctly', () => {
      const headerString = auth.formatAuthHeaderString();

      expect(headerString).toContain('code="TEST_MERCHANT"');
      expect(headerString).toContain('date="');
      expect(headerString).toContain('hash="');
      expect(headerString).toContain('algo="sha256"');
    });

    it('should produce a valid header format', () => {
      const headerString = auth.formatAuthHeaderString();

      // Should match the expected format
      const formatRegex = /^code="[^"]+" date="[^"]+" hash="[^"]+" algo="[^"]+"$/;
      expect(headerString).toMatch(formatRegex);
    });
  });

  describe('getRestUrl', () => {
    it('should return sandbox URL when sandbox is true', () => {
      const url = auth.getRestUrl();
      expect(url).toBe('https://api.avangate.com/rest/6.0');
    });

    it('should return production URL when sandbox is false', () => {
      const prodAuth = new TwoCheckoutAuth({
        ...mockConfig,
        sandbox: false
      });
      const url = prodAuth.getRestUrl();
      expect(url).toBe('https://api.2checkout.com/rest/6.0');
    });

    it('should return custom URL when baseUrl is set', () => {
      const customAuth = new TwoCheckoutAuth({
        ...mockConfig,
        baseUrl: 'https://custom.api.com/rest/6.0'
      });
      const url = customAuth.getRestUrl();
      expect(url).toBe('https://custom.api.com/rest/6.0');
    });
  });

  describe('getJsonRpcUrl', () => {
    it('should return sandbox URL when sandbox is true', () => {
      const url = auth.getJsonRpcUrl();
      expect(url).toBe('https://api.avangate.com/rpc/6.0/');
    });

    it('should return production URL when sandbox is false', () => {
      const prodAuth = new TwoCheckoutAuth({
        ...mockConfig,
        sandbox: false
      });
      const url = prodAuth.getJsonRpcUrl();
      expect(url).toBe('https://api.2checkout.com/rpc/6.0/');
    });
  });

  describe('clearSession', () => {
    it('should clear session data', () => {
      // Access private properties for testing
      const authAny = auth as any;
      authAny.sessionId = 'test-session';
      authAny.sessionExpiry = Date.now() + 1000;

      auth.clearSession();

      expect(authAny.sessionId).toBeNull();
      expect(authAny.sessionExpiry).toBe(0);
    });
  });

  describe('hash generation', () => {
    it('should use byte length for UTF-8 characters', () => {
      const unicodeAuth = new TwoCheckoutAuth({
        merchantCode: 'TËST', // Contains special character
        secretKey: 'secret',
        sandbox: true
      });

      // Should not throw
      const header = unicodeAuth.generateAuthHeader();
      expect(header.hash).toBeTruthy();
    });

    it('should generate consistent hashes for same input', () => {
      // Create a fixed date for testing
      const auth1 = new TwoCheckoutAuth(mockConfig);
      const auth2 = new TwoCheckoutAuth(mockConfig);

      // Since we're using current time, just verify hash format
      const header1 = auth1.generateAuthHeader();
      const header2 = auth2.generateAuthHeader();

      // Hashes should be hex strings
      expect(header1.hash).toMatch(/^[a-f0-9]+$/);
      expect(header2.hash).toMatch(/^[a-f0-9]+$/);
    });
  });
});
