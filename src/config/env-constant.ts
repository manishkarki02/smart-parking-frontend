export const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const cleaned = (raw ?? "").trim();
  if (!cleaned) return "";

  // Support protocol-relative input (e.g., //host:port)
  let candidate = /^\/\//.test(cleaned) ? `http:${cleaned}` : cleaned;
  // Ensure protocol if missing
  if (!/^https?:\/\//i.test(candidate)) candidate = `http://${candidate}`;
  // Remove trailing slashes
  candidate = candidate.replace(/\/+$/, "");

  // Validate URL format; fallback to empty if invalid
  try {
    new URL(candidate);
    return candidate;
  } catch {
    if (import.meta.env.DEV) {
      console.warn(
        `Invalid VITE_API_BASE_URL: "${cleaned}". Falling back to relative /api.`
      );
    }
    return "";
  }
})();

export async function envChecker() {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not defined");
  }
}