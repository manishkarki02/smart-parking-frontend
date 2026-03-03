import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";

const HTTP_STATUS_TO_NOT_RETRY = [
  400, 401, 403, 404, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511,
];
const MAX_RETRY = 3;

type CustomQueryProps<TData> = {
  key: QueryKey;
  queryFn: () => Promise<TData>;
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">;
};

export default function useCustomQuery<TData = unknown>({
  key,
  queryFn,
  options,
}: CustomQueryProps<TData>): UseQueryResult<TData> {
  return useQuery<TData>({
    queryKey: key,
    queryFn: queryFn,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status && HTTP_STATUS_TO_NOT_RETRY.includes(status)) {
          return false;
        }
      }
      return failureCount < MAX_RETRY;
    },
    ...options,
  });
}