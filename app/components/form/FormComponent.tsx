// FormComponent.tsx
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { MasterComponentItem, FormState } from "@/typings/types/form.types";
import MasterFormItem from "./MasterFormItem";
import ButtonComponent from "../ButtonComponent";
import { Ban, FileCheck } from "lucide-react-native";
import { Validator } from "@/utils/validation/validator";
import MasterFormRow from "./MasterFormRow";

interface MasterFormProps {
  fields: MasterComponentItem[];
  initialValues?: { [key: string]: any };
  onSubmit?: (values: { [key: string]: any }) => void;
  onCancel?: () => void;
  onChange?: (values: { [key: string]: any }, isValid: boolean) => void;
  containerStyle?: object;
}

const FormComponent: React.FC<MasterFormProps> = ({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  
  const renderFields = () => {
    return (
      <MasterFormRow
        fields={fields} // Truyền toàn bộ fields, không phải từng field
        values={formState.values}
        onChange={handleChange}
        onBlur={handleBlur}
        errors={formState.errors}
        touched={formState.touched}
        formValues={formState.values}
      />
    );
  };

  return (
    <ScrollView style={[styles.container, containerStyle]}>
      <View style={styles.form}>
        {renderFields()}

        <View style={styles.buttonContainer}>
          {onCancel && (
            <View style={styles.buttonWrapper}>
              <ButtonComponent
                onPress={handleCancel}
                title="Hủy"
                icon={Ban}
                variant="outline"
                color="#FF3B30" // Màu đỏ
                textColor="#FF3B30"
              />
            </View>
          )}

          {onSubmit && (
            <View style={styles.buttonWrapper}>
              <ButtonComponent
                onPress={handleSubmit}
                title="Đồng ý"
                icon={FileCheck}
                variant="primary" // Mặc định là primary màu tím
                disabled={!formState.isValid}
              />
            </View>
          )}
        </View>
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default FormComponent;
