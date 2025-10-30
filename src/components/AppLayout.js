import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('screen');

const AppLayout = ({ children, navigation, customerData }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;

  const drawerData = [
    { title: 'Home', image: require('../assets/astrobookimages/drawer/home.png'), screen: 'Home' },
    { title: 'Book a Pooja', image: require('../assets/astrobookimages/drawer/pooja.png'), screen: 'BookPooja' },
    { title: 'Customer Support', image: require('../assets/astrobookimages/drawer/customer.png'), screen: 'Support' },
    { title: 'Settings', image: require('../assets/astrobookimages/drawer/setting.png'), screen: 'Settings' },
    { title: 'Logout', image: require('../assets/astrobookimages/drawer/logout.png') },
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
      }).start(() => setDrawerVisible(false));
    }
  };

  const handleNavigation = (item) => {
    toggleDrawer();
    if (item.title === 'Logout') {
      Alert.alert('Logout', 'Do you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => Alert.alert('Logged out') },
      ]);
    } else if (item.title === 'Astro Remedy') {
      Linking.openURL('https://lifechangingastro.com/');
    } else if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  const Imguri = customerData?.image || null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFA500" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.hamburger}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acharya Lav Bhushan</Text>
        <TouchableOpacity>
          <Text style={styles.walletText}>₹ 0</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* Drawer */}
      <Modal visible={drawerVisible} transparent animationType="fade" onRequestClose={toggleDrawer}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={toggleDrawer}>
          <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
            <TouchableOpacity activeOpacity={1}>
              <ScrollView>
                <View style={styles.profileContainer}>
                  <Image
                    source={Imguri ? { uri: Imguri } : require('../assets/images/user_img.png')}
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{customerData?.customerName || 'User'}</Text>
                    <Text style={styles.phoneText}>{customerData?.phoneNumber || '1234567890'}</Text>
                  </View>
                </View>

                {drawerData.map((item, idx) => (
                  <TouchableOpacity key={idx} style={styles.menuItem} onPress={() => handleNavigation(item)}>
                    <Image source={item.image} style={styles.menuIcon} />
                    <Text style={styles.menuText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default AppLayout;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFA500',
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  walletText: { color: '#fff', fontWeight: 'bold' },
  hamburger: { padding: 5 },
  hamburgerLine: { width: 24, height: 3, backgroundColor: '#fff', marginVertical: 2, borderRadius: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  drawerContainer: { width: width * 0.8, height, backgroundColor: '#fff', paddingTop: 40 },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  phoneText: { fontSize: 13, color: '#666' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  menuIcon: { width: 22, height: 22, marginRight: 10 },
  menuText: { fontSize: 15, color: '#333' },
});
