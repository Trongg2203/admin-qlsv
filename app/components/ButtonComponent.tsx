import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, View } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  color?: string;
  textColor?: string;
  iconColor?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
};

export default function ButtonComponent({
  title,
  onPress,
  style,
  icon: IconComponent,
  iconPosition = "left",
  disabled = false,
  color,
  textColor,
  iconColor,
  variant = "primary",
}: Props) {
  // Màu sắc theo variant
  const getVariantColors = () => {
    switch (variant) {
      case "primary":
        return {
          bg: color || "#6B4EFF",
          text: textColor || "#fff",
          icon: iconColor || "#fff",
        };
      case "secondary":
        return {
          bg: color || "#6c757d",
          text: textColor || "#fff",
          icon: iconColor || "#fff",
        };
      case "outline":
        return {
          bg: "transparent",
          text: textColor || color || "#6B4EFF",
          icon: iconColor || color || "#6B4EFF",
        };
      case "ghost":
        return {
          bg: "transparent",
          text: textColor || color || "#6B4EFF",
          icon: iconColor || color || "#6B4EFF",
        };
      case "danger":
        return {
          bg: color || "#dc3545",
          text: textColor || "#fff",
          icon: iconColor || "#fff",
        };
      default:
        return {
          bg: color || "#6B4EFF",
          text: textColor || "#fff",
          icon: iconColor || "#fff",
        };
    }
  };

  const { bg, text, icon: iconColorFinal } = getVariantColors();

  // Style cho từng variant
  const getButtonStyle = () => {
    let buttonStyle: any = {
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    };

    if (variant === "outline") {
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: text,
      };
    } else if (variant === "ghost") {
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: bg,
      };
    } else {
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: disabled ? "#ccc" : bg,
      };
    }

    return buttonStyle;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        getButtonStyle(),
        pressed && styles.buttonPressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.content}>
        {IconComponent && iconPosition === "left" && (
          <View style={styles.iconLeft}>
            <IconComponent size={18} color={iconColorFinal} />
          </View>
        )}
        <Text style={[styles.text, { color: text }]}>{title}</Text>
        {IconComponent && iconPosition === "right" && (
          <View style={styles.iconRight}>
            <IconComponent size={18} color={iconColorFinal} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonPressed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
