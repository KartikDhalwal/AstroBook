import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
  ScrollView,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../apiConfig';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// Responsive sizing helpers
const scale = (size) => (WINDOW_WIDTH / 375) * size; // Base width 375 (iPhone X)
const verticalScale = (size) => (WINDOW_HEIGHT / 812) * size; // Base height 812 (iPhone X)
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;



const MyHeader = () => {
  const navigation = useNavigation();
  const [imageError, setImageError] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [customerData, setCustomerData] = useState(
    {
      customerName: 'User',
      phoneNumber: '1234567890',
      image: null,
    }
  );
  const BASE_URL = 'https://alb-web-assets.s3.ap-south-1.amazonaws.com/';
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


    fetchCustomer();
  }, []);
  const getImageUrl = (path) =>
    path?.startsWith('http') ? path : `${BASE_URL}${path}`;
  const Imguri =
    customerData?.image &&
      typeof customerData.image === 'string' &&
      customerData.image.trim().length > 0
      ? getImageUrl(customerData.image)
      : null;

  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.8)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fetchNotifications = async () => {
    const userData = JSON.parse(await AsyncStorage.getItem('customerData'));

    const res = await axios.get(
      `${api}/mobile/notifications/${userData._id}`
    );

    setNotifications(res.data.notifications);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
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
        toValue: -SCREEN_WIDTH * 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setDrawerVisible(false);
      });
    }
  };
  const toggleDropdown = () => {
    // if (showDropdown) {
    //   Animated.timing(scaleAnim, {
    //     toValue: 0,
    //     duration: 120,
    //     useNativeDriver: true,
    //   }).start(() => setShowDropdown(false));
    // } else {
    //   setShowDropdown(true);
    //   Animated.spring(scaleAnim, {
    //     toValue: 1,
    //     friction: 6,
    //     useNativeDriver: true,
    //   }).start();
    // }
    navigation.navigate('SignUp', { isLogin: false });
  };
  const unreadNotifications = notifications?.filter(n => !n?.isRead) || [];
  const hasUnread = unreadNotifications.length > 0;
  const drawerData = [
    // { title: 'Home', icon: 'home-outline' },
    { title: 'Profile', icon: 'account' },
    { title: 'My Consultations', icon: 'calendar-check-outline' },
    { title: 'Pooja Cart', icon: 'cart' },
    { title: 'Booked Pooja', icon: 'campfire' },
    // { title: 'Order History', icon: 'history' },
    { title: 'Free Kundli', icon: 'book-open-page-variant' },
    { title: 'About Us', icon: 'account-tie' },
    { title: 'Blogs', icon: 'newspaper-variant' },
    { title: 'Contact Us', icon: 'headset' },
    // { title: 'Astrology Blog', icon: 'book-open-page-variant' },
    // { title: 'Chat With Astrologers', icon: 'chat-outline' },
    // { title: 'Free Service', icon: 'gift-outline' },
    // { title: 'Customer Support', icon: 'headset' },
    // { title: 'Settings', icon: 'cog-outline' },
    { title: 'Logout', icon: 'logout' },
    { title: 'Delete Account', icon: 'delete' },
  ];
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

      case 'About Us':
        navigation.navigate('About Us');
        break;
      case 'Blogs':
        navigation.navigate('Blogs');
        break;
      case 'Booked Pooja':
        navigation.navigate('BookedPoojaListScreen');
        break;
      case 'Profile':
        navigation.navigate('SignUp', { isLogin: false });
        break;
      case 'Pooja Cart':
        navigation.navigate('CartScreen');
        break;
      case 'Logout':
        setDrawerVisible(false);
        setTimeout(() => handleLogout(), 300);
        break;

        case 'Delete Account':
          setDrawerVisible(false);
          setTimeout(() => setConfirmDeleteVisible(true), 300);
          break;
        

      case 'Contact Us':
        handleSupport();
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
  const confirmDeleteAccount = async () => {
    try {
      // Get user data
      const storedData = await AsyncStorage.getItem('customerData');
  
      if (!storedData) {
        Alert.alert('Error', 'User data not found');
        return;
      }
  
      const userData = JSON.parse(storedData);
  
      // Call delete API
      const res = await axios.post(
        `${api}/admin/delete-customer`,
        { customerId: userData._id },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );
  
      if (res?.data?.success) {
        // Clear storage
        await AsyncStorage.multiRemove(['customerData', 'isLoggedIn']);
  
        // Small delay to avoid Android navigation race condition
        setTimeout(() => {
          Alert.alert(
            'Account Deleted',
            'Your account has been deleted successfully.'
          );
  
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }, 200);
      } else {
        Alert.alert(
          'Failed',
          res?.data?.message || 'Unable to delete account'
        );
      }
    } catch (error) {
      console.error('Delete account error:', error);
  
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
  
      Alert.alert('Error', message);
    }
  };
  

  const handleSupport = () => {
    setSupportModalVisible(true);
  };

  useEffect(() => {
    setImageError(false);
  }, [customerData?.image]);
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <View>
          <Text style={styles.headerTitle}>AstroBook</Text>
          <Text style={styles.headerSubtitle}>Vedic Astrology</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.notificationButton} onPress={toggleDropdown}>
        <Icon name="account" size={24} color="black" />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={supportModalVisible}
        animationType="fade"
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <Text style={styles.modalTitle}>Contact Information</Text>

            {/* Email */}
            <View style={styles.row}>
              <Icon name="email-outline" size={22} color="#db9a4a" />
              <View style={styles.col}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>info@acharyalavbhushan.com</Text>
              </View>
            </View>

            {/* Website Queries */}
            <View style={styles.row}>
              <Icon name="phone" size={22} color="#db9a4a" />
              <View style={styles.col}>
                <Text style={styles.label}>Consultation related queries</Text>
                <Text style={styles.value}>+91 92579 91666</Text>
              </View>
            </View>

            {/* Reports Queries */}
            {/* <View style={styles.row}>
              <Icon name="phone" size={22} color="#db9a4a" />
              <View style={styles.col}>
                <Text style={styles.label}>Reports related queries</Text>
                <Text style={styles.value}>+91 97837 62666</Text>
              </View>
            </View> */}

            {/* Address */}
            <View style={styles.row}>
              <Icon name="map-marker-outline" size={24} color="#db9a4a" />
              <View style={styles.col}>
                <Text style={styles.label}>Office</Text>
                <Text style={styles.value}>
                  Plot no. 177, Near Suresh Gyan Vihar University,
                  OBC Colony, Jagatpura,{"\n"}
                  Jaipur, Rajasthan
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setSupportModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>



      {/* Drawer Modal */}
      <Modal visible={drawerVisible} animationType="fade" transparent onRequestClose={toggleDrawer}>
        <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={toggleDrawer}>
          <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
              <ScrollView
                contentContainerStyle={{
                  paddingBottom: insets.bottom + 20, // 👈 prevents tab overlap
                }}
                showsVerticalScrollIndicator={false}
              >

                {/* Drawer Header */}
                <View style={styles.drawerHeader}>
                  <View style={styles.profileContainer}>
                    {Imguri && !imageError ? (
                      <View style={styles.avatarWrapper}>
                        <Image
                          source={{ uri: Imguri }}
                          style={styles.avatar}
                          resizeMode="cover"
                          onError={() => setImageError(true)}   // 👈 CRITICAL
                        />
                        <View style={styles.avatarBadge}>
                          <Text style={styles.avatarBadgeText}>✓</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                        <Icon name="account" size={32} color="#fff" />
                      </View>
                    )}


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
                  {drawerData.map((item, idx) => {
                    const isDelete = item.title === 'Delete Account';

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.menuItem,
                          isDelete && styles.deleteMenuItem,
                        ]}
                        onPress={() => handleNavigation(item)}
                      >
                        <View style={styles.menuIconWrapper}>
                          <Icon
                            name={item.icon}
                            size={24}
                            color={isDelete ? '#D32F2F' : '#444'}
                          />
                        </View>

                        <Text
                          style={[
                            styles.menuText,
                            isDelete && styles.deleteMenuText,
                          ]}
                        >
                          {item.title}
                        </Text>

                        <Text
                          style={[
                            styles.menuArrow,
                            isDelete && styles.deleteMenuArrow,
                          ]}
                        >
                          ›
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                </View>

                {/* Social */}
                <View style={styles.socialWrapper}>
                  <Text style={styles.socialText}>Connect With Us</Text>

                  <View style={styles.socialRow}>

                    {/* Facebook */}
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => Linking.openURL('https://www.facebook.com/acharyalavbhushan09/')}
                    >
                      <Icon name="facebook" size={26} color="#9C7A56" />
                    </TouchableOpacity>

                    {/* Instagram */}
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => Linking.openURL('https://www.instagram.com/acharyalavbhushan/')}
                    >
                      <Icon name="instagram" size={26} color="#9C7A56" />
                    </TouchableOpacity>

                    {/* LinkedIn */}
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => Linking.openURL('https://www.linkedin.com/in/acharyalavbhushan/')}
                    >
                      <Icon name="linkedin" size={26} color="#9C7A56" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => Linking.openURL('https://www.youtube.com/@acharyalavbhushan')}
                    >
                      <Icon name="youtube" size={26} color="#9C7A56" />
                    </TouchableOpacity>

                  </View>
                </View>
                <Text style={styles.versionText}>Version 1.0.0</Text>
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={toggleDropdown}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={toggleDropdown}
        >
          <Animated.View
            style={[
              styles.dropdownContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            {/* Arrow */}
            <View style={styles.arrowUp} />

            <View style={styles.dropdownBox}>
              <Text style={styles.title}>Notifications</Text>

              <ScrollView style={{ maxHeight: 250 }}>
                {notifications.length === 0 ? (
                  <Text style={{ color: '#777', textAlign: 'center' }}>
                    No notifications
                  </Text>
                ) : (
                  notifications
                    .filter(item => !item?.isRead)
                    .map(item => (
                      <TouchableOpacity
                        key={item._id}
                        style={styles.notificationItem}
                      >
                        <Text style={styles.notificationText}>
                          • {item.title}
                        </Text>
                      </TouchableOpacity>
                    ))
                )}
              </ScrollView>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      <Modal transparent visible={confirmDeleteVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={{ marginBottom: 16 }}>
              This action is permanent. Do you want to continue?
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => setConfirmDeleteVisible(false)}
                style={{ marginRight: 16 }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setConfirmDeleteVisible(false);
                  confirmDeleteAccount(); // API call
                }}
              >
                <Text style={{ color: '#D32F2F', fontWeight: '700' }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default MyHeader;
const styles = StyleSheet.create({
  /* ================= HEADER ================= */
  drawerHeader: {
    backgroundColor: '#db9a4a',
    paddingTop: 50,
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
    borderColor: 'rgba(255,255,255,0.3)',
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

  headerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  avatarPlaceholder: {
    backgroundColor: '#db9a4a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  userInfo: {
    marginLeft: 16,
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
    backgroundColor: 'rgba(255,255,255,0.25)',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    elevation: 3,
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  dropdownContainer: {
    position: 'absolute',
    top: 70,          // below header
    right: 15,
    alignItems: 'flex-end',
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
    flex: 1,
    alignItems: 'center',
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

  /* ================= NOTIFICATION DROPDOWN ================= */
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  deleteMenuItem: {
    backgroundColor: '#FFF1F1',
  },

  deleteMenuText: {
    color: '#D32F2F',
    fontWeight: '600',
  },

  deleteMenuArrow: {
    color: '#D32F2F',
  },


  arrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#db9a4a',
    marginRight: 10,
    marginTop: -6,
  },

  dropdownBox: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  title: {
    fontWeight: '700',
    marginBottom: 10,
    fontSize: 16,
  },

  notificationItem: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },

  notificationText: {
    fontSize: 14,
    color: '#333',
  },

  /* ================= SUPPORT MODAL ================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    elevation: 8,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },

  col: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: '#9C7A56',
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    color: '#2C1810',
    fontWeight: '500',
    lineHeight: 18,
  },
  avatarContainer: {
    width: moderateScale(36),
    marginRight: scale(8),
    marginBottom: verticalScale(2)
  },
  // avatar: {
  //   width: moderateScale(36),
  //   height: moderateScale(36),
  //   borderRadius: moderateScale(18),
  //   borderWidth: 2,
  //   borderColor: "#E5E7EB"
  // },
  avatarPlaceholder: {
    backgroundColor: "#db9a4a",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#c28940"
  },
  avatarText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#fff"
  },
  avatarSpacer: {
    width: moderateScale(36),
    height: moderateScale(36)
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: '#db9a4a',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  modalButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ================= DRAWER ================= */
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },

  drawerContainer: {
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 320,
    height: SCREEN_HEIGHT,
    backgroundColor: '#FFFFFF',
  },

  // drawerHeader: {
  //   backgroundColor: '#db9a4a',
  //   paddingTop: 50,
  //   paddingBottom: 24,
  //   borderBottomRightRadius: 24,
  // },

  // profileContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 20,
  // },
  // avatarWrapper: {
  //   position: 'relative',
  // },
  // avatar: {
  //   width: 80,
  //   height: 80,
  //   borderRadius: 42,
  // },
  // avatarBadge: {
  //   position: 'absolute',
  //   bottom: 0,
  //   right: 0,
  //   width: 24,
  //   height: 24,
  //   borderRadius: 12,
  //   backgroundColor: '#4CAF50',
  //   borderWidth: 2,
  //   borderColor: '#FFFFFF',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  headerAvatarContainer: {
    position: "relative"
  },
  // headerAvatar: {
  //   width: moderateScale(52),
  //   height: moderateScale(52),
  //   borderRadius: moderateScale(26),
  //   borderWidth: 3,
  //   borderColor: "rgba(255,255,255,0.3)"
  // },
  // avatarBadgeText: {
  //   color: '#FFFFFF',
  //   fontSize: 12,
  //   fontWeight: '700',
  // },

  // userInfo: {
  //   marginLeft: 12,
  //   flex: 1,
  // },

  // userName: {
  //   fontSize: 18,
  //   fontWeight: '700',
  //   color: '#FFFFFF',
  // },

  // phoneText: {
  //   fontSize: 13,
  //   color: '#FFF5E6',
  //   marginTop: 2,
  // },

  // premiumBadge: {
  //   backgroundColor: 'rgba(255,255,255,0.25)',
  //   alignSelf: 'flex-start',
  //   paddingHorizontal: 10,
  //   paddingVertical: 4,
  //   borderRadius: 12,
  //   marginTop: 6,
  // },

  // premiumText: {
  //   color: '#FFFFFF',
  //   fontSize: 11,
  //   fontWeight: '600',
  // },

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
    alignItems: 'center',
    marginRight: 10,
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
    gap: 12,
  },

  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  versionText: {
    color: '#999',
    fontSize: 11,
    textAlign: 'center',
    marginVertical: 24,
  },
});
