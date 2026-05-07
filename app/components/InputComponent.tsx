// components/InputComponent.tsx
import { themeTokens, useThemeStore } from "@/store/themeStore";
import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface InputComponentProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  info: any;
  error?: string;
  touched?: boolean;
}

const InputComponent: React.FC<InputComponentProps> = ({
  value,
  onChange,
  onBlur,
  info,
  error,
  touched,
}) => {
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const isError = !!touched && !!error;
  const label = info.label;
  const accessibilityLabel = info.accessibilityLabel || label || "Input";

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {info.icon ? <View style={styles.leftIcon}>{info.icon}</View> : null}
        <TextInput
          style={[
            styles.input,
            info.icon && styles.inputWithIcon,
            isError && styles.inputError,
          ]}
          value={value?.toString() || ""}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={info.placeholder}
          placeholderTextColor={tokens.subtext}
          editable={!info.readonly && !info.disabled}
          secureTextEntry={false}
          autoFocus={info.autofocus}
          returnKeyType={info.returnKeyType}
          onSubmitEditing={info.onSubmitEditing}
          blurOnSubmit={info.blurOnSubmit}
          accessibilityLabel={accessibilityLabel}
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
    errorText: {
      color: tokens.danger,
      fontSize: 12,
      marginTop: 4,
    },
  });

export default InputComponent;
