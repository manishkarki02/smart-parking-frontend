export function formatEnumLabel(value: string | null | undefined): string {
  if (!value) return "N/A";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDateTime(
  value: string | Date | null | undefined,
  fallback = "N/A",
): string {
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatCurrency(
  value: number | string | null | undefined,
  options: { currencyLabel?: string; fallback?: string } = {},
): string {
  const amount = Number(value ?? 0);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const currencyLabel = options.currencyLabel ?? "Rs.";

  if (value == null && options.fallback) {
    return options.fallback;
  }

  return `${currencyLabel} ${safeAmount.toFixed(2)}`;
}
