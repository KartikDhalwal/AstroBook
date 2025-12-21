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


// Custom HTML stripper (enhanced for headings/lists)
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
    .replace(/<[^>]+>/g, "") // remove all tags
    .replace(/&nbsp;/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
};

const TermsConditionsScreen = () => {
  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTerms = async () => {
    try {
      const response = await axios.post(
        `${api}/admin/get-terms-condition`,
        { type: "Customer" },
        { headers: { "Content-Type": "application/json" } }
      );

      const html = response.data?.termsAndCondition?.description || "";
      setTerms(stripHTML(html));
    } catch (error) {
      console.log("Error fetching terms:", error);
      setTerms("Failed to load terms & conditions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#db9a4a"
            style={{ marginTop: 2 }}
          />
        ) : (
            <AstroTextRenderer html={terms}/>
        )}

        <View style={{ height: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsConditionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF7EE",
    paddingHorizontal: 16,
    paddingTop: -4,
  },
  header: {
    backgroundColor: "#FDF7EE",
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
    padding: 4,
    borderRadius: 12,
    elevation: 1,
  },
  text: {
    fontSize: 14.5,
    color: "#333",
    lineHeight: 24,
  },
});
