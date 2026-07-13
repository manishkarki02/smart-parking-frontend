import type { PaginatedResult } from "@/common/types/pagination.types";

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

export function normalizePaginatedResponse<TData>(
  payload: unknown,
): PaginatedResult<TData> {
  if (Array.isArray(payload)) {
    return {
      data: payload as TData[],
      totalPages: 1,
    };
  }

  const record = readRecord(payload);
  if (!record) {
    return {
      data: [],
      totalPages: 1,
    };
  }

  const meta = readRecord(record.meta);
  const possibleData = record.items ?? record.content ?? record.data;

  return {
    data: Array.isArray(possibleData) ? (possibleData as TData[]) : [],
    totalPages:
      readNumber(record.totalPages) ??
      readNumber(record.totalPage) ??
      readNumber(meta?.totalPages) ??
      1,
    totalElements:
      readNumber(record.totalElements) ??
      readNumber(record.totalElement) ??
      readNumber(meta?.totalElements),
    page:
      readNumber(record.page) ??
      readNumber(record.number) ??
      readNumber(meta?.page),
    size: readNumber(record.size) ?? readNumber(meta?.size),
  };
}
