/**
 * Utilities for surfacing API Zod validation errors in the frontend.
 *
 * The server returns structured errors in the shape:
 *   { error: string, details: { fieldErrors: Record<string, string[]>, formErrors: string[] } }
 *
 * getApiErrorDesc  — single string suitable for a toast description
 * extractApiFieldErrors — per-field map for inline form validation hints
 */

type ApiErrorShape = {
  details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
  error?: string;
};

function parseErrorData(err: unknown): ApiErrorShape | null {
  if (err && typeof err === "object") {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object") return data as ApiErrorShape;
  }
  return null;
}

/** Returns a human-readable description string (joined with " · "). */
export function getApiErrorDesc(err: unknown, fallback = "Terjadi kesalahan"): string {
  const d = parseErrorData(err);
  if (d) {
    const fieldErrors = d.details?.fieldErrors;
    if (fieldErrors) {
      const msgs = Object.values(fieldErrors).flat();
      if (msgs.length > 0) return msgs.join(" · ");
    }
    const formErrors = d.details?.formErrors;
    if (Array.isArray(formErrors) && formErrors.length > 0) return formErrors.join(" · ");
    if (typeof d.error === "string" && d.error) return d.error;
  }
  const msg = (err as { message?: string }).message;
  if (typeof msg === "string" && msg) return msg;
  return fallback;
}

/**
 * Returns a per-field error map (field name → first error message).
 * Pass this to form state so each input can show its own error inline.
 *
 * Usage:
 *   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
 *   // in onError:
 *   setFieldErrors(extractApiFieldErrors(err));
 *   // in JSX:
 *   {fieldErrors.title && <p className="text-xs text-rose-500 mt-1">{fieldErrors.title}</p>}
 */
export function extractApiFieldErrors(err: unknown): Record<string, string> {
  const d = parseErrorData(err);
  if (!d?.details?.fieldErrors) return {};
  const out: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(d.details.fieldErrors)) {
    if (Array.isArray(msgs) && msgs.length > 0) out[key] = msgs[0];
  }
  return out;
}
