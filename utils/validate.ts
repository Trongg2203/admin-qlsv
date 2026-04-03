// utils/validate.ts

// Định nghĩa các rule type
export type ValidateRule = {
  required?: boolean | string;
  min?: number | [number, string];
  max?: number | [number, string];
  minLength?: number | [number, string];
  maxLength?: number | [number, string];
  pattern?: RegExp | [RegExp, string];
  email?: boolean | string;
  phone?: boolean | string;
  url?: boolean | string;
  number?: boolean | string;
  integer?: boolean | string;
  match?: [any, string];
  custom?: (value: any) => string | null;
};

export type ValidateRules<T> = {
  [K in keyof T]?: ValidateRule;
};

export type ValidateErrors<T> = {
  [K in keyof T]?: string;
};

// Helper để lấy message
const getMessage = (rule: any, defaultMsg: string): string => {
  if (typeof rule === "string") return rule;
  if (Array.isArray(rule) && typeof rule[1] === "string") return rule[1];
  return defaultMsg;
};

// Các validate function riêng
const validateRequired = (value: any, rule: any): string | null => {
  if (!rule) return null;

  const message = getMessage(rule, "Trường này là bắt buộc");

  if (value === undefined || value === null || value === "") {
    return message;
  }
  if (typeof value === "string" && value.trim() === "") {
    return message;
  }
  if (Array.isArray(value) && value.length === 0) {
    return message;
  }
  return null;
};

const validateMin = (value: number, rule: any): string | null => {
  if (!rule) return null;

  const min = Array.isArray(rule) ? rule[0] : rule;
  const message = getMessage(rule, `Giá trị phải lớn hơn hoặc bằng ${min}`);

  if (value !== undefined && value !== null && value < min) {
    return message;
  }
  return null;
};

const validateMax = (value: number, rule: any): string | null => {
  if (!rule) return null;

  const max = Array.isArray(rule) ? rule[0] : rule;
  const message = getMessage(rule, `Giá trị phải nhỏ hơn hoặc bằng ${max}`);

  if (value !== undefined && value !== null && value > max) {
    return message;
  }
  return null;
};

const validateMinLength = (value: string, rule: any): string | null => {
  if (!rule) return null;

  const min = Array.isArray(rule) ? rule[0] : rule;
  const message = getMessage(rule, `Độ dài tối thiểu là ${min} ký tự`);

  if (value && value.length < min) {
    return message;
  }
  return null;
};

const validateMaxLength = (value: string, rule: any): string | null => {
  if (!rule) return null;

  const max = Array.isArray(rule) ? rule[0] : rule;
  const message = getMessage(rule, `Độ dài tối đa là ${max} ký tự`);

  if (value && value.length > max) {
    return message;
  }
  return null;
};

const validatePattern = (value: string, rule: any): string | null => {
  if (!rule) return null;

  const pattern = Array.isArray(rule) ? rule[0] : rule;
  const message = getMessage(rule, "Giá trị không đúng định dạng");

  if (value && !pattern.test(value)) {
    return message;
  }
  return null;
};

const validateEmail = (value: string, rule: any): string | null => {
  if (!rule) return null;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const message = getMessage(rule, "Email không hợp lệ");

  if (value && !emailRegex.test(value)) {
    return message;
  }
  return null;
};

const validatePhone = (value: string, rule: any): string | null => {
  if (!rule) return null;

  // Số điện thoại Việt Nam
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  const message = getMessage(rule, "Số điện thoại không hợp lệ");

  if (value && !phoneRegex.test(value)) {
    return message;
  }
  return null;
};

const validateUrl = (value: string, rule: any): string | null => {
  if (!rule) return null;

  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  const message = getMessage(rule, "URL không hợp lệ");

  if (value && !urlRegex.test(value)) {
    return message;
  }
  return null;
};

const validateNumber = (value: any, rule: any): string | null => {
  if (!rule) return null;

  const message = getMessage(rule, "Phải là số");

  if (value !== undefined && value !== null && value !== "") {
    if (isNaN(Number(value))) {
      return message;
    }
  }
  return null;
};

const validateInteger = (value: any, rule: any): string | null => {
  if (!rule) return null;

  const message = getMessage(rule, "Phải là số nguyên");

  if (value !== undefined && value !== null && value !== "") {
    if (!Number.isInteger(Number(value))) {
      return message;
    }
  }
  return null;
};

const validateMatch = (value: any, rule: any): string | null => {
  if (!rule) return null;

  const [target, message] = Array.isArray(rule)
    ? rule
    : [rule, "Giá trị không khớp"];

  if (value !== target) {
    return message;
  }
  return null;
};

// Main validate function
export const validate = <T extends Record<string, any>>(
  values: T,
  rules: ValidateRules<T>,
): ValidateErrors<T> => {
  const errors: ValidateErrors<T> = {};

  for (const field in rules) {
    const rule = rules[field];
    if (!rule) continue;

    const value = values[field];

    // Kiểm tra required trước
    if (rule.required) {
      const error = validateRequired(value, rule.required);
      if (error) {
        errors[field] = error;
        continue; // Bỏ qua các rule khác nếu required chưa đúng
      }
    }

    // Nếu có value hoặc không required thì check tiếp
    if (value !== undefined && value !== null && value !== "") {
      // Check min
      if (rule.min) {
        const error = validateMin(Number(value), rule.min);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      // Check max
      if (rule.max) {
        const error = validateMax(Number(value), rule.max);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      // Check minLength
      if (rule.minLength) {
        const error = validateMinLength(String(value), rule.minLength);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      // Check maxLength
      if (rule.maxLength) {
        const error = validateMaxLength(String(value), rule.maxLength);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      // Check pattern
      if (rule.pattern) {
        const error = validatePattern(String(value), rule.pattern);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      // Check email
      if (rule.email) {
        const error = validateEmail(String(value), rule.email);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      // Check phone
      if (rule.phone) {
        const error = validatePhone(String(value), rule.phone);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      // Check url
      if (rule.url) {
        const error = validateUrl(String(value), rule.url);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      // Check number
      if (rule.number) {
        const error = validateNumber(value, rule.number);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      // Check integer
      if (rule.integer) {
        const error = validateInteger(value, rule.integer);
        if (error) {
          errors[field] = error;
          continue;
        }
      }
    }

    // Check match (so sánh với field khác)
    if (rule.match) {
      const error = validateMatch(value, rule.match);
      if (error) {
        errors[field] = error;
        continue;
      }
    }

    // Custom rule
    if (rule.custom) {
      const error = rule.custom(value);
      if (error) {
        errors[field] = error;
        continue;
      }
    }
  }

  return errors;
};

// Validate 1 field
export const validateField = <T extends Record<string, any>>(
  field: keyof T,
  value: any,
  rule: ValidateRule,
): string | null => {
  const tempRules = { [field]: rule } as ValidateRules<T>;
  const tempValues = { [field]: value } as T;
  const errors = validate(tempValues, tempRules);
  return errors[field] || null;
};
