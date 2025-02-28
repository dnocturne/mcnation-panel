/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Custom error class for API-specific errors
 */
export class ApiError extends AppError {
  constructor(message: string, code: string = 'API_ERROR', status: number = 500, details?: any) {
    super(message, code, status, details);
    this.name = 'ApiError';
  }
}

/**
 * Error codes for common error scenarios
 */
export const ErrorCode = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

/**
 * Convert error to standard format for consistent handling
 */
export function normalizeError(error: any): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      { originalError: error }
    );
  }

  if (typeof error === 'string') {
    return new AppError(error);
  }

  return new AppError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    { originalError: error }
  );
}

/**
 * Log error with consistent format
 */
export function logError(error: any, context?: string): void {
  const normalizedError = normalizeError(error);
  const contextPrefix = context ? `[${context}] ` : '';
  
  console.error(
    `${contextPrefix}Error: ${normalizedError.message}`,
    {
      code: normalizedError.code,
      status: normalizedError.status,
      details: normalizedError.details,
      stack: normalizedError.stack,
    }
  );
}

/**
 * Format error for API responses
 */
export function formatApiError(error: any): { error: string; code: string; status: number; details?: any } {
  const normalizedError = normalizeError(error);
  
  return {
    error: normalizedError.message,
    code: normalizedError.code,
    status: normalizedError.status,
    details: normalizedError.details,
  };
}

/**
 * Handle errors for API routes
 */
export function handleApiError(error: any, defaultMessage: string = 'An error occurred') {
  logError(error, 'API');
  
  const normalizedError = normalizeError(error);
  
  return Response.json(
    formatApiError(normalizedError),
    { status: normalizedError.status }
  );
} 