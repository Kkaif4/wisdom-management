/**
 * Standard API Response Structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

/**
 * Enhanced API Error for Frontend
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly errorType?: string;
  public readonly details?: any;

  constructor(
    message: string,
    status: number,
    errorType?: string,
    details?: any,
  ) {
    super(message);
    this.status = status;
    this.errorType = errorType;
    this.details = details;
    this.name = "ApiError";
  }
}

/**
 * Standardized Fetch Wrapper
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(endpoint, config);
  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.message || "An unexpected error occurred",
      response.status,
      data.error,
      data.details,
    );
  }

  return data.data as T;
}
