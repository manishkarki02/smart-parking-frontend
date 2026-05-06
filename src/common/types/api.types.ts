export interface ApiResponse<T = unknown> {
  responseMessage: string;
  responseCode: number;
  timestamp: string;
  data: T;
}
