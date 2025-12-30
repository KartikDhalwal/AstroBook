import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import axios from "axios";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AstroTextRenderer from "./auth/components/AstroTextRenderer";
import api from "../apiConfig";

const TermsConditionsScreen = () => {
  const [termsHTML, setTermsHTML] = useState("");
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const fetchTerms = async () => {
    try {
      const response = await axios.post(
        `${api}/admin/get-terms-condition`,
        { type: "Customer" },
        { headers: { "Content-Type": "application/json" } }
      );

      setTermsHTML(
        response?.data?.termsAndCondition?.description || ""
      );
    } catch (err) {
      console.log("Terms fetch error:", err);
      setTermsHTML("<p>Failed to load terms & conditions.</p>");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FDF7EE"
        translucent={false}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#db9a4a"
            style={{ marginTop: 40 }}
          />
        ) : (
          <AstroTextRenderer html={termsHTML} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsConditionsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF7EE",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
