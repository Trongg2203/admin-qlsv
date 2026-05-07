// FormComponent.tsx
import { themeTokens, useThemeStore } from "@/store/themeStore";
import { FormState, MasterComponentItem } from "@/typings/types/form.types";
import { Validator } from "@/utils/validation/validator";
import * as Haptics from "expo-haptics";
import { Ban, FileCheck } from "lucide-react-native";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import ButtonComponent from "../ButtonComponent";
import MasterFormRow from "./MasterFormRow";

interface MasterFormProps<T = { [key: string]: any }> {
  fields: MasterComponentItem[];
  initialValues?: T;
  onSubmit?: (values: T) => Promise<void> | void;
  onCancel?: () => void;
  onChange?: (values: T, isValid: boolean) => void;
  onAutoSave?: (values: T) => Promise<void> | void;
  autoSave?: boolean;
  autoSaveDelay?: number;
  containerStyle?: object;
}

const FormComponent = <T extends { [key: string]: any }>({
  fields,
  initialValues = {} as T,
  onSubmit,
  onCancel,
  onChange,
  onAutoSave,
  autoSave = false,
  autoSaveDelay = 800,
  containerStyle,
}: MasterFormProps<T>) => {
  const [formState, setFormState] = useState<FormState>({
    values: {},
    errors: {},
    touched: {},
    isValid: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const styles = useMemo(
    () => createStyles(tokens, isWeb, width),
    [tokens, isWeb, width],
  );
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize form values - CHI KHOI TAO NHUNG FIELD CO TRONG FIELDS
  useEffect(() => {
    const initValues: { [key: string]: any } = {};
    const initTouched: { [key: string]: boolean } = {};

    const initFields = (fieldsList: MasterComponentItem[]) => {
      fieldsList.forEach((field) => {
        if (field.model) {
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
      values: initValues,
      touched: initTouched,
    }));
  }, [fields, initialValues]);

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
      onChange(formState.values as T, isValid);
    }
  }, [formState.values, fields, onChange]);

  // Auto save draft
  useEffect(() => {
    if (!autoSave || !onAutoSave) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      onAutoSave(formState.values as T);
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [autoSave, autoSaveDelay, formState.values, onAutoSave]);

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

  const handleSubmit = useCallback(async () => {
    const allTouched: { [key: string]: boolean } = {};
    Object.keys(formState.values).forEach((key) => {
      allTouched[key] = true;
    });

    setFormState((prev) => ({
      ...prev,
      touched: allTouched,
    }));

    const errors = Validator.validateForm(formState.values, fields);
    const isValid = Validator.isFormValid(errors);

    if (!isValid || !onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formState.values as T);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [fields, formState.values, onSubmit]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const flatFields = useMemo(() => {
    const result: MasterComponentItem[] = [];
    const walk = (list: MasterComponentItem[]) => {
      list.forEach((field) => {
        if (field.model) {
          result.push(field);
        }
        if (field.children) {
          walk(field.children);
        }
      });
    };
    walk(fields);
    return result;
  }, [fields]);

  const hasAutoFocus = useMemo(
    () => flatFields.some((field) => field.info?.autofocus),
    [flatFields],
  );

  const enhancedFields = useMemo(() => {
    let index = 0;
    const total = flatFields.length;

    const enhance = (list: MasterComponentItem[]): MasterComponentItem[] =>
      list.map((field) => {
        const info = { ...field.info };

        if (!info.accessibilityLabel && info.label) {
          info.accessibilityLabel = info.label;
        }

        if (!hasAutoFocus && index === 0) {
          info.autofocus = true;
        }

        if (field.model) {
          const isLast = index === total - 1;
          info.returnKeyType = isLast ? "done" : "next";
          if (isLast) {
            info.onSubmitEditing = handleSubmit;
          }
          index += 1;
        }

        if (isSubmitting) {
          info.disabled = true;
        }

        return {
          ...field,
          info,
          children: field.children ? enhance(field.children) : undefined,
        };
      });

    return enhance(fields);
  }, [fields, flatFields.length, handleSubmit, hasAutoFocus, isSubmitting]);

  return (
    <ScrollView
      style={[styles.scroll, containerStyle]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <View style={styles.formContent}>
          <MasterFormRow
            fields={enhancedFields}
            values={formState.values}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={formState.errors}
            touched={formState.touched}
            formValues={formState.values}
          />

          <View style={styles.buttonContainer}>
            {onCancel && (
              <View style={styles.buttonWrapper}>
                <ButtonComponent
                  onPress={handleCancel}
                  title="Hủy"
                  icon={Ban}
                  variant="outline"
                  color={tokens.danger}
                  textColor={tokens.danger}
                  disabled={isSubmitting}
                />
              </View>
            )}

            {onSubmit && (
              <View style={styles.buttonWrapper}>
                <ButtonComponent
                  onPress={handleSubmit}
                  title={isSubmitting ? "Đang xử lý..." : "Đồng ý"}
                  icon={FileCheck}
                  variant="primary"
                  disabled={!formState.isValid || isSubmitting}
                  loading={isSubmitting}
                  disabledColor={tokens.disabled}
                  color={tokens.accent}
                  textColor="#0B0B0D"
                />
              </View>
            )}
          </View>

          {!formState.isValid && (
            <Text
              style={styles.errorAnnouncement}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
            >
              Vui lòng kiểm tra lại các trường đang bị lỗi.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (
  tokens: typeof themeTokens.dark,
  isWeb: boolean,
  width: number,
) => {
  const horizontalPadding = width >= 768 ? 24 : 16;

  return StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: tokens.background,
    },
    scrollContent: {
      paddingHorizontal: horizontalPadding,
      paddingVertical: 16,
      alignItems: isWeb ? "center" : "stretch",
    },
    formContainer: {
      width: "100%",
      maxWidth: isWeb ? 600 : undefined,
    },
    formContent: {
      backgroundColor: tokens.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: tokens.border,
      padding: 16,
      gap: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    buttonWrapper: {
      flex: 1,
    },
    errorAnnouncement: {
      color: tokens.danger,
      fontSize: 12,
    },
  });
};

export default FormComponent;
