// 2Checkout API Types

export interface TwoCheckoutConfig {
  merchantCode: string;
  secretKey: string;
  baseUrl?: string;
  sandbox?: boolean;
  timeout?: number;        // Request timeout in ms (default: 30000)
  maxRetries?: number;     // Max retry attempts for network errors (default: 3)
  retryDelay?: number;     // Delay between retries in ms (default: 1000)
}

// Authentication
export interface AuthHeader {
  code: string;
  date: string;
  hash: string;
  algo?: 'sha256' | 'sha3-256' | 'md5';
}

export interface SessionResponse {
  sessionId: string;
}

// Order Types
export interface BillingDetails {
  FirstName: string;
  LastName: string;
  Email: string;
  Phone?: string;
  Company?: string;
  Address1: string;
  Address2?: string;
  City: string;
  State?: string;
  Zip: string;
  CountryCode: string;
}

export interface DeliveryDetails extends BillingDetails {}

export interface PaymentMethod {
  EesToken?: string;
  CardNumber?: string;
  CardType?: string;
  ExpirationYear?: string;
  ExpirationMonth?: string;
  HolderName?: string;
  CCID?: string;
  RecurringEnabled?: boolean;
}

export interface PaymentDetails {
  Type: 'EES_TOKEN_PAYMENT' | 'CC' | 'PAYPAL' | 'PAYPAL_EXPRESS' | 'WIRE' | 'TEST' | 'NO_PAYMENT';
  Currency: string;
  CustomerIP?: string;
  PaymentMethod?: PaymentMethod;
}

export interface PriceOption {
  Name: string;
  Value?: string;
  Surcharge?: number;
}

export interface ProductPrice {
  Amount: number;
  Type: 'CUSTOM' | 'REGULAR';
}

export interface OrderItem {
  Code?: string;
  Quantity: number;
  Name?: string;
  Description?: string;
  IsDynamic?: boolean;
  Tangible?: boolean;
  PurchaseType?: 'PRODUCT' | 'SHIPPING' | 'TAX';
  Price?: ProductPrice;
  PriceOptions?: PriceOption[];
  RecurringOptions?: RecurringOptions;
  SKU?: string;
}

export interface RecurringOptions {
  CycleLength?: number;
  CycleUnit?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  CycleAmount?: number;
  ContractLength?: number;
  ContractUnit?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}

export interface Order {
  Currency: string;
  Country: string;
  Language?: string;
  CustomerIP?: string;
  ExternalReference?: string;
  Source?: string;
  Items: OrderItem[];
  BillingDetails: BillingDetails;
  DeliveryDetails?: DeliveryDetails;
  PaymentDetails: PaymentDetails;
  Promotions?: string[];
  AdditionalFields?: Record<string, string>;
}

export interface OrderResponse {
  RefNo: string;
  OrderNo: number;
  ExternalReference?: string;
  Status: string;
  ApproveStatus: string;
  Currency: string;
  NetPrice: number;
  GrossPrice: number;
  NetDiscountedPrice: number;
  GrossDiscountedPrice: number;
  Discount: number;
  VAT: number;
  Affiliate?: AffiliateInfo;
  OrderDate: string;
  FinishDate?: string;
  Items: OrderItemResponse[];
  BillingDetails: BillingDetails;
  DeliveryDetails?: DeliveryDetails;
  PaymentDetails: PaymentDetailsResponse;
  CustomerDetails?: CustomerDetails;
  Errors?: ApiError[];
}

export interface OrderItemResponse extends Omit<OrderItem, 'Price'> {
  ProductDetails?: ProductDetails;
  Price?: ProductPriceResponse;
  LineItemReference?: string;
}

export interface ProductPriceResponse {
  UnitNetPrice: number;
  UnitGrossPrice: number;
  UnitVAT: number;
  UnitDiscount: number;
  UnitNetDiscountedPrice: number;
  UnitGrossDiscountedPrice: number;
  UnitAffiliateCommission: number;
}

export interface PaymentDetailsResponse {
  Type: string;
  Currency: string;
  PaymentMethod?: PaymentMethodResponse;
}

export interface PaymentMethodResponse {
  FirstDigits?: string;
  LastDigits?: string;
  CardType?: string;
  ExpirationMonth?: string;
  ExpirationYear?: string;
}

export interface AffiliateInfo {
  AffiliateCode?: string;
  AffiliateSource?: string;
  AffiliateName?: string;
  AffiliateUrl?: string;
}

export interface CustomerDetails {
  CustomerReference?: string;
  ExternalCustomerReference?: string;
  FirstName?: string;
  LastName?: string;
  Company?: string;
  Email?: string;
  Phone?: string;
  Fax?: string;
}

