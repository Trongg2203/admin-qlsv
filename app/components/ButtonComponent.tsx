import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, View } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  iconPosition?: "left" | "right";
  disabled?: boolean;
};

export default function ButtonComponent({
  title,
  onPress,
  style,
  icon: IconComponent,
  iconPosition = "left",
  disabled = false,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.content}>
        {IconComponent && iconPosition === "left" && (
          <View style={styles.iconLeft}>
            <IconComponent size={18} color="#fff" />
          </View>
        )}
        <Text style={styles.text}>{title}</Text>
        {IconComponent && iconPosition === "right" && (
          <View style={styles.iconRight}>
            <IconComponent size={18} color="#fff" />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#6B4EFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    opacity: 0.7,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  iconLeft: {
    marginRight: 8, // Khoảng cách giữa icon và text
  },

  iconRight: {
    marginLeft: 8, // Khoảng cách giữa text và icon
  },
});
