import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import LinkComponent from "../components/LinkComponent";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogInIcon,
  Mail,
  SendIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import ButtonComponent from "../components/ButtonComponent";
import { POSITION_TOAST } from "@/typings/types/PostionToast";
import ToastManager from "toastify-react-native/components/ToastManager";

function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(true);
  const [password, setPassword] = React.useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(true);

  // The Laravel backend exposes no password-reset endpoint, so there is
  // nothing to call here. Be honest with the user instead of failing silently.
  function handleForgotPassword() {
    ToastManager.show({
      type: "info",
      text1: "Tính năng đặt lại mật khẩu chưa được hỗ trợ",
      text2: "Vui lòng liên hệ quản trị viên để được hỗ trợ.",
      position: POSITION_TOAST.TOP,
    });
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

              <Text style={styles.title}>Quên mật khẩu</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
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
                <Text style={styles.label}>Mật cũ</Text>

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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu mới</Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.icon}>
                    <LockKeyhole size={16} color="#6b7280" />
                  </View>

                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={showNewPassword}
                  />

                  {/* icon phải */}
                  <Pressable
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} color="#6b7280" />
                    ) : (
                      <Eye size={18} color="#6b7280" />
                    )}
                  </Pressable>
                </View>
              </View>

              <View style={styles.forgotWrapper}>
                <LinkComponent href="/(auth)/LoginScreen" text="Đăng nhập" />
              </View>

              <ButtonComponent
                title="Xác nhận"
                icon={SendIcon}
                onPress={handleForgotPassword}
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
});

export default ForgotPassword;
