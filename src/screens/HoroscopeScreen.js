import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ZodiacImageWithName } from "../utils/static-data";

const SCREEN_WIDTH = Dimensions.get("window").width;

const HoroscopeScreen = () => {
  const navigation = useNavigation();

  const getImageSource = (img) => {
    if (typeof img === "string") return { uri: img };
    return img;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F4EF" }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Discover Your Daily Horoscope</Text>
            <Text style={styles.heroSubtitle}>
              Let the cosmos guide your journey today
            </Text>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>Choose Your Sign</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* MULTI-ROW GRID */}
        <View style={styles.gridContainer}>
          {ZodiacImageWithName?.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.zodiacCard}
              onPress={() =>
                navigation.navigate("HoroscopeDetailScreen", {
                  zodiacSign: item.zodiacSign,
                  zodiacImage: item.image,
                })
              }
              activeOpacity={0.9}
            >
              <View style={styles.zodiacBackground}>
                <Image
                  source={getImageSource(item.image)}
                  style={styles.zodiacIcon}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.zodiacName}>{item.title}</Text>
              {/* <Icon name="chevron-right" size={18} color="#db9a4a" /> */}
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoPattern}>
            <View style={styles.promoCircle1} />
            <View style={styles.promoCircle2} />
          </View>

          <View style={styles.promoLeft}>
            <View style={styles.promoIconContainer}>
              <Icon name="crystal-ball" size={28} color="#fff" />
            </View>

            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTitle}>
                Ready to Know Your Future?
              </Text>
              <Text style={styles.promoDescription}>
                Connect with expert astrologers now
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("AstrolgersList", { mode: "video" })}
            style={styles.promoButtonLarge}
          >
            <Text style={styles.promoButtonTextLarge}>Consult Now</Text>
            <Icon name="arrow-right" size={18} color="#7F1D1D" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

export default HoroscopeScreen;


/* ------------------------ STYLES ------------------------ */

const styles = StyleSheet.create({
  heroBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    height: 160,
    borderRadius: 20,
    backgroundColor: "#7F1D1D",
    overflow: "hidden",
  },

  heroOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },

  heroSubtitle: {
    fontSize: 15,
    color: "#FFF5E6",
    textAlign: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 32,
    marginBottom: 24,
  },

  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8DCC8",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C1810",
    marginHorizontal: 12,
  },

  /* === GRID SYSTEM === */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  zodiacCard: {
    width: "48%",        // 👈 2 cards per row
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8DCC8",
  },

  zodiacBackground: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#FFF5E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  zodiacIcon: {
    width: 40,
    height: 40,
  },

  zodiacName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#2C1810",
  },

  /* Promo Section */
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 32,
    backgroundColor: "#7F1D1D",
    borderRadius: 20,
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },

  promoPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  promoCircle1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    top: -40,
    right: -20,
  },

  promoCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: -20,
    left: 20,
  },

  promoLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  promoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  promoTextContainer: {
    flex: 1,
  },

  promoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },

  promoDescription: {
    fontSize: 13,
    color: "#FFF5E6",
  },

  promoButtonLarge: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  promoButtonTextLarge: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7F1D1D",
    marginRight: 8,
  },
});
