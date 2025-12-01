import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
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
  Modal,
  StatusBar,
  Animated,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('screen');

const AstroTalkHome = ({ customerData: propCustomerData }) => {
  const [reviews, setReviews] = useState([]);
  const flatListRef = useRef(null);
  const currentIndex = useRef(0);
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const storedData = await AsyncStorage.getItem("customerData");
        console.log({ storedData })
        if (storedData) {
          setCustomerData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Error reading customerData:", error);
      }
    };
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`https://api.acharyalavbhushan.com/api/customers/get-feedback`, {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log(response?.data, 'response?.data')
        if (response?.data?.success) {
          setReviews(response?.data?.data || []);
        }
      } catch (error) {
        console.error("Error reading customerData:", error);
      }
    };

    fetchCustomer();
    fetchReviews();
  }, []);
  useEffect(() => {
    if (reviews.length === 0) return;

    const interval = setInterval(() => {
      currentIndex.current =
        (currentIndex.current + 1) % reviews.length;

      flatListRef.current?.scrollToIndex({
        index: currentIndex.current,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [reviews]);

  const renderItem = ({ item }) => {
    console.log(getImageUrl(item.image))
    return (
      <View style={styles.card}>
        {/* <Text style={styles.quote}>“</Text> */}
        <Text style={styles.reviewText}>{item.review}</Text>

        <View style={styles.footer}>
          {/* {item.image ? (
            <Image
              source={{ uri: getImageUrl(item.image) }}
              style={styles.avatar}
            />
          ) : ( */}
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {item.name?.charAt(0) || "U"}
            </Text>
          </View>
          {/* )} */}

          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.rating}>
              {"⭐".repeat(item.rating || 5)}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  const navigation = useNavigation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [customerData, setCustomerData] = useState(
    {
      customerName: 'User',
      phoneNumber: '1234567890',
      image: null,
    }
  );
  // useEffect(()=>{

  // })
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;

  const drawerData = [
    { title: 'Home', icon: 'home-outline' },
    { title: 'My Consultations', icon: 'calendar-check-outline' },
    // { title: 'Order History', icon: 'history' },
    { title: 'Free Kundli', icon: 'book-open-page-variant' },
    { title: 'About Us', icon: 'book-open-page-variant' },
    // { title: 'Astrology Blog', icon: 'book-open-page-variant' },
    // { title: 'Chat With Astrologers', icon: 'chat-outline' },
    // { title: 'Free Service', icon: 'gift-outline' },
    // { title: 'Customer Support', icon: 'headset' },
    // { title: 'Settings', icon: 'cog-outline' },
    { title: 'Logout', icon: 'logout' },
  ];

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
      }).start(() => {
        setDrawerVisible(false);
      });
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('customerData');
            await AsyncStorage.removeItem('isLoggedIn');
            navigation.replace('Login');
          } catch (error) {
            console.error('Error during logout:', error);
          }
        },
      },
    ]);
  };

  const handleNavigation = (item) => {
    const { title } = item;
    setDrawerVisible(false);

    switch (title) {
      case 'My Consultations':
        navigation.navigate('UserConsultationList');
        break;
      case 'Free Kundli':
        navigation.navigate('Free Kundli');
        break;
      case 'Chat With Astrologers':
        navigation.navigate('PoojaList');
        break;
      case 'About Us':
        navigation.navigate('About Us');
        break;
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
  const BASE_URL = 'https://api.acharyalavbhushan.com/uploads/';

  const getImageUrl = (path) =>
    path?.startsWith('http') ? path : `${BASE_URL}${path}`;
  let Imguri = getImageUrl(customerData.image);
  console.log(Imguri, 'Imguri')
  // let Imguri = customerData.image;
  // const isDefault = Imguri?.endsWith('user_default.jpg');
  // if (isDefault) Imguri = null;
  console.log(customerData)
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {/* ✅ Logo added here */}

          {/* <Image
            source={require('../assets/images/logoBlack.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          /> */}
          <View>
            <Text style={styles.headerTitle}>AstroBook</Text>
            <Text style={styles.headerSubtitle}>Vedic Astrology</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell-outline" size={24} color="black" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>


      {/* Scroll Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.bannerGradient}>
            <Text style={styles.bannerTitle}>Hi {customerData?.customerName}</Text>
            <Text style={styles.bannerTitle}>Talk to India's Best</Text>
            <Text style={styles.bannerTitleHighlight}>Astrologers</Text>
            <Text style={styles.bannerSubtitle}>Get accurate predictions & personalized remedies</Text>

            <TouchableOpacity style={styles.bannerButton} onPress={() => navigation.navigate('AstrolgersList', { mode: 'video' })}>
              <Text style={styles.bannerButtonText}>Consult Now</Text>
              <Icon name="arrow-right" size={24} color="#db9a4a" />
            </TouchableOpacity>
          </View>
          <View style={styles.bannerDecoration}>
            <Text style={styles.bannerEmoji}>✨</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Consultations</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>20+</Text>
            <Text style={styles.statLabel}>Years of Experience</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Privacy</Text>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AstrolgersList', { mode: 'voice' })}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                <Icon name="phone-in-talk" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Voice Call</Text>
              <Text style={styles.actionSubtext}>with Expert</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AstrolgersList', { mode: 'video' })}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                <Icon name="video-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Video Call</Text>
              <Text style={styles.actionSubtext}>Face to Face</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AstrolgersList', { mode: 'chat' })}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                <Icon name="chat-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Chat</Text>
              <Text style={styles.actionSubtext}>Instant Reply</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                <Icon name="campfire" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Puja</Text>
              <Text style={styles.actionSubtext}>Book Online Puja</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Free Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Free Services</Text>
              <Text style={styles.sectionSubtitle}>Explore our complimentary offerings</Text>
            </View>
            {/* <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>
                View All <Icon name="arrow-right" size={12} color="#db9a4a" />
              </Text>
            </TouchableOpacity> */}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
            <TouchableOpacity
              style={styles.serviceCardEnhanced}
              onPress={() => navigation.navigate('HoroscopeScreen')}
            >
              <View style={styles.serviceIconContainer}>
                <Icon name="crystal-ball" size={28} color="#db9a4a" />
              </View>
              <Text style={styles.serviceTitle}>Daily Horoscope</Text>
              <Text style={styles.serviceDescription}>Your daily predictions</Text>
              <View style={styles.serviceBadge}>
                <Text style={styles.serviceBadgeText}>FREE</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceCardEnhanced}
              onPress={() => navigation.navigate('KundliMatchingScreen')}
            >
              <View style={styles.serviceIconContainer}>
                <Icon name={'heart-outline'} size={28} color="#db9a4a" />
              </View>
              <Text style={styles.serviceTitle}>Kundli Matching</Text>
              <Text style={styles.serviceDescription}>Marriage compatibility</Text>
              <View style={styles.serviceBadge}>
                <Text style={styles.serviceBadgeText}>FREE</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceCardEnhanced}
              onPress={() => navigation.navigate('Free Kundli')}
            >
              <View style={styles.serviceIconContainer}>
                <Icon name={'book-open-page-variant'} size={28} color="#db9a4a" />
              </View>
              <Text style={styles.serviceTitle}>Free Kundli</Text>
              <Text style={styles.serviceDescription}>Birth chart analysis</Text>
              <View style={styles.serviceBadge}>
                <Text style={styles.serviceBadgeText}>FREE</Text>
              </View>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.serviceCardEnhanced}
              onPress={() => navigation.navigate('PoojaList')}
            >
              <View style={styles.serviceIconContainer}>
                <Icon name={'cards-outline'} size={28} color="#db9a4a" />
              </View>
              <Text style={styles.serviceTitle}>Astro Remedies</Text>
              <Text style={styles.serviceDescription}>Card predictions</Text>
              <View style={styles.serviceBadge}>
                <Text style={styles.serviceBadgeText}>FREE</Text>
              </View>
            </TouchableOpacity> */}
          </ScrollView>
        </View>

        {/* Special Offerings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Offerings</Text>

          <TouchableOpacity style={styles.specialCard} onPress={() => navigation.navigate('PoojaList')}>
            <View style={styles.specialLeft}>
              <Icon name="campfire" size={36} color="#db9a4a" />
            </View>
            <View style={styles.specialMiddle}>
              <Text style={styles.specialTitle}>Book a Pooja</Text>
              <Text style={styles.specialDescription}>Personalized rituals for prosperity</Text>
              <View style={styles.specialRating}>
                <Text style={styles.specialRatingText}>⭐ 4.9 • 2K+ bookings</Text>
              </View>
            </View>
            <View style={styles.specialRight}>
              <Icon name="arrow-right" size={24} color="#db9a4a" />
            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.specialCard}>
            <View style={styles.specialLeft}>
              <Icon name="om" size={36} color="#db9a4a" />
            </View>
            <View style={styles.specialMiddle}>
              <Text style={styles.specialTitle}>Astro Remedies</Text>
              <Text style={styles.specialDescription}>Gemstones & spiritual solutions</Text>
              <View style={styles.specialRating}>
                <Text style={styles.specialRatingText}>⭐ 4.8 • Verified products</Text>
              </View>
            </View>
            <View style={styles.specialRight}>
              <Icon name="arrow-right" size={24} color="#db9a4a" />
            </View>
          </TouchableOpacity> */}
        </View>

        {/* Testimonial Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Our Users Say</Text>

          <FlatList
            ref={flatListRef}
            data={reviews}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Drawer Modal */}
      <Modal visible={drawerVisible} animationType="fade" transparent onRequestClose={toggleDrawer}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={toggleDrawer}>
          <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
              <ScrollView>
                {/* Drawer Header */}
                <View style={styles.drawerHeader}>
                  <View style={styles.profileContainer}>
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={{ uri: Imguri }}
                        style={styles.avatar}
                      />
                      <View style={styles.avatarBadge}>
                        <Text style={styles.avatarBadgeText}>✓</Text>
                      </View>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{customerData.customerName}</Text>
                      <Text style={styles.phoneText}>{customerData.phoneNumber}</Text>
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumText}>⭐ Premium User</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Drawer Menu */}
                <View style={styles.menuWrapper}>
                  {drawerData.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.menuItem}
                      onPress={() => handleNavigation(item)}
                    >
                      <View style={styles.menuIconWrapper}>
                        <Icon name={item.icon} size={24} color="#444" />
                      </View>

                      <Text style={styles.menuText}>{item.title}</Text>

                      <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Social */}
                <View style={styles.socialWrapper}>
                  <Text style={styles.socialText}>Connect With Us</Text>

                  <View style={styles.socialRow}>

                    {/* Facebook */}
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => Linking.openURL('https://www.facebook.com/')}
                    >
                      <Icon name="facebook" size={26} color="#9C7A56" />
                    </TouchableOpacity>

                    {/* Instagram */}
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => Linking.openURL('https://www.instagram.com/')}
                    >
                      <Icon name="instagram" size={26} color="#9C7A56" />
                    </TouchableOpacity>

                    {/* LinkedIn */}
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => Linking.openURL('https://www.linkedin.com/')}
                    >
                      <Icon name="linkedin" size={26} color="#9C7A56" />
                    </TouchableOpacity>

                  </View>
                </View>
                <Text style={styles.versionText}>Version 1.0.0</Text>
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default AstroTalkHome;


