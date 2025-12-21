import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ImageBackground,
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
import MyHeader from '../components/MyHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshControl } from 'react-native';

const PoojaList = ({ route }) => {
    const { routeMode } = route?.params || {};

    const [isLoading, setIsLoading] = useState(false);
    const [pooja, setPooja] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const navigation = useNavigation();
    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await getPoojaData();
        } catch (e) {
            console.log('Refresh error:', e);
        } finally {
            setRefreshing(false);
        }
    };

    const getPoojaData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${api}/puja/get_puja`, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (response?.data?.success) {
                setPooja(response?.data?.pooja || []);
            } else {
                Alert.alert('No Data', 'No Pooja found.');
            }
        } catch (error) {
            console.error('API Error:', error);
            Alert.alert('Error', 'Unable to get Pooja data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getPoojaData();
    }, []);

    const BASE_URL = 'https://alb-web-assets.s3.ap-south-1.amazonaws.com/acharyalavbhushan';
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) {
            return `${path}?format=jpg`;
        }
        return `${BASE_URL}${path}?format=jpg`;
    };
    const filteredPooja = pooja.filter((item) =>
        item.pujaName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const Container = routeMode === false ? View : SafeAreaView;
    return (
        <Container
            style={styles.container}
            {...(!routeMode ? { edges: ['top'] } : {})}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#F8F4EF" />
            <MyLoader isVisible={isLoading} />
            {routeMode !== false && <MyHeader />}
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Icon name="magnify" size={20} color="#999" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Pooja"
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Pooja List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#db9a4a']}     // Android spinner
                        tintColor="#db9a4a"     // iOS spinner
                    />
                }
            >
                {filteredPooja.map((item) => (
                    <TouchableOpacity
                        key={item._id}
                        style={styles.card}
                        onPress={() => navigation.navigate('PoojaDetails', { pooja: item })}
                        activeOpacity={0.8}
                    >
                        <ImageBackground
                            source={{ uri: getImageUrl(item?.image?.[0]) }}
                            style={styles.cardImage}
                            imageStyle={styles.cardImageStyle}
                        >
                            <View style={styles.overlay} />
                            <View style={styles.cardContent}>
                                <Text style={styles.poojaName}>{item.pujaName}</Text>
                                <Text style={styles.price}>₹{item.price?.toLocaleString()}</Text>
                                <TouchableOpacity
                                    style={styles.bookButton}
                                    onPress={() => navigation.navigate('PoojaDetails', { pooja: item })}
                                >
                                    <Text style={styles.bookButtonText}>Book Now</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                ))}
                {filteredPooja.length === 0 && (
                    <Text style={styles.noDataText}>No matching Pooja found.</Text>
                )}
            </ScrollView>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F4EF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5E6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    searchBar: {
        flex: 1,
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
        paddingVertical: 0,
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    scrollContent: {
        paddingTop: 10,
        paddingHorizontal: 12,
        paddingBottom: 0, // 🔥 critical
    },

    card: {
        marginBottom: 16,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 3,
    },
    cardImage: {
        height: 200,
        justifyContent: 'flex-end',
    },
    cardImageStyle: {
        borderRadius: 15,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    cardContent: {
        padding: 16,
    },
    poojaName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    price: {
        fontSize: 16,
        color: '#FFD580',
        marginTop: 4,
    },
    bookButton: {
        backgroundColor: '#db9a4a',
        alignSelf: 'flex-start',
        marginTop: 10,
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    bookButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    noDataText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        marginTop: 40,
    },
});

export default PoojaList;
