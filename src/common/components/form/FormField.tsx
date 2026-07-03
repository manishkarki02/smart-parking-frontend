import type { ReactNode } from "react";
import { FieldError } from "@/common/components/form/FieldError";
import { RequiredLabel } from "@/common/components/form/RequiredLabel";

export function FormField({
  label,
  error,
  required = true,
  children,
  labelClassName,
  errorClassName,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  labelClassName?: string;
  errorClassName?: string;
}) {
  return (
    <div className="grid gap-2">
      {required ? (
        <RequiredLabel className={labelClassName}>{label}</RequiredLabel>
      ) : null}
      {children}
      <FieldError message={error} className={errorClassName} />
    </div>
  );
}
