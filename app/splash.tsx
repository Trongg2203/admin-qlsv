import { Text, View, StyleSheet, Animated, Dimensions, Easing, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  // Animations cho logo
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;
  
  // Animations cho text
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(50)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(30)).current;
  
  // Animations cho progress bar
  const progressWidth = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;
  const progressShimmer = useRef(new Animated.Value(0)).current;
  
  // Animation cho các particles
  const particles = useRef([...Array(30)].map(() => new Animated.Value(0))).current;
  
  // Animation cho hiệu ứng ripple
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation cho vòng tròn xoay (style như GlobalLoading)
  const ringRotate1 = useRef(new Animated.Value(0)).current;
  const ringRotate2 = useRef(new Animated.Value(0)).current;
  const ringRotate3 = useRef(new Animated.Value(0)).current;
  
  // Animation cho hiệu ứng loading dots
  const dotsAnim = useRef([...Array(3)].map(() => new Animated.Value(0))).current;
  
  // Animation cho hiệu ứng confetti khi kết thúc
  const confettiAnim = useRef([...Array(50)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const startAnimation = async () => {
      // 1. Logo fade in + scale + xoay
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();

      // 2. Bounce cho logo
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }).start();

      // 3. Glow effect cho logo
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoGlow, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(logoGlow, { toValue: 0, duration: 1000, useNativeDriver: false }),
        ])
      ).start();

      // 4. Ripple effect
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(rippleScale, { toValue: 1.5, duration: 1500, useNativeDriver: true }),
            Animated.timing(rippleOpacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(rippleScale, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.timing(rippleOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          ]),
        ]),
        { iterations: -1 }
      ).start();

      // 5. Vòng tròn xoay (style GlobalLoading)
      Animated.loop(
        Animated.timing(ringRotate1, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
      ).start();
      Animated.loop(
        Animated.timing(ringRotate2, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
      ).start();
      Animated.loop(
        Animated.timing(ringRotate3, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true })
      ).start();

      // 6. Text animation
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 800, delay: 300, useNativeDriver: true }),
        Animated.timing(titleTranslate, { toValue: 0, duration: 800, delay: 300, easing: Easing.out(Easing.back(0.5)), useNativeDriver: true }),
        Animated.timing(taglineFade, { toValue: 1, duration: 800, delay: 500, useNativeDriver: true }),
        Animated.timing(taglineTranslate, { toValue: 0, duration: 800, delay: 500, useNativeDriver: true }),
      ]).start();

      // 7. Progress bar animation
      Animated.parallel([
        Animated.timing(progressOpacity, { toValue: 1, duration: 500, delay: 600, useNativeDriver: true }),
        Animated.timing(progressWidth, { toValue: width * 0.7, duration: 2200, delay: 600, easing: Easing.bezier(0.4, 0.0, 0.2, 1), useNativeDriver: false }),
      ]).start();

      // 8. Shimmer effect cho progress bar
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressShimmer, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(progressShimmer, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();

      // 9. Particles animation
      particles.forEach((particle, index) => {
        const delay = index * 80;
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle, { toValue: 1, duration: 2500, delay, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(particle, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
          { iterations: -1 }
        ).start();
      });

      // 10. Loading dots animation
      dotsAnim.forEach((dot, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, { toValue: 1, duration: 400, delay: index * 200, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
          ])
        ).start();
      });
    };

    startAnimation();

    // Chuyển màn hình sau 3.5 giây với hiệu ứng confetti
    const timer = setTimeout(() => {
      // Confetti animation
      confettiAnim.forEach((confetti, index) => {
        Animated.timing(confetti, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });

      // Animation thoát
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.5, duration: 600, useNativeDriver: true }),
        Animated.timing(titleFade, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(progressOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => {
        router.replace("/(auth)/LoginScreen");
      });
    }, 3800);

    return () => clearTimeout(timer);
  }, []);

  // Interpolations
  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const bounce = bounceAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, -15, 0] });
  const rippleScaleInterpolate = rippleScale.interpolate({ inputRange: [0, 1], outputRange: [1, 2] });
  const glowSize = logoGlow.interpolate({ inputRange: [0, 1], outputRange: [0, 25] });
  
  // Ring rotations
  const ringSpin1 = ringRotate1.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const ringSpin2 = ringRotate2.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] });
  const ringSpin3 = ringRotate3.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "720deg"] });
  
  // Shimmer effect
  const shimmerTranslate = progressShimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.7, width * 0.7],
  });

  // Render particles
  const renderParticles = () => {
    return particles.map((particle, index) => {
      const translateX = particle.interpolate({
        inputRange: [0, 1],
        outputRange: [0, (Math.random() - 0.5) * 300],
      });
      const translateY = particle.interpolate({
        inputRange: [0, 1],
        outputRange: [0, (Math.random() - 0.5) * 200 - 100],
      });
      const opacity = particle.interpolate({
        inputRange: [0, 0.3, 0.7, 1],
        outputRange: [0, 1, 1, 0],
      });
      const scale = particle.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1.5, 0],
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [{ translateX }, { translateY }, { scale }],
              opacity,
              backgroundColor: `hsl(${Math.random() * 360}, 80%, 65%)`,
            },
          ]}
        />
      );
    });
  };

  // Render confetti
  const renderConfetti = () => {
    return confettiAnim.map((confetti, index) => {
      const translateX = confetti.interpolate({
        inputRange: [0, 1],
        outputRange: [0, (Math.random() - 0.5) * width * 2],
      });
      const translateY = confetti.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -height - Math.random() * 200],
      });
      const rotate = confetti.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", `${Math.random() * 1080}deg`],
      });
      const opacity = confetti.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1, 0],
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              transform: [{ translateX }, { translateY }, { rotate }],
              backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
              opacity,
            },
          ]}
        />
      );
    });
  };

  // Render loading dots
  const renderDots = () => {
    return dotsAnim.map((dot, index) => {
      const scale = dot.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.5, 1.2, 0.5],
      });
      const opacity = dot.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 1, 0.3],
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        />
      );
    });
  };

  return (
    <LinearGradient 
      colors={["#0f0c29", "#302b63", "#24243e"]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Confetti khi kết thúc */}
      {renderConfetti()}

      {/* Particles */}
      {renderParticles()}

      {/* Main wrapper - center everything */}
      <View style={styles.mainWrapper}>
        {/* Ripple effect */}
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScaleInterpolate }],
              opacity: rippleOpacity,
            },
          ]}
        />

        {/* Vòng tròn xoay (style GlobalLoading) */}
        <View style={styles.ringsContainer}>
          <Animated.View style={[styles.ringOuter, { transform: [{ rotate: ringSpin1 }] }]}>
            <View style={styles.ringGradient1} />
          </Animated.View>
          <Animated.View style={[styles.ringMiddle, { transform: [{ rotate: ringSpin2 }] }]}>
            <View style={styles.ringGradient2} />
          </Animated.View>
          <Animated.View style={[styles.ringInner, { transform: [{ rotate: ringSpin3 }] }]} />
        </View>

        {/* Main content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate },
                { translateY: bounce },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                shadowRadius: glowSize,
                shadowOpacity: logoGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={["#fff", "#e0e0e0"]}
              style={styles.logoCircle}
            >
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </LinearGradient>
          </Animated.View>

          {/* Text content */}
         
        </Animated.View>
      </View>

      {/* Progress Bar */}
      <Animated.View
        style={[
          styles.progressWrapper,
          {
            opacity: progressOpacity,
          },
        ]}
      >
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />
          {/* Shimmer effect */}
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          />
        </View>
        
        {/* Loading dots */}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải</Text>
          <View style={styles.dotsContainer}>
            {renderDots()}
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  ringsContainer: {
    position: "absolute",
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  ringOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: "#6B4EFF",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  ringMiddle: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2.5,
    borderColor: "#9B7EFF",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
  ringInner: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "#6B4EFF",
    borderTopColor: "#fff",
    borderRightColor: "transparent",
  },
  ringGradient1: {
    width: "100%",
    height: "100%",
    borderRadius: 110,
    borderWidth: 3,
    borderColor: "#6B4EFF",
    borderTopColor: "#fff",
    borderRightColor: "#fff",
  },
  ringGradient2: {
    width: "100%",
    height: "100%",
    borderRadius: 90,
    borderWidth: 2.5,
    borderColor: "#9B7EFF",
    borderBottomColor: "#fff",
    borderLeftColor: "#fff",
  },
  logoWrapper: {
    shadowColor: "#6B4EFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    elevation: 8,
    zIndex: 20,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#6B4EFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  appName: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "#6B4EFF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 10,
    letterSpacing: 1,
  },
  progressWrapper: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
    width: "100%",
  },
  progressContainer: {
    width: width * 0.7,
    height: 4,
    backgroundColor: "rgba(107, 78, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 15,
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6B4EFF",
    borderRadius: 2,
  },
  shimmer: {
    position: "absolute",
    width: 60,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.4)",
    transform: [{ skewX: "-20deg" }],
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(107, 78, 255, 0.8)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
  },
  dotsContainer: {
    flexDirection: "row",
    marginLeft: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6B4EFF",
    marginHorizontal: 2,
  },
  ripple: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "rgba(107, 78, 255, 0.6)",
    backgroundColor: "transparent",
    zIndex: 2,
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  confetti: {
    position: "absolute",
    width: 8,
    height: 8,
    top: height / 2,
    left: width / 2,
  },
});