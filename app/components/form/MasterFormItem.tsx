// MasterFormItem.tsx
import { MasterComponentItem } from "@/typings/types/form.types";
import React from "react";
import { View, StyleSheet } from "react-native";
import InputComponent from "../InputComponent";
import PasswordComponent from "../PasswordComponent";
import ButtonComponent from "../ButtonComponent";
interface MasterFormItemProps {
  field: MasterComponentItem;
  value: any;
  onChange: (model: string, value: any) => void;
  onBlur: (model: string) => void;
  errors: { [key: string]: string | null };
  touched: { [key: string]: boolean };
  formValues: any;
}

const MasterFormItem: React.FC<MasterFormItemProps> = ({
  field,
  value,
  onChange,
  onBlur,
  errors,
  touched,
  formValues,
}) => {
  const renderComponent = () => {
    const commonProps = {
      value: value,
      onChange: (newValue: any) => onChange(field.model, newValue),
      onBlur: () => onBlur(field.model),
      info: field.info,
      error: errors[field.model] || undefined,
      touched: touched[field.model],
      formValues: formValues,
    };

    switch (field.type) {
      case "InputComponent":
        return <InputComponent {...commonProps} />;
        case "PasswordComponent":
          return <PasswordComponent {...commonProps} />;
      //   case "MasterLabel":
      //     return <MasterLabel {...commonProps} />;
      //   case "MasterCheckbox":
      //     return <MasterCheckbox {...commonProps} />;
      //   case "MasterRadio":
      //     return <MasterRadio {...commonProps} />;
      //   case "MasterSelect":
      //     return <MasterSelect {...commonProps} />;
      //   case "MasterDatePicker":
      //     return <MasterDatePicker {...commonProps} />;
      //   case "MasterTextarea":
      //     return <MasterTextarea {...commonProps} />;
        case "ButtonComponent":
          return (
            <ButtonComponent
              title={field.info?.label ?? ""}
              onPress={() => {
                /* handle button press logic here if needed */
              }}
            />
          );
      default:
        return <InputComponent {...commonProps} />;
    }
  };

  const columnWidth = (field.column || 12) / 12;

  return (
    <View style={[styles.column, { width: `${columnWidth * 100}%` }]}>
      {renderComponent()}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default MasterFormItem;
