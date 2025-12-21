import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../apiConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BASE_URL =
    'https://alb-web-assets.s3.ap-south-1.amazonaws.com/acharyalavbhushan';

const BookedPoojaListScreen = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${BASE_URL}${path}`;
    };
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchBookedPoojas(false);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchBookedPoojas = async (showLoader = true) => {
        if (showLoader) setLoading(true);

        try {
            const raw = await AsyncStorage.getItem('customerData');
            const customer = raw ? JSON.parse(raw) : null;

            if (!customer?._id) {
                Alert.alert('Login Required');
                return;
            }

            const res = await axios.post(
                `${api}/puja/get_customer_booked_puja`,
                { customerId: customer._id }
            );

            if (res?.data?.success) {
                setOrders(res.data.data || []);
            } else {
                setOrders([]);
            }
        } catch (e) {
            // Alert.alert('No Bookings', e?.response?.data?.message);
        } finally {
            if (showLoader) setLoading(false);
        }
    };


    useEffect(() => {
        fetchBookedPoojas();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#db9a4a" />
            ) : orders.length === 0 ? (
                <View style={styles.center}>
                    <Icon name="campfire" size={70} color="#db9a4a" />
                    <Text style={styles.emptyText}>No Pooja Booked yet</Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#db9a4a']}   // Android
                            tintColor="#db9a4a"    // iOS
                        />
                    }
                >
                    {orders.map((item, index) => {
                        const puja = item?.pujaData?.[0];
                        const pujaInfo = puja?.pujaId;
                        console.log(puja, 'puja')
                        return (
                            <View key={index} style={styles.card}>
                                <Image
                                    source={{
                                        uri: getImageUrl(
                                            item?.pujaImage?.[0] || pujaInfo?.image?.[0]
                                        ),
                                    }}
                                    style={styles.image}
                                />

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.poojaName}>
                                        {pujaInfo?.pujaName || 'Pooja'}
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
                                        Quantity: <Text style={styles.bold}>{item.quantity}</Text>
                                    </Text>

                                    <Text style={styles.text}>
                                        Amount:{' '}
                                        <Text style={styles.amount}>₹{item.price}</Text>
                                    </Text>

                                    <Text style={styles.status}>
                                        Status: {puja?.status
                                            ? puja.status.charAt(0).toUpperCase() + puja.status.slice(1)
                                            : ''}

                                    </Text>
                                    {/* 
                                    <Text style={styles.invoice}>
                                        Invoice: {item.InvoiceId}
                                    </Text> */}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default BookedPoojaListScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F4EF',
        padding: 15,
        marginTop: -18
    },
    emptyState: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,        // ⬅️ make box rounded
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',

        // subtle shadow
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    emptyText: { fontSize: 18, fontWeight: '600', color: '#2C1810', marginBottom: 8 },

    header: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 15,
        color: '#2C1810',
    },
    empty: {
        textAlign: 'center',
        color: '#999',
        marginTop: 40,
        fontSize: 16,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    card: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 10,
        marginBottom: 12,
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 10,
        marginRight: 12,
    },
    poojaName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C1810',
    },
    text: {
        fontSize: 14,
        color: '#555',
        marginTop: 2,
    },
    bold: {
        fontWeight: '600',
        color: '#333',
    },
    amount: {
        fontWeight: '700',
        color: '#db9a4a',
    },
    status: {
        marginTop: 4,
        fontSize: 13,
        fontWeight: '600',
        color: '#B45309',
    },
    invoice: {
        marginTop: 4,
        fontSize: 12,
        color: '#777',
    },
});
