// ErrorDialog.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useErrorStore } from "@/store/errorStore";

const { width, height } = Dimensions.get("window");

interface ErrorDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttonText?: string;
  onClose: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
  icon?: string;
  duration?: number;
}

export default function ErrorDialog({
  visible,
  title = "Lỗi",
  message,
  buttonText = "Đóng",
  onClose,
  onRetry,
  showRetry = false,
  icon = "❌",
  duration,
}: ErrorDialogProps) {
  const [isVisible, setIsVisible] = React.useState(visible);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const { errorMessage, errorDetails } = useErrorStore();

  const formatMessage = () => {
    //  Ưu tiên message truyền từ ngoài
    if (message) return message;

    //  Không có thì lấy từ store
    if (errorDetails && errorDetails.length > 0) {
      return errorDetails.map((e) => `• ${e.message}`).join("\n");
    }

    return errorMessage || "Có lỗi xảy ra";
  };

  React.useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // Animation hiện dialog
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Tự động đóng nếu có duration
      if (duration) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      closeAnimation();
    }
  }, [visible]);

  const closeAnimation = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  const handleClose = () => {
    closeAnimation();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.dialogContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient colors={["#1a1a2e", "#16213e"]} style={styles.dialog}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{icon}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <ScrollView
              style={styles.messageContainer}
              contentContainerStyle={{ paddingBottom: 4 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.message}>{formatMessage()}</Text>
            </ScrollView>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={handleClose}
              >
                <Text style={styles.closeButtonText}>{buttonText}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContainer: {
    width: width * 0.85,
    maxWidth: 400,
  },
  dialog: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  messageContainer: {
    maxHeight: 150,
    marginBottom: 24,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF3B30",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#FF3B30",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  retryButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
});
