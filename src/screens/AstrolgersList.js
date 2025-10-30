import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
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

const AstrolgersList = ({ mode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [astrologers, setAstrologers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('Celebrity');

  const navigation = useNavigation();

  const getAstrologerData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${api}/astrologer/get-all-astrologers`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response?.data?.success) {
        setAstrologers(response?.data?.astrologer || []);
      } else {
        Alert.alert('No Data', 'No astrologers found.');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Unable to get astrologer data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAstrologerData();
  }, []);

  const BASE_URL = 'https://api.acharyalavbhushan.com/';
  const getImageUrl = (path) => (path?.startsWith('http') ? path : `${BASE_URL}/${path}`);

  let filteredAstrologers = astrologers
    .filter((astro) =>
      astro.astrologerName?.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
    .filter((astro) => astro.title?.toLowerCase() === selectedTab.toLowerCase());

  const topAstrologerId = '68b546bad26a07574a62453d';
  filteredAstrologers = filteredAstrologers.sort((a, b) =>
    a._id === topAstrologerId ? -1 : b._id === topAstrologerId ? 1 : 0
  );

  const fetchAstrologerDetails = async (id) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${api}/astrologer/get-astrologer-details`,
        { astrologerId: id },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response?.data?.success) {
        navigation.navigate('AstrologerDetailsScreen', { astrologer: response.data.astrologer });
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

      {/* Header with Search */}
      <View style={styles.header}>

        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search astrologers..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Celebrity', 'Top Astrologer', 'Rising Star'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, selectedTab === tab && styles.activeTabButton]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[styles.tabText, selectedTab === tab && styles.activeTabText]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Astrologer List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.astrologersList}>
          {filteredAstrologers.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="crystal-ball" size={60} color="#db9a4a" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>No astrologers available</Text>
              <Text style={styles.emptySubtext}>Please check back later</Text>
            </View>
          ) : (
            filteredAstrologers.map((astro, index) => (
              <TouchableOpacity
                key={index}
                style={styles.astrologerCard}
                activeOpacity={0.7}
                onPress={() => fetchAstrologerDetails(astro?._id)}
              >
                {/* Left Avatar */}
                <View style={styles.astrologerLeft}>
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: getImageUrl(astro.profileImage) }} style={styles.avatar} />
                  </View>
                </View>

                {/* Middle Info */}
                <View style={styles.astrologerMiddle}>
                  <Text style={styles.astrologerName}>{astro.astrologerName || 'Unknown'}</Text>
                  <View style={styles.infoRow}>
                    <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeText}>⭐ {astro.rating || '4.5'}</Text>
                    </View>
                    <View style={[styles.infoBadge, { backgroundColor: '#E8F5E9' }]}>
                      <Text style={[styles.infoBadgeText, { color: '#4CAF50' }]}>
                        {astro.experience || '5'}+ yrs
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.astrologerTagline} numberOfLines={1}>
                    {astro.tagLine || 'Expert Astrologer'}
                  </Text>
                </View>

                {/* Right Actions */}
                <View style={[styles.astrologerRight, { gap: 4 }]}>
                  {mode === 'voice' && (
                    <TouchableOpacity
                      style={styles.actionButtonVoice}
                      onPress={() =>
                        navigation.navigate('VoiceVideoCallScreen', {
                          isVideo: false,
                          astrologerData: astro,
                        })
                      }
                    >
                      <Icon name="phone" size={22} color="#FFF" />
                    </TouchableOpacity>
                  )}

                  {mode === 'video' && (
                    <TouchableOpacity
                      style={styles.actionButtonVideo}
                      onPress={() =>
                        navigation.navigate('VoiceVideoCallScreen', {
                          isVideo: true,
                          astrologerData: astro,
                        })
                      }
                    >
                      <Icon name="video" size={22} color="#FFF" />
                    </TouchableOpacity>
                  )}

                  {mode === 'chat' && (
                    <TouchableOpacity
                      style={styles.actionButtonChat}
                      onPress={() => navigation.navigate('ChatScreen', { astrologerData: astro })}
                    >
                      <Icon name="chat" size={22} color="#FFF" />
                    </TouchableOpacity>
                  )}
                </View>

              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#E8DCC8',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5EFE6',
  },
  activeTabButton: {
    backgroundColor: '#db9a4a',
  },
  tabText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
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
  actionButtonChat: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: '#db9a4a', // Blue for chat
  alignItems: 'center',
  justifyContent: 'center',
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  astrologersList: {
    gap: 12,
  },
  astrologerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0E8DC',
  },
  astrologerLeft: {
    marginRight: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFD580',
  },
  astrologerMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  astrologerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  infoBadge: {
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  infoBadgeText: {
    fontSize: 11,
    color: '#db9a4a',
    fontWeight: '600',
  },
  astrologerTagline: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  astrologerRight: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop:15
  },
  actionButtonVoice: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#db9a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonVideo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#db9a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C1810',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default AstrolgersList;
