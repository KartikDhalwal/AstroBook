import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Animatable from "react-native-animatable";
import axios from "axios";

import api from "../apiConfig";
import HoroscopeBarChart from "../components/HoroscopeBarChart";

/* -------------------- RESPONSIVE HELPERS -------------------- */
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base width = 375 (standard Android phone)
const scale = (size) => (SCREEN_WIDTH / 375) * size;

const HoroscopeDetailScreen = ({ route, navigation }) => {
    const { zodiacSign, zodiacImage } = route.params;

    const [activeTab, setActiveTab] = useState("daily");
    const [loading, setLoading] = useState(true);
    const [horoscope, setHoroscope] = useState(null);

    const tabs = ["daily", "weekly", "monthly", "yearly"];

    /* -------------------- HTML CLEANER -------------------- */
    const stripHTML = (html) => {
        if (!html) return "No data available.";

        return html
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim();
    };

    /* -------------------- API -------------------- */
    const loadHoroscope = async () => {
        try {
            setLoading(true);
            const res = await axios.post(
                "https://kundli2.astrosetalk.com/api/horoscope/get_horoscope",
                { sign: zodiacSign }
            );

            const extracted =
                res?.data?.responseData?.data?.[0]?.horoscope || null;

            setHoroscope(extracted);
        } catch (err) {
            console.log("Horoscope Error:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadHoroscope();
    }, [zodiacSign]);

    const textContent = stripHTML(horoscope?.[activeTab]);

    const tagField = activeTab + "tag";
    const chartData = horoscope?.[tagField]
        ? Object.entries(horoscope[tagField]).map(([k, v]) => ({
              label: k,
              value: v,
          }))
        : [];

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: scale(20) }}
            >
                {/* Zodiac Image */}
                {zodiacImage && (
                    <Image
                        source={
                            typeof zodiacImage === "string"
                                ? { uri: zodiacImage }
                                : zodiacImage
                        }
                        resizeMode="contain"
                        style={styles.zodiacImage}
                    />
                )}

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && styles.activeTab,
                            ]}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab &&
                                        styles.activeTabText,
                                ]}
                            >
                                {tab.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
                <View style={styles.contentArea}>
                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color="#db9a4a"
                        />
                    ) : (
                        <Animatable.View
                            animation="fadeInUp"
                            duration={400}
                            key={activeTab}
                        >
                            <Text style={styles.horoscopeText}>
                                {textContent}
                            </Text>

                            <HoroscopeBarChart data={chartData} />
                        </Animatable.View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HoroscopeDetailScreen;

/* ------------------------- STYLES ------------------------ */
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#F8F4EF",
    },

    zodiacImage: {
        width: scale(140),
        height: scale(140),
        alignSelf: "center",
        marginTop: scale(20),
    },

    tabContainer: {
        flexDirection: "row",
        flexWrap: "wrap", // ✅ IMPORTANT for small screens
        justifyContent: "center",
        gap: scale(8),
        marginTop: scale(24),
        paddingHorizontal: scale(12),
    },

    tab: {
        paddingVertical: scale(8),
        paddingHorizontal: scale(16),
        borderRadius: scale(20),
        borderWidth: 1,
        borderColor: "#db9a4a",
        marginBottom: scale(6),
    },

    activeTab: {
        backgroundColor: "#db9a4a",
    },

    tabText: {
        fontSize: scale(13),
        fontWeight: "600",
        color: "#db9a4a",
    },

    activeTabText: {
        color: "#FFF",
    },

    contentArea: {
        paddingHorizontal: scale(18),
        paddingTop: scale(10),
    },

    horoscopeText: {
        fontSize: scale(15),
        color: "#444",
        lineHeight: scale(22),
        textAlign: "justify",
        marginBottom: scale(20),
    },
});
