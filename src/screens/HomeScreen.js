import React, { Component } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('screen');


export default class AstroTalkHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
      customerData: props.customerData || {
        customerName: 'User',
        phoneNumber: '1234567890',
        image: null,
      },
    };
    this.slideAnim = new Animated.Value(-width * 0.8);

    this.drawerData = [
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
  }

  toggleDrawer = () => {
    if (!this.state.drawerVisible) {
      this.setState({ drawerVisible: true }, () => {
        Animated.timing(this.slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      Animated.timing(this.slideAnim, {
        toValue: -width * 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        this.setState({ drawerVisible: false });
      });
    }
  };

  handleNavigation = (item) => {
    const { title } = item;
    this.setState({ drawerVisible: false });

    switch (title) {
      case 'Logout':
        this.handleLogout();
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

  handleLogout = () => {
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

  render() {
    const { customerData, drawerVisible } = this.state;
    let Imguri = customerData.image;
    const isDefault = Imguri?.endsWith('user_default.jpg');
    if (isDefault) Imguri = null;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={this.toggleDrawer} style={styles.menuButton}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AstroBook</Text>
            <Text style={styles.headerSubtitle}>Vedic Astrology</Text>
          </View>

          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="bell-outline" size={24} color="black" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.bannerGradient}>
              <Text style={styles.bannerTitle}>Talk to India's Best</Text>
              <Text style={styles.bannerTitleHighlight}>Astrologers</Text>
              <Text style={styles.bannerSubtitle}>Get accurate predictions & personalized remedies</Text>

              <TouchableOpacity style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>Consult Now</Text>
                <Icon name="arrow-right" size={24} color="#db9a4a" />
              </TouchableOpacity>
            </View>
            <View style={styles.bannerDecoration}>
              <Text style={styles.bannerEmoji}>✨</Text>
            </View>
          </View>

          {/* Quick Stats */}
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

          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionCard} >
                <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                  <Icon name={'phone-in-talk'} size={28} color="#ffffffff" />
                </View>
                <Text style={styles.actionText}>Voice Call</Text>
                <Text style={styles.actionSubtext}>with Expert</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                  <Icon name={'video-outline'} size={28} color="#ffffffff" />
                </View>
                <Text style={styles.actionText}>Video Call</Text>
                <Text style={styles.actionSubtext}>Face to Face</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
               <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                  <Icon name={'chat-outline'} size={28} color="#ffffffff" />
                </View>
                <Text style={styles.actionText}>Live Chat</Text>
                <Text style={styles.actionSubtext}>Instant Reply</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <View style={[styles.actionIconWrapper, { backgroundColor: '#db9a4a' }]}>
                  <Icon name={'file-document-outline'} size={28} color="#ffffffff" />
                </View>
                <Text style={styles.actionText}>Get Report</Text>
                <Text style={styles.actionSubtext}>Detailed</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Free Services Carousel */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Free Services</Text>
                <Text style={styles.sectionSubtitle}>Explore our complimentary offerings</Text>
              </View>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All <Icon name="arrow-right" size={12} color="#db9a4a" /></Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesScroll}
            >
              <TouchableOpacity
                style={styles.serviceCardEnhanced}
                onPress={() => this.props.navigation.navigate('ShowHoroscope')}
              >
                <View style={styles.serviceIconContainer}>
                  <Icon name={'crystal-ball'} size={28} color="#db9a4a" />
                </View>
                <Text style={styles.serviceTitle}>Daily Horoscope</Text>
                <Text style={styles.serviceDescription}>Your daily predictions</Text>
                <View style={styles.serviceBadge}>
                  <Text style={styles.serviceBadgeText}>FREE</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceCardEnhanced}>
                <View style={styles.serviceIconContainer}>
                  <Icon name={'heart-outline'} size={28} color="#db9a4a" />
                </View>
                <Text style={styles.serviceTitle}>Kundli Matching</Text>
                <Text style={styles.serviceDescription}>Marriage compatibility</Text>
                <View style={styles.serviceBadge}>
                  <Text style={styles.serviceBadgeText}>FREE</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceCardEnhanced}>
                <View style={styles.serviceIconContainer}>
                  <Icon name={'account-star-outline'} size={28} color="#db9a4a" />
                </View>
                <Text style={styles.serviceTitle}>Free Kundli</Text>
                <Text style={styles.serviceDescription}>Birth chart analysis</Text>
                <View style={styles.serviceBadge}>
                  <Text style={styles.serviceBadgeText}>FREE</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceCardEnhanced}>
                <View style={styles.serviceIconContainer}>
                  <Icon name={'cards-outline'} size={28} color="#db9a4a" />
                </View>
                <Text style={styles.serviceTitle}>Tarot Reading</Text>
                <Text style={styles.serviceDescription}>Card predictions</Text>
                <View style={styles.serviceBadge}>
                  <Text style={styles.serviceBadgeText}>FREE</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Special Offerings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Offerings</Text>

            <TouchableOpacity style={styles.specialCard}>
              <View style={styles.specialLeft}>
                <Icon name="hand-heart" size={36} color="#db9a4a" />
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

            <TouchableOpacity style={styles.specialCard}>
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
            </TouchableOpacity>
          </View>

          {/* Testimonial Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What Our Users Say</Text>
            <View style={styles.testimonialCard}>
              <View style={styles.quoteIcon}>
                <Text style={styles.quoteText}>"</Text>
              </View>
              <Text style={styles.testimonialText}>
                The predictions were incredibly accurate! The astrologer understood my concerns and provided practical solutions.
              </Text>
              <View style={styles.testimonialFooter}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialAvatarText}>RS</Text>
                </View>
                <View>
                  <Text style={styles.testimonialName}>Rajesh Sharma</Text>
                  <Text style={styles.testimonialRating}>⭐⭐⭐⭐⭐</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Side Drawer Modal */}
        <Modal
          visible={drawerVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={this.toggleDrawer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={this.toggleDrawer}
          >
            <Animated.View
              style={[
                styles.drawerContainer,
                { transform: [{ translateX: this.slideAnim }] }
              ]}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                style={{ flex: 1 }}
              >
                <ScrollView>
                  {/* Enhanced Profile Section */}
                  <View style={styles.drawerHeader}>
                    <View style={styles.profileContainer}>
                      <View style={styles.avatarWrapper}>
                        <Image
                          source={
                            Imguri
                              ? { uri: Imguri }
                              : require('../assets/images/user_img.png')
                          }
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

                  {/* Menu Items */}
                  <View style={styles.menuWrapper}>
                    {this.drawerData.map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.menuItem}
                        onPress={() => this.handleNavigation(item)}
                      >
                        <View style={styles.menuIconWrapper}>
                          <Image source={item.image} style={styles.menuIcon} />
                        </View>
                        <Text style={styles.menuText}>{item.title}</Text>
                        <Text style={styles.menuArrow}>›</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Social Links */}
                  <View style={styles.socialWrapper}>
                    <Text style={styles.socialText}>Connect With Us</Text>
                    <View style={styles.socialRow}>
                      <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => Linking.openURL('https://www.facebook.com/')}
                      >
                        <Image
                          source={require('../assets/astrobookimages/drawer/facebook.png')}
                          style={styles.socialIcon}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => Linking.openURL('https://www.instagram.com/')}
                      >
                        <Image
                          source={require('../assets/astrobookimages/drawer/instagram.png')}
                          style={styles.socialIcon}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => Linking.openURL('https://www.linkedin.com/')}
                      >
                        <Image
                          source={require('../assets/astrobookimages/drawer/link.png')}
                          style={styles.socialIconSmall}
                        />
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
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4EF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: 'black',
    marginVertical: 2,
    borderRadius: 2,
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
    fontSize: 11,
    color: '#db9a4a',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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