// components/InputCurrentcyComponent.tsx
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface InputCurrentcyComponentProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  info: {
    label?: string;
    placeholder?: string;
    required?: boolean;
    min?: number;
    max?: number;
    currency?: "VND" | "USD" | "EUR"; // Loại tiền tệ
    locale?: string; // Ngôn ngữ hiển thị
    [key: string]: any;
  };
  error?: string;
  touched?: boolean;
}

const InputCurrentcyComponent: React.FC<InputCurrentcyComponentProps> = ({
  value,
  onChange,
  onBlur,
  info,
  error,
  touched,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(
    formatCurrency(value, info.currency || "VND")
  );

  // Format tiền tệ
  function formatCurrency(amount: number | null, currency: string): string {
    if (amount === null || amount === undefined || amount === 0) return "";
    
    const formatter = new Intl.NumberFormat(info.locale || "vi-VN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "VND" ? 0 : 2,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    });
    
    return formatter.format(amount);
  }

  // Parse từ string tiền tệ sang số
  function parseCurrency(text: string): number | null {
    // Loại bỏ ký tự tiền tệ và khoảng trắng
    let cleaned = text.replace(/[^0-9.,-]/g, "");
    
    // Xử lý dấu phân cách
    if (info.currency === "VND") {
      cleaned = cleaned.replace(/\./g, "");
      cleaned = cleaned.replace(/,/g, ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  const handleChangeText = (text: string) => {
    const number = parseCurrency(text);
    
    if (number !== null) {
      let finalValue = number;
      if (info.min !== undefined && finalValue < info.min) {
        finalValue = info.min;
      }
      if (info.max !== undefined && finalValue > info.max) {
        finalValue = info.max;
      }
      
      setDisplayValue(formatCurrency(finalValue, info.currency || "VND"));
      onChange(finalValue);
    } else {
      setDisplayValue(text);
      onChange(null);
    }
  };

  const handleBlur = () => {
    if (value && value !== 0) {
      setDisplayValue(formatCurrency(value, info.currency || "VND"));
    } else {
      setDisplayValue("");
    }
    
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <View style={styles.container}>
      {info.label && (
        <Text style={styles.label}>
          {info.label}
          {info.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <TextInput
        style={[
          styles.input,
          touched && error && styles.inputError,
        ]}
        value={displayValue}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        placeholder={info.placeholder || "0"}
        keyboardType="numeric"
        returnKeyType="done"
      />
      
      {touched && error && (
        <Text style={styles.errorText}>{error}</Text>
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
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 4,
  },
});

export default InputCurrentcyComponent;