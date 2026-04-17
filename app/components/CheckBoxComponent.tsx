// components/CheckBoxComponent.tsx
import { Check, ChevronDown, ChevronRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CheckboxOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  children?: CheckboxOption[];
}

interface CheckBoxComponentProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  info: {
    label?: string;
    options?: CheckboxOption[];
    direction?: "row" | "column";
    required?: boolean;
    disabled?: boolean;
    returnType?: "array" | "single"; // Thêm option: array (mặc định) hoặc single (trả về 1 giá trị)
    [key: string]: any;
  };
  error?: string;
  touched?: boolean;
  formValues?: any;
}

const CheckBoxComponent: React.FC<CheckBoxComponentProps> = ({
  value,
  onChange,
  onBlur,
  info,
  error,
  touched,
}) => {
  const [selectedValues, setSelectedValues] = useState<any[]>(
    Array.isArray(value) ? value : value ? [value] : [],
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (Array.isArray(value)) {
      setSelectedValues(value);
    } else if (value !== undefined && value !== null) {
      setSelectedValues([value]);
    } else {
      setSelectedValues([]);
    }
  }, [value]);

  const getAllChildrenValues = (option: CheckboxOption): any[] => {
    let values: any[] = [option.value];
    if (option.children) {
      option.children.forEach((child) => {
        values = [...values, ...getAllChildrenValues(child)];
      });
    }
    return values;
  };

  const getCheckboxState = (
    option: CheckboxOption,
  ): "checked" | "unchecked" | "indeterminate" => {
    const allValues = getAllChildrenValues(option);
    const selectedCount = allValues.filter((v) =>
      selectedValues.includes(v),
    ).length;

    if (selectedCount === 0) return "unchecked";
    if (selectedCount === allValues.length) return "checked";
    return "indeterminate";
  };

  // Hàm xử lý onChange với returnType
  const handleOnChange = (newValues: any[]) => {
    if (info.returnType === "single") {
      // Nếu là single, chỉ lấy giá trị đầu tiên hoặc null
      const singleValue = newValues.length > 0 ? newValues[0] : null;
      onChange(singleValue);
    } else {
      // Mặc định là array
      onChange(newValues);
    }
  };

  const handleToggle = (option: CheckboxOption) => {
    let newValues = [...selectedValues];
    const allValues = getAllChildrenValues(option);
    const isAllSelected = allValues.every((v) => newValues.includes(v));

    if (isAllSelected) {
      newValues = newValues.filter((v) => !allValues.includes(v));
    } else {
      allValues.forEach((v) => {
        if (!newValues.includes(v)) {
          newValues.push(v);
        }
      });
    }

    setSelectedValues(newValues);
    handleOnChange(newValues);

    if (onBlur) {
      onBlur();
    }
  };

  const handleToggleChild = (optionValue: any) => {
    let newValues = [...selectedValues];

    if (newValues.includes(optionValue)) {
      newValues = newValues.filter((v) => v !== optionValue);
    } else {
      // Nếu là single, clear các giá trị cũ trước khi thêm mới
      if (info.returnType === "single") {
        newValues = [optionValue];
      } else {
        newValues.push(optionValue);
      }
    }

    setSelectedValues(newValues);
    handleOnChange(newValues);

    if (onBlur) {
      onBlur();
    }
  };

  const toggleExpand = (value: string) => {
    setExpanded((prev) => ({ ...prev, [value]: !prev[value] }));
  };

  const renderCheckboxItem = (option: CheckboxOption, level: number = 0) => {
    const isChecked = getCheckboxState(option) === "checked";
    const isIndeterminate = getCheckboxState(option) === "indeterminate";
    const hasChildren = option.children && option.children.length > 0;
    const isExpanded = expanded[option.value.toString()];

    return (
      <View key={option.value.toString()} style={{ marginLeft: level * 20 }}>
        <View style={styles.checkboxRow}>
          {hasChildren && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => toggleExpand(option.value.toString())}
            >
              {isExpanded ? (
                <ChevronDown size={16} color="#666" />
              ) : (
                <ChevronRight size={16} color="#666" />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.checkboxItem,
              !hasChildren && { marginLeft: hasChildren ? 0 : 24 },
            ]}
            onPress={() =>
              hasChildren
                ? handleToggle(option)
                : handleToggleChild(option.value)
            }
            disabled={option.disabled || info.disabled}
          >
            <View
              style={[
                styles.checkbox,
                isChecked && styles.checkboxChecked,
                isIndeterminate && styles.checkboxIndeterminate,
                (option.disabled || info.disabled) && styles.checkboxDisabled,
              ]}
            >
              {isChecked && <Check size={14} color="#fff" />}
              {isIndeterminate && <View style={styles.indeterminateLine} />}
            </View>
            <Text
              style={[
                styles.checkboxLabel,
                (option.disabled || info.disabled) && styles.labelDisabled,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        </View>

        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {option.children?.map((child) =>
              renderCheckboxItem(child, level + 1),
            )}
          </View>
        )}
      </View>
    );
  };

  // Lọc bỏ children nếu direction là row
  const getFilteredOptions = () => {
    if (info.direction === "row") {
      return info.options?.map((option) => ({
        label: option.label,
        value: option.value,
        disabled: option.disabled,
      }));
    }
    return info.options;
  };

  // Render theo direction
  const renderOptions = () => {
    if (info.direction === "row") {
      const flatOptions = getFilteredOptions();

      return (
        <View style={styles.optionsContainerRow}>
          {flatOptions?.map((option) => {
            const isChecked = selectedValues.includes(option.value);

            return (
              <TouchableOpacity
                key={option.value.toString()}
                style={styles.checkboxItemRow}
                onPress={() => handleToggleChild(option.value)}
                disabled={option.disabled || info.disabled}
              >
                <View
                  style={[
                    styles.checkbox,
                    isChecked && styles.checkboxChecked,
                    (option.disabled || info.disabled) &&
                      styles.checkboxDisabled,
                  ]}
                >
                  {isChecked && <Check size={14} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    return (
      <View style={styles.optionsContainer}>
        {info.options?.map((option) => renderCheckboxItem(option, 0))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {info.label && (
        <Text style={styles.label}>
          {info.label}
          {info.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {renderOptions()}

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
  required: {
    color: "#ff3b30",
  },
  optionsContainer: {
    flexDirection: "column",
    gap: 12,
  },
  optionsContainerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  expandButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkboxItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#6B4EFF",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#6B4EFF",
    borderColor: "#6B4EFF",
  },
  checkboxIndeterminate: {
    borderColor: "#6B4EFF",
    backgroundColor: "#6B4EFF",
  },
  indeterminateLine: {
    width: 10,
    height: 2,
    backgroundColor: "#fff",
  },
  checkboxDisabled: {
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
  },
  labelDisabled: {
    color: "#999",
  },
  childrenContainer: {
    marginLeft: 20,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 4,
  },
});

export default CheckBoxComponent;
