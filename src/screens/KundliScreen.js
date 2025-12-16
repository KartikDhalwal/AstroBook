import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import PlaceInput from "../components/PlaceInput";

const ADD_KUNDLI_API = "https://api.acharyalavbhushan.com/api/kundli/add_kundli";
const GET_KUNDLI_API = "https://api.acharyalavbhushan.com/api/kundli/get_customer_kundli";
const DELETE_KUNDLI_API = "https://api.acharyalavbhushan.com/api/kundli/delete_kundli";

const KundliScreen = () => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [amPm, setAmPm] = useState("AM");
  const [place, setPlace] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const navigation = useNavigation();
  const [kundlis, setKundlis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const getCustomerId = async () => {
    const stored = await AsyncStorage.getItem("customerData");
    if (!stored) return null;
    return JSON.parse(stored)._id;
  };

  // Load kundlis
  const loadKundlis = async () => {
    try {
      setFetchLoading(true);
      const customerId = await getCustomerId();
      if (!customerId) return;
      const res = await axios.post(GET_KUNDLI_API, { customerId });
      setKundlis(res?.data?.kundli || []);
    } catch (err) {
      console.log("Error loading kundlis:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    loadKundlis();
  }, []);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter name");
      return false;
    }
    if (!gender) {
      Alert.alert("Error", "Please select gender");
      return false;
    }
    if (!dob) {
      Alert.alert("Error", "Please select date of birth");
      return false;
    }
    if (!hour || !minute) {
      Alert.alert("Error", "Please select time of birth");
      return false;
    }
    if (!place.trim()) {
      Alert.alert("Error", "Please enter place of birth");
      return false;
    }
    return true;
  };

  // Add Kundli
  const generateKundli = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const customerId = await getCustomerId();
      if (!customerId) {
        Alert.alert("Error", "Customer ID not found");
        return;
      }

      const finalDob = `${dob}T00:00:00.000Z`;
      const finalTob = `${dob}T${hour}:${minute}:00.000Z`;

      const payload = {
        customerId,
        name,
        gender,
        dob: finalDob,
        tob: finalTob,
        place,
        lat,
        lon,
      };

      await axios.post(ADD_KUNDLI_API, payload);

      Alert.alert("Success", "Kundli created successfully!");

      setName("");
      setGender("");
      setDob("");
      setHour("");
      setMinute("");
      setAmPm("AM");
      setPlace("");
      setLat("");
      setLon("");
      setShowForm(false);

      loadKundlis();
    } catch (err) {
      Alert.alert("Error", "Failed to create kundli");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const deleteKundli = async (id) => {
    Alert.alert("Delete Kundli", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const customerId = await getCustomerId();
            await axios.post(DELETE_KUNDLI_API, { customerId, kundliId: id });
            loadKundlis();
            Alert.alert("Success", "Kundli deleted");
          } catch {
            Alert.alert("Error", "Delete failed");
          }
        },
      },
    ]);
  };

  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const time = new Date(timeString);

    const dateStr = date.toDateString();

    const timeStr = time.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { date: dateStr, time: timeStr };
  };

  return (
    <View style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="book-open-page-variant" size={28} color="#db9a4a" />
          <Text style={styles.headerTitle}>My Kundlis</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Icon name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* List */}
      {fetchLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#db9a4a" />
        </View>
      ) : kundlis.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="book-open-page-variant-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>No Kundlis Yet</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setShowForm(true)}>
            <Icon name="plus" size={20} color="#FFF" />
            <Text style={styles.emptyButtonText}>Create Kundli</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={kundlis}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const { date, time } = formatDateTime(item.dob, item.tob);

            return (
              <View style={styles.kundliCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarCircle}>
                    <Icon
                      name={item.gender === "Male" ? "gender-male" : "gender-female"}
                      size={28}
                      color="#db9a4a"
                    />
                  </View>

                  <View style={styles.cardHeaderInfo}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <View style={styles.genderBadge}>
                      <Text style={styles.genderText}>{item.gender}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="calendar" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Date of Birth</Text>
                    <Text style={styles.detailValue}>{date}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Icon name="clock-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Time of Birth</Text>
                    <Text style={styles.detailValue}>{time}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Icon name="map-marker" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Place</Text>
                    <Text style={styles.detailValue}>{item.place}</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() =>
                      navigation.navigate("Kundli Details", { kundliId: item._id })
                    }
                  >
                    <Icon name="eye" size={18} color="#db9a4a" />
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteKundli(item._id)}
                  >
                    <Icon name="delete" size={18} color="#D32F2F" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Create Kundli Modal */}
      <Modal visible={showForm} animationType="slide">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Icon name="close" size={24} color="#2C1810" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create New Kundli</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.formContainer}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <Icon name="account" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter full name"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender *</Text>
              <View style={styles.genderSelector}>
                <TouchableOpacity
                  style={[styles.genderOption, gender === "Male" && styles.genderOptionSelected]}
                  onPress={() => setGender("Male")}
                >
                  <Icon name="gender-male" size={24} color={gender === "Male" ? "#FFF" : "#666"} />
                  <Text
                    style={[
                      styles.genderOptionText,
                      gender === "Male" && styles.genderOptionTextSelected,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === "Female" && styles.genderOptionSelected,
                  ]}
                  onPress={() => setGender("Female")}
                >
                  <Icon
                    name="gender-female"
                    size={24}
                    color={gender === "Female" ? "#FFF" : "#666"}
                  />
                  <Text
                    style={[
                      styles.genderOptionText,
                      gender === "Female" && styles.genderOptionTextSelected,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* DOB Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth *</Text>

              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar" size={20} color="#999" style={styles.inputIcon} />
                <Text style={styles.textInput}>
                  {dob ? dob : "Select date of birth"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* TIME PICKER */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time of Birth *</Text>

              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowTimePicker(true)}
              >
                <Icon name="clock-outline" size={20} color="#999" style={styles.inputIcon} />
                <Text style={styles.textInput}>
                  {hour && minute ? `${hour}:${minute} ${amPm}` : "Select time of birth"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Place */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Place of Birth *</Text>
              {/* <View style={styles.inputWrapper}> */}
                {/* <Icon name="map-marker" size={20} color="#999" style={styles.inputIcon} /> */}
                <PlaceInput
                  label="Place of Birth"
                  onSelect={(location) => {
                    console.log("PLACE SELECTED => ", location);
                    setPlace(
                      location.description
                    );
                    setLat(location.latitude);
                    setLon(location.longitude);
                  }}
                />
                {/* <TextInput
                  style={styles.textInput}
                  placeholder="Enter place of birth"
                  value={place}
                  onChangeText={setPlace}
                /> */}
              </View>
            {/* </View> */}

            {/* Submit */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={generateKundli}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Icon name="star-four-points" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>Generate Kundli</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* DATE PICKER */}
      {showDatePicker && (
        <DateTimePicker
          value={dob ? new Date(dob) : new Date()}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
              const day = String(selectedDate.getDate()).padStart(2, "0");
              setDob(`${year}-${month}-${day}`);
            }
          }}
        />
      )}

      {/* TIME PICKER */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="spinner"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              let h = selectedTime.getHours();
              let m = selectedTime.getMinutes();
              const ampm = h >= 12 ? "PM" : "AM";
              h = h % 12 || 12;
              setHour(String(h).padStart(2, "0"));
              setMinute(String(m).padStart(2, "0"));
              setAmPm(ampm);
            }
          }}
        />
      )}
    </View>
  );
};

