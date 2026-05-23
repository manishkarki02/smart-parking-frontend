import { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiErrorResponse } from "../types/api.types";
import { getApiErrorMessage } from "../utils/get-api-error-message";

interface IMutateParams<Param, ReturnType> {
  api: (param: Param) => Promise<ReturnType>;
  success?: string;
  error?: string;
  onSuccess?: (data: ReturnType) => void;
  onError?: (err: AxiosError<ApiErrorResponse>) => void;
}

function useCustomMutation<Param, ReturnType>({
  api,
  success,
  error,
  onSuccess,
  onError,
}: IMutateParams<Param, ReturnType>) {
  return useMutation({
    mutationFn: api,
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
      if (success) toast.success(success);
    },
    onError: (err: unknown) => {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      // Let consumer inspect the raw error
      if (onError) {
        onError(axiosErr);
        return;
      }

      // Prefer server message if present, otherwise Axios error message
      const msg = getApiErrorMessage(err);

      if (Array.isArray(msg)) {
        msg.forEach((m) => typeof m === "string" && toast.error(m));
        return;
      }
      if (typeof msg === "string" && msg.trim()) {
        toast.error(msg);
        return;
      }
      if (error) {
        toast.error(error);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });
}

export default useCustomMutation;
