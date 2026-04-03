import { Text, View, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation fade in và scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation cho progress bar
    Animated.timing(progressWidth, {
      toValue: width * 0.7, // Chiều rộng tối đa của progress bar
      duration: 2800, // Hơi ngắn hơn thời gian chờ để chuyển mượt mà
      useNativeDriver: false, // Không dùng native driver vì animate width
    }).start();

    // Animation cho progress text (xoay vòng)
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Chuyển sang màn hình login sau 3 giây
    const timer = setTimeout(() => {
      router.replace("/(auth)/LoginScreen");
    }, 3000);

    // Cleanup timer
    return () => clearTimeout(timer);
  }, []);

  // Interpolate cho hiệu ứng xoay
  const rotate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>🚀</Text>
        </View>
        <Text style={styles.appName}>My App</Text>
        <Text style={styles.tagline}>Khám phá trải nghiệm tuyệt vời</Text>
      </Animated.View>

      {/* Progress Bar Container */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
            },
          ]}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  progressContainer: {
    width: width * 0.7,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 50,
  },
  loadingIcon: {
    color: "white",
    fontSize: 16,
    marginRight: 8,
  },
  loadingText: {
    color: "white",
    fontSize: 14,
  },
  percentText: {
    position: "absolute",
    bottom: 80,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
