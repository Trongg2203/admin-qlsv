import { FieldItem } from "@/typings/types/FieldItem";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  data: FieldItem[];
};

const InfoListComponent = ({ data }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const handlePress = (item: FieldItem, index: number) => {
    // nếu có onPress riêng
    if (item.onPress) {
      item.onPress();
    }

    // nếu có expand thì vẫn toggle
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
            <ChevronUp size={16} color="#888" />
          ) : (
            <ChevronDown size={16} color="#888" />
          )}
        </Text>
      );
    }

    return <Text style={styles.textValue}>{value}</Text>;
  };

  return (
    <View>
      {data.map((item, index) => {
        const isActive = activeIndex === index;
        const hasExpand = !!item.expand || !!item.children;
        const hasValue = !!item.value || !!item.render || hasExpand;

        const Content = (
          <View
            style={[styles.row, !hasValue && { justifyContent: "flex-start" }]}
          >
            <Text style={[styles.label, !hasValue && { width: "100%" }]}>
              {item.label}
            </Text>

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
              <TouchableOpacity onPress={() => handlePress(item, index)}>
                {Content}
              </TouchableOpacity>
            ) : (
              Content
            )}

            {/* EXPAND */}
            {isActive && hasExpand && (
              <View style={styles.expand}>
                {/* nếu có children thì render tiếp */}
                {item.children ? (
                  <InfoListComponent data={item.children} />
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  label: {
    width: 110,
    fontWeight: "600",
  },
  value: {
    flex: 1,
    alignItems: "flex-end",
  },
  textValue: {
    color: "#555",
  },

  // expan
  expand: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 10,
  },
  icon: {
    marginLeft: 6,
    fontSize: 12,
    color: "#888",
  },
});
