import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/api.types";

export function getApiErrorMessage(error: unknown): string | string[] {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.responseMessage ?? data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
