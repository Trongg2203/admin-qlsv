import { View, StyleSheet, Image, Animated, Easing } from "react-native";
import { useLoadingStore } from "@/store/loadingStore";
import { useEffect, useRef } from "react";

export default function GlobalLoading() {
  const isLoading = useLoadingStore((s) => s.isLoading);
  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      // Vòng quay thứ nhất (xoay nhanh)
      Animated.loop(
        Animated.timing(rotateAnim1, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Vòng quay thứ hai (xoay chậm hơn, ngược chiều)
      Animated.loop(
        Animated.timing(rotateAnim2, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim1.setValue(0);
      rotateAnim2.setValue(0);
    }
  }, [isLoading]);

  const spin1 = rotateAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spin2 = rotateAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  if (!isLoading) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Border xoay ngoài cùng */}
        <Animated.View style={[styles.borderOuter, { transform: [{ rotate: spin1 }] }]}>
          <View style={[styles.borderInner, styles.borderGradient1]} />
        </Animated.View>

        {/* Border xoay giữa */}
        <Animated.View style={[styles.borderMiddle, { transform: [{ rotate: spin2 }] }]}>
          <View style={[styles.borderInner, styles.borderGradient2]} />
        </Animated.View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    zIndex: 9,
  },
  container: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  borderOuter: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#6B4EFF",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  borderMiddle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#9B7EFF",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
  borderInner: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  borderGradient1: {
    borderWidth: 3,
    borderColor: "#6B4EFF",
    borderTopColor: "#fff",
    borderRightColor: "#fff",
  },
  borderGradient2: {
    borderWidth: 2,
    borderColor: "#9B7EFF",
    borderBottomColor: "#fff",
    borderLeftColor: "#fff",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6B4EFF",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
});