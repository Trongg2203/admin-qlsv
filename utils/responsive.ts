import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

// base theo design (iPhone 11)
const baseWidth = 375;
const baseHeight = 812;

/**
 * Scale theo chiều ngang
 */
export const scale = (size: number) => {
  return (width / baseWidth) * size;
};

/**
 * Scale theo chiều dọc
 */
export const verticalScale = (size: number) => {
  return (height / baseHeight) * size;
};

/**
 * Scale vừa phải (khuyên dùng cho UI)
 */
export const moderateScale = (size: number, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

/**
 * Font size (không bị quá to)
 */
export const fontScale = (size: number) => {
  return moderateScale(size, 0.3);
};

/**
 * Border radius
 */
export const radius = (size: number) => {
  return moderateScale(size, 0.4);
};

/**
 * Icon size
 */
export const iconSize = (size: number) => {
  return moderateScale(size, 0.5);
};

/**
 * Spacing (padding / margin)
 */
export const spacing = (size: number) => {
  return moderateScale(size, 0.6);
};

/**
 * Normalize (chuẩn pixel density)
 */
export const normalize = (size: number) => {
  const newSize = scale(size);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
