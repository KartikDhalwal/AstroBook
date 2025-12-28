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
import Toast from "react-native-toast-message";
import { KeyboardAvoidingView } from 'react-native';

const { width } = Dimensions.get('screen');

const SignUpLogin = ({ navigation, route }) => {
  const { customer, isProfile, isLogin } = route.params || {};

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
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [pickedImage, setPickedImage] = useState(null); // 👈 NEW
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpFor, setOtpFor] = useState(null); // "email" | "phone"
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  /* ================= PERMISSIONS ================= */
  const sendUpdateOtp = async (type) => {
    try {
      // ✅ EMAIL VALIDATION
      if (type === "email") {
        if (!email?.trim()) {
          Alert.alert("Error", "Please enter email address");
          return;
        }

        if (!isValidEmail(email)) {
          Alert.alert("Invalid Email", "Please enter a valid email address");
          return;
        }
      }

      setLoading(true);

      const payload = {
        customerId: customerId,
        ...(type === "email"
          ? { email }
          : { phoneNumber }),
      };

      const res = await axios.post(
        `${api}/customers/send-update-otp`,
        payload
      );

      if (res.data.success) {
        Toast.show({
          type: "success",
          text1: "OTP Sent",
          text2: `OTP sent to your ${type}`,
        });

        setOtpFor(type);
        setOtpSent(true);
        setOtp("");
        setOtpModalVisible(true);
      } else {
        Alert.alert("Error", res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Unable to send OTP"
      );
      setOtpModalVisible(false);
      setOtpSent(false);
    } finally {
      setLoading(false);
    }
  };


  const verifyAndUpdate = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customerId: customerId,
        otp,
        ...(otpFor === "email"
          ? { email }
          : { phoneNumber }),
      };

      const res = await axios.post(
        `${api}/customers/update-contact`,
        payload
      );

      if (res.data.success) {
        // Alert.alert("Success", "Updated successfully");
        Toast.show({
          type: "success",
          text1: "Success",
          text2: 'Updated successfully',
        });
        setOtp("");
        setOtpSent(false);
        setOtpFor(null);
        setOtpModalVisible(false);
        setIsEditingPhone(false);
        setIsEditingEmail(false);
      } else {
        Alert.alert("Error", res.data.message || "Invalid OTP");
      }
    } catch (err) {
      Alert.alert("Error", "OTP verification failed");
    } finally {
      setLoading(false);
    }
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
  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const getProfilePic = useCallback(async (type, options) => {
    if (type === 'capture') {
      const ok = await requestCameraPermission();
      if (!ok) return Alert.alert('Permission denied');
    }

    const picker =
      type === 'capture'
        ? ImagePicker.launchCamera
        : ImagePicker.launchImageLibrary;

    picker(options, res => {
      setModalVisible(false);

      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Image error');
        return;
      }

      if (res.assets?.length) {
        const asset = res.assets[0];
        setProfileImage({ uri: asset.uri }); // UI only
        setPickedImage(asset);               // UPLOAD only
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
      setCustomerName(data.customerName || '');
      setPhoneNumber(data.phoneNumber || '');
      setEmail(data.email || '');
      setGender(data.gender || '');
      setEmail(data.email || '');

      if (data.dateOfBirth) setDateOfBirth(new Date(data.dateOfBirth));
      if (data.timeOfBirth) setTimeOfBirth(new Date(data.timeOfBirth));
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
  const isValidEmail = (value) => {
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value.trim());
  };

  const uploadProfileImage = async (customerId, imageFile) => {
    const imgData = new FormData();

    const fileName =
      imageFile.fileName ||
      `camera_${Date.now()}.jpg`;

    const fileType =
      imageFile.type ||
      'image/jpeg';

    imgData.append('customerId', customerId);
    imgData.append('image', {
      uri:
        Platform.OS === 'android'
          ? imageFile.uri
          : imageFile.uri.replace('file://', ''),
      name: fileName,
      type: fileType,
    });

    const res = await axios.post(
      `${api}/customers/change_profile`,
      imgData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return res.data;
  };



  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!customerName || !gender || !dateOfBirth || !timeOfBirth || !placeOfBirth || !phoneNumber) {
      return Alert.alert('Error', 'Please fill all required fields');
    }

    const [firstName, ...rest] = customerName.trim().split(' ');
    const lastName = rest.join(' ');

    try {
      setIsLoading(true);

      const payload = {
        customerId: customerId,
        firstName,
        lastName,
        gender,
        email,
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

        if (pickedImage) {
          const imgRes = await uploadProfileImage(customerId, pickedImage);
          if (imgRes?.success && imgRes?.image) {
            const fullImageUrl = `https://alb-web-assets.s3.ap-south-1.amazonaws.com/${imgRes.image}`;

            updatedProfile = { ...updatedProfile, image: imgRes.image };

            // 🔥 UPDATE UI IMMEDIATELY
            setProfileImage({ uri: fullImageUrl });
          }

        }


        await AsyncStorage.setItem(
          'customerData',
          JSON.stringify(updatedProfile)
        );
        // if (isLogin) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
        // }
        Toast.show({
          type: "success",
          text1: "Success",
          text2: res.data.message || 'Profile Updated Successfully',
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
  const formatDobDisplay = (dob) => {
    if (!dob) return '';

    const date = new Date(dob);
    return date.toDateString(); // Fri Dec 19 2025
  };
  const Required = () => <Text style={{ color: 'red' }}> *</Text>;
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 80 : 0}
    >

      {/* <View style={styles.topEditBar}>
        <TouchableOpacity
          onPress={() => setIsProfileEditing(prev => !prev)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={isProfileEditing ? "check-circle-outline" : "pencil-outline"}
            size={26}
            color="#db9a4a"
          />
        </TouchableOpacity>
      </View> */}

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }} // 👈 space for fixed button
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* PROFILE AVATAR */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            {profileImage?.uri ? (
              <Image
                source={{ uri: profileImage.uri }}
                style={styles.avatarImage}
              />
            ) : (
              <MaterialCommunityIcons
                name="account-circle"
                size={110}
                color="#B9B1A8"
              />
            )}


            <TouchableOpacity
              style={styles.cameraIcon}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="camera"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>

          </View>
        </View>

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



        <Modal
          isVisible={otpModalVisible}
          onBackdropPress={() => setOtpModalVisible(false)}
          onBackButtonPress={() => setOtpModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Verify {otpFor === "email" ? "Email" : "Mobile"}
            </Text>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="shield-key"
                size={20}
                color="#db9a4a"
              />
              <TextInput
                value={otp}
                onChangeText={setOtp}
                style={styles.textInput}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Enter OTP"
                placeholderTextColor="#8B7355"
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={verifyAndUpdate}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? "Verifying..." : "VERIFY & UPDATE"}
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>



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
            {dateOfBirth ? formatDobDisplay(dateOfBirth) : 'Select date of birth'}
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
        <Text style={styles.label}>
          Place of Birth<Required />
        </Text>

        <PlaceInput
          value={placeOfBirth}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.textInput}
          iconColor="#db9a4a"
          onSelect={(loc) => {
            setPlaceOfBirth(loc.description);
            setLatitude(loc.latitude);
            setLongitude(loc.longitude);
          }}
        />



        {/* Photo */}
        {/* <Text style={styles.label}>Profile Photo (Optional)</Text>
        <TouchableOpacity
          style={styles.selectPhotoButton}
          onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="camera-outline" size={20} color="#db9a4a" />
          <Text style={styles.selectPhotoText}>SELECT PHOTO</Text>
        </TouchableOpacity>

        {profileImage && (
          <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
        )} */}

        {/* {!isProfile && ( */}

        {/* )} */}
      </ScrollView>
      <View style={styles.fixedFooter}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>
            {isLoading ? 'Submitting...' : 'SUBMIT'}
          </Text>
        </TouchableOpacity>

      </View>



      {/* Modal */}
      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalCard}>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => getProfilePic('capture', {
              mediaType: 'photo',
              quality: 0.8,
              saveToPhotos: true,
              cameraType: 'back',
            })
            }>
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
    </KeyboardAvoidingView>
  );
};

export default SignUpLogin;

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#2C1810' },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  inlineOtpButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderLeftColor: '#E8E4DC',
  },
  topEditBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 0,
    marginTop: -10
  },

  inlineOtpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#db9a4a',
  },

  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8E4DC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },

  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#db9a4a',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FAF8F5',
  },

  label: {
    marginTop: 16,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#2C1810',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 16,
    textAlign: 'center',
  },

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

  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FAF8F5',
    borderTopWidth: 1,
    borderTopColor: '#E8E4DC',
  },

  submitButton: {
    backgroundColor: '#db9a4a',
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitText: { color: '#FFFFFF', fontWeight: '700' },

  modalCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 6 },
  modalOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  modalText: { color: '#2C1810', fontSize: 15 },
});
