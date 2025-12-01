// KundliMatchingReportScreen.js
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import api from "../apiConfig";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

/* -------------------------------------------------------------
   LIGHTWEIGHT HTML → TEXT PARSER
-------------------------------------------------------------- */
const htmlToPlainText = (html) => {
  if (!html) return { text: "", blocks: [] };

  let s = String(html)
    .replace(/\u00A0|\u202F/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(h[1-4])[^>]*>(.*?)<\/\1>/gi, (_, __, txt) => `\n${txt.toUpperCase()}\n`)
    .replace(/<p[^>]*>(.*?)<\/p>/gi, (_, txt) => `\n${txt}\n`)
    .replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, (_, __, t) => `**${t}**`)
    .replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, (_, __, t) => `*${t}*`)
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) =>
      inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, li) => `\n• ${li}\n`)
    )
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
      let i = 0;
      return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, li) => {
        i++;
        return `\n${i}. ${li}\n`;
      });
    })
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const blocks = s.split(/\n\s*\n/).map((b) => b.trim());
  return { text: s, blocks };
};

const SimpleBlock = ({ block }) => {
  const lines = block.split("\n");

  return (
    <View style={{ marginBottom: 12 }}>
      {lines.map((line, i) => (
        <Text key={i} style={styles.plainTextLine}>
          {line}
        </Text>
      ))}
    </View>
  );
};

const InfoRow = ({ icon, label, value, iconColor = "#7F1D1D" }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconContainer}>
      <Icon name={icon} size={16} color={iconColor} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2} ellipsizeMode="tail">
        {value ?? "-"}
      </Text>
    </View>
  </View>
);

