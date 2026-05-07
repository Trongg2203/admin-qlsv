// components/PassworComponent.tsx
import { themeTokens, useThemeStore } from "@/store/themeStore";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface PassworComponentProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  info: any;
  error?: string;
  touched?: boolean;
}

const PassworComponent: React.FC<PassworComponentProps> = ({
  value,
  onChange,
  onBlur,
  info,
  error,
  touched,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const isError = !!touched && !!error;
  const label = info.label;
  const accessibilityLabel = info.accessibilityLabel || label || "Password";

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
          secureTextEntry={!showPassword}
          editable={!info.readonly && !info.disabled}
          autoFocus={info.autofocus}
          returnKeyType={info.returnKeyType}
          onSubmitEditing={info.onSubmitEditing}
          blurOnSubmit={info.blurOnSubmit}
          accessibilityLabel={accessibilityLabel}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text>
            {showPassword ? (
              <EyeOff size={18} color={tokens.subtext} />
            ) : (
              <Eye size={18} color={tokens.subtext} />
            )}
          </Text>
        </TouchableOpacity>
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
      paddingRight: 40,
    },
    inputWithIcon: {
      paddingLeft: 40,
    },
    inputError: {
      borderColor: tokens.danger,
    },
    eyeButton: {
      position: "absolute",
      right: 12,
      top: 12,
    },
    errorText: {
      color: tokens.danger,
      fontSize: 12,
      marginTop: 4,
    },
  });

export default PassworComponent;
