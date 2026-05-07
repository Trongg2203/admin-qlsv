// components/InputCurrentcyComponent.tsx
import { themeTokens, useThemeStore } from "@/store/themeStore";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

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
    formatCurrency(value, info.currency || "VND"),
  );
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const isError = !!touched && !!error;
  const label = info.label;
  const accessibilityLabel = info.accessibilityLabel || label || "Input";

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
      {label && (
        <Text style={styles.label}>
          {label}
          {info.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.inputWrapper}>
        {info.icon ? <View style={styles.leftIcon}>{info.icon}</View> : null}
        <TextInput
          style={[
            styles.input,
            info.icon && styles.inputWithIcon,
            isError && styles.inputError,
            info.disabled && styles.inputDisabled,
          ]}
          value={displayValue}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          placeholder={info.placeholder || "0"}
          placeholderTextColor={tokens.subtext}
          keyboardType="numeric"
          returnKeyType={info.returnKeyType || "done"}
          onSubmitEditing={info.onSubmitEditing}
          blurOnSubmit={info.blurOnSubmit}
          accessibilityLabel={accessibilityLabel}
          editable={!info.disabled}
        />
      </View>

      {isError && (
        <Text
          style={styles.errorText}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const createStyles = (tokens: typeof themeTokens.dark) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 8,
      color: tokens.text,
    },
    required: {
      color: tokens.danger,
    },
    inputWrapper: {
      position: "relative",
      justifyContent: "center",
    },
    leftIcon: {
      position: "absolute",
      left: 12,
      zIndex: 1,
    },
    input: {
      borderWidth: 1,
      borderColor: tokens.border,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 12,
      fontSize: 16,
      backgroundColor: tokens.surface,
      color: tokens.text,
    },
    inputWithIcon: {
      paddingLeft: 40,
    },
    inputError: {
      borderColor: tokens.danger,
    },
    inputDisabled: {
      backgroundColor: tokens.card,
      color: tokens.subtext,
    },
    errorText: {
      color: tokens.danger,
      fontSize: 12,
      marginTop: 4,
    },
  });

export default InputCurrentcyComponent;
