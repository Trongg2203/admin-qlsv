import { useAuthStore } from "@/store/authStore";
import { themeTokens, useThemeStore } from "@/store/themeStore";
import { tabBarScrollY } from "@/utils/tabBarScroll";
import { Redirect, Tabs } from "expo-router";
import { CalendarCheck2, House, User } from "lucide-react-native";
import { Animated, Platform, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebSidebarNavigation from "../components/navigation/WebSidebarNavigation";

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = createStyles(tokens);
  const tabBarScale = tabBarScrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.7],
    extrapolate: "clamp",
  });
  const tabBarTranslateY = tabBarScrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 8],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom:
            Platform.OS === "ios"
              ? Math.max(insets.bottom + 2, 10)
              : Math.max(insets.bottom + 4, 8),
          paddingTop: 8,
          transform: [{ scale: tabBarScale }, { translateY: tabBarTranslateY }],
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let IconComponent;
        if (route.name === "DailyScreen") IconComponent = CalendarCheck2;
        else if (route.name === "ProfileScreen") IconComponent = User;
        else IconComponent = House;

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <IconComponent
              size={24}
              color={isFocused ? tokens.accent : tokens.subtext}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isFocused ? tokens.accent : tokens.subtext },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

export default function AppLayout() {
  const { isLoggedIn } = useAuthStore();
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const isWeb = Platform.OS === "web";

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/LoginScreen" />;
  }

  return (
    <Tabs
      tabBar={(props) =>
        isWeb ? (
          <WebSidebarNavigation {...props} />
        ) : (
          <CustomTabBar {...props} />
        )
      }
      screenOptions={{
        headerShown: true,
        tabBarPosition: isWeb ? "left" : "bottom",
        headerStyle: {
          backgroundColor: tokens.nav, // theo màu nav của theme
        },
        headerTitleStyle: {
          color: tokens.text, // theo màu text của theme
        },
        headerTintColor: tokens.accent, // màu cho nút back
      }}
    >
      <Tabs.Screen
        name="DailyScreen"
        options={{
          title: "Kế hoạch",
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Hồ sơ",
        }}
      />
    </Tabs>
  );
}

const createStyles = (tokens: typeof themeTokens.dark) =>
  ({
    tabBarContainer: {
      flexDirection: "row",
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 12,
      backgroundColor: tokens.nav,
      borderWidth: 1,
      borderColor: tokens.border,
      borderRadius: 22,
      elevation: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: "500",
      marginTop: 2,
    },
  }) as const;
