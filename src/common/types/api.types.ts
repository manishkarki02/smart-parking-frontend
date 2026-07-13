export interface ApiResponse<T = unknown> {
  responseMessage: string;
  responseCode: number;
  timestamp: string;
  data: T;
}

export interface ApiErrorResponse {
  responseMessage?: string | string[];
  responseCode?: number;
  timestamp?: string;
  message?: string | string[];
  error?: string;
  data?: unknown;
}
