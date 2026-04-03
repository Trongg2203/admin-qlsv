// validation/rules.ts
export const validationRules = {
    required: (value: any, message?: string) => {
        if (value === undefined || value === null || value === '') {
            return message || 'Trường này là bắt buộc';
        }
        if (Array.isArray(value) && value.length === 0) {
            return message || 'Trường này là bắt buộc';
        }
        return null;
    },

    min: (value: number, min: number, message?: string) => {
        if (value !== undefined && value !== null && value < min) {
            return message || `Giá trị phải lớn hơn hoặc bằng ${min}`;
        }
        return null;
    },

    max: (value: number, max: number, message?: string) => {
        if (value !== undefined && value !== null && value > max) {
            return message || `Giá trị phải nhỏ hơn hoặc bằng ${max}`;
        }
        return null;
    },

    minLength: (value: string, min: number, message?: string) => {
        if (value && value.length < min) {
            return message || `Độ dài tối thiểu là ${min} ký tự`;
        }
        return null;
    },

    maxLength: (value: string, max: number, message?: string) => {
        if (value && value.length > max) {
            return message || `Độ dài tối đa là ${max} ký tự`;
        }
        return null;
    },

    email: (value: string, message?: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
            return message || 'Email không hợp lệ';
        }
        return null;
    },

    pattern: (value: string, pattern: RegExp, message?: string) => {
        if (value && !pattern.test(value)) {
            return message || 'Giá trị không đúng định dạng';
        }
        return null;
    },

    same: (value: any, targetField: string, formValues: any, message?: string) => {
        if (value !== formValues[targetField]) {
            return message || `Giá trị không khớp với ${targetField}`;
        }
        return null;
    }
};