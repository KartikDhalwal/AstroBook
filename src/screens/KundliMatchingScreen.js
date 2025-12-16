import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import PlaceInput from "../components/PlaceInput";
import api from "../apiConfig";
import { api_url } from "../config/Constants1";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const KundliMatchingScreen = () => {
  const navigation = useNavigation();

  // --------------------- MALE INPUTS ------------------------
  const [maleInputField, setMaleInputField] = useState({
    name: "",
    birth_date: new Date(),
    birth_time: new Date(),
    place_of_birth: "",
    latitude: null,
    longitude: null,
  });

  const [showMaleDatePicker, setShowMaleDatePicker] = useState(false);
  const [showMaleTimePicker, setShowMaleTimePicker] = useState(false);

  const handleMaleInputField = (name, value) =>setMaleInputField(prev => ({ ...prev, [name]: value }))

  // ---------------------- FEMALE INPUTS ------------------------
  const [femaleInputField, setFemaleInputField] = useState({
    name: "",
    birth_date: new Date(),
    birth_time: new Date(),
    place_of_birth: "",
    latitude: null,
    longitude: null,
  });

  const [showFemaleDatePicker, setShowFemaleDatePicker] = useState(false);
  const [showFemaleTimePicker, setShowFemaleTimePicker] = useState(false);

  const handleFemaleInputField = (name, value) =>setFemaleInputField(prev => ({ ...prev, [name]: value }))


  // ----------------------- INPUT ERRORS ------------------------
  const [inputFieldError, setInputFieldError] = useState({});
  const handleInputFieldError = (name, value) =>
    setInputFieldError({ ...inputFieldError, [name]: value });

  // Format date and time
  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB");
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ------------------------ VALIDATION -------------------------
  const handleValidation = () => {
    if (!maleInputField.name) {
      handleInputFieldError("boysName", "Please enter boy's name");
      return false;
    }
    if (!maleInputField.place_of_birth) {
      handleInputFieldError(
        "boysPlaceOfBirth",
        "Please select boy's place of birth"
      );
      return false;
    }

    if (!femaleInputField.name) {
      handleInputFieldError("girlsName", "Please enter girl's name");
      return false;
    }
    if (!femaleInputField.place_of_birth) {
      handleInputFieldError(
        "girlsPlaceOfBirth",
        "Please select girl's place of birth"
      );
      return false;
    }

    return true;
  };

  const combineDateAndTime = (dateObj, timeObj) => {
    const d = new Date(dateObj);

    d.setHours(timeObj.getHours());
    d.setMinutes(timeObj.getMinutes());
    d.setSeconds(0);
    d.setMilliseconds(0);

    return d.toISOString();
  };

  const handleGetReport = async () => {
    console.log("Male Place:", maleInputField.place_of_birth);
console.log("Female Place:", femaleInputField.place_of_birth);

    if (!handleValidation()) return;

    const customerData = JSON.parse(await AsyncStorage.getItem("customerData"));

    try {
      const payload = {
        maleKundliData: {
          name: maleInputField.name,
          dob: maleInputField.birth_date.toISOString(),
          tob: combineDateAndTime(
            maleInputField.birth_date,
            maleInputField.birth_time
          ),
          MaleplaceOfBirth: maleInputField.place_of_birth,
          lat: maleInputField.latitude ?? "26.4498954",
          lon: maleInputField.longitude ?? "74.6399163",
        },

        femaleKundliData: {
          name: femaleInputField.name,
          dob: femaleInputField.birth_date.toISOString(),
          tob: combineDateAndTime(
            femaleInputField.birth_date,
            femaleInputField.birth_time
          ),
          FemaleplaceOfBirth: femaleInputField.place_of_birth,
          lat: femaleInputField.latitude,
          lon: femaleInputField.longitude,
        },

        customerId: customerData?._id,
      };

      const response = await axios.post(`${api}/customers/match_save`, payload);
      navigation.navigate("KundliMatchingReportScreen", {
        id: response?.data?.results?.customerId,
      });
    } catch (error) {
      console.log("API Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.bannerDecoration}>
            <Text style={styles.bannerEmoji}>💑</Text>
          </View>
          <Text style={styles.bannerTitle}>Discover Your</Text>
          <Text style={styles.bannerTitleHighlight}>Perfect Match</Text>
          <Text style={styles.bannerSubtitle}>
            Ancient vedic wisdom for modern relationships
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>36</Text>
            <Text style={styles.statLabel}>Gun Points</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12K+</Text>
            <Text style={styles.statLabel}>Matches Done</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.section}>
          <View style={styles.testimonialCard}>
            <View style={styles.quoteIcon}>
              <Icon name="information" size={20} color="#db9a4a" />
            </View>
            <Text style={styles.testimonialText}>
              Kundli Milan ensures compatibility and harmony before marriage.
              Enter both partners' birth details for comprehensive analysis.
            </Text>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Partner Details</Text>
              <Text style={styles.sectionSubtitle}>
                Enter birth information accurately
              </Text>
            </View>
          </View>
        </View>

        {/* Male Form Card */}
        <View style={styles.section}>
          <View style={styles.specialCard}>
            <View style={styles.specialLeft}>
              <Icon name="gender-male" size={24} color="#2196F3" />
            </View>
            <View style={styles.specialMiddle}>
              <Text style={styles.specialTitle}>Male Partner</Text>
              <Text style={styles.specialDescription}>Boy&apos;s birth details</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.formScroll}
          >
            <View style={styles.formCard}>
              {/* Name Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View
                  style={[
                    styles.inputContainer,
                    inputFieldError.boysName && styles.inputError,
                  ]}
                >
                  <Icon
                    name="account"
                    size={18}
                    color="#9C7A56"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Enter boy's name"
                    placeholderTextColor="#AAA"
                    value={maleInputField.name}
                    onChangeText={(t) => handleMaleInputField("name", t)}
                    onFocus={() => handleInputFieldError("boysName", null)}
                    style={styles.textInput}
                  />
                </View>
                {inputFieldError.boysName && (
                  <Text style={styles.errorText}>
                    {inputFieldError.boysName}
                  </Text>
                )}
              </View>

              {/* Birth Date */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Birth Date</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowMaleDatePicker(true)}
                >
                  <Icon
                    name="calendar"
                    size={18}
                    color="#9C7A56"
                    style={styles.inputIcon}
                  />
                  <Text style={styles.dateText}>
                    {formatDate(maleInputField.birth_date)}
                  </Text>
                  <Icon name="chevron-down" size={18} color="#9C7A56" />
                </TouchableOpacity>
              </View>

              {showMaleDatePicker && (
                <DateTimePicker
                  value={maleInputField.birth_date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowMaleDatePicker(false);
                    if (selectedDate) {
                      handleMaleInputField("birth_date", selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}

              {/* Birth Time */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Birth Time</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowMaleTimePicker(true)}
                >
                  <Icon
                    name="clock-outline"
                    size={18}
                    color="#9C7A56"
                    style={styles.inputIcon}
                  />
                  <Text style={styles.dateText}>
                    {formatTime(maleInputField.birth_time)}
                  </Text>
                  <Icon name="chevron-down" size={18} color="#9C7A56" />
                </TouchableOpacity>
              </View>

              {showMaleTimePicker && (
                <DateTimePicker
                  value={maleInputField.birth_time}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowMaleTimePicker(false);
                    if (selectedTime) {
                      handleMaleInputField("birth_time", selectedTime);
                    }
                  }}
                />
              )}

              {/* Place of Birth */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Place of Birth</Text>
                <PlaceInput
                  label="Place of Birth"
                  onSelect={(location) => {
                    handleMaleInputField(
                      "place_of_birth",
                      location.description
                    );
                    handleMaleInputField("latitude", location.latitude);
                    handleMaleInputField("longitude", location.longitude);
                    handleInputFieldError("boysPlaceOfBirth", null);
                  }}
                />
                {inputFieldError.boysPlaceOfBirth && (
                  <Text style={styles.errorText}>
                    {inputFieldError.boysPlaceOfBirth}
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Female Form Card */}
        <View style={styles.section}>
          <View style={styles.specialCard}>
            <View
              style={[styles.specialLeft, { backgroundColor: "#FCE4EC" }]}
            >
              <Icon name="gender-female" size={24} color="#E91E63" />
            </View>
            <View style={styles.specialMiddle}>
              <Text style={styles.specialTitle}>Female Partner</Text>
              <Text style={styles.specialDescription}>
                Girl&apos;s birth details
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.formScroll}
          >
            <View style={styles.formCard}>
              {/* Name Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View
                  style={[
                    styles.inputContainer,
                    inputFieldError.girlsName && styles.inputError,
                  ]}
                >
                  <Icon
                    name="account"
                    size={18}
                    color="#9C7A56"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Enter girl's name"
                    placeholderTextColor="#AAA"
                    value={femaleInputField.name}
                    onChangeText={(t) => handleFemaleInputField("name", t)}
                    onFocus={() => handleInputFieldError("girlsName", null)}
                    style={styles.textInput}
                  />
                </View>
                {inputFieldError.girlsName && (
                  <Text style={styles.errorText}>
                    {inputFieldError.girlsName}
                  </Text>
                )}
              </View>

              {/* Birth Date */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Birth Date</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowFemaleDatePicker(true)}
                >
                  <Icon
                    name="calendar"
                    size={18}
                    color="#9C7A56"
                    style={styles.inputIcon}
                  />
                  <Text style={styles.dateText}>
                    {formatDate(femaleInputField.birth_date)}
                  </Text>
                  <Icon name="chevron-down" size={18} color="#9C7A56" />
                </TouchableOpacity>
              </View>

              {showFemaleDatePicker && (
                <DateTimePicker
                  value={femaleInputField.birth_date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowFemaleDatePicker(false);
                    if (selectedDate) {
                      handleFemaleInputField("birth_date", selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}

              {/* Birth Time */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Birth Time</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowFemaleTimePicker(true)}
                >
                  <Icon
                    name="clock-outline"
                    size={18}
                    color="#9C7A56"
                    style={styles.inputIcon}
                  />
                  <Text style={styles.dateText}>
                    {formatTime(femaleInputField.birth_time)}
                  </Text>
                  <Icon name="chevron-down" size={18} color="#9C7A56" />
                </TouchableOpacity>
              </View>

              {showFemaleTimePicker && (
                <DateTimePicker
                  value={femaleInputField.birth_time}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowFemaleTimePicker(false);
                    if (selectedTime) {
                      handleFemaleInputField("birth_time", selectedTime);
                    }
                  }}
                />
              )}

              {/* Place of Birth */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Place of Birth</Text>
                <PlaceInput
                  label="Place of Birth"
                  onSelect={(location) => {
                    handleFemaleInputField(
                      "place_of_birth",
                      location.description
                    );
                    handleFemaleInputField("latitude", location.latitude);
                    handleFemaleInputField("longitude", location.longitude);
                    handleInputFieldError("girlsPlaceOfBirth", null);
                  }}
                />
                {inputFieldError.girlsPlaceOfBirth && (
                  <Text style={styles.errorText}>
                    {inputFieldError.girlsPlaceOfBirth}
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Submit Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={handleGetReport}
          >
            <Text style={styles.bannerButtonText}>
              Get Compatibility Report
            </Text>
            <Text style={styles.bannerButtonIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>What You'll Get</Text>
              <Text style={styles.sectionSubtitle}>Comprehensive analysis</Text>
            </View>
          </View>

          <View style={styles.actionsGrid}>
            <View style={styles.actionCard}>
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: "#FFF5E6" },
                ]}
              >
                <Text style={styles.actionEmoji}>⭐</Text>
              </View>
              <Text style={styles.actionText}>Gun Milan</Text>
              <Text style={styles.actionSubtext}>36-point score</Text>
            </View>

            <View style={styles.actionCard}>
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: "#FFF5E6" },
                ]}
              >
                <Text style={styles.actionEmoji}>💝</Text>
              </View>
              <Text style={styles.actionText}>Manglik Check</Text>
              <Text style={styles.actionSubtext}>Dosha analysis</Text>
            </View>

            <View style={styles.actionCard}>
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: "#FFF5E6" },
                ]}
              >
                <Text style={styles.actionEmoji}>📊</Text>
              </View>
              <Text style={styles.actionText}>Detailed Report</Text>
              <Text style={styles.actionSubtext}>Full insights</Text>
            </View>

            <View style={styles.actionCard}>
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: "#FFF5E6" },
                ]}
              >
                <Text style={styles.actionEmoji}>🔮</Text>
              </View>
              <Text style={styles.actionText}>Remedies</Text>
              <Text style={styles.actionSubtext}>Solutions</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
};

