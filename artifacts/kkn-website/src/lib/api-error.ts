/**
 * Extracts a human-readable description from an API mutation error.
 *
 * The server returns structured Zod validation errors in the shape:
 *   { error: string, details: { fieldErrors: Record<string, string[]>, formErrors: string[] } }
 *
 * This utility flattens them into a single string suitable for a toast description.
 */
export function getApiErrorDesc(err: unknown, fallback = "Terjadi kesalahan"): string {
  if (err && typeof err === "object") {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const d = data as {
        details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
        error?: string;
      };
      const fieldErrors = d.details?.fieldErrors;
      if (fieldErrors) {
        const msgs = Object.values(fieldErrors).flat();
        if (msgs.length > 0) return msgs.join(" · ");
      }
      const formErrors = d.details?.formErrors;
      if (Array.isArray(formErrors) && formErrors.length > 0) {
        return formErrors.join(" · ");
      }
      if (typeof d.error === "string" && d.error) return d.error;
    }
    const msg = (err as { message?: string }).message;
    if (typeof msg === "string" && msg) return msg;
  }
  return fallback;
}
