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

const SCREEN_WIDTH = Dimensions.get("window").width;

const HoroscopeDetailScreen = ({ route, navigation }) => {
    const { zodiacSign, zodiacImage } = route.params;

    const [activeTab, setActiveTab] = useState("daily");
    const [loading, setLoading] = useState(true);
    const [horoscope, setHoroscope] = useState(null);

    const tabs = ["daily", "weekly", "monthly", "yearly"];

    // Convert HTML → clean text
    const stripHTML = (html) => {
        if (!html) return "No data available.";

        return html
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<[^>]+>/g, "") // remove tags
            .replace(/&nbsp;/g, " ")
            .trim();
    };

    // Fetch horoscope
    const loadHoroscope = async () => {
        try {
            setLoading(true);

            const res = await axios.post(
                `https://kundli2.astrosetalk.com/api/horoscope/get_horoscope`,
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

    // Pick correct text content based on tab
    const textContent = stripHTML(horoscope?.[activeTab]);

    // Pick correct tag data
    const tagField = activeTab + "tag"; // dailytag, weeklytag etc
    const chartData = horoscope?.[tagField]
        ? Object.entries(horoscope[tagField]).map(([k, v]) => ({
            label: k,
            value: v,
        }))
        : [];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F4EF" }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                {/* <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="arrow-left" size={26} color="#db9a4a" />
                    </TouchableOpacity>

                    <Text style={styles.title}>{zodiacSign.toUpperCase()}</Text>
                    <View style={{ width: 40 }} />
                </View> */}

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
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab && styles.activeTabText,
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
                        <ActivityIndicator size="large" color="#db9a4a" />
                    ) : (
                        <Animatable.View animation="fadeInUp" duration={400} key={activeTab}>
                            {/* TEXT */}
                            <Text style={styles.horoscopeText}>{textContent}</Text>

                            {/* Chart */}
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
    header: {
        padding: 16,
        backgroundColor: "#FFF",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 3,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: "#FFF5E6",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2C1810",
    },
    zodiacImage: {
        width: 140,
        height: 140,
        alignSelf: "center",
        marginTop: 20,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 25,
        paddingHorizontal: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#db9a4a",
    },
    activeTab: {
        backgroundColor: "#db9a4a",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#db9a4a",
    },
    activeTabText: {
        color: "#FFF",
    },
    contentArea: {
        padding: 20,
        marginTop: 10,
    },
    horoscopeText: {
        fontSize: 15,
        color: "#444",
        lineHeight: 22,
        textAlign: "justify",
        marginBottom: 20,
    },
});