export default KundliMatchingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4EF",
  },

  /* HEADER (kept same, not used currently) */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  menuButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2C1810",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#9C7A56",
    marginTop: -2,
  },
  notificationButton: {
    padding: 6,
  },

  /* HERO BANNER - COMPACT */
  heroBanner: {
    backgroundColor: "#7F1D1D",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "300",
    color: "#FFFFFF",
  },
  bannerTitleHighlight: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: -2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "#FFF5E6",
    marginTop: 6,
    opacity: 0.9,
  },
  bannerDecoration: {
    position: "absolute",
    right: -18,
    top: -20,
    opacity: 0.15,
  },
  bannerEmoji: {
    fontSize: 90,
  },

  /* STATS ROW - COMPACT */
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginTop: 10,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    elevation: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#db9a4a",
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
  },

  /* SECTIONS - COMPACT */
  section: {
    marginTop: 18,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2C1810",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#666",
  },

  /* INFO CARD - COMPACT */
  testimonialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#db9a4a",
  },
  quoteIcon: {
    marginBottom: 4,
  },
  testimonialText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 19,
  },

  /* SPECIAL CARD (MALE / FEMALE HEADER) - COMPACT */
  specialCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    elevation: 1,
    alignItems: "center",
  },
  specialLeft: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  specialMiddle: {
    flex: 1,
  },
  specialTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C1810",
    marginBottom: 2,
  },
  specialDescription: {
    fontSize: 11,
    color: "#666",
  },

  /* FORM CARDS - COMPACT */
  formScroll: {
    paddingRight: 10,
  },
  formCard: {
    width: width - 36,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    elevation: 1,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C1810",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F4EF",
    borderWidth: 1,
    borderColor: "#E8DCC8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2, // medium compact
    minHeight: 44, // medium compact
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#2C1810",
    paddingVertical: 0,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: "#2C1810",
  },
  inputError: {
    borderColor: "#E53935",
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 11,
    color: "#E53935",
    marginTop: 3,
    marginLeft: 3,
  },

  /* BUTTON - COMPACT */
  bannerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#db9a4a",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
    elevation: 3,
  },
  bannerButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginRight: 6,
  },
  bannerButtonIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  /* FEATURES GRID - COMPACT */
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  actionCard: {
    width: (width - 44) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    elevation: 1,
  },
  actionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C1810",
    textAlign: "center",
  },
  actionSubtext: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
});
