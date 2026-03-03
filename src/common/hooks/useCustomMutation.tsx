import { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface IMutateParams<Param, ReturnType> {
  api: (param: Param) => Promise<ReturnType>;
  success?: string;
  error?: string;
  onSuccess?: (data: ReturnType) => void;
  onError?: (err: AxiosError) => void;
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
      const axiosErr = err as AxiosError<unknown>;
      // Let consumer inspect the raw error
      if (onError) onError(axiosErr as unknown as AxiosError);

      // Prefer server message if present, otherwise Axios error message
      const data = axiosErr?.response?.data as unknown;
      const serverMsg =
        data && typeof data === "object" && "message" in data
          ? (data as { message?: unknown }).message
          : undefined;
      const msg = serverMsg ?? axiosErr?.message;

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