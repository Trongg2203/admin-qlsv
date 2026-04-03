import { Link } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
} from "react-native";

type Props = {
  href: string;
  text: string;
  styleText?: StyleProp<TextStyle>;
};

export default function LinkComponent({ href, text, styleText }: Props) {
  return (
    <Link href={href} asChild>
      <Pressable>
        <Text style={styleText ? styleText : styles.link}>{text}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  link: {
    fontSize: 12,
    color: "#6B4EFF",
    fontWeight: "600",
  },
});
