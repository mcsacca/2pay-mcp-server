import { createHmac } from 'crypto';
import { TwoCheckoutConfig, AuthHeader, JsonRpcRequest, JsonRpcResponse, SessionResponse } from '../types/2checkout.js';

export class TwoCheckoutAuth {
  private config: TwoCheckoutConfig;
  private sessionId: string | null = null;
  private sessionExpiry: number = 0;

  constructor(config: TwoCheckoutConfig) {
    this.config = config;
  }

  /**
   * Generate REST API authentication header
   */
  generateAuthHeader(algo: 'sha256' | 'sha3-256' | 'md5' = 'sha256'): AuthHeader {
    const date = this.getCurrentUTCDate();
    const hash = this.generateHash(date, algo);

    return {
      code: this.config.merchantCode,
      date,
      hash,
      algo
    };
  }

  /**
   * Format auth header for HTTP request
   */
  formatAuthHeaderString(algo: 'sha256' | 'sha3-256' | 'md5' = 'sha256'): string {
    const auth = this.generateAuthHeader(algo);
    return `code="${auth.code}" date="${auth.date}" hash="${auth.hash}" algo="${auth.algo}"`;
  }

  /**
   * Get or create JSON-RPC session ID
   */
  async getSessionId(): Promise<string> {
    // Return cached session if still valid (5 min buffer)
    if (this.sessionId && Date.now() < this.sessionExpiry - 300000) {
      return this.sessionId;
    }

    // Create new session
    const baseUrl = this.getJsonRpcUrl();
    const date = this.getCurrentUTCDate();
    const hash = this.generateHash(date, 'sha256');

    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'login',
      params: [this.config.merchantCode, date, hash, 'sha256']
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as JsonRpcResponse<string>;

    if (result.error) {
      throw new Error(`Login error: ${result.error.message}`);
    }

    if (!result.result) {
      throw new Error('Login failed: No session ID returned');
    }

    this.sessionId = result.result;
    // Session expires in 30 minutes
    this.sessionExpiry = Date.now() + 30 * 60 * 1000;

    return this.sessionId;
  }

  /**
   * Clear cached session
   */
  clearSession(): void {
    this.sessionId = null;
    this.sessionExpiry = 0;
  }

  /**
   * Generate HMAC hash for authentication
   */
  private generateHash(date: string, algo: 'sha256' | 'sha3-256' | 'md5'): string {
    const merchantCode = this.config.merchantCode;
    // Use byte length for proper UTF-8 support
    const merchantCodeBytes = Buffer.byteLength(merchantCode, 'utf8');
    const dateBytes = Buffer.byteLength(date, 'utf8');
    const stringToHash = `${merchantCodeBytes}${merchantCode}${dateBytes}${date}`;

    // Map algo to Node.js crypto algorithm name
    const cryptoAlgo = algo === 'sha3-256' ? 'sha3-256' : algo;

    return createHmac(cryptoAlgo, this.config.secretKey)
      .update(stringToHash)
      .digest('hex');
  }

  /**
   * Get current UTC date in required format
   */
  private getCurrentUTCDate(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Get REST API base URL
   */
  getRestUrl(): string {
    if (this.config.baseUrl) {
      return this.config.baseUrl;
    }
    return this.config.sandbox
      ? 'https://api.avangate.com/rest/6.0'
      : 'https://api.2checkout.com/rest/6.0';
  }

  /**
   * Get JSON-RPC API URL
   */
  getJsonRpcUrl(): string {
    return this.config.sandbox
      ? 'https://api.avangate.com/rpc/6.0/'
      : 'https://api.2checkout.com/rpc/6.0/';
  }
}
