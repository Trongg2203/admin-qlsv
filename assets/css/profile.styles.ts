// profile.styles.ts
import { StyleSheet } from "react-native";

export const profileCss = StyleSheet.create({
  // header
  header_profile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10, // Thêm padding thay vì flex
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginTop: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 10,
  },
  // info Profile
  text_info_profile: {
    fontSize: 16,
    paddingTop: 8,
  },
});
