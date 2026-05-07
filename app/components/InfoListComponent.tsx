import { themeTokens, useThemeStore } from "@/store/themeStore";
import { FieldItem } from "@/typings/types/FieldItem";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

type Props = {
  data: FieldItem[];
  loading?: boolean;
  emptyText?: string;
  card?: boolean;
  skeletonCount?: number;
};

const InfoListComponent = ({
  data,
  loading = false,
  emptyText = "Không có dữ liệu",
  card = true,
  skeletonCount = 3,
}: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  useEffect(() => {
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const toggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const handlePress = (item: FieldItem, index: number) => {
    if (item.onPress) {
      item.onPress();
    }

    if (item.expand || item.children) {
      toggle(index);
    }
  };

  const itemValue = (
    value: string | number,
    hasExpand: boolean,
    isActive: boolean,
  ) => {
    if (hasExpand) {
      return (
        <Text style={styles.icon}>
          {isActive ? (
            <ChevronUp size={16} color={tokens.subtext} />
          ) : (
            <ChevronDown size={16} color={tokens.subtext} />
          )}
        </Text>
      );
    }

    return (
      <Text style={[styles.textValue, { color: tokens.subtext }]}>{value}</Text>
    );
  };

  const renderSkeleton = (index: number) => (
    <View key={`skeleton-${index}`} style={styles.row}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonLabel} />
      <View style={styles.skeletonValue} />
    </View>
  );

  if (loading) {
    return (
      <View style={card ? styles.card : undefined}>
        {Array.from({ length: skeletonCount }).map((_, index) =>
          renderSkeleton(index),
        )}
      </View>
    );
  }

  if (!data.length) {
    return (
      <View style={card ? styles.card : undefined}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={card ? styles.card : undefined}>
      {data.map((item, index) => {
        const isActive = activeIndex === index;
        const hasExpand = !!item.expand || !!item.children;
        const hasValue = !!item.value || !!item.render || hasExpand;
        const isDanger = item.variant === "danger";
        const showDivider = index < data.length - 1;

        const Content = (
          <View
            style={[
              styles.row,
              !hasValue && { justifyContent: "flex-start" },
              showDivider && styles.rowDivider,
            ]}
          >
            <View style={styles.labelRow}>
              {item.icon ? (
                <View style={styles.labelIcon}>{item.icon}</View>
              ) : null}
              <Text
                style={[
                  isDanger ? styles.dangerText : styles.label,
                  !hasValue && { width: "100%" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.label}
              </Text>
            </View>

            <View style={styles.value}>
              {item.render
                ? item.render()
                : itemValue(item.value, hasExpand, isActive)}
            </View>
          </View>
        );

        return (
          <View key={index}>
            {hasExpand || item.onPress ? (
              <Pressable
                onPress={() => handlePress(item, index)}
                android_ripple={{ color: tokens.accentSoft }}
                style={({ pressed }) => [
                  styles.pressable,
                  pressed && styles.pressed,
                ]}
              >
                {Content}
              </Pressable>
            ) : (
              Content
            )}

            {isActive && hasExpand && (
              <View style={styles.expand}>
                {item.children ? (
                  <InfoListComponent
                    data={item.children}
                    card={false}
                    emptyText={emptyText}
                  />
                ) : (
                  item.expand?.()
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default InfoListComponent;

const createStyles = (tokens: typeof themeTokens.dark) =>
  StyleSheet.create({
    card: {
      backgroundColor: tokens.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: tokens.border,
      paddingVertical: 4,
      marginVertical: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: tokens.border,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
      marginRight: 12,
    },
    labelIcon: {
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: tokens.text,
      letterSpacing: 0.3,
    },
    dangerText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: "#E11D48",
      letterSpacing: 0.3,
    },
    value: {
      flexShrink: 1,
      alignItems: "flex-end",
    },
    textValue: {
      fontSize: 14,
      fontWeight: "500",
      color: tokens.subtext,
      textAlign: "right",
    },
    pressable: {
      borderRadius: 10,
      overflow: "hidden",
    },
    pressed: {
      opacity: 0.7,
    },

    expand: {
      padding: 12,
      backgroundColor: tokens.card,
      borderRadius: 10,
      marginHorizontal: 16,
      marginBottom: 10,
    },
    icon: {
      marginLeft: 6,
      fontSize: 12,
      color: tokens.subtext,
    },
    emptyText: {
      paddingVertical: 20,
      paddingHorizontal: 16,
      fontSize: 14,
      color: tokens.subtext,
      textAlign: "center",
    },
    skeletonIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: tokens.border,
      marginRight: 8,
    },
    skeletonLabel: {
      height: 12,
      flex: 1,
      borderRadius: 6,
      backgroundColor: tokens.border,
      marginRight: 12,
    },
    skeletonValue: {
      width: 64,
      height: 12,
      borderRadius: 6,
      backgroundColor: tokens.border,
    },
  });
