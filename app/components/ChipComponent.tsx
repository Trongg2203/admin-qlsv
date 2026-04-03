import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

const ChipComponent = ({ label, selected, onPress }: Props) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eee",
    margin: 4,
  },
  chipSelected: {
    backgroundColor: "#007bff",
  },
  text: {
    color: "#333",
  },
  textSelected: {
    color: "#fff",
  },
});

export default ChipComponent;
