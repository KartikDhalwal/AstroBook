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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../apiConfig';
import Toast from "react-native-toast-message";

const BASE_URL =
  'https://alb-web-assets.s3.ap-south-1.amazonaws.com/acharyalavbhushan';

const PoojaDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { pooja } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return `${path}?format=jpg`;
    return `${BASE_URL}${path}?format=jpg`;
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const fetchCart = async (customerId) => {
    const res = await axios.post(`${api}/puja/get_cart`, { customerId });
    setCartData(res?.data?.data || null);
  };

  const handleCart = async () => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please choose date before booking.');
      return;
    }

    try {
      setCartLoading(true);

      const raw = await AsyncStorage.getItem('customerData');
      const customer = raw ? JSON.parse(raw) : null;

      if (!customer?._id) {
        Alert.alert('Login Required', 'Please login to continue');
        return;
      }

      await axios.post(`${api}/puja/add_to_cart`, {
        customerId: customer._id,
        astrologerId: '',
        quantity: 1,
        pujaId: pooja?._id,
        pujaDate: selectedDate,
        pujaTime: selectedDate,
      });

      await fetchCart(customer._id);
      setShowCart(true);
    } catch (e) {
      Alert.alert('Error', 'Unable to add to cart');
    } finally {
      setCartLoading(false);
    }
  };

  const proceedToPayment = async () => {
    try {
      setPaymentLoading(true);

      const raw = await AsyncStorage.getItem('customerData');
      const customer = raw ? JSON.parse(raw) : null;

      const orderRes = await axios.post(
        `${api}/customers/create_razorpay_order`,
        { amount: cartData.totalCartPrice }
      );
      const { id } = orderRes.data.data;

      const options = {
        name: 'Acharya Lav Bhushan',
        description: `Booking for ${pooja.pujaName}`,
        currency: 'INR',
        key: orderRes.data.key_id,
        amount: Number(cartData.totalCartPrice) * 100,
        order_id: id,
        prefill: {
          name: customer?.customerName || 'User',
          contact: customer?.phoneNumber || '',
        },
        theme: { color: '#db9a4a' },
      };

      const payment = await RazorpayCheckout.open(options);

      await axios.post(`${api}/puja/book_puja`, {
        customerId: customer._id,
        cartId: cartData.cartId,
        razorpayOrderId: id,
        razorpayPaymentId: payment.razorpay_payment_id,
      });
      navigation.navigate('BookedPoojaListScreen')
      Toast.show({
        type: "success",
        text1: "Payment Successful",
        text2: "Pooja booked successfully",
      });
      setShowCart(false);
      setCartData(null);
    } catch {
      Toast.show({
        type: "error",
        text1: "Payment Failed",
        text2: "Payment was cancelled",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const updateQuantity = async (item, type) => {
    if (cartLoading) return;

    try {
      setCartLoading(true);

      const raw = await AsyncStorage.getItem('customerData');
      const customer = raw ? JSON.parse(raw) : null;

      if (!customer?._id || !item?.pujaId?._id) {
        Alert.alert('Error', 'Invalid cart item');
        return;
      }

      await axios.post(`${api}/puja/update_cart_quantity`, {
        customerId: customer._id,
        pujaId: item.pujaId._id,
        action: type === 'inc' ? 'increment' : 'decrement',
      });

      // Always refresh cart after update
      await fetchCart(customer._id);
    } catch (e) {
      Alert.alert('Error', 'Quantity update failed');
    } finally {
      setCartLoading(false);
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F4EF" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: getImageUrl(pooja?.image?.[0]) }}
          style={styles.image}
        />

        <Text style={styles.title}>{pooja.pujaName}</Text>
        <Text style={styles.price}>₹{pooja.price}</Text>

        <Text style={styles.description}>
          {pooja?.about?.[0]?.bulletPoint || 'No description available.'}
        </Text>

        <View style={styles.slotContainer}>
          <Text style={styles.slotLabel}>Select Date</Text>

          <TouchableOpacity
            style={styles.slotButton}
            disabled={showCart}
            onPress={() => setShowDatePicker(true)}
          >

            <Icon name="calendar" size={20} color="#db9a4a" />
            <Text style={styles.slotButtonText}>
              {selectedDate
                ? selectedDate.toDateString()
                : 'Select Date'}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || minDate}
            mode="date"
            minimumDate={minDate}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}
        {showCart && cartData?.cartItems?.length > 0 &&
          cartData.cartItems.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <Text style={styles.cartName}>{item?.pujaId?.pujaName}</Text>

              <Text style={styles.cartDate}>
                Date: {new Date(item?.pujaDate).toDateString()}
              </Text>

              <View style={styles.qtyRow}>
                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item, 'dec')}
                    disabled={cartLoading}
                  >
                    <Icon name="minus" size={18} />
                  </TouchableOpacity>

                  <Text style={styles.qtyText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item, 'inc')}
                    disabled={cartLoading}
                  >
                    <Icon name="plus" size={18} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cartPrice}>₹{item.totalPujaPrice}</Text>
              </View>
            </View>
          ))}
        {showCart && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '700' }}>
              Total: ₹{cartData?.totalCartPrice}
            </Text>

            <View style={styles.actionRow}>
              {/* Go to Cart */}
              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => navigation.navigate('CartScreen')} // adjust route if needed
                disabled={paymentLoading}
              >
                <Icon name="cart-outline" size={18} color="#db9a4a" />
                <Text style={styles.cartButtonText}>Go to Cart</Text>
              </TouchableOpacity>

              {/* Proceed to Payment */}
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={proceedToPayment}
                disabled={paymentLoading}
              >
                <Text style={styles.bookButtonText}>
                  {paymentLoading ? 'Processing...' : 'Proceed to Payment'}
                </Text>
              </TouchableOpacity>
            </View>


          </View>
        )}
        {!showCart && <TouchableOpacity
          style={[
            styles.bookButton,
            (cartLoading || showCart) && { opacity: 0.6 },
          ]}
          onPress={handleCart}
          disabled={cartLoading || showCart}
        >
          <Text style={styles.bookButtonText}>
            {cartLoading ? 'Adding to Cart...' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  image: { width: '100%', height: 230, borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 10 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 🔥 key
    marginTop: 10,
  },

  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  qtyBtn: {
    backgroundColor: '#eee',
    padding: 6,
    borderRadius: 6,
  },

  qtyText: {
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
  },

  cartPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#db9a4a',
    marginRight: '20'
  },

  price: {
    fontSize: 18,
    color: '#db9a4a',
    marginVertical: 8,
    fontWeight: '600',
  },
  description: { fontSize: 15, color: '#555', lineHeight: 22 },
  slotContainer: {
    marginTop: 20,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
  },
  slotLabel: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    padding: 10,
    borderRadius: 8,
  },
  slotButtonText: { marginLeft: 10, fontSize: 15 },
  bookButton: {
    backgroundColor: '#db9a4a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#999', fontSize: 16 },
  cartBox: {
    marginTop: 25,
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 10,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  cartItem: {
    borderBottomWidth: 1,
    borderColor: '#b5aaaaff',
    paddingVertical: 10,
    marginTop: '10'
  },
  cartName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cartDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  // proceedButton: {
  //   backgroundColor: '#db9a4a',
  //   paddingVertical: 12,
  //   borderRadius: 8,
  //   alignItems: 'center',
  //   marginTop: 15,
  // },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },

  cartButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#db9a4a',
    marginRight: 10,
    backgroundColor: '#FFF',
  },

  cartButtonText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '600',
    color: '#db9a4a',
  },

  proceedButton: {
    flex: 1,
    backgroundColor: '#db9a4a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

});

export default PoojaDetails;
