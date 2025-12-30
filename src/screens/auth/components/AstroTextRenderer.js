import React from "react";
import { View, Text, StyleSheet } from "react-native";

const parseAstroHTML = (html = "") => {
  if (!html) return [];

  const cleanText = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleanText.split("\n\n").map(text => {
    const t = text.trim();

    if (t.length < 50 && t === t.toUpperCase()) {
      return { type: "title", text: t };
    }

    if (t.length < 70) {
      return { type: "subtitle", text: t };
    }

    return { type: "body", text: t };
  });
};

const AstroTextRenderer = ({ html }) => {
  const blocks = parseAstroHTML(html);

  return (
    <View>
      {blocks.map((block, index) => (
        <Text
          key={`${block.type}-${index}`}
          style={styles[block.type]}
          allowFontScaling
        >
          {block.text}
        </Text>
      ))}
    </View>
  );
};

export default AstroTextRenderer;

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7F1D1D",
    marginBottom: 10,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 10,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 8,
  },
});
