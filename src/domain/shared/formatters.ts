const KATHMANDU_TIME_ZONE = "Asia/Kathmandu";

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
  return formatKathmanduDateTime(value, fallback);
}

export function formatKathmanduDateTime(
  value: string | Date | null | undefined,
  fallback = "N/A",
): string {
  if (!value) return fallback;

  if (typeof value === "string" && isLocalDateTimeString(value)) {
    const localParts = parseLocalDateTimeParts(value);
    if (!localParts) return fallback;

    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(localParts);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: KATHMANDU_TIME_ZONE,
  }).format(date);
}

export function formatKathmanduDate(
  value: string | Date | null | undefined,
  fallback = "N/A",
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
): string {
  if (!value) return fallback;

  if (typeof value === "string" && isLocalDateTimeString(value)) {
    const localParts = parseLocalDateTimeParts(value);
    if (!localParts) return fallback;
    return new Intl.DateTimeFormat("en-US", options).format(localParts);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: KATHMANDU_TIME_ZONE,
  }).format(date);
}

export function formatKathmanduTime(
  value: string | Date | null | undefined,
  fallback = "N/A",
): string {
  if (!value) return fallback;

  if (typeof value === "string" && isLocalDateTimeString(value)) {
    const localParts = parseLocalDateTimeParts(value);
    if (!localParts) return fallback;
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(localParts);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: KATHMANDU_TIME_ZONE,
  }).format(date);
}

export function formatKathmanduDateInputValue(
  value: string | Date | null | undefined,
): string {
  if (!value) return "";

  if (typeof value === "string" && isLocalDateTimeString(value)) {
    return value.slice(0, 10);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: KATHMANDU_TIME_ZONE,
  }).format(date);
}

function isLocalDateTimeString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) && !/[zZ]|[+-]\d{2}:\d{2}$/.test(value);
}

function parseLocalDateTimeParts(value: string): Date | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/,
  );

  if (!match) return null;

  const [, year, month, day, hour, minute, second = "0"] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
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
