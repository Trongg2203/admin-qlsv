import { useAuthStore } from "@/store/authStore";
import { useLoadingStore } from "@/store/loadingStore";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";
import { Eye, EyeOff, LockKeyhole, LogInIcon, Mail } from "lucide-react-native";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ButtonComponent from "../components/ButtonComponent";
import LinkComponent from "../components/LinkComponent";
import { useErrorStore } from "@/store/errorStore";
import { resolveEntryRoute } from "@/utils/sessionFlow";

export default function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(true);
  const [password, setPassword] = React.useState("");

  // store
  const loading = useLoadingStore();
  const authStore = useAuthStore();
  const router = useRouter();
  const userForgotResponse = useUserStore((state) => state.userForgotResponse);
  const clearForgotResponse = useUserStore(
    (state) => state.clearForgotResponse,
  );
  const errorStore = useErrorStore();

  React.useEffect(() => {
    if (userForgotResponse) {
      setEmail(userForgotResponse.email);
      setPassword(userForgotResponse.password);
      setShowPassword(false);
      // clearForgotResponse();
    }
  }, [userForgotResponse, clearForgotResponse]);

  async function onLogin() {
    try {
      loading.setLoading(true);

      const isSuccess = await authStore.login(email, password);

      if (!isSuccess) return; //  không chuyển trang

      clearForgotResponse();
      // Route based on onboarding state (profile -> goal -> meal plan)
      router.replace(await resolveEntryRoute());
    } finally {
      loading.setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.orbTopRight} pointerEvents="none" />
      <View style={styles.orbBottomLeft} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.wrapper}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logo}>
                <LockKeyhole size={28} color="#f8f8f8" />
              </View>

              <Text style={styles.title}>Đăng nhập</Text>
              <Text style={styles.subtitle}>
                Hãy đăng nhập để sử dụng hệ thống
              </Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              {errorStore.errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    {errorStore.errorMessage}
                  </Text>
                </View>
              )}
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.icon}>
                    <Mail size={16} color="#6b7280" />
                  </View>

                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.icon}>
                    <LockKeyhole size={16} color="#6b7280" />
                  </View>

                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={showPassword}
                  />

                  {/* icon phải */}
                  <Pressable
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#6b7280" />
                    ) : (
                      <Eye size={18} color="#6b7280" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Forgot password */}
              <View style={styles.forgotWrapper}>
                <LinkComponent
                  href="/(auth)/ForgotPassword"
                  text="Quên mật khẩu"
                />
              </View>

              <ButtonComponent
                title="Đăng nhập"
                icon={LogInIcon}
                onPress={onLogin}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Bạn chưa có tài khoản?</Text>

              <LinkComponent
                href="/(auth)/register"
                text="Tạo tài khoản"
                styleText={styles.linkBold}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 48,
  },

  wrapper: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    paddingHorizontal: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 14,
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#6B4EFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 24,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },

  inputWrapper: {
    position: "relative",
  },

  icon: {
    position: "absolute",
    left: 10,
    top: 14,
    zIndex: 1,
  },

  input: {
    borderWidth: 1,
    borderColor: "#7397df",
    borderRadius: 10,
    paddingLeft: 36,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },

  forgotWrapper: {
    alignItems: "flex-end",
    marginBottom: 20,
  },

  link: {
    fontSize: 12,
    color: "#6B4EFF",
  },

  linkBold: {
    fontSize: 12,
    color: "#6B4EFF",
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  footerText: {
    fontSize: 12,
    color: "#6b7280",
  },

  orbTopRight: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -100,
    right: -100,
    backgroundColor: "rgba(107, 78, 255, 0.10)",
  },

  orbBottomLeft: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: -80,
    left: -100,
    backgroundColor: "rgba(107, 78, 255, 0.07)",
  },

  // error

  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  errorText: {
    color: "#dc2626",
    fontSize: 13,
  },
});
