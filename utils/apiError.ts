// utils/apiError.ts
//
// The Laravel backend returns validation errors in TWO shapes:
//   1. BaseRequest-derived requests:  { code: 422, message: { field: [msg] } }
//   2. RegisterRequest / UpdateProfileRequest (extend FormRequest):
//                                     { message: "...", errors: { field: [msg] } }
// This helper normalizes both (plus plain string errors) into one structure.

export interface ParsedApiError {
  message: string;
  fields: Record<string, string>;
}

const flatten = (obj: Record<string, any>): Record<string, string> => {
  const fields: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    fields[key] = Array.isArray(v) ? String(v[0]) : String(v);
  }
  return fields;
};

export function parseApiError(res: any): ParsedApiError {
  // Shape 2: Laravel default validation response
  if (res?.errors && typeof res.errors === "object") {
    return {
      message:
        typeof res.message === "string"
          ? res.message
          : "Vui lòng kiểm tra lại thông tin",
      fields: flatten(res.errors),
    };
  }

  // Shape 1: BaseRequest — message itself is the field->messages map
  if (res?.message && typeof res.message === "object") {
    return {
      message: "Vui lòng kiểm tra lại thông tin",
      fields: flatten(res.message),
    };
  }

  // Plain string message
  return {
    message: typeof res?.message === "string" ? res.message : "Có lỗi xảy ra",
    fields: {},
  };
}

/** Join all field errors into a single human-readable line. */
export function summarizeApiError(res: any): string {
  const parsed = parseApiError(res);
  const fieldMsgs = Object.values(parsed.fields);
  return fieldMsgs.length > 0 ? fieldMsgs.join("\n") : parsed.message;
}
