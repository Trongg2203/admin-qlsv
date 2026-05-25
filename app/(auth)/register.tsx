import authService from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useLoadingStore } from "@/store/loadingStore";
import { themeTokens, useThemeStore } from "@/store/themeStore";
import { RegisterRequest } from "@/typings/interfaces/auth/login";
import { DateFormat } from "@/typings/types/DateType";
import { MasterComponentItem } from "@/typings/types/form.types";
import { summarizeApiError } from "@/utils/apiError";
import { getCurrentDate, minusYear } from "@/utils/dateHelpers";
import { resolveEntryRoute } from "@/utils/sessionFlow";
import { UserPlus } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinkComponent from "../components/LinkComponent";
import FormComponent from "../components/form/FormComponent";
import { router } from "expo-router";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  date_of_birth: string;
  gender: number;
  height: number;
  weight: number;
  activity_level: number;
};

export default function RegisterScreen() {
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const loadingStore = useLoadingStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const initialValues: RegisterFormValues = {
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    date_of_birth: minusYear(getCurrentDate(), 18),
    gender: 0,
    height: 170,
    weight: 65,
    activity_level: 0,
  };

  // Field rules mirror App\Http\Requests\Auth\RegisterRequest.
  const fields: MasterComponentItem[] = [
    {
      type: "InputComponent",
      column: 12,
      model: "name",
      info: { label: "Họ tên", required: true },
    },
    {
      type: "InputComponent",
      column: 12,
      model: "email",
      info: {
        label: "Email",
        required: true,
        validationRules: [{ type: "email", message: "Email không hợp lệ" }],
      },
    },
    {
      type: "PasswordComponent",
      column: 6,
      model: "password",
      info: {
        label: "Mật khẩu",
        required: true,
        validationRules: [
          { type: "minLength", value: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
          { type: "maxLength", value: 50, message: "Mật khẩu tối đa 50 ký tự" },
        ],
      },
    },
    {
      type: "PasswordComponent",
      column: 6,
      model: "confirm_password",
      info: {
        label: "Xác nhận mật khẩu",
        required: true,
        validationRules: [
          {
            type: "same",
            value: "password",
            message: "Mật khẩu xác nhận không khớp",
          },
        ],
      },
    },
    {
      type: "DatePickerComponent",
      column: 12,
      model: "date_of_birth",
      info: {
        label: "Ngày sinh (tối thiểu 10 tuổi)",
        required: true,
        mode: "date",
        format: DateFormat.DATE,
      },
    },
    {
      type: "CheckBoxComponent",
      column: 12,
      model: "gender",
      info: {
        label: "Giới tính",
        required: true,
        direction: "row",
        returnType: "single",
        options: [
          { label: "Nam", value: 0 },
          { label: "Nữ", value: 1 },
        ],
      },
    },
    {
      type: "InputDecimalComponent",
      column: 6,
      model: "height",
      info: {
        label: "Chiều cao",
        required: true,
        decimalPlaces: 0,
        suffix: "cm",
        min: 100,
        max: 250,
        validationRules: [
          { type: "min", value: 100, message: "Chiều cao tối thiểu 100 cm" },
          { type: "max", value: 250, message: "Chiều cao tối đa 250 cm" },
        ],
      },
    },
    {
      type: "InputDecimalComponent",
      column: 6,
      model: "weight",
      info: {
        label: "Cân nặng",
        required: true,
        decimalPlaces: 2,
        suffix: "kg",
        min: 30,
        max: 300,
        validationRules: [
          { type: "min", value: 30, message: "Cân nặng tối thiểu 30 kg" },
          { type: "max", value: 300, message: "Cân nặng tối đa 300 kg" },
        ],
      },
    },
    {
      type: "CheckBoxComponent",
      column: 12,
      model: "activity_level",
      info: {
        label: "Mức độ vận động",
        required: true,
        direction: "row",
        returnType: "single",
        options: [
          { label: "Ít vận động", value: 0 },
          { label: "Nhẹ nhàng", value: 1 },
          { label: "Vừa phải", value: 2 },
          { label: "Năng động", value: 3 },
          { label: "Cực kỳ năng động", value: 4 },
        ],
      },
    },
  ];

  const handleSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    loadingStore.setLoading(true);

    const payload: RegisterRequest = {
      name: values.name,
      email: values.email,
      password: values.password,
      date_of_birth: values.date_of_birth,
      gender: Number(values.gender),
      height: Number(values.height),
      weight: Number(values.weight),
      activity_level: Number(values.activity_level),
    };

    try {
      const res = await authService.register(payload);

      if (res?.code === 200 || res?.code === 201) {
        // Account + profile created. Log in automatically and continue
        // onboarding (resolver will route to goal setup next).
        const ok = await useAuthStore
          .getState()
          .login(values.email, values.password);
        if (ok) {
          router.replace(await resolveEntryRoute());
        } else {
          router.replace("/(auth)/LoginScreen");
        }
        return;
      }

      // 422 (email unique, age, etc.) or other server error.
      setServerError(summarizeApiError(res));
    } catch (error) {
      console.log("register error", error);
      setServerError("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      loadingStore.setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <UserPlus size={28} color="#f8f8f8" />
            </View>
            <Text style={[styles.title, { color: tokens.text }]}>
              Tạo tài khoản
            </Text>
            <Text style={[styles.subtitle, { color: tokens.subtext }]}>
              Nhập thông tin cơ thể để cá nhân hoá thực đơn
            </Text>
          </View>

          {serverError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{serverError}</Text>
            </View>
          )}

          <FormComponent
            fields={fields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
          />

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: tokens.subtext }]}>
              Đã có tài khoản?
            </Text>
            <LinkComponent
              href="/(auth)/LoginScreen"
              text="Đăng nhập"
              styleText={styles.linkBold}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (tokens: typeof themeTokens.dark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.background },
    scrollContent: { flexGrow: 1, paddingVertical: 32 },
    header: { alignItems: "center", marginBottom: 8, paddingHorizontal: 24 },
    logo: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: "#6B4EFF",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    title: { fontSize: 26, fontWeight: "700" },
    subtitle: { fontSize: 13, marginTop: 6, textAlign: "center" },
    errorBox: {
      backgroundColor: "#fee2e2",
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 24,
      marginTop: 12,
    },
    errorText: { color: "#dc2626", fontSize: 13 },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      marginTop: 8,
      marginBottom: 24,
    },
    footerText: { fontSize: 12 },
    linkBold: { fontSize: 12, color: "#6B4EFF", fontWeight: "600" },
  });
