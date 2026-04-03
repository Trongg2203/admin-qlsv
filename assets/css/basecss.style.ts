import { StyleSheet } from "react-native";

export const baseCss = StyleSheet.create({
  base_padding: {
    padding: 5,
    paddingHorizontal: 12,
  },

  // kiểu phần row có 1 lef 1 value
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  label: {
    width: 100,
    fontWeight: "600",
  },
  value: {
    flex: 1,
    alignItems: "flex-end",
  },
});
