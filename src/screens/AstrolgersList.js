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
import MyHeader from '../components/MyHeader';
import { RefreshControl } from 'react-native';

const AstrolgersList = ({ route, mode: propMode }) => {
  const { mode: routeMode } = route?.params || {};
  const mode = routeMode || propMode;
  const [isLoading, setIsLoading] = useState(false);
  const [astrologers, setAstrologers] = useState([]);
  const [astrologersDetails, setAstrologersDetails] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  // const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [expertiseList, setExpertiseList] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_LIMIT = 100;
  const [isFetchingMore, setIsFetchingMore] = useState(false);

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
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 2000);
const debouncedExpertise = useDebounce(selectedExpertise, 2000);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    getAstrologerData(1, false);
  }, [debouncedSearchQuery, debouncedExpertise]);
  

  function useDebounce(value, delay = 500) {
    const [debounced, setDebounced] = useState(value);
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebounced(value);
      }, delay);
  
      return () => clearTimeout(timer);
    }, [value, delay]);
  
    return debounced;
  }
  
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDebouncedSearchQuery(searchQuery.trim());
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, [searchQuery]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setPage(1);
      setHasMore(true);

      await getAstrologerData(1, false);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch astrologers
  const getAstrologerData = async (pageNo = 1, isLoadMore = false) => {
    if (isFetchingMore || (!hasMore && isLoadMore)) return;

    isLoadMore ? setIsFetchingMore(true) : setIsLoading(true);

    const currentTime = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 🔥 combine search input + mainExpertise
    const finalSearchText = [debouncedSearchQuery, debouncedExpertise]
    .filter(Boolean)
    .join(" ");
  

    try {
      const url = `${api}/astrologer/astrologer_filters?page=${pageNo}&limit=${PAGE_LIMIT}&searchText=${finalSearchText}&hasAvailableSlots=true&currentTime=${currentTime}`;
      const response = await axios.get(url);
      if (response?.data?.success) {
        const newData = response.data.results || [];
        setAstrologers(prev =>
          isLoadMore ? [...prev, ...newData] : newData
        );
        setHasMore(newData.length === PAGE_LIMIT);
        setPage(pageNo);
      }
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("Error", "Unable to get astrologer data.");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };



  // Fetch expertise list
  const getExpertiseList = async () => {
    try {
      const res = await axios.get(`${api}/admin/get-all-main-expertise`);
      if (res?.data) {
        setExpertiseList(res.data.mainExpertise);
        console.log(res.data.mainExpertise[0], 'res.data.mainExpertise')
      }
    } catch (error) {
      console.error('Error fetching expertise:', error);
    }
  };
  useEffect(() => {
    getExpertiseList();
  }, []);
  console.log({ astrologers })
  let finalList = astrologers;

  const topAstrologer = astrologers.find(
    (astro) => astro._id === topAstrologerId
  );

  if (
    shouldShowTopAstrologer &&
    topAstrologer &&
    !astrologers.some((a, i) => i === 0 && a._id === topAstrologerId)
  ) {
    finalList = [topAstrologer, ...astrologers.filter(a => a._id !== topAstrologerId)];
  }

  if (mode === "chat") {
    finalList = finalList.filter(a => a._id !== topAstrologerId);
  }

  // const finalAstrologers =
  //   shouldShowTopAstrologer && topAstrologer
  //     ? [topAstrologer, ...filteredAstrologers]
  //     : filteredAstrologers;
  // const finalList =
  //   mode === 'chat'
  //     ? finalAstrologers.filter(
  //       (astro) => astro._id !== topAstrologerId
  //     )
  //     : finalAstrologers;


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

  const Container = routeMode ? View : SafeAreaView;

  return routeMode ? (
    <View style={styles.container}>
      {!routeMode && <MyHeader />}

      {/* <MyLoader isVisible={isLoading} /> */}

      {/* Header with Search + Filter */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color="#999" />

          <TextInput
            style={styles.searchInput}
            placeholder="Search astrologers..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>


        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Icon name="filter-variant" size={24} color="#db9a4a" />
        </TouchableOpacity>
      </View>


      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#db9a4a']}      // Android
            tintColor="#db9a4a"       // iOS
          />
        }
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
                    {/* <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeText}>⭐ {astro.rating || '4.5'}</Text>
                    </View> */}
                    <View style={[styles.infoBadge, { backgroundColor: '#E8F5E9' }]}>
                      <Text style={[styles.infoBadgeText, { color: '#4CAF50' }]}>
                        {astro.experience || '5'}+ yrs
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.astrologerTagline} numberOfLines={1}>
                    {astro.title || 'Expert Astrologer'}
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
                    selectedExpertise === item.mainExpertise && styles.selectedExpertiseItem,
                  ]}
                  onPress={() => {
                    setSelectedExpertise(item.mainExpertise);
                    setFilterVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.expertiseText,
                      selectedExpertise === item.mainExpertise && { color: '#FFF' },
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
  ) : (
    <SafeAreaView edges={['top']} style={styles.container}>
      {!routeMode && <MyHeader />}

      <MyLoader isVisible={isLoading} />

      {/* Header with Search + Filter */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color="#999" />

          <TextInput
            style={styles.searchInput}
            placeholder="Search astrologers..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#db9a4a']}
            tintColor="#db9a4a"
          />
        }
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
                    {/* <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeText}>⭐ {astro.rating || '4.5'}</Text>
                    </View> */}
                    <View style={[styles.infoBadge, { backgroundColor: '#E8F5E9' }]}>
                      <Text style={[styles.infoBadgeText, { color: '#4CAF50' }]}>
                        {astro.experience || '5'}+ yrs
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.astrologerTagline} numberOfLines={1}>
                    {astro.title || 'Expert Astrologer'}
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
                    selectedExpertise === item.mainExpertise && styles.selectedExpertiseItem,
                  ]}
                  onPress={() => {
                    setSelectedExpertise(item.mainExpertise);
                    setFilterVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.expertiseText,
                      selectedExpertise === item.mainExpertise && { color: '#FFF' },
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
    </SafeAreaView>
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
  // searchBar: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#F8F4EF',
  //   borderRadius: 12,
  //   paddingHorizontal: 12,
  //   height: 42,
  //   borderWidth: 1,
  //   borderColor: '#E8DCC8',
  // },
  filterButton: { marginLeft: 10 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    paddingVertical: 0,
    marginHorizontal: 8,
  },

  clearIcon: {
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
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
