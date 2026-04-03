// components/PassworComponent.tsx
import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
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

  return (
    <View style={styles.container}>
      {info.label && <Text style={styles.label}>{info.label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, touched && error && styles.inputError]}
          value={value?.toString() || ""}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={info.placeholder}
          secureTextEntry={!showPassword}
          editable={!info.readonly && !info.disabled}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text>
            {showPassword ? (
              <EyeOff size={18} color="#6b7280" />
            ) : (
              <Eye size={18} color="#6b7280" />
            )}
          </Text>
        </TouchableOpacity>
      </View>
      {touched && error && <Text style={styles.errorText}>{error}</Text>}
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
  inputWrapper: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    paddingRight: 40,
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 4,
  },
});

export default PassworComponent;
