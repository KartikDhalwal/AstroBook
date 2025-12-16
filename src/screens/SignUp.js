import React, { useState, useCallback, useEffect } from 'react';
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
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';
import moment from 'moment';
import axios from 'axios';
import Modal from 'react-native-modal';
import api from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlaceInput from '../components/PlaceInput';

const { width } = Dimensions.get('screen');

const SignUp = ({ navigation, route }) => {
  const { customer, isProfile } = route.params || {};

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [timeOfBirth, setTimeOfBirth] = useState(null);

  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [customerId, setCustomerId] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* ================= PERMISSIONS ================= */

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };



  /* ================= IMAGE PICKER ================= */
  const loadCustomerId = async () => {
    const raw = await AsyncStorage.getItem('customerData');
    if (!raw) return;
    
    const data = JSON.parse(raw);
    console.log(data)
    if (data?._id) {
      setCustomerId(data._id);
    }
  };
  const getProfilePic = useCallback(async (type, options) => {
    if (type === 'capture') {
      const ok = await requestCameraPermission();
      if (!ok) return Alert.alert('Permission denied', 'Camera permission required');
    }

    const picker =
      type === 'capture'
        ? ImagePicker.launchCamera
        : ImagePicker.launchImageLibrary;

    picker(options, res => {
      setModalVisible(false);
      if (res?.assets?.length) {
        setProfileImage(res.assets[0]);
      }
    });
  }, []);

  /* ================= FETCH USER FROM API ================= */

  const fetchCustomerDetail = async () => {
    try {
      const res = await axios.post(
        `${api}/customers/get-customer-detail`,
        { customerId: customerId }
      );
      if (!res.data.success) return;

      const data = res.data.customersDetail;
      console.log(data,'data')
      setCustomerName(data.customerName || '');
      setPhoneNumber(data.phoneNumber || '');
      setEmail(data.email || '');
      setGender(data.gender || '');

      if (data.dateOfBirth) setDateOfBirth(new Date(data.dateOfBirth));
      if (data.timeOfBirth) setTimeOfBirth(new Date(data.timeOfBirth));
      console.log(data?.address?.birthPlace,'data?.address?.birthPlace')
      setPlaceOfBirth(data?.address?.birthPlace || '');
      setLatitude(data?.address?.latitude || 0);
      setLongitude(data?.address?.longitude || 0);

      if (data.image) {
  const imageUrl = data.image.startsWith('http')
    ? data.image
    : `https://alb-web-assets.s3.ap-south-1.amazonaws.com/${data.image}`;

  setProfileImage({ uri: imageUrl });
}

    } catch (err) {
      console.log('Customer fetch error:', err);
    }
  };

  useEffect(() => {
    loadCustomerId();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetail(customerId);
    }
  }, [customerId]);

  /* ================= IMAGE UPLOAD ================= */

  const uploadProfileImage = async (customerId, imageFile) => {
    try {
      const imgData = new FormData();
      imgData.append('customerId', customerId);
      imgData.append('image', {
        uri:
          Platform.OS === 'android'
            ? imageFile.uri
            : imageFile.uri.replace('file://', ''),
        name: imageFile.fileName || 'profile.jpg',
        type: imageFile.type || 'image/jpeg',
      });

      const res = await axios.post(
        `${api}/customers/change_profile`,
        imgData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      return res.data;
    } catch (err) {
      console.log('Image upload error:', err);
      return null;
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!customerName || !gender || !dateOfBirth || !timeOfBirth || !placeOfBirth) {
      return Alert.alert('Error', 'Please fill all required fields');
    }

    const [firstName, ...rest] = customerName.split(' ');
    const lastName = rest.join(' ');

    try {
      setIsLoading(true);

      const payload = {
        customerId: customerId,
        firstName,
        lastName,
        email,
        gender,
        dateOfBirth: moment(dateOfBirth).toISOString(),
        timeOfBirth: moment(timeOfBirth).toISOString(),
        placeOfBirth,
        latitude,
        longitude,
      };

      const res = await axios.post(
        `${api}/customers/update_profile_intake`,
        payload
      );

      if (res.data.success) {
        let updatedProfile = res.data.results;

        if (profileImage?.uri) {
          const imgRes = await uploadProfileImage(customerId, profileImage);
          if (imgRes?.success && imgRes?.image) {
            updatedProfile = { ...updatedProfile, image: imgRes.image };
          }
        }

        await AsyncStorage.setItem(
          'customerData',
          JSON.stringify(updatedProfile)
        );

        Alert.alert('Success', res.data.message);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const Required = () => <Text style={{ color: 'red' }}> *</Text>;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Name */}
        <Text style={styles.label}>Full Name<Required /></Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="account" size={20} color="#db9a4a" />
          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            style={styles.textInput}
          />
        </View>

        {/* Phone (DISABLED) */}
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="phone-outline" size={20} color="#999" />
          <TextInput
            value={phoneNumber}
            editable={false}
            style={[styles.textInput, { color: '#777' }]}
          />
        </View>

        {/* Email (DISABLED) */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#999" />
          <TextInput
            value={email}
            editable={false}
            style={[styles.textInput, { color: '#777' }]}
          />
        </View>

        {/* Gender */}
        <Text style={styles.label}>Gender<Required /></Text>
        <View style={styles.genderContainer}>
          {['Male', 'Female'].map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.genderButton, gender === g && styles.genderButtonActive]}
              onPress={() => setGender(g)}>
              <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DOB */}
        <Text style={styles.label}>Date of Birth<Required /></Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputWrapper}>
          <MaterialCommunityIcons name="calendar" size={20} color="#db9a4a" />
          <Text style={styles.textInput}>
            {dateOfBirth ? moment(dateOfBirth).format('DD MMM YYYY') : 'Select date of birth'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            mode="date"
            onChange={(e, d) => {
              setShowDatePicker(false);
              d && setDateOfBirth(d);
            }}
          />
        )}

        {/* TOB */}
        <Text style={styles.label}>Time of Birth<Required /></Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputWrapper}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#db9a4a" />
          <Text style={styles.textInput}>
            {timeOfBirth ? moment(timeOfBirth).format('hh:mm A') : 'Select time of birth'}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={timeOfBirth || new Date()}
            mode="time"
            onChange={(e, t) => {
              setShowTimePicker(false);
              t && setTimeOfBirth(t);
            }}
          />
        )}

        {/* Place */}
        <Text style={styles.label}>Place of Birth<Required /></Text>
        <View style={styles.inputWrapper}>
          <PlaceInput
            onSelect={(loc) => {
              setPlaceOfBirth(loc.description);
              setLatitude(loc.latitude);
              setLongitude(loc.longitude);
            }}
            value={placeOfBirth}
          />
        </View>

        {/* Photo */}
        <Text style={styles.label}>Profile Photo (Optional)</Text>
        <TouchableOpacity
          style={styles.selectPhotoButton}
          onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="camera-outline" size={20} color="#db9a4a" />
          <Text style={styles.selectPhotoText}>SELECT PHOTO</Text>
        </TouchableOpacity>

        {profileImage && (
          <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
        )}

        {/* {!isProfile && ( */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>
              {isLoading ? 'Submitting...' : 'SUBMIT'}
            </Text>
          </TouchableOpacity>
        {/* )} */}
      </ScrollView>

      {/* Modal */}
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

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#2C1810' },

  label: { fontSize: 14, fontWeight: '700', color: '#2C1810', marginBottom: 4 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4DC',
    paddingVertical: 12,
    marginBottom: 16
  },

  textInput: { flex: 1, fontSize: 15, color: '#2C1810', marginLeft: 8 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  genderButton: { flex: 1, marginHorizontal: 4, padding: 12, borderWidth: 1, borderColor: '#E8E4DC', alignItems: 'center', borderRadius: 4 },
  genderButtonActive: { borderColor: '#db9a4a', backgroundColor: '#FFF5E6' },
  genderText: { color: '#8B7355' },
  genderTextActive: { color: '#db9a4a', fontWeight: '600' },

  selectPhotoButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 4, borderWidth: 1, borderColor: '#db9a4a', marginBottom: 16 },
  selectPhotoText: { fontSize: 13, fontWeight: '600', color: '#db9a4a', marginLeft: 8 },

  profileImage: { width: width * 0.5, height: width * 0.5, borderRadius: 8, alignSelf: 'center', marginBottom: 20 },

  submitButton: { backgroundColor: '#db9a4a', paddingVertical: 16, borderRadius: 4, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#FFFFFF', fontWeight: '700' },

  modalCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 6 },
  modalOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  modalText: { color: '#2C1810', fontSize: 15 },
});
