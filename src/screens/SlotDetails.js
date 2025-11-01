import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation } from '@react-navigation/native';

const SelectSlotScreen = ({ route }) => {
  const navigation = useNavigation();
  const { astrolger } = route.params || {};
  const consultationPrices = astrolger?.consultationPrices || [];

  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (event, selected) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) setSelectedDate(selected);
  };

  const onChangeTime = (event, selected) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selected) setSelectedTime(selected);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
          Alert.alert('Select Date & Time', 'Please choose both date and time slot before booking.');
          return;
        }
    
        try {
          const options = {
            description: `Booking for Consultation on ${selectedDate.toDateString()} at ${selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            // image: getImageUrl(pooja?.image?.[0]),
            currency: 'INR',
            key: 'rzp_test_YourKeyHere', // Replace with your actual Razorpay key
            amount: 100,
            name: 'Acharya Lav Bhushan',
            prefill: {
              email: 'user@example.com',
              contact: '9999999999',
              name: 'Test User',
            },
            theme: { color: '#db9a4a' },
          };
    
          RazorpayCheckout.open(options)
            .then((data) => {
              Alert.alert('Success', `Payment ID: ${data.razorpay_payment_id}`);
              // TODO: Call backend to confirm booking with selectedDate & selectedTime
            })
            .catch((error) => {
              Alert.alert('Payment Failed', error.description);
            });
        } catch (err) {
          console.error(err);
          Alert.alert('Error', 'Something went wrong during payment.');
        }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={26} color="#db9a4a" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            Book Slot for {astrolger?.astrologerName}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Duration Section */}
        <Text style={styles.sectionTitle}>Select Duration</Text>
        {consultationPrices.length > 0 ? (
          <View style={styles.row}>
            {consultationPrices.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.durationCard,
                  selectedDuration?._id === item._id && styles.selectedCard,
                ]}
                onPress={() => setSelectedDuration(item)}
              >
                <Text style={styles.durationText}>
                  {item.duration.slotDuration} Min
                </Text>
                <Text style={styles.priceText}>₹{item.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={{ color: '#777', marginTop: 8 }}>
            No consultation packages available
          </Text>
        )}

        {/* Date Selection */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <TouchableOpacity
          style={styles.inputCard}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="calendar" size={22} color="#db9a4a" />
          <Text style={styles.inputText}>
            {selectedDate
              ? selectedDate.toDateString()
              : 'Tap to choose a date'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={selectedDate || new Date()}
            minimumDate={new Date()}
            onChange={onChangeDate}
          />
        )}

        {/* Time Selection */}
        <Text style={styles.sectionTitle}>Select Time</Text>
        <TouchableOpacity
          style={styles.inputCard}
          onPress={() => setShowTimePicker(true)}
        >
          <Icon name="clock-outline" size={22} color="#db9a4a" />
          <Text style={styles.inputText}>
            {selectedTime
              ? selectedTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Tap to choose a time'}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            mode="time"
            value={selectedTime || new Date()}
            onChange={onChangeTime}
          />
        )}

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Confirm Slot</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelectSlotScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    borderBottomWidth: 0.4,
    borderColor: '#E8DCC8',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1810',
    flex: 1,
    textAlign: 'center',
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C1810',
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },

  // Duration cards
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 12,
  },
  durationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  selectedCard: {
    backgroundColor: '#FFF3E0',
    borderColor: '#db9a4a',
  },
  durationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C1810',
  },
  priceText: {
    fontSize: 14,
    color: '#db9a4a',
    marginTop: 4,
    fontWeight: '600',
  },

  // Date/Time input
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DCC8',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
  },
  inputText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#2C1810',
  },

  // Button
  confirmBtn: {
    backgroundColor: '#db9a4a',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
    elevation: 4,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
