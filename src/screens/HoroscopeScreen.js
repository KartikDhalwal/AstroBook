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

/* -------------------- RESPONSIVE HELPERS -------------------- */
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size) => (SCREEN_WIDTH / 375) * size;

const HoroscopeScreen = () => {
  const navigation = useNavigation();

  const getImageSource = (img) => {
    if (typeof img === "string") return { uri: img };
    return img;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scale(30) }}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>
              Discover Your Daily Horoscope
            </Text>
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

        {/* GRID */}
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
              activeOpacity={0.85}
            >
              <View style={styles.zodiacBackground}>
                <Image
                  source={getImageSource(item.image)}
                  style={styles.zodiacIcon}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.zodiacName}>{item.title}</Text>
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
              <Icon name="crystal-ball" size={scale(26)} color="#fff" />
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
            onPress={() =>
              navigation.navigate("AstrolgersList", { mode: "video" })
            }
            style={styles.promoButtonLarge}
            activeOpacity={0.85}
          >
            <Text style={styles.promoButtonTextLarge}>
              Consult Now
            </Text>
            <Icon
              name="arrow-right"
              size={scale(18)}
              color="#7F1D1D"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HoroscopeScreen;

/* ------------------------ STYLES ------------------------ */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F4EF",
  },

  /* Hero */
  heroBanner: {
    marginHorizontal: scale(16),
    marginTop: scale(20),
    height: scale(160),
    borderRadius: scale(20),
    backgroundColor: "#7F1D1D",
    overflow: "hidden",
  },

  heroOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(24),
  },

  heroTitle: {
    fontSize: scale(22),
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: scale(8),
  },

  heroSubtitle: {
    fontSize: scale(14),
    color: "#FFF5E6",
    textAlign: "center",
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    marginTop: scale(32),
    marginBottom: scale(24),
  },

  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8DCC8",
  },

  sectionTitle: {
    fontSize: scale(15),
    fontWeight: "600",
    color: "#2C1810",
    marginHorizontal: scale(12),
  },

  /* Grid */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
  },

  zodiacCard: {
    width: "48%", // ✅ always 2 per row
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: scale(14),
    paddingHorizontal: scale(12),
    borderRadius: scale(16),
    marginBottom: scale(14),
    borderWidth: 1,
    borderColor: "#E8DCC8",
  },

  zodiacBackground: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    backgroundColor: "#FFF5E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(10),
  },

  zodiacIcon: {
    width: scale(38),
    height: scale(38),
  },

  zodiacName: {
    flex: 1,
    fontSize: scale(12),
    fontWeight: "600",
    color: "#2C1810",
  },

  /* Promo */
  promoBanner: {
    marginHorizontal: scale(16),
    marginTop: scale(32),
    backgroundColor: "#7F1D1D",
    borderRadius: scale(20),
    padding: scale(20),
    overflow: "hidden",
  },

  promoPattern: {
    ...StyleSheet.absoluteFillObject,
  },

  promoCircle1: {
    position: "absolute",
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -scale(40),
    right: -scale(20),
  },

  promoCircle2: {
    position: "absolute",
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -scale(20),
    left: scale(20),
  },

  promoLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(20),
  },

  promoIconContainer: {
    width: scale(54),
    height: scale(54),
    borderRadius: scale(27),
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(16),
  },

  promoTextContainer: {
    flex: 1,
  },

  promoTitle: {
    fontSize: scale(17),
    fontWeight: "700",
    color: "#fff",
    marginBottom: scale(4),
  },

  promoDescription: {
    fontSize: scale(13),
    color: "#FFF5E6",
  },

  promoButtonLarge: {
    backgroundColor: "#fff",
    paddingVertical: scale(14),
    paddingHorizontal: scale(24),
    borderRadius: scale(25),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  promoButtonTextLarge: {
    fontSize: scale(16),
    fontWeight: "700",
    color: "#7F1D1D",
    marginRight: scale(8),
  },
});
