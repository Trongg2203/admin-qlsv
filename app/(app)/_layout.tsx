import { Tabs, Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { House, User, CalendarCheck2 } from "lucide-react-native";
import {
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/store/userStore";

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom:
            Platform.OS === "ios" ? insets.bottom : insets.bottom + 8,
          paddingTop: 8,
          height:
            Platform.OS === "ios" ? 80 + insets.bottom : 60 + insets.bottom,
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
        if (route.name === "HomeScreen") IconComponent = House;
        else if (route.name === "DailyScreen") IconComponent = CalendarCheck2;
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
              color={isFocused ? "#6B4EFF" : "#9ca3af"}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isFocused ? "#6B4EFF" : "#9ca3af" },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AppLayout() {
  const { isLoggedIn } = useAuthStore();
  const { fetchUserDetail } = useUserStore();

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/LoginScreen" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="DailyScreen"
        options={{
          title: "Daily",
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
});
