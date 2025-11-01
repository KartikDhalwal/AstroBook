// screens/PoojaDetails.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const BASE_URL = 'https://api.acharyalavbhushan.com';

const PoojaDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pooja } = route.params || {};

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const getImageUrl = (path) =>
    path?.startsWith('http') ? path : `${BASE_URL}${path}`;

  const handlePayment = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Select Date & Time', 'Please choose both date and time slot before booking.');
      return;
    }

    try {
      const options = {
        description: `Booking for ${pooja?.pujaName} on ${selectedDate.toDateString()} at ${selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        image: getImageUrl(pooja?.image?.[0]),
        currency: 'INR',
        key: 'rzp_test_YourKeyHere', // Replace with your actual Razorpay key
        amount: pooja?.price * 100,
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

  if (!pooja) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No Pooja data found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F4EF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#db9a4a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pooja.pujaName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: getImageUrl(pooja?.image?.[0]) }}
          style={styles.image}
          resizeMode="cover"
        />

        <Text style={styles.title}>{pooja.pujaName}</Text>
        <Text style={styles.price}>₹{pooja?.price?.toLocaleString()}</Text>
        <Text style={styles.description}>
          {pooja?.about?.[0]?.bulletPoint || 'No description available.'}
        </Text>

        {/* Date and Time Selection */}
        <View style={styles.slotContainer}>
          <Text style={styles.slotLabel}>Select Date & Time</Text>

          <TouchableOpacity
            style={styles.slotButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={20} color="#db9a4a" />
            <Text style={styles.slotButtonText}>
              {selectedDate ? selectedDate.toDateString() : 'Select Date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.slotButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="clock-outline" size={20} color="#db9a4a" />
            <Text style={styles.slotButtonText}>
              {selectedTime
                ? selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Select Time'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime || new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) setSelectedTime(time);
            }}
          />
        )}

        {/* Book Button */}
        <TouchableOpacity style={styles.bookButton} onPress={handlePayment}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  image: { width: '100%', height: 230, borderRadius: 12, marginBottom: 15 },
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  price: { fontSize: 18, color: '#db9a4a', marginVertical: 8, fontWeight: '600' },
  description: { fontSize: 15, color: '#555', lineHeight: 22 },
  slotContainer: {
    marginTop: 20,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  slotLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  slotButtonText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  bookButton: {
    backgroundColor: '#db9a4a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
  },
  bookButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#999' },
});

export default PoojaDetails;
