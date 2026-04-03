// FormComponent.tsx
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { MasterComponentItem, FormState } from "@/typings/types/form.types";
import MasterFormItem from "./MasterFormItem";
import ButtonComponent from "../ButtonComponent";
import { FileCheck } from "lucide-react-native";
import { Validator } from "@/utils/validation/validator";

interface MasterFormProps {
  fields: MasterComponentItem[];
  initialValues?: { [key: string]: any };
  onSubmit?: (values: { [key: string]: any }) => void;
  onChange?: (values: { [key: string]: any }, isValid: boolean) => void;
  containerStyle?: object;
}

const FormComponent: React.FC<MasterFormProps> = ({
  fields,
  initialValues = {},
  onSubmit,
  onChange,
  containerStyle,
}) => {
  const [formState, setFormState] = useState<FormState>({
    values: {}, // Khởi tạo rỗng, không có giá trị mặc định
    errors: {},
    touched: {},
    isValid: true,
  });

  // Initialize form values - CHỈ KHỞI TẠO NHỮNG FIELD CÓ TRONG FIELDS
  useEffect(() => {
    const initValues: { [key: string]: any } = {};
    const initTouched: { [key: string]: boolean } = {};

    const initFields = (fieldsList: MasterComponentItem[]) => {
      fieldsList.forEach((field) => {
        if (field.model) {
          // Chỉ lấy giá trị từ initialValues nếu có, không thì để undefined hoặc giá trị mặc định theo type
          initValues[field.model] =
            initialValues[field.model] !== undefined
              ? initialValues[field.model]
              : field.info?.defaultValue || "";
          initTouched[field.model] = false;
        }
        if (field.children) {
          initFields(field.children);
        }
      });
    };

    initFields(fields);

    setFormState((prev) => ({
      ...prev,
      values: initValues, // Gán trực tiếp, không merge với cũ
      touched: initTouched,
    }));
  }, [fields, initialValues]); // Thêm initialValues vào dependency

  // Validate form when values change
  useEffect(() => {
    if (Object.keys(formState.values).length === 0) return;

    const errors = Validator.validateForm(formState.values, fields);
    const isValid = Validator.isFormValid(errors);

    setFormState((prev) => ({
      ...prev,
      errors,
      isValid,
    }));

    if (onChange) {
      onChange(formState.values, isValid);
    }
  }, [formState.values, fields, onChange]);

  const handleChange = useCallback((model: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [model]: value,
      },
    }));
  }, []);

  const handleBlur = useCallback((model: string) => {
    setFormState((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [model]: true,
      },
    }));
  }, []);

  const handleSubmit = () => {
    // Mark all fields as touched
    const allTouched: { [key: string]: boolean } = {};
    Object.keys(formState.values).forEach((key) => {
      allTouched[key] = true;
    });

    setFormState((prev) => ({
      ...prev,
      touched: allTouched,
    }));

    // Validate all fields
    const errors = Validator.validateForm(formState.values, fields);
    const isValid = Validator.isFormValid(errors);

    if (isValid && onSubmit) {
      onSubmit(formState.values);
    }
  };

  const renderFields = (fieldsList: MasterComponentItem[]) => {
    return fieldsList.map((field, index) => (
      <MasterFormItem
        key={`${field.model}-${index}`}
        field={field}
        value={formState.values[field.model]}
        onChange={handleChange}
        onBlur={handleBlur}
        errors={formState.errors}
        touched={formState.touched}
        formValues={formState.values}
      />
    ));
  };

  return (
    <ScrollView style={[styles.container, containerStyle]}>
      <View style={styles.form}>
        {renderFields(fields)}
        {onSubmit && (
          <ButtonComponent
            onPress={handleSubmit}
            title="Đồng ý"
            icon={FileCheck}
            disabled={!formState.isValid}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  form: {
    padding: 16,
  },
});

export default FormComponent;
