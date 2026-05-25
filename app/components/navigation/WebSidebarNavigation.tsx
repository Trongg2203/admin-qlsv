// components/WebSidebarNavigation.tsx
import { MenuItem, menuItems } from "@/typings/types/menu";
import { useAuthStore } from "@/store/authStore";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Enable LayoutAnimation cho Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const EXPANDED_WIDTH = 284;
const COLLAPSED_WIDTH = 92;

// Component Menu Item với children
function MenuItemComponent({
  item,
  isExpanded,
  level = 0,
  currentRouteName,
  isParentFocused = false,
  onNavigate,
}: {
  item: MenuItem;
  isExpanded: boolean;
  level?: number;
  currentRouteName: string;
  isParentFocused?: boolean;
  onNavigate: (item: MenuItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.name === currentRouteName;
  const hasActiveChild =
    Boolean(item.children?.some((child) => child.name === currentRouteName)) ||
    isParentFocused;

  const toggleSubmenu = () => {
    if (hasChildren) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsOpen(!isOpen);
    } else {
      onNavigate(item);
    }
  };

  return (
    <View style={{ marginLeft: level * (isExpanded ? 12 : 0) }}>
      <Pressable
        onPress={toggleSubmenu}
        style={({ pressed }) => [
          styles.menuItem,
          !isExpanded && styles.menuItemCollapsed,
          (isActive || hasActiveChild) && !hasChildren && styles.menuItemActive,
          pressed && styles.menuItemPressed,
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            (isActive || hasActiveChild) &&
              !hasChildren &&
              styles.iconWrapActive,
          ]}
        >
          <item.icon
            size={18}
            color={
              (isActive || hasActiveChild) && !hasChildren
                ? "#dbeafe"
                : "#94a3b8"
            }
          />
        </View>

        {isExpanded && (
          <>
            <Text
              style={[
                styles.menuLabel,
                (isActive || hasActiveChild) &&
                  !hasChildren &&
                  styles.menuLabelActive,
              ]}
            >
              {item.label}
            </Text>
            {hasChildren && (
              <View style={styles.chevronContainer}>
                {isOpen ? (
                  <ChevronUp size={16} color="#94a3b8" />
                ) : (
                  <ChevronDown size={16} color="#94a3b8" />
                )}
              </View>
            )}
          </>
        )}
      </Pressable>

      {/* Render children */}
      {hasChildren && isOpen && isExpanded && (
        <View style={styles.submenuContainer}>
          {item.children!.map((child: any) => (
            <MenuItemComponent
              key={child.name}
              item={child}
              isExpanded={isExpanded}
              level={level + 1}
              currentRouteName={currentRouteName}
              isParentFocused={hasActiveChild}
              onNavigate={onNavigate}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function WebSidebarNavigation({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isAdmin = useAuthStore(
    (s) => s.is_admin && s.user_type === 1,
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const widthAnim = useRef(new Animated.Value(EXPANDED_WIDTH)).current;
  const currentRouteName = state.routes[state.index]?.name ?? "";
  const visibleMenuItems = isAdmin
    ? menuItems
    : menuItems.filter(
        (item) =>
          !["UserManagement", "ProductManagement", "Management"].includes(
            item.name,
          ),
      );

  const toggleSidebar = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);

    Animated.timing(widthAnim, {
      toValue: nextExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const handleNavigate = (item: MenuItem) => {
    const targetName = item.name;
    const targetRoute = item.route;

    const route = state.routes.find(
      (r) => r.name === targetName || r.name === targetRoute,
    );

    if (route) {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.navigate(route.name);
      }

      return;
    }

    if (targetRoute?.startsWith("/")) {
      router.push(targetRoute as never);
      return;
    }

    if (targetName) {
      navigation.navigate(targetName as never);
    }
  };

  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          width: widthAnim,
          paddingTop: Math.max(14, insets.top),
          paddingBottom: Math.max(14, insets.bottom),
        },
      ]}
    >
      <LinearGradient
        colors={["#0b1220", "#111827", "#0f172a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.sidebarGlow} pointerEvents="none" />

      <View style={styles.headerRow}>
        <LinearGradient
          colors={["#60a5fa", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBadge}
        >
          <Text style={styles.logoText}>A</Text>
        </LinearGradient>

        {isExpanded ? (
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandTitle}>Admin Control</Text>
            <Text style={styles.brandSubTitle}>Web Management</Text>
          </View>
        ) : null}

        <Pressable
          onPress={toggleSidebar}
          style={styles.toggleButton}
          hitSlop={8}
        >
          {isExpanded ? (
            <ChevronLeft size={16} color="#cbd5e1" />
          ) : (
            <ChevronRight size={16} color="#cbd5e1" />
          )}
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.menuList}>
        {visibleMenuItems.map((item: any) => (
          <MenuItemComponent
            key={item.name}
            item={item}
            isExpanded={isExpanded}
            currentRouteName={currentRouteName}
            onNavigate={handleNavigate}
          />
        ))}
      </View>

      <View style={styles.footerWrap}>
        <Text style={styles.footerText}>
          {isExpanded ? "Admin App - Web Portal" : "AW"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    borderRightWidth: 1,
    borderRightColor: "#1f2937",
    paddingHorizontal: 12,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  sidebarGlow: {
    position: "absolute",
    top: -140,
    right: -130,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(37, 99, 235, 0.18)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#eff6ff",
    fontSize: 17,
    fontWeight: "800",
  },
  brandTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  brandTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
  brandSubTitle: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  toggleButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    marginTop: 16,
    marginBottom: 14,
    height: 1,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
  },
  menuList: {
    flex: 1,
    gap: 4,
  },
  menuItem: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  menuItemCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  menuItemActive: {
    backgroundColor: "rgba(37, 99, 235, 0.25)",
    borderColor: "rgba(96, 165, 250, 0.45)",
  },
  menuItemPressed: {
    backgroundColor: "rgba(30, 41, 59, 0.75)",
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.65)",
  },
  iconWrapActive: {
    backgroundColor: "rgba(29, 78, 216, 0.75)",
  },
  menuLabel: {
    marginLeft: 10,
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  menuLabelActive: {
    color: "#f8fafc",
    fontWeight: "600",
  },
  chevronContainer: {
    width: 20,
    alignItems: "center",
  },
  submenuContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  footerWrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.18)",
    alignItems: "center",
  },
  footerText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
  },
});