export default KundliScreen;



// ---------------- STYLES ----------------
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#F8F4EF",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#F8F4EF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5D5C8",
    },

    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#2C1810",
        marginLeft: 12,
    },

    addButton: {
        backgroundColor: "#db9a4a",
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },

    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2C1810",
        marginTop: 20,
        marginBottom: 8,
    },

    emptySubtitle: {
        fontSize: 14,
        color: "#777",
        textAlign: "center",
        marginBottom: 24,
    },

    emptyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#db9a4a",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },

    emptyButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16,
        marginLeft: 8,
    },

    listContent: {
        padding: 16,
    },

    kundliCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },

    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#FFF5E6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },

    cardHeaderInfo: {
        flex: 1,
    },

    cardName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2C1810",
        marginBottom: 6,
    },

    genderBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#FFF5E6",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },

    genderText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#db9a4a",
    },

    cardDivider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginHorizontal: 16,
    },

    cardDetails: {
        padding: 16,
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },

    detailLabel: {
        fontSize: 13,
        color: "#666",
        marginLeft: 8,
        width: 110,
    },

    detailValue: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: "#2C1810",
    },

    cardActions: {
        flexDirection: "row",
        gap: 10,
        padding: 16,
        paddingTop: 0,
    },

    viewButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF5E6",
        paddingVertical: 12,
        borderRadius: 12,
    },

    viewButtonText: {
        color: "#db9a4a",
        fontWeight: "700",
        fontSize: 14,
        marginLeft: 6,
    },

    deleteButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFEBEE",
        paddingVertical: 12,
        borderRadius: 12,
    },

    deleteButtonText: {
        color: "#D32F2F",
        fontWeight: "700",
        fontSize: 14,
        marginLeft: 6,
    },

    // Modal Styles
    modalSafe: {
        flex: 1,
        backgroundColor: "#F8F4EF",
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#F8F4EF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5D5C8",
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2C1810",
    },

    modalScroll: {
        flex: 1,
    },

    formContainer: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },

    inputGroup: {
        marginBottom: 24,
    },

    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2C1810",
        marginBottom: 10,
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },

    inputIcon: {
        marginRight: 12,
    },

    textInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 15,
        color: "#2C1810",
    },

    inputHint: {
        fontSize: 12,
        color: "#999",
        marginTop: 6,
        marginLeft: 4,
    },

    genderSelector: {
        flexDirection: "row",
        gap: 12,
    },

    genderOption: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 18,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: "#E5D5C8",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },

    genderOptionSelected: {
        backgroundColor: "#db9a4a",
        borderColor: "#db9a4a",
    },

    genderOptionText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#666",
        marginLeft: 8,
    },

    genderOptionTextSelected: {
        color: "#FFF",
    },

    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    timeSeparator: {
        fontSize: 24,
        fontWeight: "700",
        color: "#666",
    },

    amPmSelector: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },

    amPmOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
    },

    amPmSelected: {
        backgroundColor: "#db9a4a",
    },

    amPmText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#666",
    },

    amPmTextSelected: {
        color: "#FFF",
    },

    coordRow: {
        flexDirection: "row",
        gap: 12,
    },

    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#db9a4a",
        paddingVertical: 18,
        borderRadius: 16,
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },

    submitButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16,
        marginLeft: 8,
    },
});