// components/InputComponent.tsx
import React from "react";
import { TextInput, Text, View, StyleSheet } from "react-native";

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
  return (
    <View style={styles.container}>
      {info.label && <Text style={styles.label}>{info.label}</Text>}
      <TextInput
        style={[styles.input, touched && error && styles.inputError]}
        value={value?.toString() || ""}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={info.placeholder}
        editable={!info.readonly && !info.disabled}
        secureTextEntry={false}
        autoFocus={info.autofocus}
      />
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

export default InputComponent;
