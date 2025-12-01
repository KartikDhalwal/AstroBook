import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

const ConsultationDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { astrologer, mode,price } = route.params || {};

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F8F4EF" barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: astrologer?.profileImage
                ? `${astrologer.profileImage}`
                : "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
          />

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{astrologer?.astrologerName}</Text>
            <Text style={styles.tag}>{astrologer?.tagLine}</Text>

            <View style={styles.row}>
              <Icon name="star" size={18} color="#db9a4a" />
              <Text style={styles.rating}>
                {astrologer?.rating || 0} / 5
              </Text>
            </View>

            <Text style={styles.experience}>
              {astrologer?.experience} Years Experience
            </Text>

            <View style={styles.langRow}>
              {astrologer?.language?.map((lng, idx) => (
                <View key={idx} style={styles.langPill}>
                  <Text style={styles.langText}>{lng}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ABOUT CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.cardText}>
            {astrologer?.about || "No description available."}
          </Text>
        </View>

        {/* MODE CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Consultation Mode</Text>

          <View style={styles.modeBox}>
            <Icon
              name={
                mode === "video"
                  ? "video-outline"
                  : mode === "voice"
                  ? "phone"
                  : "chat-outline"
              }
              size={20}
              color="#db9a4a"
            />
            <Text style={styles.modeText}>
              {mode === "video"
                ? "Video Call"
                : mode === "voice"
                ? "Voice Call"
                : "Live Chat"}
            </Text>
          </View>
        </View>

        {/* PRICE CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Consultation Price</Text>

          <Text style={styles.price}>
            ₹ {price}
          </Text>
        </View>

        {/* JOIN BUTTON */}
        {/* <TouchableOpacity style={styles.joinButton}>
          <Icon
            name={
              mode === "video"
                ? "video-outline"
                : mode === "voice"
                ? "phone"
                : "chat-outline"
            }
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.joinText}>
            {mode === "chat"
              ? "Start Chat"
              : mode === "voice"
              ? "Join Voice Call"
              : "Join Video Call"}
          </Text>
        </TouchableOpacity> */}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ConsultationDetailsScreen;

/* ============================================
                STYLES (Compact UI)
==============================================*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4EF",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2C1810",
  },

  /* PROFILE CARD */
  profileCard: {
    backgroundColor: "#fff",
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EEE2D3",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 40,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2C1810",
  },
  tag: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rating: {
    marginLeft: 6,
    color: "#2C1810",
    fontWeight: "600",
    fontSize: 13,
  },
  experience: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
  },

  langRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  langPill: {
    backgroundColor: "#FFF5E6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  langText: {
    fontSize: 12,
    color: "#db9a4a",
    fontWeight: "600",
  },

  /* GENERAL CARD */
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#EEE2D3",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C1810",
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },

  /* MODE */
  modeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5E6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  modeText: {
    marginLeft: 8,
    color: "#db9a4a",
    fontWeight: "600",
    fontSize: 13,
  },

  /* PRICE */
  price: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
    color: "#db9a4a",
  },

  /* JOIN BUTTON */
  joinButton: {
    backgroundColor: "#db9a4a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 12,
    elevation: 2,
  },
  joinText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
