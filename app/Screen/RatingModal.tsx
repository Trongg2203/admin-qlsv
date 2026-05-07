// components/RatingModal.tsx
import { themeTokens, useThemeStore } from "@/store/themeStore";
import { POSITION_TOAST } from "@/typings/types/PostionToast";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ToastManager from "toastify-react-native/components/ToastManager";

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  foodId: string;
  foodName: string;
  foodImage?: string;
  foodImages?: Array<{ id: string; food_id: string; image_url: string; is_primary: number; sort_order: number }>;
  loadingImages?: boolean;
  currentRating?: number;
  currentComment?: string;
  onSubmit: (foodId: string, rating: number, comment: string) => Promise<void>;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  foodId,
  foodName,
  foodImage,
  foodImages = [],
  loadingImages = false,
  currentRating = 0,
  currentComment = "",
  onSubmit,
}) => {
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const [rating, setRating] = useState(currentRating);
  const [comment, setComment] = useState(currentComment);
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Reset form khi modal mở lại với food mới
  useEffect(() => {
    if (visible) {
      setRating(currentRating);
      setComment(currentComment);
    }
  }, [visible, currentRating, currentComment, foodId]);

  const getPrimaryImage = () => {
    const primaryImage = foodImages.find((img) => img.is_primary === 1);
    return primaryImage?.image_url || foodImages[0]?.image_url || foodImage;
  };

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      ToastManager.show({
        type: "warning",
        text1: "Vui lòng chọn số sao đánh giá",
        position: POSITION_TOAST.TOP,
      });
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      await onSubmit(foodId, rating, comment);
      ToastManager.show({
        type: "success",
        text1: "Đánh giá thành công",
        position: POSITION_TOAST.TOP,
      });
      onClose();
    } catch (error) {
      console.error("Rating error:", error);
      ToastManager.show({
        type: "error",
        text1: "Đánh giá thất bại, vui lòng thử lại",
        position: POSITION_TOAST.TOP,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStarIconName = (index: number) => {
    if (hoveredStar >= index) return "star";
    if (rating >= index) return "star";
    return "star-outline";
  };

  const getStarColor = (index: number) => {
    if (hoveredStar >= index) return "#FFD700";
    if (rating >= index) return "#FFD700";
    return tokens.subtext;
  };

  const ratingEmojis = [
    { label: "Tệ", emoji: "😞", color: "#FF4B4B" },
    { label: "Không ngon", emoji: "😕", color: "#FF8C42" },
    { label: "Tạm được", emoji: "😐", color: "#FFD700" },
    { label: "Ngon", emoji: "😋", color: "#8BC34A" },
    { label: "Tuyệt vời", emoji: "🤩", color: "#4CAF50" },
  ];

  const currentRatingEmoji = ratingEmojis[rating - 1] || ratingEmojis[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={[styles.modalContent, { backgroundColor: tokens.surface }]}
          >
            {/* Drag Indicator */}
            <View style={styles.dragIndicator}>
              <View
                style={[styles.dragBar, { backgroundColor: tokens.border }]}
              />
            </View>

            {/* Header */}
            <LinearGradient
              colors={[tokens.accentSoft, "transparent"]}
              style={styles.headerGradient}
            >
              {loadingImages ? (
                <View style={styles.foodImagePlaceholder}>
                  <ActivityIndicator size="small" color={tokens.accent} />
                </View>
              ) : getPrimaryImage() ? (
                <Image
                  source={{ uri: getPrimaryImage() }}
                  style={styles.foodImage}
                />
              ) : (
                <View style={styles.foodIconWrapper}>
                  <Ionicons
                    name="restaurant-outline"
                    size={32}
                    color={tokens.accent}
                  />
                </View>
              )}
              <Text style={[styles.foodName, { color: tokens.text }]}>
                {foodName}
              </Text>
              <Text style={[styles.ratingLabel, { color: tokens.subtext }]}>
                Đánh giá món ăn này
              </Text>
            </LinearGradient>

            {/* Stars Section */}
            <View style={styles.starsContainer}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRatingPress(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    activeOpacity={0.7}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={getStarIconName(star)}
                      size={48}
                      color={getStarColor(star)}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {rating > 0 && (
                <View style={styles.ratingFeedback}>
                  <Text style={styles.ratingEmoji}>
                    {currentRatingEmoji.emoji}
                  </Text>
                  <Text
                    style={[
                      styles.ratingLabelText,
                      { color: currentRatingEmoji.color },
                    ]}
                  >
                    {currentRatingEmoji.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Comment Section */}
            <View style={styles.commentSection}>
              <Text style={[styles.commentLabel, { color: tokens.text }]}>
                Nhận xét (không bắt buộc)
              </Text>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: tokens.card,
                    borderColor: tokens.border,
                    color: tokens.text,
                  },
                ]}
                placeholder="Chia sẻ cảm nhận của bạn về món ăn này..."
                placeholderTextColor={tokens.subtext}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Text style={[styles.commentHint, { color: tokens.subtext }]}>
                {comment.length}/200 ký tự
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: tokens.border }]}
                onPress={onClose}
                disabled={loading}
              >
                <Text
                  style={[styles.cancelButtonText, { color: tokens.subtext }]}
                >
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: tokens.accent },
                  rating === 0 && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading || rating === 0}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={tokens.background} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={tokens.background}
                    />
                    <Text
                      style={[
                        styles.submitButtonText,
                        { color: tokens.background },
                      ]}
                    >
                      Gửi đánh giá
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (tokens: typeof themeTokens.dark) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === "ios" ? 34 : 20,
      maxHeight: "90%",
    },
    dragIndicator: {
      alignItems: "center",
      paddingVertical: 12,
    },
    dragBar: {
      width: 40,
      height: 4,
      borderRadius: 2,
    },
    headerGradient: {
      alignItems: "center",
      paddingVertical: 20,
      marginHorizontal: -20,
      marginTop: -8,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
    },
    foodIconWrapper: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: tokens.accentSoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    foodImage: {
      width: 100,
      height: 100,
      borderRadius: 16,
      marginBottom: 12,
    },
    foodImagePlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: tokens.accentSoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    foodName: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 4,
    },
    ratingLabel: {
      fontSize: 13,
      marginBottom: 8,
    },
    starsContainer: {
      alignItems: "center",
      paddingVertical: 20,
    },
    starsRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    starButton: {
      padding: 4,
    },
    ratingFeedback: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
    },
    ratingEmoji: {
      fontSize: 24,
    },
    ratingLabelText: {
      fontSize: 16,
      fontWeight: "600",
    },
    commentSection: {
      marginTop: 8,
    },
    commentLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
    },
    commentInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      minHeight: 100,
      textAlignVertical: "top",
    },
    commentHint: {
      fontSize: 11,
      marginTop: 6,
      textAlign: "right",
    },
    actionButtons: {
      flexDirection: "row",
      gap: 12,
      marginTop: 20,
      marginBottom: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    submitButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default RatingModal;