export interface ProductDetails {
  Name: string;
  Version?: string;
  ProductType?: string;
  ProductId?: string;
  ShortDescription?: string;
  LongDescription?: string;
}

// Subscription Types
export interface Subscription {
  SubscriptionReference: string;
  OrderReference: string;
  ExternalCustomerReference?: string;
  CustomerEmail: string;
  StartDate: string;
  ExpirationDate: string;
  RecurringEnabled: boolean;
  SubscriptionEnabled: boolean;
  Product: SubscriptionProduct;
  EndUser?: EndUser;
  DeliveryInfo?: DeliveryDetails;
  PaymentMethod?: SubscriptionPaymentMethod;
  LastBillingDate?: string;
  NextBillingDate?: string;
}

export interface SubscriptionProduct {
  ProductId: string;
  ProductCode: string;
  ProductName: string;
  ProductVersion?: string;
  ProductQuantity: number;
  PriceOptionCodes?: string[];
}

export interface EndUser {
  FirstName?: string;
  LastName?: string;
  Company?: string;
  Email?: string;
  Phone?: string;
  Fax?: string;
  Address?: string;
  City?: string;
  State?: string;
  Zip?: string;
  CountryCode?: string;
}

export interface SubscriptionPaymentMethod {
  Type: string;
  CardType?: string;
  LastDigits?: string;
  ExpirationMonth?: string;
  ExpirationYear?: string;
}

export interface SubscriptionSearchOptions {
  CustomerEmail?: string;
  ExternalCustomerReference?: string;
  Status?: 'Active' | 'Disabled' | 'Past';
  RecurringEnabled?: boolean;
  ProductCodes?: string[];
  StartDate?: string;
  EndDate?: string;
  Page?: number;
  Limit?: number;
}

export interface SubscriptionUpdatePayment {
  SubscriptionReference: string;
  PaymentMethod: {
    EesToken: string;
    HolderName?: string;
  };
}

// Customer Types
export interface Customer {
  CustomerReference?: string;
  ExternalCustomerReference?: string;
  FirstName: string;
  LastName: string;
  Company?: string;
  Email: string;
  Phone?: string;
  Fax?: string;
  Address1?: string;
  Address2?: string;
  City?: string;
  State?: string;
  Zip?: string;
  CountryCode?: string;
  Language?: string;
}

export interface CustomerResponse extends Customer {
  CustomerReference: string;
}

// Product Types
export interface Product {
  ProductId?: string;
  ProductCode: string;
  ProductType: 'REGULAR' | 'BUNDLE';
  ProductName: string;
  ProductVersion?: string;
  ShortDescription?: string;
  LongDescription?: string;
  Enabled: boolean;
  Tangible: boolean;
  TrialDays?: number;
  TrialPrice?: number;
  Prices?: ProductPricing[];
  PricingConfigurations?: PricingConfiguration[];
}

export interface ProductPricing {
  Currency: string;
  Amount: number;
  OptionCodes?: string[];
}

export interface PricingConfiguration {
  Name: string;
  Code: string;
  BillingCountries: string[];
  PricingSchema: string;
  PriceType: string;
  DefaultCurrency: string;
  Prices: ProductPrice[];
}

// Promotion Types
export interface Promotion {
  Name: string;
  Description?: string;
  StartDate: string;
  EndDate: string;
  MaximumOrdersNumber?: number;
  MaximumQuantity?: number;
  InstantDiscount?: boolean;
  Coupon?: CouponSettings;
  Enabled: boolean;
  ChannelType?: string;
  Type: 'REGULAR' | 'SPECIAL';
  Discount: PromotionDiscount;
  Products?: PromotionProduct[];
  PriceThreshold?: PriceThreshold;
  ApplyRecurring?: boolean;
  RecurringChargesNumber?: number;
}

export interface CouponSettings {
  Type: 'SINGLE' | 'MULTIPLE';
  Code?: string;
}

export interface PromotionDiscount {
  Type: 'PERCENT' | 'FIXED';
  Value: number;
}

export interface PromotionProduct {
  Code: string;
  PricingOptionGroup?: string;
  PricingConfigurationCode?: string;
}

export interface PriceThreshold {
  Amount: number;
  Currency: string;
}

export interface PromotionResponse extends Promotion {
  PromotionCode: string;
}

// Search/Pagination
export interface PaginationOptions {
  Page?: number;
  Limit?: number;
}

export interface SearchResponse<T> {
  Items: T[];
  Pagination: {
    Page: number;
    Limit: number;
    TotalResults: number;
    TotalPages: number;
  };
}

