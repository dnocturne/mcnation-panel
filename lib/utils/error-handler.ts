/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
	public code: string;
	public status: number;
	public details?: unknown;

	constructor(
		message: string,
		code = "UNKNOWN_ERROR",
		status = 500,
		details?: unknown,
	) {
		super(message);
		this.name = "AppError";
		this.code = code;
		this.status = status;
		this.details = details;
	}
}

/**
 * Custom error class for API-specific errors
 */
export class ApiError extends AppError {
	constructor(
		message: string,
		code = "API_ERROR",
		status = 500,
		details?: unknown,
	) {
		super(message, code, status, details);
		this.name = "ApiError";
	}
}

/**
 * Error codes for common error scenarios
 */
export const ErrorCode = {
	NOT_FOUND: "NOT_FOUND",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	BAD_REQUEST: "BAD_REQUEST",
	INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
	NETWORK_ERROR: "NETWORK_ERROR",
	VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

/**
 * Convert error to standard format for consistent handling
 */
export function normalizeError(error: unknown): AppError {
	if (error instanceof AppError) {
		return error;
	}

	if (error instanceof Error) {
		return new AppError(error.message, "SYSTEM_ERROR", 500, {
			name: error.name,
			stack: error.stack,
		});
	}

	if (typeof error === "string") {
		return new AppError(error);
	}

	return new AppError("An unknown error occurred", "UNKNOWN_ERROR", 500, error);
}

/**
 * Log error with consistent format
 */
export function logError(error: unknown, context?: string): void {
	const normalizedError = normalizeError(error);
	const contextPrefix = context ? `[${context}] ` : "";

	console.error(
		`${contextPrefix}${normalizedError.code} (${normalizedError.status}): ${normalizedError.message}`,
		normalizedError.details,
	);
}

/**
 * Format error for API responses
 */
export function formatApiError(error: unknown): {
	error: string;
	code: string;
	status: number;
	details?: unknown;
} {
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
export function handleApiError(
	error: unknown,
	defaultMessage = "An error occurred",
) {
	logError(error, "API");

	const formattedError = formatApiError(error);
	return Response.json(
		{
			error: formattedError.error || defaultMessage,
			code: formattedError.code,
			status: formattedError.status,
		},
		{ status: formattedError.status },
	);
}
