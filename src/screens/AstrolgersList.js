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
  Modal,
  FlatList,
} from 'react-native';
import axios from 'axios';
import api from '../apiConfig';
import IMAGE_BASE_URL from '../imageConfig';
import MyLoader from '../components/MyLoader';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const AstrolgersList = ({ route, mode: propMode }) => {
  const { mode: routeMode } = route?.params || {};
  const mode = routeMode || propMode;
  console.log(mode,'modemodemodemodemodemode')
  const [isLoading, setIsLoading] = useState(false);
  const [astrologers, setAstrologers] = useState([]);
  const [astrologersDetails, setAstrologersDetails] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [expertiseList, setExpertiseList] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);

  const navigation = useNavigation();

  const topAstrologerId = '68b546bad26a07574a62453d';
const isSearchApplied = searchQuery.trim().length > 0;
const isFilterApplied = !!selectedExpertise;
const shouldShowTopAstrologer =
  (mode === 'voice' || mode === 'video') &&
  !isSearchApplied &&
  !isFilterApplied;

const getImageUrl = (path) => {
  if (!path) return null;

  // If already a full URL
  if (path.startsWith('http')) {
    return `${path}?format=jpg`; // 👈 fixes RN no-extension issue
  }

  // Relative path from backend
  return `${IMAGE_BASE_URL}${path}?format=jpg`;
};
  // Fetch astrologers
  const getAstrologerData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${api}/astrologer/get-all-astrologers`, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(response?.data, 'response?.data')
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

  // Fetch expertise list
  const getExpertiseList = async () => {
    try {
      const res = await axios.get(`${api}/admin/get-all-main-expertise`);
      if (res?.data) {
        setExpertiseList(res.data.mainExpertise);
      }
    } catch (error) {
      console.error('Error fetching expertise:', error);
    }
  };

  useEffect(() => {
    getAstrologerData();
    getExpertiseList();
  }, []);

 let filteredAstrologers = astrologers.filter((astro) =>
  astro.astrologerName
    ?.toLowerCase()
    .includes(searchQuery.trim().toLowerCase())
);

if (selectedExpertise) {
  filteredAstrologers = filteredAstrologers.filter(
    (astro) =>
      Array.isArray(astro.mainExpertise) &&
      astro.mainExpertise.includes(selectedExpertise)
  );
}



const topAstrologer = astrologers.find(
  (astro) => astro._id === topAstrologerId
);

  if (mode === "chat") {
    filteredAstrologers = filteredAstrologers.filter(
  (astro) => astro._id !== topAstrologerId
);

  }

const finalAstrologers =
  shouldShowTopAstrologer && topAstrologer
    ? [topAstrologer, ...filteredAstrologers]
    : filteredAstrologers;
const finalList =
  mode === 'chat'
    ? finalAstrologers.filter(
        (astro) => astro._id !== topAstrologerId
      )
    : finalAstrologers;


  const fetchAstrologerDetails = async (id) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${api}/astrologer/get-astrologer-details`,
        { astrologerId: id },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response?.data?.success) {
        setAstrologersDetails(response.data.astrologer)
        navigation.navigate('AstrologerDetailsScreen', {
          astrologer: response.data.astrologer,
          mode
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

  const Container = routeMode ? SafeAreaView : View;

  return (
    <View style={styles.container}>
      <MyLoader isVisible={isLoading} />

      {/* Header with Search + Filter */}
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

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Icon name="filter-variant" size={24} color="#db9a4a" />
        </TouchableOpacity>
      </View>

      {/* Astrologer List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.astrologersList}>
          {finalList.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="crystal-ball" size={60} color="#db9a4a" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>No astrologers available</Text>
              <Text style={styles.emptySubtext}>Please check back later</Text>
            </View>
          ) : (
            finalList.map((astro, index) => (
              <TouchableOpacity
                key={index}
                style={styles.astrologerCard}
                activeOpacity={0.7}
                onPress={() => fetchAstrologerDetails(astro?._id)}
              >
                {/* Avatar */}
                <View style={styles.astrologerLeft}>
                  <Image
                    source={{ uri: getImageUrl(astro.profileImage) }}
                    style={styles.avatar}
                  />
                </View>

                {/* Info */}
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

                {/* Action Button */}
                <View style={[styles.astrologerRight, { gap: 4 }]}>
                  {mode === 'voice' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => fetchAstrologerDetails(astro?._id)}
                    >
                      <Icon name="phone" size={22} color="#FFF" />
                    </TouchableOpacity>
                  )}

                  {mode === 'video' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => fetchAstrologerDetails(astro?._id)}
                    >
                      <Icon name="video" size={22} color="#FFF" />
                    </TouchableOpacity>
                  )}

                  {mode === 'chat' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => fetchAstrologerDetails(astro?._id)}
                    >
                      <Icon name="chat" size={22} color="#FFF" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Filter Drawer */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Filter by Expertise</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Icon name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={expertiseList}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.expertiseItem,
                    selectedExpertise === item._id && styles.selectedExpertiseItem,
                  ]}
                  onPress={() => {
                    setSelectedExpertise(item._id);
                    setFilterVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.expertiseText,
                      selectedExpertise === item._id && { color: '#FFF' },
                    ]}
                  >
                    {item.mainExpertise}
                  </Text>
                </TouchableOpacity>
              )}
            />


            {selectedExpertise && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => setSelectedExpertise(null)}
              >
                <Text style={styles.clearFilterText}>Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 3,
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
  filterButton: { marginLeft: 10 },
  searchInput: { flex: 1, color: '#333', fontSize: 15, paddingVertical: 0 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  astrologersList: { gap: 12 },
  astrologerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0E8DC',
  },
  astrologerLeft: { marginRight: 12 },
  avatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#FFD580' },
  astrologerMiddle: { flex: 1, justifyContent: 'center' },
  astrologerName: { fontSize: 16, fontWeight: '700', color: '#2C1810', marginBottom: 6 },
  infoRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  infoBadge: { backgroundColor: '#FFF5E6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  infoBadgeText: { fontSize: 11, color: '#db9a4a', fontWeight: '600' },
  astrologerTagline: { fontSize: 12, color: '#666', marginBottom: 6 },
  astrologerRight: { justifyContent: 'space-between', alignItems: 'center', paddingTop: 15 },
  actionButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#db9a4a', alignItems: 'center', justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#2C1810', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#666' },
drawerOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},

drawerContainer: {
  backgroundColor: '#fff',
  height: '100%',     // full height
  width: '100%',      // full width
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  padding: 20,
},

  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerTitle: { fontSize: 18, fontWeight: '700', color: '#2C1810' },
  expertiseItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#db9a4a',
    marginVertical: 5,
  },
  selectedExpertiseItem: { backgroundColor: '#db9a4a' },
  expertiseText: { fontSize: 15, color: '#2C1810', fontWeight: '500' },
  clearFilterButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F8F4EF',
    borderRadius: 10,
    alignItems: 'center',
  },
  clearFilterText: { color: '#db9a4a', fontWeight: '600' },
});

export default AstrolgersList;
