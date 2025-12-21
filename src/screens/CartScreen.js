import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../apiConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const CartScreen = () => {
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    // -----------------------------
    // FETCH CART
    // -----------------------------
    const fetchCart = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const raw = await AsyncStorage.getItem('customerData');
            const customer = raw ? JSON.parse(raw) : null;

            if (!customer?._id) return;

            const res = await axios.post(`${api}/puja/get_cart`, {
                customerId: customer._id,
            });
            console.log(res?.data, 'res?.data')
            setCartData(res?.data?.data || null);
        } catch {
            Alert.alert('Error', 'Unable to load cart');
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // -----------------------------
    // PULL TO REFRESH
    // -----------------------------
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCart(false);
        setRefreshing(false);
    };

    // -----------------------------
    // UPDATE QUANTITY
    // -----------------------------
    const updateQuantity = async (item, type) => {
        if (cartLoading) return;

        try {
            setCartLoading(true);

            const raw = await AsyncStorage.getItem('customerData');
            const customer = raw ? JSON.parse(raw) : null;

            await axios.post(`${api}/puja/update_cart_quantity`, {
                customerId: customer._id,
                pujaId: item.pujaId._id,
                action: type === 'inc' ? 'increment' : 'decrement',
            });

            await fetchCart(false);
        } catch {
            Alert.alert('Error', 'Quantity update failed');
        } finally {
            setCartLoading(false);
        }
    };

    // -----------------------------
    // PROCEED TO PAYMENT
    // -----------------------------
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
                description: 'Pooja Booking',
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
            Alert.alert('Success', 'Pooja booked successfully');
            setCartData(null);
        } catch {
            Toast.show({
                        type: "failed",
                        text1: "Payment Failed",
                        text2:  "Payment was cancelled",
                      });
        } finally {
            setPaymentLoading(false);
        }
    };

    // -----------------------------
    // UI
    // -----------------------------
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#db9a4a" />
            </View>
        );
    }

    if (!cartData || cartData.items?.length === 0) {
        return (
            <View style={styles.center}>
                <Icon name="cart-outline" size={70} color="#db9a4a" />
                <Text style={styles.emptyText}>Your cart is empty</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#db9a4a']}
                    />
                }
            >
                {cartData?.cartItems && cartData.cartItems.length > 0 ? (
                    cartData.cartItems.map((item, index) => (
                        <View key={index} style={styles.card}>
                            <Text style={styles.poojaName}>
                                {item?.pujaId?.pujaName || 'Pooja'}
                            </Text>

                            <Text style={styles.text}>
                                Date:{' '}
                                <Text style={styles.bold}>
                                    {item?.pujaDate
                                        ? new Date(item.pujaDate).toDateString()
                                        : 'N/A'}
                                </Text>
                            </Text>

                            <Text style={styles.text}>
                                Price:{' '}
                                <Text style={styles.bold}>
                                    ₹ {item?.pujaId?.price}
                                </Text>
                            </Text>

                            <View style={styles.qtyRow}>
                                <TouchableOpacity
                                    onPress={() => updateQuantity(item, 'dec')}
                                    style={styles.qtyBtn}
                                >
                                    <Icon name="minus" size={18} />
                                </TouchableOpacity>

                                <Text style={styles.qty}>{item?.quantity}</Text>

                                <TouchableOpacity
                                    onPress={() => updateQuantity(item, 'inc')}
                                    style={styles.qtyBtn}
                                >
                                    <Icon name="plus" size={18} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.amount}>
                                ₹ {item?.totalPujaPrice}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Icon
                            name="cart"
                            size={60}
                            color="#db9a4a"
                            style={{ marginBottom: 16 }}
                        />
                        <Text style={styles.emptyText}>Your Cart is Empty</Text>
                    </View>
                )}


            </ScrollView>

            {/* FOOTER */}
            {cartData.totalCartPrice &&
                <View style={styles.footer}>
                    <Text style={styles.total}>
                        Total: ₹ {cartData.totalCartPrice}
                    </Text>

                    <TouchableOpacity
                        style={styles.payBtn}
                        onPress={proceedToPayment}
                        disabled={paymentLoading}
                    >
                        {paymentLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.payText}>Proceed to Pay</Text>
                        )}
                    </TouchableOpacity>
                </View>
            }
        </View>
    );
};

export default CartScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F4EF',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // emptyText: {
    //     marginTop: 10,
    //     fontSize: 16,
    //     color: '#555',
    // },
    card: {
        backgroundColor: '#fff',
        margin: 12,
        padding: 14,
        borderRadius: 12,
    },
    poojaName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C1810',
    },
    text: {
        marginTop: 4,
        fontSize: 14,
        color: '#555',
    },
    bold: {
        fontWeight: '600',
        color: '#333',
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    qtyBtn: {
        backgroundColor: '#eee',
        padding: 6,
        borderRadius: 6,
    },
    qty: {
        marginHorizontal: 14,
        fontSize: 15,
        fontWeight: '600',
    },
    amount: {
        marginTop: 10,
        fontSize: 15,
        fontWeight: '700',
        color: '#db9a4a',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 14,
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    total: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    payBtn: {
        backgroundColor: '#db9a4a',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    payText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    emptyState: { alignItems: 'center', paddingVertical: 280 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#2C1810', marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: '#666' },
});