const AstroDetailRow = ({ label, data }) => (
  <View style={styles.astroDetailRow}>
    <Text style={styles.astroLabel} numberOfLines={1}>
      {label}
    </Text>
    <View style={styles.astroValueContainer}>
      {typeof data === "object" ? (
        <>
          {data.name && (
            <Text style={styles.astroValue} numberOfLines={1}>
              {data.name}
            </Text>
          )}
          {data.startDateTime && (
            <Text style={styles.astroSubValue} numberOfLines={1}>
              {data.startDateTime}
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.astroValue} numberOfLines={1}>
          {data}
        </Text>
      )}
    </View>
  </View>
);

/* -------------------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------------------- */
const KundliMatchingReportScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};

  // STATE HOOKS
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [asthaKootaData, setAsthaKootaData] = useState(null);
  const [astroData, setAstroData] = useState(null);
  const [falitData, setFalitData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // STATIC MEMO HOOK
  const displayableKeys = useMemo(
    () => [
      { key: "ascendant", label: "Ascendant" },
      { key: "sign", label: "Sign" },
      { key: "signLord", label: "Sign Lord" },
      { key: "naksahtra", label: "Nakshatra" },
      { key: "nakshatraLord", label: "Nakshatra Lord" },
      { key: "varna", label: "Varna" },
      { key: "vashya", label: "Vashya" },
      { key: "yoni", label: "Yoni" },
      { key: "gana", label: "Gana" },
      { key: "nadi", label: "Nadi" },
      { key: "tatva", label: "Tatva" },
      { key: "paya", label: "Paya" },
      { key: "yog", label: "Yog" },
      { key: "karan", label: "Karan" },
      { key: "tithi", label: "Tithi" },
    ],
    []
  );

  /* -------------------------------------------------------------
     API CALLS
  -------------------------------------------------------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) {
          setErrorMsg("Missing id");
          setLoading(false);
          return;
        }

        const prof = await axios.post(`${api}/customers/match_data`, {
          customerId: id,
        });
        const profData = prof?.data?.data[0];
        
        if (!profData) throw new Error("Invalid profile response");

        setProfile(profData);

        const parseISO = (iso) => {
          const d = new Date(iso);
          return {
            day: `${d.getUTCDate()}`,
            month: `${d.getUTCMonth() + 1}`,
            year: `${d.getUTCFullYear()}`,
            hour: `${d.getUTCHours()}`,
            minute: `${d.getUTCMinutes()}`,
          };
        };

        const boyDT = parseISO(profData.MaledateOfBirth);
        const girlDT = parseISO(profData.FemaledateOfBirth);

        const payload = {
          boyName: profData.MaleName,
          boyDay: boyDT.day,
          boyMonth: boyDT.month,
          boyYear: boyDT.year,
          boyHour: boyDT.hour,
          boyMin: boyDT.minute,
          boyPlace: profData.MaleplaceOfBirth,
          boyLatitude: '26.4498954',
          boyLongitude: '74.6399163',
          boyTimezone: profData.timeZone,
          boyGender: profData.Malegender,

          girlName: profData.FemaleName,
          girlDay: girlDT.day,
          girlMonth: girlDT.month,
          girlYear: girlDT.year,
          girlHour: girlDT.hour,
          girlMin: girlDT.minute,
          girlPlace: profData.FemaleplaceOfBirth,
          girlLatitude: '26.4498954',
          girlLongitude: '74.6399163',
          girlTimezone: profData.timeZone,
          girlGender: profData.Femalegender,
        };

        const [a1, a2] = await Promise.all([
          axios.post("https://kundli2.astrosetalk.com/api/kundali/get_asthakoota_data", payload),
          axios.post("https://kundli2.astrosetalk.com/api/kundali/get_astro_data", payload),
        ]);

        const a1Data = a1.data?.responseData?.data[0];
        const a2Data = a2.data?.responseData?.data[0];

        if (!a1Data) throw new Error("Invalid AshtaKoota data");
        if (!a2Data) throw new Error("Invalid Astro data");

        setAsthaKootaData(a1Data);
        setAstroData(a2Data);
        setFalitData(a1Data.falit);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  /* -------------------------------------------------------------
     PREPARE UI DATA
  -------------------------------------------------------------- */

  const boyInfo = asthaKootaData
    ? {
        name: asthaKootaData.boyName,
        place: asthaKootaData.boyPlace,
        latitude: asthaKootaData.boyLatitude,
        longitude: asthaKootaData.boyLongitude,
      }
    : null;

  const girlInfo = asthaKootaData
    ? {
        name: asthaKootaData.girlName,
        place: asthaKootaData.girlPlace,
        latitude: asthaKootaData.girlLatitude,
        longitude: asthaKootaData.girlLongitude,
      }
    : null;

  const boyAstro = astroData?.boyAstroData;
  const girlAstro = astroData?.girlAstroData;

  const matchTable = asthaKootaData?.matchData ?? [];
  const manglik = asthaKootaData?.mangalDoshaAnalysis ?? {};
  const falit = falitData ?? {};

  /* -------------------------------------------------------------
     FINAL RETURNS
  -------------------------------------------------------------- */

  if (loading)
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#7F1D1D" />
        </View>
      </SafeAreaView>
    );

  if (!asthaKootaData || !astroData)
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyWrapper}>
          <Icon name="alert-circle-outline" size={60} color="#999" />
          <Text style={styles.emptyText}>{errorMsg || "Failed to load data"}</Text>
        </View>
      </SafeAreaView>
    );

  return (
    <View style={styles.safe}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#2C1810" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kundli Matching</Text>
        <View style={{ width: 24 }} />
      </View> */}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Names Banner */}
          <View style={styles.namesBanner}>
            <View style={styles.nameCard}>
              <View style={[styles.nameIconCircle, { backgroundColor: "#E3F2FD" }]}>
                <Icon name="gender-male" size={28} color="#1976D2" />
              </View>
              <Text style={styles.nameText} numberOfLines={2}>
                {boyInfo?.name}
              </Text>
              <Text style={styles.nameSubtext}>Groom</Text>
            </View>

            <View style={styles.ringContainer}>
              <View style={styles.ringCircle}>
                <Text style={styles.ringEmoji}>💍</Text>
              </View>
            </View>

            <View style={styles.nameCard}>
              <View style={[styles.nameIconCircle, { backgroundColor: "#FCE4EC" }]}>
                <Icon name="gender-female" size={28} color="#C2185B" />
              </View>
              <Text style={styles.nameText} numberOfLines={2}>
                {girlInfo?.name}
              </Text>
              <Text style={styles.nameSubtext}>Bride</Text>
            </View>
          </View>

          {/* Match Score Summary */}
          {matchTable.length > 0 && (
            <View style={styles.scoreCard}>
              <View style={styles.scoreContent}>
                <Text style={styles.scoreLabel}>Match Score</Text>
                <Text style={styles.scoreValue}>
                  {matchTable.find((r) => r.name === "Total")?.obtained || 0}/36
                </Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreContent}>
                <Text style={styles.scoreLabel}>Compatibility</Text>
                <Text style={styles.scorePercentage}>
                  {Math.round(
                    ((matchTable.find((r) => r.name === "Total")?.obtained || 0) / 36) * 100
                  )}%
                </Text>
              </View>
            </View>
          )}

          {/* Basic Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="map-marker" size={20} color="#7F1D1D" />
              <Text style={styles.sectionHeading}>Location Details</Text>
            </View>

            <View style={styles.twoColumnGrid}>
              {/* Male */}
              <View style={styles.detailCard}>
                <View style={[styles.cardBadge, { backgroundColor: "#E3F2FD" }]}>
                  <Icon name="gender-male" size={16} color="#1976D2" />
                  <Text style={[styles.cardBadgeText, { color: "#1976D2" }]}>Groom</Text>
                </View>

                <InfoRow icon="account" label="Name" value={boyInfo.name} iconColor="#1976D2" />
                <InfoRow icon="map-marker" label="Place" value={boyInfo.place} iconColor="#1976D2" />
                <InfoRow icon="latitude" label="Latitude" value={boyInfo.latitude} iconColor="#1976D2" />
                <InfoRow icon="longitude" label="Longitude" value={boyInfo.longitude} iconColor="#1976D2" />
              </View>

              {/* Female */}
              <View style={styles.detailCard}>
                <View style={[styles.cardBadge, { backgroundColor: "#FCE4EC" }]}>
                  <Icon name="gender-female" size={16} color="#C2185B" />
                  <Text style={[styles.cardBadgeText, { color: "#C2185B" }]}>Bride</Text>
                </View>

                <InfoRow icon="account" label="Name" value={girlInfo.name} iconColor="#C2185B" />
                <InfoRow icon="map-marker" label="Place" value={girlInfo.place} iconColor="#C2185B" />
                <InfoRow icon="latitude" label="Latitude" value={girlInfo.latitude} iconColor="#C2185B" />
                <InfoRow icon="longitude" label="Longitude" value={girlInfo.longitude} iconColor="#C2185B" />
              </View>
            </View>
          </View>

          {/* Astro Details - Single Column for Better Readability */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="star-four-points" size={20} color="#7F1D1D" />
              <Text style={styles.sectionHeading}>Astrological Details</Text>
            </View>

            {/* Male Astro */}
            <View style={styles.fullWidthCard}>
              <View style={[styles.cardBadge, { backgroundColor: "#E3F2FD" }]}>
                <Icon name="gender-male" size={16} color="#1976D2" />
                <Text style={[styles.cardBadgeText, { color: "#1976D2" }]}>Groom's Astro Details</Text>
              </View>

              {boyAstro &&
                displayableKeys.map(({ key, label }) => {
                  if (!boyAstro[key]) return null;
                  return <AstroDetailRow key={key} label={label} data={boyAstro[key]} />;
                })}
            </View>

            {/* Female Astro */}
            <View style={styles.fullWidthCard}>
              <View style={[styles.cardBadge, { backgroundColor: "#FCE4EC" }]}>
                <Icon name="gender-female" size={16} color="#C2185B" />
                <Text style={[styles.cardBadgeText, { color: "#C2185B" }]}>Bride's Astro Details</Text>
              </View>

              {girlAstro &&
                displayableKeys.map(({ key, label }) => {
                  if (!girlAstro[key]) return null;
                  return <AstroDetailRow key={key} label={label} data={girlAstro[key]} />;
                })}
            </View>
          </View>

          {/* Manglik Report */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="alert-circle" size={20} color="#7F1D1D" />
              <Text style={styles.sectionHeading}>Manglik Analysis</Text>
            </View>

            <View style={styles.twoColumnGrid}>
              {/* Male */}
              <View style={styles.detailCard}>
                <View style={[styles.cardBadge, { backgroundColor: "#E3F2FD" }]}>
                  <Icon name="gender-male" size={16} color="#1976D2" />
                  <Text style={[styles.cardBadgeText, { color: "#1976D2" }]}>Groom</Text>
                </View>

                <InfoRow
                  icon="information"
                  label="Status"
                  value={manglik?.boy?.mangalDosha?.info}
                  iconColor="#1976D2"
                />
                <InfoRow
                  icon="gauge"
                  label="Intensity"
                  value={manglik?.boy?.mangalDosha?.intensity}
                  iconColor="#1976D2"
                />
                <InfoRow
                  icon="comment-text"
                  label="Reason"
                  value={manglik?.boy?.mangalDosha?.reason}
                  iconColor="#1976D2"
                />
                <InfoRow
                  icon="tag"
                  label="Type"
                  value={manglik?.boy?.mangalDosha?.type}
                  iconColor="#1976D2"
                />
              </View>

              {/* Female */}
              <View style={styles.detailCard}>
                <View style={[styles.cardBadge, { backgroundColor: "#FCE4EC" }]}>
                  <Icon name="gender-female" size={16} color="#C2185B" />
                  <Text style={[styles.cardBadgeText, { color: "#C2185B" }]}>Bride</Text>
                </View>

                <InfoRow
                  icon="information"
                  label="Status"
                  value={manglik?.girl?.mangalDosha?.info}
                  iconColor="#C2185B"
                />
                <InfoRow
                  icon="gauge"
                  label="Intensity"
                  value={manglik?.girl?.mangalDosha?.intensity}
                  iconColor="#C2185B"
                />
                <InfoRow
                  icon="comment-text"
                  label="Reason"
                  value={manglik?.girl?.mangalDosha?.reason}
                  iconColor="#C2185B"
                />
                <InfoRow
                  icon="tag"
                  label="Type"
                  value={manglik?.girl?.mangalDosha?.type}
                  iconColor="#C2185B"
                />
              </View>
            </View>
          </View>

          {/* AshtaKoota Table */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="table" size={20} color="#7F1D1D" />
              <Text style={styles.sectionHeading}>AshtaKoota Analysis</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tableCard}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, { width: 120 }]}>Koota</Text>
                  <Text style={[styles.tableHeaderCell, { width: 80 }]}>Maximum</Text>
                  <Text style={[styles.tableHeaderCell, { width: 80 }]}>Obtained</Text>
                  <Text style={[styles.tableHeaderCell, { width: 100 }]}>Area</Text>
                </View>

                {matchTable.map((row, i) => (
                  <View
                    key={i}
                    style={[styles.tableRow, row.name === "Total" && styles.tableTotalRow]}
                  >
                    <Text
                      style={[styles.tableCell, { width: 120 }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {row.name}
                    </Text>
                    <Text style={[styles.tableCell, { width: 80 }]}>{row.maximum}</Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { width: 80, fontWeight: "700", color: "#7F1D1D" },
                      ]}
                    >
                      {row.obtained}
                    </Text>
                    <Text
                      style={[styles.tableCell, { width: 100 }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {row.area}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Predictions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="book-open-page-variant" size={20} color="#7F1D1D" />
              <Text style={styles.sectionHeading}>Detailed Predictions</Text>
            </View>

            <View style={styles.predictionCard}>
              {Object.keys(falit).map((key) => {
                const { blocks } = htmlToPlainText(falit[key]);

                return (
                  <View key={key} style={styles.predictionSection}>
                    <View style={styles.predictionHeader}>
                      <View style={styles.predictionIconCircle}>
                        <Icon name="star" size={16} color="#7F1D1D" />
                      </View>
                      <Text style={styles.predictionHeading}>
                        {key.replace("Falit", "").replace(/([A-Z])/g, " $1").trim()}
                      </Text>
                    </View>

                    {blocks.map((b, i) => (
                      <SimpleBlock key={i} block={b} />
                    ))}
                  </View>
                );
              })}
            </View>
          </View>

          {/* CTAs */}
          <View style={styles.ctaBox}>
            <View style={styles.ctaIconCircle}>
              <Icon name="account-star" size={32} color="#7F1D1D" />
            </View>
            <Text style={styles.ctaTitle}>Need Expert Guidance?</Text>
            <Text style={styles.ctaText}>
              Connect with our experienced astrologers for personalized insights and detailed analysis
            </Text>

            <View style={styles.ctaButtons}>
              <TouchableOpacity
                style={[styles.ctaBtn, { backgroundColor: "#7F1D1D" }]}
                onPress={() => navigation.navigate('AstrolgersList', { mode: 'video' })}
              >
                <Icon name="video" size={18} color="#fff" />
                <Text style={styles.ctaBtnText}>Talk to Expert</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={[styles.ctaBtn, { backgroundColor: "#C2185B" }]}
                onPress={() => navigation.navigate("Astrologer")}
              >
                <Icon name="message-text" size={18} color="#fff" />
                <Text style={styles.ctaBtnText}>Chat Now</Text>
              </TouchableOpacity> */}
            </View>
          </View>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </View>
  );
};

export default KundliMatchingReportScreen;

/* -------------------------------------------------------------
   STYLES
-------------------------------------------------------------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F4EF",
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 16,
  },

  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyText: {
    fontSize: 16,
    color: "#777",
    marginTop: 16,
    textAlign: "center",
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F4EF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5D5C8",
  },

  backBtn: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C1810",
  },

  namesBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  nameCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  nameIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  nameText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C1810",
    textAlign: "center",
    marginBottom: 4,
  },

  nameSubtext: {
    fontSize: 12,
    fontWeight: "500",
    color: "#777",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  ringContainer: {
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  ringCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF5E6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  ringEmoji: {
    fontSize: 28,
  },

  scoreCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  scoreContent: {
    flex: 1,
    alignItems: "center",
  },

  scoreDivider: {
    width: 1,
    backgroundColor: "#E5D5C8",
    marginHorizontal: 20,
  },

  scoreLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#777",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  scoreValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#7F1D1D",
  },

  scorePercentage: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2E7D32",
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C1810",
    marginLeft: 8,
  },

  twoColumnGrid: {
    flexDirection: "row",
    gap: 12,
  },

  detailCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  fullWidthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  cardBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },

  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8F4EF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C1810",
    flexWrap: "wrap",
  },

  astroDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },

  astroLabel: {
    width: 130,
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    paddingRight: 8,
  },

  astroValueContainer: {
    flex: 1,
    justifyContent: "center",
  },

  astroValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C1810",
    flexWrap: "wrap",
  },

  astroSubValue: {
    fontSize: 11,
    color: "#999",
    marginTop: 3,
    flexWrap: "wrap",
  },

  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#7F1D1D",
  },

  tableHeaderCell: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 13,
    textAlign: "left",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },

  tableCell: {
    color: "#2C1810",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "left",
  },

  tableTotalRow: {
    backgroundColor: "#FFF5E6",
  },

  predictionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  predictionSection: {
    marginBottom: 24,
  },

  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  predictionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF5E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  predictionHeading: {
    flex: 1,
    fontWeight: "700",
    fontSize: 16,
    color: "#7F1D1D",
    textTransform: "capitalize",
  },

  plainTextLine: {
    color: "#555",
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 6,
    textAlign: "justify",
  },

  ctaBox: {
    backgroundColor: "#FFFFFF",
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#7F1D1D",
    borderStyle: "dashed",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  ctaIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF5E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  ctaTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C1810",
    marginBottom: 8,
  },

  ctaText: {
    fontWeight: "500",
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  ctaButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  ctaBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  ctaBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 6,
  },
});