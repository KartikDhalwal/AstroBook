import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import axios from "axios";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AstroTextRenderer from "./auth/components/AstroTextRenderer";
import api from "../apiConfig";

const PrivacyPolicyScreen = () => {
  const [policyHTML, setPolicyHTML] = useState("");
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const fetchPolicy = async () => {
    try {
      const response = await axios.get(
        `${api}/admin/get-privacy-policy`
      );

      setPolicyHTML(
        response?.data?.privacyPolicy?.description || ""
      );
    } catch (err) {
      console.log("Privacy policy fetch error:", err);
      setPolicyHTML("<p>Failed to load privacy policy.</p>");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FDF7EE"
        translucent={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#db9a4a"
            style={{ marginTop: 40 }}
          />
        ) : (
          <AstroTextRenderer html={policyHTML} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

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
