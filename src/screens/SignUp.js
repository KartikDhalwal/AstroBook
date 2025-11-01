import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';
import moment from 'moment';
import axios from 'axios';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../apiConfig';

const { width } = Dimensions.get('screen');

const SignUp = ({ navigation }) => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [timeOfBirth, setTimeOfBirth] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /** 📸 Image Picker */
  const getProfilePic = useCallback((type, options) => {
    const picker =
      type === 'capture'
        ? ImagePicker.launchCamera
        : ImagePicker.launchImageLibrary;
    picker(options, res => {
      setModalVisible(false);
      if (res.assets && res.assets.length > 0) {
        setProfileImage(res.assets[0]);
      }
    });
  }, []);

  /** 📅 Date of Birth Picker */
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDateOfBirth(selectedDate);
  };

  /** ⏰ Time of Birth Picker */
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) setTimeOfBirth(selectedTime);
  };

  /** 🚀 Submit to Backend */
const handleSubmit = async () => {
  if (!customerName.trim()) {
    return Alert.alert('Error', 'Please enter your name.');
  }
  if (!phoneNumber.trim()) {
    return Alert.alert('Error', 'Please enter your mobile number.');
  }
  if (!/^\d{10}$/.test(phoneNumber.trim())) {
    return Alert.alert('Error', 'Please enter a valid 10-digit mobile number.');
  }
  if (!gender.trim()) {
    return Alert.alert('Error', 'Please select your gender.');
  }
  if (!dateOfBirth) {
    return Alert.alert('Error', 'Please select your date of birth.');
  }
  if (!timeOfBirth) {
    return Alert.alert('Error', 'Please select your time of birth.');
  }
  if (!profileImage) {
    return Alert.alert('Error', 'Please upload a profile image.');
  }

  try {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('customerName', customerName.trim());
    formData.append('phoneNumber', phoneNumber.trim());
    formData.append('gender', gender.trim());
    formData.append('dateOfBirth', moment(dateOfBirth).format('YYYY-MM-DD'));
    formData.append('timeOfBirth', moment(timeOfBirth).format('HH:mm:ss'));

    // Attach image file as expected by backend multer
    formData.append('image', {
      uri:
        Platform.OS === 'android'
          ? profileImage.uri
          : profileImage.uri.replace('file://', ''),
      name: profileImage.fileName || 'photo.jpg',
      type: profileImage.type || 'image/jpeg',
    });

    console.log('Submitting signup form to:', `${api}/customers/customeer-signup`);

    const response = await axios.post(
      `${api}/customers/customer-signup`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    console.log('Signup response:', response.data);

    const resData = response.data;
    if (resData.success) {
      Alert.alert('Success', resData.message);
      navigation.navigate('Home');
    } else {
      Alert.alert('Error', resData.message || 'Something went wrong');
    }
  } catch (error) {
    console.error('Signup error:', error);
    if (error.response) {
      console.log('Error Response:', error.response.data);
      Alert.alert('Error', error.response.data.message || 'Signup failed.');
    } else {
      Alert.alert('Error', 'Network or server issue. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={26} color="#db9a4a" />
        </TouchableOpacity>
        <Text style={styles.title}>Sign Up</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        {/* Name */}
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="account" size={20} color="#db9a4a" />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#8B7355"
            value={customerName}
            onChangeText={setCustomerName}
            style={styles.textInput}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="phone-outline" size={20} color="#db9a4a" />
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#8B7355"
            keyboardType="numeric"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.textInput}
          />
        </View>

        {/* Gender */}
        <Text style={styles.sectionTitle}>Gender</Text>
        <View style={styles.genderContainer}>
          {['Male', 'Female'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderButton, gender === g && styles.genderButtonActive]}
              onPress={() => setGender(g)}>
              <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date of Birth */}
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputWrapper}>
          <MaterialCommunityIcons name="calendar" size={20} color="#db9a4a" />
          <Text style={[styles.textInput, !dateOfBirth && { color: '#8B7355' }]}>
            {dateOfBirth ? moment(dateOfBirth).format('DD MMM YYYY') : 'Select Date of Birth'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            mode="date"
            display="calendar"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Time of Birth */}
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputWrapper}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#db9a4a" />
          <Text style={[styles.textInput, !timeOfBirth && { color: '#8B7355' }]}>
            {timeOfBirth ? moment(timeOfBirth).format('hh:mm A') : 'Select Time of Birth'}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={timeOfBirth || new Date()}
            mode="time"
            display="clock"
            onChange={handleTimeChange}
          />
        )}

        {/* Profile Image */}
        <TouchableOpacity
          style={styles.selectPhotoButton}
          onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="camera-outline" size={20} color="#db9a4a" />
          <Text style={styles.selectPhotoText}>SELECT PHOTO</Text>
        </TouchableOpacity>

        {profileImage && (
          <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
        )}

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}>
          <Text style={styles.submitText}>
            {isLoading ? 'Submitting...' : 'SUBMIT'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for Image Picker */}
      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalCard}>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => getProfilePic('capture', { mediaType: 'photo', quality: 1 })}>
            <MaterialCommunityIcons name="camera" size={24} color="#db9a4a" />
            <Text style={styles.modalText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => getProfilePic('gallery', { mediaType: 'photo', quality: 1 })}>
            <MaterialCommunityIcons name="image" size={24} color="#db9a4a" />
            <Text style={styles.modalText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF5E6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#2C1810', textAlign: 'center', flex: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E8E4DC', paddingVertical: 12, marginBottom: 16 },
  textInput: { flex: 1, fontSize: 15, color: '#2C1810', marginLeft: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#2C1810', marginVertical: 8 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  genderButton: { flex: 1, marginHorizontal: 4, padding: 12, borderWidth: 1, borderColor: '#E8E4DC', alignItems: 'center', borderRadius: 4 },
  genderButtonActive: { borderColor: '#db9a4a', backgroundColor: '#FFF5E6' },
  genderText: { color: '#8B7355' },
  genderTextActive: { color: '#db9a4a', fontWeight: '600' },
  selectPhotoButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 4, borderWidth: 1, borderColor: '#db9a4a', marginBottom: 16 },
  selectPhotoText: { fontSize: 13, fontWeight: '600', color: '#db9a4a', marginLeft: 8 },
  profileImage: { width: width * 0.5, height: width * 0.5, borderRadius: 8, alignSelf: 'center', marginBottom: 20 },
  submitButton: { backgroundColor: '#db9a4a', paddingVertical: 16, borderRadius: 4, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontWeight: '700' },
  modalCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 6 },
  modalOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  modalText: { color: '#2C1810', fontSize: 15 },
});
