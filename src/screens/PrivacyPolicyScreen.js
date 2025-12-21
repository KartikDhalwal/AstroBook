import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import AstroTextRenderer from "./auth/components/AstroTextRenderer";
import api from '../apiConfig';

// Custom HTML stripper
const stripHTML = (html) => {
  if (!html) return "No data available.";

  return html
    .replace(/<\/h2>/gi, "\n\n")
    .replace(/<\/h3>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<ul>/gi, "")
    .replace(/<\/ul>/gi, "")
    .replace(/<ol>/gi, "")
    .replace(/<\/ol>/gi, "")
    .replace(/<li>/gi, "• ")
    .replace(/<strong>/gi, "")
    .replace(/<\/strong>/gi, "")
    .replace(/<[^>]+>/g, "")       // Remove all tags
    .replace(/&nbsp;/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
};

const PrivacyPolicyScreen = () => {
  const [policy, setPolicy] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPolicy = async () => {
    try {
      const response = await axios.get(
        `${api}/admin/get-privacy-policy`
      );

      const html = response.data?.privacyPolicy?.description || "";
      setPolicy(stripHTML(html));
    } catch (err) {
      console.log("Error fetching privacy policy:", err);
      setPolicy("Failed to load privacy policy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#db9a4a"
            style={{ marginTop: 40 }}
          />
        ) : (
          <AstroTextRenderer html={policy}/>
          // <View style={styles.textCard}>
          //   <Text style={styles.policyText}>{policy}</Text>
          // </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF7EE",
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 10,
    color: "#1A1A1A",
  },
  textCard: {
    backgroundColor: "#FFF8ED",
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  policyText: {
    color: "#333",
    fontSize: 14.5,
    lineHeight: 24,
  },
});
