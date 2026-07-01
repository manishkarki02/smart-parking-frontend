declare module "react-hook-form" {
  import type { ComponentType, FormEvent, ReactNode } from "react";

  export type FieldValues = Record<string, unknown>;
  export type FieldPath<TFieldValues extends FieldValues> =
    Extract<keyof TFieldValues, string>;

  export interface FieldState {
    error?: {
      message?: string;
    };
  }

  export interface FormState<TFieldValues extends FieldValues> {
    errors: Partial<Record<FieldPath<TFieldValues>, { message?: string }>>;
    isSubmitted?: boolean;
  }

  export interface Resolver<TFieldValues extends FieldValues = FieldValues> {
    (
      values: TFieldValues,
      context?: unknown,
      options?: unknown,
    ): unknown;
  }

  export interface UseFormProps<TFieldValues extends FieldValues = FieldValues> {
    resolver?: Resolver<TFieldValues>;
    defaultValues?: Partial<TFieldValues>;
    mode?: "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all";
    reValidateMode?: "onSubmit" | "onBlur" | "onChange";
  }

  export interface RegisterReturn {
    name: string;
    onBlur: () => void;
    onChange: (event: unknown) => void;
    ref: (instance: unknown) => void;
  }

  export interface UseFormReturn<TFieldValues extends FieldValues = FieldValues> {
    register: (name: FieldPath<TFieldValues>) => RegisterReturn;
    handleSubmit: (
      onValid: (values: TFieldValues) => void | Promise<void>,
    ) => (event?: FormEvent<HTMLFormElement>) => void;
    setValue: <TName extends FieldPath<TFieldValues>>(
      name: TName,
      value: TFieldValues[TName],
      options?: { shouldValidate?: boolean },
    ) => void;
    watch: <TName extends FieldPath<TFieldValues>>(
      name: TName,
    ) => TFieldValues[TName];
    reset: (values?: Partial<TFieldValues>) => void;
    resetField: (name: FieldPath<TFieldValues>) => void;
    control: unknown;
    formState: FormState<TFieldValues>;
    getFieldState: (
      name: FieldPath<TFieldValues>,
      formState?: FormState<TFieldValues>,
    ) => FieldState;
  }

  export function useForm<TFieldValues extends FieldValues = FieldValues>(
    props?: UseFormProps<TFieldValues>,
  ): UseFormReturn<TFieldValues>;

  export function useFormContext<
    TFieldValues extends FieldValues = FieldValues,
  >(): UseFormReturn<TFieldValues>;

  export function useFormState<TFieldValues extends FieldValues = FieldValues>(
    props?: { name?: FieldPath<TFieldValues> },
  ): FormState<TFieldValues>;

  export function useWatch<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  >(props: {
    control?: unknown;
    name: TName;
  }): TFieldValues[TName];

  export interface ControllerRenderField {
    name: string;
    value: string | undefined;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    ref: (instance: unknown) => void;
  }

  export interface ControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  > {
    name: TName;
    control?: unknown;
    render: (props: {
      field: ControllerRenderField;
      fieldState: FieldState;
      formState: FormState<TFieldValues>;
    }) => ReactNode;
  }

  export const Controller: ComponentType<ControllerProps>;
  export const FormProvider: ComponentType<{
    children?: ReactNode;
  } & UseFormReturn<FieldValues>>;
}
