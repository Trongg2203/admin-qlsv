// components/InputDecimalComponent.tsx
import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface InputDecimalComponentProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  info: {
    label?: string;
    placeholder?: string;
    required?: boolean;
    min?: number;
    max?: number;
    decimalPlaces?: number;
    thousandSeparator?: boolean;
    prefix?: string;
    suffix?: string;
    readonly?: boolean;
    disabled?: boolean;
    [key: string]: any;
  };
  error?: string;
  touched?: boolean;
  formValues?: any;
}

const InputDecimalComponent: React.FC<InputDecimalComponentProps> = ({
  value,
  onChange,
  onBlur,
  info,
  error,
  touched,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(
    formatDisplayValue(value),
  );
  const inputRef = useRef<TextInput>(null);

  // Format số hiển thị
  function formatDisplayValue(val: any): string {
    if (val === undefined || val === null || val === "") return "";

    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "";

    // Nếu value là 0 thì trả về rỗng
    if (num === 0) return "";

    const decimalPlaces = info.decimalPlaces ?? 2;
    let formatted = num.toFixed(decimalPlaces);

    // Loại bỏ số 0 vô nghĩa ở cuối
    formatted = formatted.replace(/\.?0+$/, "");

    // Thêm phân cách hàng nghìn nếu cần
    if (info.thousandSeparator && formatted !== "") {
      const parts = formatted.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      formatted = parts.join(".");
    }

    return formatted;
  }

  // Parse từ string sang number
  function parseToNumber(text: string): number | null {
    // Xóa khoảng trắng
    let cleaned = text.trim();

    // Nếu text rỗng, trả về null
    if (cleaned === "") return null;

    // Loại bỏ prefix và suffix
    if (info.prefix && cleaned.startsWith(info.prefix)) {
      cleaned = cleaned.substring(info.prefix.length);
    }
    if (info.suffix && cleaned.endsWith(info.suffix)) {
      cleaned = cleaned.substring(0, cleaned.length - info.suffix.length);
    }

    // Loại bỏ phân cách hàng nghìn
    cleaned = cleaned.replace(/,/g, "");

    // Xử lý trường hợp chỉ có dấu chấm hoặc dấu trừ
    if (cleaned === ".") {
      return 0; // . -> 0
    }

    if (cleaned === "-.") {
      return 0; // -. -> 0
    }

    // Xử lý trường hợp bắt đầu bằng dấu chấm (.8 -> 0.8)
    if (cleaned.startsWith(".")) {
      cleaned = "0" + cleaned;
    }

    // Xử lý trường hợp bắt đầu bằng dấu trừ và dấu chấm (-.8 -> -0.8)
    if (cleaned.startsWith("-.")) {
      cleaned = "-0." + cleaned.substring(2);
    }

    // Loại bỏ tất cả ký tự không phải số, dấu trừ, dấu chấm
    cleaned = cleaned.replace(/[^0-9.-]/g, "");

    // Xử lý trường hợp có nhiều dấu chấm
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    // Nếu chỉ còn dấu trừ
    if (cleaned === "-") {
      return null;
    }

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  const handleChangeText = (text: string) => {
    // Nếu text rỗng, xóa toàn bộ
    if (text === "") {
      setDisplayValue("");
      onChange(null);
      return;
    }

    // Cho phép nhập tạm thời dấu chấm
    if (text === ".") {
      setDisplayValue(".");
      onChange(null);
      return;
    }

    if (text === "-.") {
      setDisplayValue("-.");
      onChange(null);
      return;
    }

    const number = parseToNumber(text);

    if (number !== null) {
      // Giới hạn min/max
      let finalValue = number;
      if (info.min !== undefined && finalValue < info.min) {
        finalValue = info.min;
      }
      if (info.max !== undefined && finalValue > info.max) {
        finalValue = info.max;
      }

      // Làm tròn theo decimalPlaces
      const decimalPlaces = info.decimalPlaces ?? 2;
      const rounded = Number(finalValue.toFixed(decimalPlaces));

      // Format lại giá trị hiển thị
      const formatted = formatDisplayValue(rounded);
      setDisplayValue(formatted);
      onChange(rounded);
    } else {
      // Nếu không parse được số, vẫn hiển thị text người dùng nhập
      setDisplayValue(text);
      onChange(null);
    }
  };

  const handleBlur = () => {
    // Khi blur, format lại số nếu có giá trị
    if (value !== null && value !== undefined && value !== "") {
      const formatted = formatDisplayValue(value);
      setDisplayValue(formatted);
    } else {
      setDisplayValue("");
      onChange(null);
    }

    if (onBlur) {
      onBlur();
    }
  };

  const getDisplayText = () => {
    let text = displayValue;
    if (text === "") return "";

    if (info.prefix && text) {
      text = info.prefix + " " + text;
    }
    if (info.suffix && text) {
      text = text + " " + info.suffix;
    }
    return text;
  };

  useEffect(() => {
    const formatted = formatDisplayValue(value);
    setDisplayValue(formatted);
  }, [value, info.label]);

  return (
    <View style={styles.container}>
      {info.label && (
        <Text style={styles.label}>
          {info.label}
          {info.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          touched && error && styles.inputError,
          (info.readonly || info.disabled) && styles.inputDisabled,
        ]}
        value={getDisplayText()}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        placeholder={info.placeholder || "Nhập số"}
        editable={!info.readonly && !info.disabled}
        keyboardType="decimal-pad"
        returnKeyType="done"
      />

      {touched && error && <Text style={styles.errorText}>{error}</Text>}

      {info.min !== undefined && info.max !== undefined && (
        <Text style={styles.hintText}>
          Giá trị từ {info.min} đến {info.max}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  required: {
    color: "#ff3b30",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 4,
  },
  hintText: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },
});

export default InputDecimalComponent;
