/**
 * Environment variables manager with validation
 * This ensures we have proper type safety and validation for our environment variables
 */

/**
 * Get environment variable with validation
 * @param key Environment variable key
 * @param defaultValue Optional default value
 * @param required Whether the variable is required
 * @returns The environment variable value or default value
 * @throws Error if the variable is required but not found
 */
function getEnv(key: string, defaultValue?: string, required = true): string {
  const value = process.env[key] || defaultValue;
  
  if (required && !value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  return value || '';
}

/**
 * Check if we're in a production environment
 */
export const isProd = process.env.NODE_ENV === 'production';
export const isDev = process.env.NODE_ENV === 'development';

/**
 * Stripe environment variables
 */
export const stripe = {
  /**
   * Stripe API secret key
   * This should be kept secret and only used on the server
   */
  secretKey: getEnv('STRIPE_SECRET_KEY'),
  
  /**
   * Stripe publishable key
   * This is safe to expose to the client
   */
  publishableKey: getEnv('STRIPE_PUBLISHABLE_KEY'),
  
  /**
   * Stripe webhook secret
   * This is used to verify webhook signatures
   */
  webhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),
  
  /**
   * Get the appropriate key based on the environment
   * This prevents accidentally using test keys in production and vice versa
   */
  getSecretKey(): string {
    // Check if the key matches the expected pattern for the environment
    const key = this.secretKey;
    const isProdKey = key.startsWith('sk_live_');
    const isTestKey = key.startsWith('sk_test_');
    
    if (isProd && !isProdKey) {
      console.warn('⚠️ Using test Stripe key in production environment!');
    } else if (!isProd && isProdKey) {
      console.warn('⚠️ Using production Stripe key in test environment!');
    }
    
    if (!isProdKey && !isTestKey) {
      console.error('❌ Invalid Stripe secret key format');
    }
    
    return key;
  },
  
  /**
   * Get the appropriate publishable key
   */
  getPublishableKey(): string {
    const key = this.publishableKey;
    const isProdKey = key.startsWith('pk_live_');
    const isTestKey = key.startsWith('pk_test_');
    
    if (!isProdKey && !isTestKey) {
      console.error('❌ Invalid Stripe publishable key format');
    }
    
    return key;
  }
};

/**
 * Application URLs
 */
export const urls = {
  /** 
   * Base URL of the application 
   */
  baseUrl: getEnv('NEXTAUTH_URL', isProd ? undefined : 'http://localhost:3000'),
  
  /**
   * Build a full URL by appending a path to the base URL
   */
  build: (path: string): string => {
    const base = urls.baseUrl.endsWith('/') 
      ? urls.baseUrl.slice(0, -1) 
      : urls.baseUrl;
    
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }
};

/**
 * Redis configuration
 */
export const redis = {
  url: getEnv('UPSTASH_REDIS_REST_URL'),
  token: getEnv('UPSTASH_REDIS_REST_TOKEN')
};

/**
 * Other common environment variables
 */
export const app = {
  name: getEnv('APP_NAME', 'MCNation Panel'),
  environment: getEnv('NODE_ENV', 'development'),
}; 