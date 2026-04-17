// types/form.types.ts
export interface MasterListItem {
  text: string;
  value: string | number | boolean;
  color?: string;
  title?: string;
  [key: string]: any;
}

export interface ValidationRule {
  type:
    | "required"
    | "min"
    | "max"
    | "minLength"
    | "maxLength"
    | "email"
    | "pattern"
    | "same"
    | "custom";
  value?: any;
  message?: string;
  validator?: (value: any, formValues: any) => boolean;
}

export interface MasterComponentItem {
  type:
    | "DatePickerComponent"
    | "InputDecimalComponent"
    | "InputCurrentcyComponent"
    | "CheckBoxComponent"
    | "InputComponent"
    | "PasswordComponent"
    | "ButtonComponent";
  column?: number;
  model: string;
  class?: string;
  info: {
    label?: string;
    placeholder?: string;
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    same?: string;
    email?: boolean;
    readonly?: boolean;
    disabled?: boolean;
    suffix?: string;
    prefix?: string;
    autofocus?: boolean;
    items?: MasterListItem[];
    itemText?: string;
    itemValue?: string;
    format?: string;
    rows?: number;
    validationRules?: ValidationRule[];
    direction?: "row" | "column";
    mode?: "date" | "time" | "datetime";
    [key: string]: any;
  };
  children?: MasterComponentItem[];
  formModels?: any;
}

export interface FormErrors {
  [key: string]: string | null;
}

export interface FormState {
  values: { [key: string]: any };
  errors: FormErrors;
  touched: { [key: string]: boolean };
  isValid: boolean;
}
