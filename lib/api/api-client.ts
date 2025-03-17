interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

/**
 * Reusable fetch wrapper for consistent API calls
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with typed response data
 */
export async function fetchApi<T>(
	url: string,
	options?: RequestInit,
): Promise<ApiResponse<T>> {
	try {
		const response = await fetch(url, {
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include", // Always include credentials for NextAuth session
			...options,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				success: false,
				error:
					errorData.error ||
					`API error: ${response.status} ${response.statusText}`,
			};
		}

		// Handle no content responses
		if (response.status === 204) {
			return { success: true };
		}

		const data = await response.json();
		return { success: true, data };
	} catch (error) {
		console.error("API request failed:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

/**
 * GET request helper
 */
export function get<T>(
	url: string,
	options?: RequestInit,
): Promise<ApiResponse<T>> {
	return fetchApi<T>(url, { method: "GET", ...options });
}

/**
 * POST request helper
 */
export function post<T, D = Record<string, unknown>>(
	url: string,
	data: D,
	options?: RequestInit,
): Promise<ApiResponse<T>> {
	return fetchApi<T>(url, {
		method: "POST",
		body: JSON.stringify(data),
		...options,
	});
}

/**
 * PUT request helper
 */
export function put<T, D = Record<string, unknown>>(
	url: string,
	data: D,
	options?: RequestInit,
): Promise<ApiResponse<T>> {
	return fetchApi<T>(url, {
		method: "PUT",
		body: JSON.stringify(data),
		...options,
	});
}

/**
 * DELETE request helper
 */
export function del<T>(
	url: string,
	options?: RequestInit,
): Promise<ApiResponse<T>> {
	return fetchApi<T>(url, {
		method: "DELETE",
		...options,
	});
}
