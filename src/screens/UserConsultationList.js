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
} from 'react-native';
import axios from 'axios';
import api from '../apiConfig';
import MyLoader from '../components/MyLoader';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserConsultationList = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [consultations, setConsultations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming');

    const navigation = useNavigation();

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

    useEffect(() => {
        getConsultations();
    }, []);

    // SEARCH FILTER
    const searchFiltered = consultations.filter((item) =>
        item?.astrologer?.name
            ?.toLowerCase()
            ?.includes(searchQuery.toLowerCase()) ||
        item?._id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // TABS
    const upcoming = searchFiltered.filter((item) => item?.status === 'new');
    const completed = searchFiltered.filter((item) => item?.status === 'completed');

    const currentList = activeTab === 'upcoming' ? upcoming : completed;
    const fetchAstrologerDetails = async (id, mode,price) => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${api}/astrologer/get-astrologer-details`,
                { astrologerId: id },
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response?.data?.success) {
                navigation.navigate('Consultation Details', {
                    astrologer: response.data.astrologer,
                    mode,price
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
            <MyLoader isVisible={isLoading} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Icon name="magnify" size={20} color="#999" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by Booking ID or Astrologer..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {['upcoming', 'completed'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[
                            styles.tabButton,
                            activeTab === tab && styles.activeTabButton,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText,
                            ]}
                        >
                            {tab === 'upcoming' ? 'Upcoming' : 'Completed'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            <ScrollView style={styles.scrollContent}>
                {currentList.length === 0 ? (
                    <Text style={styles.noDataText}>No consultations found.</Text>
                ) : (
                    currentList.map((item, index) => {
                        const astrologerName = item?.astrologer?.name || 'Astrologer';
                        const experience = item?.astrologer?.experience || 'N/A';
                        const rating = item?.astrologer?.rating || 0;
                        const price = item?.duration?.price || 'N/A';

                        const mode =
                            item?.mode === 'video'
                                ? 'Video Call'
                                : item?.mode === 'voice'
                                    ? 'Voice Call'
                                    : item?.mode === 'chat'
                                        ? 'Live Chat'
                                        : 'Unknown';

                        const dateObj = new Date(item?.date);
                        const formattedDate = dateObj.toLocaleDateString();

                        return (
                            <View key={index} style={styles.card}>
                                <View style={styles.cardContent}>
                                    <Text style={styles.bookingId}>
                                        Booking ID: {item?._id}
                                    </Text>

                                    <Text style={styles.astrologerName}>
                                        {astrologerName}
                                    </Text>

                                    <View style={styles.modeBadge}>
                                        <Icon
                                            name={
                                                item?.mode === 'video'
                                                    ? 'video-outline'
                                                    : item?.mode === 'voice'
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
                                    <Text style={styles.details}>Rating: ⭐ {rating}</Text>
                                    <Text style={styles.details}>
                                        Date: {formattedDate}
                                    </Text>
                                    <Text style={styles.price}>₹ {price}</Text>

                                    {/* VIEW DETAILS */}
                                    <TouchableOpacity
                                        style={styles.detailsButton}
                                        onPress={() => fetchAstrologerDetails(item?.astrologerId, item?.mode,item?.duration?.price)}

                                    >
                                        <Text style={styles.detailsButtonText}>
                                            View Details
                                        </Text>
                                        <Icon name="arrow-right" size={20} color="#fff" />
                                    </TouchableOpacity>

                                    {/* JOIN CALL BUTTON */}
                                    {/* {item?.status === 'new' &&
                                        (item?.mode === 'voice' ||
                                            item?.mode === 'video') && (
                                            <TouchableOpacity
                                                style={styles.joinButton}
                                                onPress={() =>
                                                    navigation.navigate(
                                                        'UserIncomingCallScreen',
                                                        {
                                                            booking: item,
                                                            astrologerData:
                                                                item?.astrologer,
                                                            isVideo:
                                                                item?.mode === 'video',
                                                            channelName:
                                                                item?.channelName,
                                                        }
                                                    )
                                                }
                                            >
                                                <Icon
                                                    name={
                                                        item.mode === 'video'
                                                            ? 'video-outline'
                                                            : 'phone'
                                                    }
                                                    size={22}
                                                    color="#fff"
                                                    style={{ marginRight: 6 }}
                                                />
                                                <Text style={styles.joinButtonText}>
                                                    Join {item.mode === 'video'
                                                        ? 'Video'
                                                        : 'Voice'}{' '}
                                                    Call
                                                </Text>
                                            </TouchableOpacity>
                                        )} */}
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

    /* Tabs */
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

    /* List */
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
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: '#db9a4a',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 6,
    },

    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#28A745',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    joinButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },

    noDataText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
        fontSize: 14,
    },
});
