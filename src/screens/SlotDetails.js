import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api from '../apiConfig';
import RazorpayCheckout from 'react-native-razorpay';
import { Calendar } from 'react-native-calendars';
import { Modal } from 'react-native';
import Toast from "react-native-toast-message";

const SelectSlotScreen = ({ route }) => {
  const navigation = useNavigation();
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const { astrolger, mode } = route.params || {};
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 2);
  const consultationPrices = astrolger?.consultationPrices || [];
  consultationPrices.sort(
    (a, b) => a.duration.slotDuration - b.duration.slotDuration
  );
  const [selectedMode, setSelectedMode] = useState(mode || null);
  const [selectedDuration, setSelectedDuration] = useState(consultationPrices[0]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [slotId, setSlotId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enabledDates, setEnabledDates] = useState([]);

  // useEffect(() => {
  //   if (!selectedDate) return
  //   onChangeDate(selectedDate)
  // }, [selectedDate])

  useEffect(() => {
    if (!selectedDuration) return
    fetchSlotDatesByDuration(selectedDuration)
  }, [selectedDuration])




  const fetchSlotDatesByDuration = async (durationItem) => {
    if (!durationItem?.duration?.slotDuration) return;
    setIsLoading(true);

    try {
      const currentDate = new Date();
      const formattedCurrentDate = currentDate.toISOString().slice(0, 10);
      const formattedCurrentTime = `${currentDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${currentDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

      const durationValue = durationItem.duration.slotDuration;
      const res = await axios.get(
        `${api}/astrologer/get_slots_date_duration/${astrolger?._id}?duration=${durationValue}&currentDate=${formattedCurrentDate}&currentTime=${formattedCurrentTime}`,
        { headers: { "Content-Type": "application/json" } }

      );
      console.log(res.data?.slotDates, 'res.data?.slotDates')
      const dates =
        res.data?.slotDates?.map((d) => d.slice(0, 10)) || [];
      console.log(dates, 'dates')
      setEnabledDates(dates);
    } catch (err) {
      console.log("Slot date API error:", err);
      setEnabledDates([]);
      Alert.alert("Error", "Unable to fetch available dates");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (enabledDates.length > 0 && !selectedDate) {
      const firstEnabled = enabledDates[0]; // STRING
      setSelectedDate(firstEnabled);
      onChangeDate(firstEnabled);
    }
  }, [enabledDates]);
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr + "T00:00:00").toDateString();
  };


  const onChangeDate = async (selectedStr) => {
    if (!enabledDates.includes(selectedStr)) {
      Alert.alert(
        "Date Unavailable",
        "No slots available for the selected duration on this date."
      );
      return;
    }

    setSelectedDate(selectedStr); // store STRING


    const now = new Date();
    const formattedCurrentDate = formatDate(now);
    const formattedCurrentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const durationValue = selectedDuration?.duration?.slotDuration;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${api}/astrologer/get_slots_gen/${astrolger?._id}/by-date`,
        {
          params: {
            currentDate: formattedCurrentDate,
            currentTime: formattedCurrentTime,
            duration: durationValue,
            date: selectedStr,
          },
        }
      );

      const slotList =
        response.data?.SlotTimeByDuration?.[`${durationValue}min`] || [];

      setAvailableSlots(
        slotList.map((slot) => ({
          id: slot._id,
          time: `${slot.fromTime} - ${slot.toTime}`,
          isBooked: slot.status !== "available",
        }))
      );
    } catch (err) {
      setAvailableSlots([]);
      Alert.alert("Error", "Unable to fetch slots");
    } finally {
      setIsLoading(false);
    }
  };



  const handleConfirm = async () => {
    if (!selectedMode || !selectedDuration || !selectedDate || !selectedTime) {
      Alert.alert("Missing Selection", "Please complete all selections.");
      return;
    }

    setIsLoading(true);
    try {
      const customerData = JSON.parse(
        await AsyncStorage.getItem("customerData")
      );
      const response = await axios.post(
        `${api}/customers/book_consultation_order`,
        {
          amount: selectedDuration.price,
          customerId: customerData._id,
          astrologerId: astrolger._id,
          slotId: slotId,
          consultationType: selectedMode === 'video' ? 'videocall' : selectedMode === 'voice' ? 'call' : 'chat',
          fullName: customerData?.customerName,
          mobileNumber: customerData?.phoneNumber,
          email: customerData?.email,
          dateOfBirth: customerData?.dateOfBirth,
          timeOfBirth: customerData?.timeOfBirth,
          placeOfBirth: customerData?.placeOfBirth,
          gender: customerData?.gender,
          latitude: customerData?.address?.latitude,
          longitude: customerData?.address?.longitude,
          duration: selectedDuration?.duration?.slotDuration,
          startTime: selectedDate,
          paymentMethod: "razorpay",
          status: "new",
          source: "mobile"
        },
        { headers: { "Content-Type": "application/json" } }
      );
      const {
        data: order,
        key_id,
        consultationLogId,
      } = response.data;

      const options = {
        description: "AstroBook Consultation",
        currency: order.currency,
        key: key_id,
        amount: order.amount,
        name: "Acharya Lav Bhushan",
        order_id: order.id,
        prefill: {
          email: customerData.email,
          contact: customerData.phoneNumber,
          name: customerData.customerName,
        },
        theme: { color: "#db9a4a" },
      };
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      RazorpayCheckout.open(options)
        .then(async (paymentData) => {
          await axios.post(
            `${api}/customers/verify_payment_and_complete_booking`,
            {
              razorpay_order_id: paymentData.razorpay_order_id,
              razorpay_payment_id: paymentData.razorpay_payment_id,
              razorpay_signature: paymentData.razorpay_signature,
              consultationLogId: consultationLogId,
            }
          );

          Toast.show({
            type: "success",
            text1: "Payment Successful",
            text2: "Your consultation has been booked successfully!",
          });
        })
        .catch((error) => {
          if (!isMountedRef.current) return;

    Toast.show({
      type: "error",
      text1: "Payment Cancelled",
      text2: "You cancelled the payment",
    });
        });
    } catch (err) {
      console.log("Booking Error:", err);
      Alert.alert("Error", "Unable to complete booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const onSelectDuration = async (item) => {
    setSelectedDuration(item);
    setSelectedDate(null);
    setAvailableSlots([]);
    setSelectedTime(null);
    setSlotId(null);

    await fetchSlotDatesByDuration(item);
  };


  const isConfirmEnabled = selectedMode && selectedDuration && selectedDate && selectedTime;
  const getMarkedDates = () => {
    const marked = {};

    // disable all future dates by default (optional range)
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = d.toISOString().slice(0, 10);

      marked[key] = {
        disabled: true,
        disableTouchEvent: true,
        color: '#eee',
      };
    }

    // enable only allowed dates
    enabledDates.forEach((date) => {
      marked[date] = {
        disabled: false,
        disableTouchEvent: false,
        selected: selectedDate === date,

        selectedColor: '#db9a4a',
      };
    });

    return marked;
  };
  const TOP_ASTROLOGER_ID = '68b546bad26a07574a62453d';

  const modes = [
    { type: "voice", icon: "phone", label: "Voice Call" },
    { type: "video", icon: "video", label: "Video Call" },
    { type: "chat", icon: "chat", label: "Chat" },
  ].filter(item => {
    // ❌ Hide chat for top astrologer
    if (astrolger?._id === TOP_ASTROLOGER_ID && item.type === "chat") {
      return false;
    }
    return true;
  });
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#2C1810" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSubtitle}>Book Consultation</Text>
            <Text style={styles.title}>{astrolger?.astrologerName}</Text>
          </View>

          <View style={{ width: 40 }} />
        </View> */}

        {/* Content Container */}
        <View style={styles.content}>

          {/* Mode Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="message-text" size={20} color="#db9a4a" />
              <Text style={styles.sectionTitle}>Consultation Mode</Text>
            </View>

            <View style={styles.modeRow}>
              {modes.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modeCard,
                    selectedMode === item.type && styles.selectedModeCard,
                  ]}
                  onPress={() => setSelectedMode(item.type)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.modeIconContainer,
                      selectedMode === item.type && styles.selectedIconContainer,
                    ]}
                  >
                    <Icon
                      name={item.icon}
                      size={24}
                      color={selectedMode === item.type ? "#fff" : "#db9a4a"}
                    />
                  </View>

                  <Text
                    style={[
                      styles.modeText,
                      selectedMode === item.type && styles.selectedModeText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

          </View>

          {/* Duration */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="clock-outline" size={20} color="#db9a4a" />
              <Text style={styles.sectionTitle}>Duration & Pricing</Text>
            </View>

            <View style={styles.durationRow}>
              {consultationPrices.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.durationCard,
                    selectedDuration?._id === item._id && styles.selectedDurationCard,
                  ]}
                  onPress={() => onSelectDuration(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.durationContent}>
                    <Text style={[
                      styles.durationText,
                      selectedDuration?._id === item._id && styles.selectedDurationText
                    ]}>
                      {item.duration.slotDuration}
                    </Text>
                    <Text style={styles.durationUnit}>minutes</Text>
                  </View>
                  <View style={[
                    styles.priceBadge,
                    selectedDuration?._id === item._id && styles.selectedPriceBadge
                  ]}>
                    <Text style={[
                      styles.priceText,
                      selectedDuration?._id === item._id && styles.selectedPriceText
                    ]}>
                      ₹{item.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Picker */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="calendar-month" size={20} color="#db9a4a" />
              <Text style={styles.sectionTitle}>Select Date</Text>
            </View>

            <TouchableOpacity
              style={[styles.dateCard, selectedDate && styles.dateCardSelected]}
              onPress={() => {
                if (!selectedDuration) {
                  Alert.alert("Select Duration", "Please select duration first");
                  return;
                }
                setShowDatePicker(true);
              }}

              activeOpacity={0.7}
            >
              <View style={styles.dateIconContainer}>
                <Icon name="calendar" size={22} color={selectedDate ? "#db9a4a" : "#999"} />
              </View>
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>
                  {selectedDate ? "Selected Date" : "Choose a date"}
                </Text>
                <Text style={[
                  styles.dateValue,
                  !selectedDate && styles.datePlaceholder
                ]}>
                  {selectedDate ? formatDisplayDate(selectedDate) : "Tap to select"}

                </Text>
              </View>
              <Icon name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>

            <Modal
              visible={showDatePicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <TouchableOpacity
                style={styles.calendarOverlay}
                activeOpacity={1}
                onPress={() => setShowDatePicker(false)}
              >
                <View style={styles.calendarModal}>
                  {/* Header */}
                  <View style={styles.calendarHeader}>
                    <Text style={styles.calendarTitle}>Select Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Icon name="close" size={22} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <Calendar
                    current={selectedDate}   // 👈 important
                    minDate={enabledDates[0]}
                    maxDate={enabledDates[enabledDates.length - 1]}
                    markedDates={getMarkedDates()}
                    onDayPress={(day) => {
                      setShowDatePicker(false);
                      onChangeDate(day.dateString);
                    }}
                    disableAllTouchEventsForDisabledDays
                  />



                </View>
              </TouchableOpacity>
            </Modal>


          </View>

          {/* Available Slots */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="clock-time-four" size={20} color="#db9a4a" />
              <Text style={styles.sectionTitle}>Available Time Slots</Text>
              {availableSlots.length > 0 && (
                <View style={styles.slotCountBadge}>
                  <Text style={styles.slotCountText}>
                    {availableSlots.filter(s => !s.isBooked).length}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.slotContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading slots...</Text>
                </View>
              ) : availableSlots.length > 0 ? (
                availableSlots.map(slot => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotCard,
                      selectedTime === slot.time && styles.slotSelected,
                      slot.isBooked && styles.slotDisabled,
                    ]}
                    disabled={slot.isBooked}
                    onPress={() => { setSelectedTime(slot.time), setSlotId(slot.id) }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.slotText,
                      selectedTime === slot.time && styles.slotTextSelected,
                      slot.isBooked && styles.slotTextDisabled
                    ]}>
                      {slot.time}
                    </Text>
                    {slot.isBooked && (
                      <View style={styles.bookedBadge}>
                        <Text style={styles.bookedText}>Booked</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="calendar-alert" size={48} color="#ddd" />
                  <Text style={styles.emptyStateText}>
                    {selectedDate
                      ? "No slots available for this date"
                      : "Select a date to view available slots"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Summary Card */}
          {isConfirmEnabled && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mode:</Text>
                <Text style={styles.summaryValue}>{selectedMode}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryValue}>{selectedDuration?.duration?.slotDuration} min</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date:</Text>
                <Text style={styles.summaryValue}>
                  {selectedDate ? formatDisplayDate(selectedDate) : ""}
                </Text>

              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time:</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total Amount:</Text>
                <Text style={styles.summaryTotalValue}>₹{selectedDuration?.price}</Text>
              </View>
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              !isConfirmEnabled && styles.confirmBtnDisabled,
              isLoading && styles.confirmBtnLoading
            ]}
            onPress={handleConfirm}
            disabled={!isConfirmEnabled || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmText}>
              {isLoading ? "Processing..." : "Confirm Booking"}
            </Text>
            {!isLoading && <Icon name="check-circle" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelectSlotScreen;

/* ---------------------------------- STYLES ---------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4EF"
  },

  scroll: {
    paddingBottom: 40
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  calendarModal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },

  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C1810',
  },

  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "#F8F4EF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
    marginBottom: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C1810",
  },

  content: {
    padding: 20,
  },

  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C1810",
    marginLeft: 8,
    flex: 1,
  },

  slotCountBadge: {
    backgroundColor: "#db9a4a",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  slotCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  /* Mode Cards */
  modeRow: {
    flexDirection: "row",
    gap: 12,
  },

  modeCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F0E6D7",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  selectedModeCard: {
    backgroundColor: "#FFF9F0",
    borderColor: "#db9a4a",
  },

  modeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF9F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  selectedIconContainer: {
    backgroundColor: "#db9a4a",
  },

  modeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C1810",
    textAlign: "center",
  },

  selectedModeText: {
    color: "#db9a4a",
  },

  /* Duration Cards */
  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  durationCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#F0E6D7",
    minWidth: "30%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  selectedDurationCard: {
    backgroundColor: "#FFF9F0",
    borderColor: "#db9a4a",
  },

  durationContent: {
    marginBottom: 8,
  },

  durationText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C1810",
  },

  selectedDurationText: {
    color: "#db9a4a",
  },

  durationUnit: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },

  priceBadge: {
    backgroundColor: "#F8F4EF",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },

  selectedPriceBadge: {
    backgroundColor: "#db9a4a",
  },

  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#db9a4a",
  },

  selectedPriceText: {
    color: "#fff",
  },

  /* Date Card */
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#F0E6D7",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  dateCardSelected: {
    backgroundColor: "#FFF9F0",
    borderColor: "#db9a4a",
  },

  dateIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F8F4EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  dateTextContainer: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
    marginBottom: 2,
  },

  dateValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C1810",
  },

  datePlaceholder: {
    color: "#999",
  },

  /* Slot Cards */
  slotContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  loadingContainer: {
    width: "100%",
    paddingVertical: 40,
    alignItems: "center",
  },

  loadingText: {
    color: "#999",
    fontSize: 14,
  },

  slotCard: {
    width: "31%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "#F0E6D7",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  slotText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2C1810",
    textAlign: "center",
  },

  slotSelected: {
    backgroundColor: "#db9a4a",
    borderColor: "#db9a4a",
  },

  slotTextSelected: {
    color: "#fff",
  },

  slotDisabled: {
    opacity: 0.5,
    backgroundColor: "#F5F5F5",
  },

  slotTextDisabled: {
    color: "#999",
  },

  bookedBadge: {
    marginTop: 4,
    backgroundColor: "#FFE5E5",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  bookedText: {
    fontSize: 9,
    color: "#D32F2F",
    fontWeight: "600",
  },

  emptyState: {
    width: "100%",
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyStateText: {
    color: "#999",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },

  /* Summary Card */
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#db9a4a",
    ...Platform.select({
      ios: {
        shadowColor: "#db9a4a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C1810",
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  summaryValue: {
    fontSize: 14,
    color: "#2C1810",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  summaryTotal: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0E6D7",
  },

  summaryTotalLabel: {
    fontSize: 16,
    color: "#2C1810",
    fontWeight: "700",
  },

  summaryTotalValue: {
    fontSize: 20,
    color: "#db9a4a",
    fontWeight: "700",
  },

  /* Confirm Button */
  confirmBtn: {
    backgroundColor: "#db9a4a",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#db9a4a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  confirmBtnDisabled: {
    backgroundColor: "#E0E0E0",
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },

  confirmBtnLoading: {
    opacity: 0.7,
  },

  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});