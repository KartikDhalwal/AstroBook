// screens/AstrologerDetailsScreen.js
import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BASE_URL = 'https://api.acharyalavbhushan.com/';
const { width } = Dimensions.get('window');

const AstrologerDetailsScreen = ({ route, navigation }) => {
  const { astrologer } = route.params;
  const expertiseScrollRef = useRef(null);

  if (!astrologer) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>No data available</Text>
      </SafeAreaView>
    );
  }

  const getImageUrl = (path) =>
    path?.startsWith('http') ? path : `${BASE_URL}${path}`;

  const scrollLeft = (ref) => {
    ref.current?.scrollToOffset({
      offset: Math.max(0, ref.current._listRef._scrollMetrics.offset - 220),
      animated: true,
    });
  };

  const scrollRight = (ref) => {
    ref.current?.scrollToOffset({
      offset: ref.current._listRef._scrollMetrics.offset + 220,
      animated: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={26} color="#db9a4a" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {astrologer.astrologerName}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: getImageUrl(astrologer.profileImage) }}
              style={styles.image}
            />
          </View>
          <Text style={styles.name}>
            {astrologer.displayName || astrologer.astrologerName}
          </Text>
          <Text style={styles.tagline}>{astrologer.tagLine}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              ⭐ {astrologer.avg_rating || 'New'}
            </Text>
            <Text style={styles.experienceText}>
              • {astrologer.experience} Years
            </Text>
          </View>
          <Text style={styles.location}>
            📍 {astrologer.city}, {astrologer.state}
          </Text>
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Languages</Text>
            <Text style={styles.infoValue}>
              {astrologer.language?.slice(0, 2).join(', ') || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Consultations</Text>
            <Text style={styles.infoValue}>500+</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              {astrologer.about ||
                'Experienced astrologer dedicated to providing insightful guidance and solutions.'}
            </Text>
          </View>
        </View>

        {/* Expertise */}
        {astrologer.mainExpertise?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Main Expertise</Text>
              <View style={styles.arrowContainer}>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={() => scrollLeft(expertiseScrollRef)}
                >
                  <Icon name="chevron-left" size={22} color="#db9a4a" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={() => scrollRight(expertiseScrollRef)}
                >
                  <Icon name="chevron-right" size={22} color="#db9a4a" />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              ref={expertiseScrollRef}
              data={astrologer.mainExpertise}
              horizontal
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <View style={styles.expertiseCard}>
                  <Image
                    source={{ uri: getImageUrl(item.image) }}
                    style={styles.expertiseImage}
                  />
                  <Text style={styles.expertiseText}>{item.mainExpertise}</Text>
                </View>
              )}
            />
          </View>
        )}

        {/* Skills */}
        {astrologer.skill?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Specializations</Text>
            <View style={styles.tilesContainer}>
              {astrologer.skill.map((s, idx) => (
                <View key={idx} style={styles.skillTile}>
                  <Icon name="star-outline" size={16} color="#db9a4a" />
                  <Text style={styles.skillText}>{s.skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Remedies */}
        {astrologer.remedies?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Remedies Offered</Text>
            <View style={styles.tilesContainer}>
              {astrologer.remedies.map((remedy) => (
                <View key={remedy._id} style={styles.remedyTile}>
                  <Text style={styles.remedyText}>{remedy.title}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Consultation Prices */}
        {astrologer.consultationPrices?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consultation Packages</Text>
            {astrologer.consultationPrices.map((item, idx) => (
              <View key={idx} style={styles.priceCard}>
                <View style={styles.priceLeft}>
                  <Text style={styles.durationText}>
                    {item.duration?.slotDuration} Minutes
                  </Text>
                  <Text style={styles.priceSubtext}>
                    One-on-one consultation
                  </Text>
                </View>
                <View style={styles.priceRight}>
                  <Text style={styles.priceText}>₹{item.price}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* YouTube Link */}
        {astrologer.youtubeLink && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connect on YouTube</Text>
            <TouchableOpacity style={styles.socialCard}>
              <Icon name="youtube" size={24} color="#FF0000" />
              <Text style={styles.socialText} numberOfLines={1}>
                {astrologer.youtubeLink}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Buttons */}
      <SafeAreaView style={styles.stickyContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.voiceButton]}
          onPress={() =>
            navigation.navigate('VoiceVideoCallScreen', {
              isVideo: false,
              astrologerData: astrologer,
            })
          }
        >
          <Icon name="phone" size={20} color="#fff" />
          <Text style={styles.actionText}>Voice Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.videoButton]}
          onPress={() =>
            navigation.navigate('VoiceVideoCallScreen', {
              isVideo: true,
              astrologerData: astrologer,
            })
          }
        >
          <Icon name="video" size={20} color="#fff" />
          <Text style={styles.actionText}>Video Call</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default AstrologerDetailsScreen;

// 🧾 STYLES (same as your base with minor cleanup)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4EF' },
  scrollContent: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1810',
    flex: 1,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFD580',
  },
  name: { fontSize: 22, fontWeight: '700', color: '#2C1810', marginTop: 12 },
  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: { fontSize: 14, color: '#db9a4a', fontWeight: '600' },
  experienceText: { fontSize: 14, color: '#666', marginLeft: 8 },
  location: { fontSize: 13, color: '#777', marginTop: 8 },
  quickInfoContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#2C1810' },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2C1810' },
  arrowContainer: { flexDirection: 'row', gap: 8 },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE4B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#db9a4a',
  },
  aboutText: { fontSize: 14, color: '#555', lineHeight: 22 },
  horizontalList: { paddingRight: 16 },
  expertiseCard: {
    width: 110,
    marginRight: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
  },
  expertiseImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  expertiseText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#2C1810',
    fontWeight: '600',
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  skillText: { fontSize: 13, color: '#2C1810', marginLeft: 6 },
  remedyTile: {
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD580',
  },
  remedyText: { fontSize: 13, color: '#2C1810' },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  priceText: { fontSize: 18, fontWeight: '700', color: '#db9a4a' },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD580',
  },
  socialText: { flex: 1, fontSize: 14, color: '#007AFF' },
  stickyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  voiceButton: { backgroundColor: '#4CAF50' },
  videoButton: { backgroundColor: '#db9a4a' },
  actionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
});
