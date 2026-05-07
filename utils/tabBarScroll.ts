import { Animated } from "react-native";

export const tabBarScrollY = new Animated.Value(0);

export const resetTabBarScroll = () => {
  tabBarScrollY.setValue(0);
};
