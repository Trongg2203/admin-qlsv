// components/UI/Divider.tsx
import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";

type DividerVariant = "horizontal" | "vertical";
type DividerStyle = "solid" | "dashed" | "dotted";

interface DividerProps {
  // Variant: horizontal (ngang) hoặc vertical (dọc)
  variant?: DividerVariant;
  // Style đường kẻ
  styleType?: DividerStyle;
  // Chiều dài (width cho horizontal, height cho vertical)
  length?: number | string;
  // Độ dày
  thickness?: number;
  // Màu sắc
  color?: string;
  // Khoảng cách
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  // Style tùy chỉnh
  style?: ViewStyle;
}

export const DividerComponent: React.FC<DividerProps> = ({
  variant = "horizontal",
  styleType = "solid",
  length = "100%",
  thickness = 1,
  color = "#E0E0E0",
  margin = 0,
  marginTop = 1,
  marginBottom = 1,
  marginLeft,
  marginRight,
  style,
}) => {
  const isHorizontal = variant === "horizontal";

  const getDividerStyle = () => {
    const baseStyle: ViewStyle = {
      backgroundColor: styleType === "solid" ? color : "transparent",
      [isHorizontal ? "width" : "height"]: length,
      [isHorizontal ? "height" : "width"]: thickness,
      marginTop: marginTop ?? margin,
      marginBottom: marginBottom ?? margin,
      marginLeft: marginLeft ?? margin,
      marginRight: marginRight ?? margin,
    };

    // Xử lý dashed và dotted
    if (styleType !== "solid") {
      return {
        ...baseStyle,
        borderStyle: styleType,
        borderTopWidth: isHorizontal ? thickness : 0,
        borderLeftWidth: !isHorizontal ? thickness : 0,
        borderColor: color,
      };
    }

    return baseStyle;
  };

  return <View style={[getDividerStyle(), style]} />;
};
