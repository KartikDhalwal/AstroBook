import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import api from '../apiConfig';
import MyLoader from '../components/MyLoader';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('screen');

const VoiceCall = ({  customerData: initialCustomerData }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [astrologers, setAstrologers] = useState([]);
  const [customerData] = useState(
    initialCustomerData || {
      customerName: 'User',
      phoneNumber: '1234567890',
      image: null,
    }
  );
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;

  const drawerData = [
    { title: 'Home', image: require('../assets/astrobookimages/drawer/home.png') },
    { title: 'Book a Pooja', image: require('../assets/astrobookimages/drawer/pooja.png') },
    { title: 'Customer Support', image: require('../assets/astrobookimages/drawer/customer.png') },
    { title: 'Wallet Transactions', image: require('../assets/astrobookimages/drawer/wallet.png') },
    { title: 'Order History', image: require('../assets/astrobookimages/drawer/order.png') },
    { title: 'Astro Remedy', image: require('../assets/astrobookimages/drawer/astro.png') },
    { title: 'Astrology Blog', image: require('../assets/astrobookimages/drawer/astrology.png') },
    { title: 'Chat With Astrologers', image: require('../assets/astrobookimages/drawer/chatwith.png') },
    { title: 'My Following', image: require('../assets/astrobookimages/drawer/follow.png') },
    { title: 'My Message', image: require('../assets/astrobookimages/drawer/follow.png') },
    { title: 'Free Service', image: require('../assets/astrobookimages/drawer/free_service.png') },
    { title: 'Settings', image: require('../assets/astrobookimages/drawer/setting.png') },
    { title: 'Logout', image: require('../assets/astrobookimages/drawer/logout.png') },
  ];

  // Drawer animation toggle
  const toggleDrawer = () => {
    if (!drawerVisible) {
      setDrawerVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width * 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDrawerVisible(false));
    }
  };

  // Handle navigation menu clicks
  const handleNavigation = (item) => {
    const { title } = item;
    setDrawerVisible(false);

    switch (title) {
      case 'Logout':
        handleLogout();
        break;
      case 'Astro Remedy':
        Linking.openURL('https://lifechangingastro.com/').catch(() =>
          Alert.alert('Error', 'Unable to open URL')
        );
        break;
      default:
        Alert.alert('Navigation', `Navigate to: ${title}`);
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Logged out', 'You are logged out successfully.');
        },
      },
    ]);
  };

  // Fetch astrologers from API
  const getAstrologerData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${api}/astrologer/get-all-astrologers`, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(response.data.success, 'success')
      if (response?.data?.success) {
        setAstrologers(response?.data?.astrologer || []);
      } else {
        Alert.alert('No Data', 'No astrologers found.');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Unable to get astrologer data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAstrologerData();
  }, []);

  let Imguri = customerData.image;
  const isDefault = Imguri?.endsWith('user_default.jpg');
  if (isDefault) Imguri = null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFA500" />
      <MyLoader isVisible={isLoading} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.hamburger}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acharya Lav Bhushan</Text>
        <TouchableOpacity>{/* Wallet Button (optional) */}</TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <View style={[styles.section, styles.highlightSection]}>
          <Text style={styles.sectionTitle}>🌟 Top Astrologers 🌟</Text>

          {astrologers.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#999' }}>No astrologers available.</Text>
          ) : (
            astrologers.map((astro, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.astrologerCardHighlight, { transform: [{ scale: 1 }] }]}
                onPress={() => navigation.navigate('AstrologerDetailsScreen', { astrologer: astro })}
              >

                <View style={styles.astrologerAvatarGlow} >
                  <Image
                    source={
                      astro.profile_image}
                    style={styles.avatar}
                  />
                </View>

                <View style={styles.astrologerInfo}>
                  <Text style={styles.astrologerName}>{astro.astrologerName || 'Unknown'}</Text>
                  <Text style={styles.astrologerExp}>
                    {astro.experience
                      ? `${astro.experience} Years Experience`
                      : 'Experience N/A'}
                  </Text>
                  <Text style={styles.astrologerLang}>
                    {astro.tagLine || ''}
                  </Text>
                </View>

                <View style={styles.astrologerAction}>
                  <Text style={styles.ratingText}>⭐ {astro.rating || '4.5'}</Text>

                  <TouchableOpacity
                    style={styles.voiceBtn}
                    onPress={() =>
                      navigation.navigate('VoiceVideoCallScreen', {
                        isVideo: false,
                        userName: astro.name,
                      })
                    }
                  >
                    <Text style={styles.voiceBtnText}>🔊 Voice</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.videoBtn}
                    onPress={() =>
                      navigation.navigate('VoiceVideoCallScreen', {
                        isVideo: true,
                        userName: astro.name,
                      })
                    }
                  >
                    <Text style={styles.videoBtnText}>🎥 Video</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFA500',
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  hamburger: {
    padding: 5,
  },
  hamburgerLine: {
    width: 24,
    height: 3,
    backgroundColor: '#fff',
    marginVertical: 2,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  walletText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  banner: {
    backgroundColor: '#FFF9E6',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF8C00',
    textAlign: 'center',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF4DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    alignItems: 'center',
    width: 120,
    elevation: 2,
  },
  serviceEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  astrologerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    alignItems: 'center',
  },
  astrologerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFA500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  astrologerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  astrologerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  astrologerExp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  astrologerLang: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  astrologerAction: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 6,
  },
  chatBtn: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chatBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  drawerContainer: {
    width: width * 0.8,
    height: height,
    backgroundColor: '#fff',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: '#FFA500',
    borderRadius: width * 0.09,
    overflow: 'hidden',
  },
  avatar: {
    width: width * 0.18,
    height: width * 0.18,
  },
  userInfo: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  phoneText: {
    fontSize: 13,
    color: '#696969',
    marginTop: 3,
  },
  menuWrapper: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  menuIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  socialWrapper: {
    marginTop: 20,
    paddingHorizontal: 25,
  },
  socialText: {
    fontSize: 12,
    color: '#424141',
    marginBottom: 8,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  socialIconSmall: {
    width: 30,
    height: 30,
  },
  versionText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  highlightSection: {
    // backgroundColor: '#FFF9E8',
    // borderRadius: 16,
    // paddingVertical: 15,
    // marginHorizontal: 10,
    // marginTop: 10,
    // shadowColor: '#FFA500',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.3,
    // shadowRadius: 6,
    // elevation: 6,
  },

  astrologerCardHighlight: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD580',
  },

  astrologerAvatarGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,165,0,0.15)',
    marginRight: 10,
  },

  voiceBtn: {
    backgroundColor: '#FFAE42',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    marginBottom: 6,
  },
  voiceBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },

  videoBtn: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  videoBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },

});
export default VoiceCall;

