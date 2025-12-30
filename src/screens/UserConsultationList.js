import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    StatusBar,
    TextInput,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import axios from 'axios';
import api from '../apiConfig';
import MyLoader from '../components/MyLoader';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { RefreshControl } from 'react-native';

const UserConsultationList = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [consultations, setConsultations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming');
    const [refreshing, setRefreshing] = useState(false);

    const navigation = useNavigation();
    const requestNotificationPermissionIfNeeded = async () => {
        try {
            // 🔹 Android 13+
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                const granted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );

                if (!granted) {
                    const result = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                    );

                    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('Notification permission denied');
                        return;
                    }
                }
            }

            // 🔹 Firebase permission (covers Android <13 + iOS)
            const authStatus = await messaging().hasPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (!enabled) {
                await messaging().requestPermission();
            }

        } catch (error) {
            console.log('Notification permission error:', error);
        }
    };

    const getConsultations = async () => {
        setIsLoading(true);
        try {
            const rawCustomerData = await AsyncStorage.getItem('customerData');
            const customerData = JSON.parse(rawCustomerData);

            const response = await axios.get(
                `${api}/mobile/user-consultations/${customerData?._id}`,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response?.data?.success) {
                setConsultations(response?.data?.bookings || []);
            } else {
                Alert.alert('No Consultations', 'No records found.');
            }
        } catch (error) {
            console.error('API Error:', error);
            Alert.alert('Error', 'Unable to fetch consultations.');
        } finally {
            setIsLoading(false);
        }
    };
    const isSameDay = (d1, d2) => {
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await getConsultations();
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        getConsultations();
        requestNotificationPermissionIfNeeded();
    }, []);

    // ------------------------------
    // SEARCH FILTER
    // ------------------------------
    const searchFiltered = consultations.filter((item) =>
        item?.astrologer?.name
            ?.toLowerCase()
            ?.includes(searchQuery.toLowerCase())
    );


    // ------------------------------
    // DATE & TIME BASED FILTERING
    // ------------------------------
    const now = new Date();

    // Extract today's date strip time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const getStartDateTime = (item) => {
        if (!item?.date || !item?.fromTime) return new Date(8640000000000000); // max date

        const dateObj = new Date(item.date);
        const [h, m] = item.fromTime.split(":").map(Number);

        dateObj.setHours(h, m, 0, 0);
        return dateObj;
    };

    const parseTimeToDate = (date, fromTime, toTime) => {
        const dateObj = new Date(date);

        const [sh, sm] = fromTime.split(":").map(Number);
        const [eh, em] = toTime.split(":").map(Number);

        const startDate = new Date(dateObj);
        startDate.setHours(sh, sm, 0, 0);

        const endDate = new Date(dateObj);
        endDate.setHours(eh, em, 0, 0);

        return { startDate, endDate };
    };

    // UPCOMING (Today's & time not passed)
    const upcoming = searchFiltered
        .filter((item) => {
            if (item?.status !== "booked") return false;

            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);

            const todayOnly = new Date();
            todayOnly.setHours(0, 0, 0, 0);

            const { endDate } = parseTimeToDate(
                item.date,
                item.fromTime,
                item.toTime
            );

            if (itemDate > todayOnly) return true;
            if (itemDate.getTime() === todayOnly.getTime()) return now <= endDate;

            return false;
        })
        .sort((a, b) => getStartDateTime(a) - getStartDateTime(b));


    // PENDING (Date passed OR today's time passed)
    const pending = searchFiltered
        .filter((item) => {
            if (item?.status !== "booked") return false;

            const { endDate } = parseTimeToDate(
                item.date,
                item.fromTime,
                item.toTime
            );

            return now > endDate;
        })
        .sort((a, b) => getStartDateTime(a) - getStartDateTime(b));


    // COMPLETED
    const completed = searchFiltered
        .filter(
            (item) =>
                item?.status === "completed" ||
                item?.status === "user_not_joined"
        )
        .sort((a, b) => getStartDateTime(a) - getStartDateTime(b));


    let currentList = [];
    if (activeTab === 'upcoming') currentList = upcoming;
    else if (activeTab === 'pending') currentList = pending;
    else currentList = completed;

    // ------------------------------
    // FETCH ASTROLOGER DETAILS
    // ------------------------------
    const fetchAstrologerDetails = async (id, mode, price, time, formattedDate) => {
        setIsLoading(true);
        const rawCustomerData = await AsyncStorage.getItem('customerData');
        const customerData = JSON.parse(rawCustomerData);

        try {
            const response = await axios.post(
                `${api}/astrologer/get-astrologer-details`,
                { astrologerId: id },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response?.data?.success) {
                navigation.navigate('Consultation Details', {
                    astrologer: response.data.astrologer,
                    mode,
                    price,
                    customerData,
                    time,
                    formattedDate
                });
            } else {
                Alert.alert('No Data', 'Astrologer details not found.');
            }
        } catch (error) {
            console.error('API Error:', error);
            Alert.alert('Error', 'Failed to fetch astrologer details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F4EF" />
            {/* <MyLoader isVisible={isLoading} /> */}

            {/* Header Search */}
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Icon name="magnify" size={20} color="#999" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by Astrologer Name..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {[
                    { key: 'upcoming', label: 'Upcoming' },
                    { key: 'pending', label: 'Expired' },
                    { key: 'completed', label: 'Completed' },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => setActiveTab(tab.key)}
                        style={[
                            styles.tabButton,
                            activeTab === tab.key && styles.activeTabButton,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab.key && styles.activeTabText,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#db9a4a']}
                        tintColor="#db9a4a"
                    />
                }
            >
                {currentList.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="crystal-ball" size={60} color="#db9a4a" style={{ marginBottom: 16 }} />
                        <Text style={styles.emptyText}>No Consultations</Text>
                        <Text style={styles.emptySubtext}>Please check back later</Text>
                    </View>
                ) : (
                    currentList.map((item, index) => {
                        const astrologerName = item?.astrologer?.name || 'Astrologer';
                        const experience = item?.astrologer?.experience || 'N/A';
                        const rating = item?.astrologer?.rating || 0;

                        const price = item?.consultationPrice;
                        const mode =
                            item?.consultationType === 'videocall'
                                ? 'Video Call'
                                : item?.consultationType === 'call'
                                    ? 'Voice Call'
                                    : 'Chat';

                        const timeObj = `${item?.fromTime} - ${item?.toTime}`;

                        const dateObj = new Date(item?.date);
                        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                        const day = String(dateObj.getDate()).padStart(2, "0");
                        const month = months[dateObj.getMonth()];
                        const year = dateObj.getFullYear();

                        const formattedDate = dateObj?.toDateString();


                        return (
                            <View key={index} style={styles.card}>
                                <View style={styles.cardContent}>
                                    {/* <Text style={styles.bookingId}>
                                        Booking ID: {item?._id}
                                    </Text> */}

                                    <Text style={styles.astrologerName}>
                                        {astrologerName}
                                    </Text>

                                    <View style={styles.modeBadge}>
                                        <Icon
                                            name={
                                                item?.consultationType === 'videocall'
                                                    ? 'video-outline'
                                                    : item?.consultationType === 'call'
                                                        ? 'phone'
                                                        : 'chat-outline'
                                            }
                                            size={16}
                                            color="#db9a4a"
                                        />

                                        <Text style={styles.modeText}>{mode}</Text>
                                    </View>

                                    <Text style={styles.details}>
                                        Experience: {experience} yrs
                                    </Text>
                                    {rating !== 0 &&
                                        <Text style={styles.details}>
                                            Rating: ⭐ {rating}
                                        </Text>
                                    }
                                    <Text style={styles.details}>
                                        Date: {formattedDate}
                                    </Text>
                                    <Text style={styles.details}>
                                        Time: {timeObj}
                                    </Text>

                                    <Text style={styles.price}>₹ {price}</Text>

                                    <View style={styles.buttonsRow}>
                                        <TouchableOpacity
                                            style={styles.detailsButton}
                                            onPress={() =>
                                                fetchAstrologerDetails(
                                                    item?.astrologerId,
                                                    item?.consultationType,
                                                    item?.consultationPrice,
                                                    timeObj,
                                                    formattedDate
                                                )
                                            }

                                        >
                                            <Text style={styles.detailsButtonText}>View Details</Text>
                                            <Icon name="arrow-right" size={18} color="#fff" />
                                        </TouchableOpacity>
                                        {(activeTab === "completed") && (
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    {
                                                        backgroundColor: item.status === "completed" ? "#16A34A" : "#DC2626",
                                                    },
                                                ]}
                                            >
                                                <Icon
                                                    name={item.status === "completed" ? "check-circle-outline" : "close-circle-outline"}
                                                    size={18}
                                                    color="#fff"
                                                />
                                                <Text style={styles.statusBadgeText}>
                                                    {item.status === "completed" ? "Completed" : "Didn't Join"}
                                                </Text>
                                            </View>
                                        )}

                                        {/* View Details Button */}


                                        {/* Reschedule Button (Only for pending) */}
                                        {activeTab === "upcoming" &&
                                            !isSameDay(new Date(item.date), new Date()) && (
                                                <TouchableOpacity
                                                    style={[styles.detailsButton, styles.rescheduleButton]}
                                                    onPress={() =>
                                                        navigation.navigate('SelectSlotScreenReschedule', {
                                                            astrolgerId: item.astrologer?._id,
                                                            id: item?._id,
                                                            mode,
                                                            booking: item
                                                        })
                                                    }
                                                >
                                                    <Text style={styles.detailsButtonText}>Reschedule</Text>
                                                    <Icon name="calendar-edit" size={18} color="#fff" />
                                                </TouchableOpacity>
                                            )}

                                    </View>


                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
};

export default UserConsultationList;

/* ============================
        STYLESHEET
============================ */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F4EF',
    },

    buttonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },

    statusBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },

    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#db9a4a',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },

    rescheduleButton: {
        backgroundColor: '#b85c38',
    },

    detailsButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#E8DCC8',
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    activeTabButton: {
        borderBottomWidth: 3,
        borderColor: '#db9a4a',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#db9a4a',
        fontWeight: '700',
    },

    /* Search */
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        elevation: 3,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F4EF',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 42,
        borderWidth: 1,
        borderColor: '#E8DCC8',
    },
    searchInput: {
        flex: 1,
        color: '#333',
        fontSize: 15,
    },
    emptyState: { alignItems: 'center', paddingVertical: 160 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#2C1810', marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: '#666' },
    /* Cards */
    scrollContent: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#EEE2D3',
    },
    bookingId: {
        fontSize: 12,
        color: '#777',
        marginBottom: 4,
    },
    astrologerName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C1810',
        marginBottom: 6,
    },
    details: {
        fontSize: 14,
        color: '#555',
        marginBottom: 3,
    },
    price: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: '700',
        color: '#db9a4a',
    },
    modeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#FFF5E6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginBottom: 8,
    },
    modeText: {
        marginLeft: 6,
        color: '#db9a4a',
        fontWeight: '600',
        fontSize: 13,
    },

    /* Buttons */
    // detailsButton: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     marginTop: 12,
    //     backgroundColor: '#db9a4a',
    //     paddingVertical: 8,
    //     paddingHorizontal: 15,
    //     borderRadius: 8,
    //     alignSelf: 'flex-start',
    // },
    // detailsButtonText: {
    //     color: '#fff',
    //     fontSize: 14,
    //     fontWeight: '600',
    //     marginRight: 6,
    // },

    noDataText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
        fontSize: 14,
    },
});
