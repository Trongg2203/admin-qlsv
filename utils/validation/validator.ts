// validation/validator.ts

import {
  MasterComponentItem,
  ValidationRule,
} from "@/typings/types/form.types";
import { validationRules } from "./rules";

export class Validator {
  static validateField(
    value: any,
    rules: ValidationRule[] = [],
    formValues: any = {},
  ): string | null {
    for (const rule of rules) {
      let error = null;

      switch (rule.type) {
        case "required":
          error = validationRules.required(value, rule.message);
          break;
        case "min":
          error = validationRules.min(value, rule.value, rule.message);
          break;
        case "max":
          error = validationRules.max(value, rule.value, rule.message);
          break;
        case "minLength":
          error = validationRules.minLength(value, rule.value, rule.message);
          break;
        case "maxLength":
          error = validationRules.maxLength(value, rule.value, rule.message);
          break;
        case "email":
          error = validationRules.email(value, rule.message);
          break;
        case "pattern":
          error = validationRules.pattern(value, rule.value, rule.message);
          break;
        case "same":
          error = validationRules.same(
            value,
            rule.value,
            formValues,
            rule.message,
          );
          break;
        case "custom":
          if (rule.validator && !rule.validator(value, formValues)) {
            error = rule.message || "Giá trị không hợp lệ";
          }
          break;
      }

      if (error) {
        return error;
      }
    }
    return null;
  }

  static validateForm(
    values: { [key: string]: any },
    fields: MasterComponentItem[],
  ): { [key: string]: string | null } {
    const errors: { [key: string]: string | null } = {};

    const validateFields = (fieldsList: MasterComponentItem[]) => {
      fieldsList.forEach((field) => {
        const fieldKey = field.model;
        // CHỈ validate nếu field có trong values
        if (fieldKey && values.hasOwnProperty(fieldKey)) {
          const value = values[fieldKey];
          const rules = field.info?.validationRules || [];

          // Tự động thêm required rule nếu field required
          if (field.info?.required) {
            const hasRequired = rules.some((rule) => rule.type === "required");
            if (!hasRequired) {
              rules.unshift({ type: "required" });
            }
          }

          const error = this.validateField(value, rules, values);
          errors[fieldKey] = error;
        }

        // Validate children nếu có
        if (field.children && field.children.length > 0) {
          validateFields(field.children);
        }
      });
    };

    validateFields(fields);
    return errors;
  }

  static isFormValid(errors: { [key: string]: string | null }): boolean {
    return Object.values(errors).every((error) => error === null);
  }
}