const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    backgroundColor: "#FFFFFF",
    marginRight: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#db9a4a",
  },
  reviewText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#db9a4a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C1810",
  },
  rating: {
    fontSize: 12,
    color: "#db9a4a",
    marginTop: 2,
  },

  container: {
    flex: 1,
    backgroundColor: '#F8F4EF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    elevation: 3,
    marginTop: 30
  },

  menuButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },

  menuLine: {
    width: 22,
    height: 2,
    backgroundColor: '#000',
    marginVertical: 2,
    borderRadius: 1,
  },

  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0, // for spacing between logo and text
  },

  headerLogo: {
    width: 60,
    height: 60,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1810',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#9C7A56',
    marginTop: -2,
  },

  notificationButton: {
    padding: 8,
    position: 'relative',
  },

  notificationBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },


  notificationIcon: {
    fontSize: 20,
  },

  content: {
    flex: 1,
  },
  heroBanner: {
    backgroundColor: '#7F1D1D',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerGradient: {
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  bannerTitleHighlight: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: -4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#FFF5E6',
    marginTop: 8,
    opacity: 0.9,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 16,
  },
  bannerButtonText: {
    color: '#db9a4a',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 8,
  },
  bannerButtonIcon: {
    color: '#db9a4a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerDecoration: {
    position: 'absolute',
    right: -10,
    top: -10,
    opacity: 0.15,
  },
  bannerEmoji: {
    fontSize: 120,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#db9a4a',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    color: '#db9a4a',
    fontSize: 13,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C1810',
    textAlign: 'center',
  },
  actionSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  servicesScroll: {
    paddingRight: 16,
  },
  serviceCardEnhanced: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C1810',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 11,
    color: '#666',
  },
  serviceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  serviceBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  specialCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: 'center',
  },
  specialLeft: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  specialIcon: {
    fontSize: 28,
  },
  specialMiddle: {
    flex: 1,
  },
  specialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C1810',
    marginBottom: 4,
  },
  specialDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  specialRating: {
    flexDirection: 'row',
  },
  specialRatingText: {
    fontSize: 11,
    color: '#999',
  },
  specialRight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialArrow: {
    fontSize: 18,
    color: '#db9a4a',
    fontWeight: 'bold',
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#db9a4a',
  },
  quoteIcon: {
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 40,
    color: '#FFD580',
    fontWeight: 'bold',
    lineHeight: 40,
  },
  testimonialText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  testimonialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#db9a4a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  testimonialAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C1810',
  },
  testimonialRating: {
    fontSize: 12,
    marginTop: 2,
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
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    backgroundColor: '#db9a4a',
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomRightRadius: 24,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  phoneText: {
    fontSize: 13,
    color: '#FFF5E6',
    marginTop: 2,
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  menuWrapper: {
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuIconWrapper: {
    width: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  menuIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 15,
    color: '#2C1810',
    fontWeight: '500',
    flex: 1,
  },
  menuArrow: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  socialWrapper: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0E8DC',
  },
  socialText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  socialIconSmall: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  versionText: {
    color: '#999',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
});