export interface OrderSearchOptions extends PaginationOptions {
  StartDate?: string;
  EndDate?: string;
  Status?: string;
  CustomerEmail?: string;
  ExternalReference?: string;
  PaymentType?: string;
}

// Error Types
export interface ApiError {
  Code: string;
  Message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// JSON-RPC Types
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown[];
}

export interface JsonRpcResponse<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// Usage Types (for metered/overage billing)
export interface Usage {
  UsageReference?: string;
  SubscriptionReference: string;
  OptionCode: string;
  UsageStart: string;
  UsageEnd: string;
  Units: number;
  Description?: string;
}

export interface UsageResponse extends Usage {
  UsageReference: string;
}

export interface UsageSearchOptions extends PaginationOptions {
  SubscriptionReference?: string;
  StartDate?: string;
  EndDate?: string;
}

export interface UsageImport {
  SubscriptionReference: string;
  OptionCode: string;
  UsageStart: string;
  UsageEnd: string;
  Units: number;
  Description?: string;
}

// Lead Types
export interface Lead {
  Email: string;
  FirstName?: string;
  LastName?: string;
  Company?: string;
  Phone?: string;
  Country?: string;
  State?: string;
  City?: string;
  Zip?: string;
  LocalTime?: string;
  Language?: string;
  Campaign?: string;
  CartItems?: LeadCartItem[];
}

export interface LeadCartItem {
  ProductCode: string;
  Quantity: number;
  PriceOptions?: PriceOption[];
}

export interface LeadResponse extends Lead {
  LeadCode: string;
  CreatedDate: string;
  UpdatedDate: string;
}

export interface LeadSearchOptions extends PaginationOptions {
  Email?: string;
  StartDate?: string;
  EndDate?: string;
  Type?: string;
  Language?: string;
  Country?: string;
}

// Cross-sell Campaign Types
export interface CrossSellCampaign {
  CampaignCode?: string;
  CampaignName: string;
  StartDate: string;
  EndDate: string;
  Status?: string;
  MasterProducts: string[];
  DisplayProducts: string[];
  DisplayType?: string;
  AutoDisplay?: boolean;
}

export interface CrossSellCampaignResponse extends CrossSellCampaign {
  CampaignCode: string;
}

export interface CrossSellSearchOptions extends PaginationOptions {
  CampaignName?: string;
  Status?: string;
}

// Upsell Campaign Types
export interface UpsellCampaign {
  CampaignCode?: string;
  CampaignName: string;
  StartDate: string;
  EndDate: string;
  Status?: string;
  PrimaryProducts: string[];
  RecommendedProduct: string;
  DiscountType?: 'PERCENT' | 'FIXED';
  Discount?: number;
}

export interface UpsellCampaignResponse extends UpsellCampaign {
  CampaignCode: string;
}

export interface UpsellSearchOptions extends PaginationOptions {
  CampaignName?: string;
  Status?: string;
}

// Shipping Types
export interface ShippingMethod {
  Code: string;
  Name: string;
  TrackingUrl?: string;
}

export interface ShippingInfo {
  OrderReference: string;
  TrackingNumber?: string;
  TrackingUrl?: string;
  ShippingMethodCode?: string;
}

export interface ShippingSearchOptions extends PaginationOptions {
  Country?: string;
}

// SKU Types
export interface SKUCode {
  ProductCode: string;
  PriceOptionCodes: string[];
  SKU: string;
  Currency?: string;
}

export interface SKUSearchOptions extends PaginationOptions {
  ProductCode?: string;
  SKU?: string;
}

// Account Types
export interface AccountBalance {
  Balance: number;
  Currency: string;
  AvailableBalance: number;
  PendingBalance: number;
}

export interface Payout {
  PayoutReference: string;
  PayoutDate: string;
  Amount: number;
  Currency: string;
  Status: string;
}

export interface PayoutSearchOptions extends PaginationOptions {
  StartDate?: string;
  EndDate?: string;
  Status?: string;
}

export interface Country {
  Code: string;
  Name: string;
}

export interface Currency {
  Code: string;
  Name: string;
  Symbol?: string;
}

// SSO Types
export interface SSOToken {
  Token: string;
  Url: string;
  ExpirationDate: string;
}

export interface SSOCustomerInfo {
  CustomerReference: string;
  Email: string;
  FirstName: string;
  LastName: string;
}

// Translation/Localization Types
export interface Translation {
  Language: string;
  Name?: string;
  Description?: string;
  Text?: string;
}

export interface PromotionTranslation {
  PromotionCode: string;
  Language: string;
  Name: string;
  Description?: string;
}

export interface PriceOptionTranslation {
  Name: string;
  Description?: string;
  Language: string;
}
