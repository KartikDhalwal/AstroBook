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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IMAGE_BASE_URL from '../imageConfig';

const AstrologerDetailsScreen = ({ route, navigation, }) => {
  const { astrologer, mode } = route.params;
  const expertiseScrollRef = useRef(null);
  console.log(astrologer?.consultationPrices, 'consultationPrices')
  if (!astrologer) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>No data available</Text>
      </SafeAreaView>
    );
  }

const getImageUrl = (path) => {
  if (!path) return null;

  // If already a full URL
  if (path.startsWith('http')) {
    return `${path}?format=jpg`; // 👈 fixes RN no-extension issue
  }

  // Relative path from backend
  return `${IMAGE_BASE_URL}${path}?format=jpg`;
};

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
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        {/* <View style={styles.header}>
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
        </View> */}

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
          <View style={styles.badgesRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
                ⭐ {astrologer.avg_rating || 'New'}
              </Text>
            </View>
            <View style={[styles.infoBadge, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.infoBadgeText, { color: '#4CAF50' }]}>
                {astrologer.experience} Years
              </Text>
            </View>
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
            <TouchableOpacity style={styles.socialCard} onPress={() => Linking.openURL('https://www.youtube.com/@acharyalavbhushan')}>
              <Icon name="youtube" size={24} color="#FF0000" />
              <Text style={styles.socialText} numberOfLines={1}>
                Acharya Lav Bhushan's Youtube Channel
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Buttons */}
      <View style={styles.stickyContainer}>
        {mode === 'voice' ? (

          <TouchableOpacity
            style={[styles.actionButton, styles.voiceButton]}
            onPress={() =>
              navigation.navigate('SlotDetails', {
                astrolger: astrologer,
                mode
              })
            }
          >
            <Icon name="phone" size={20} color="#fff" />
            <Text style={styles.actionText}>Voice Call</Text>
          </TouchableOpacity>
        ) : null}
        {mode === 'video' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.videoButton]}
            onPress={() =>
              navigation.navigate('SlotDetails', {
                astrolger: astrologer,
                mode
              })
            }
          >
            <Icon name="video" size={20} color="#fff" />
            <Text style={styles.actionText}>Video Call</Text>
          </TouchableOpacity>
        ) : null}
        {mode === 'chat' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.videoButton]}
            onPress={() =>
              navigation.navigate('SlotDetails', {
                astrolger: astrologer,
                mode
              })
            }
          >
            <Icon name="chat" size={20} color="#fff" />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default AstrologerDetailsScreen;

// 🧾 STYLES (same as your base with minor cleanup)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4EF',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingHorizontal: 8,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  imageWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFD580',
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C1810',
    marginTop: 16,
    textAlign: 'center',
  },

  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Badges Row
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  ratingText: {
    fontSize: 14,
    color: '#db9a4a',
    fontWeight: '600',
  },

  infoBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  infoBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },

  location: {
    fontSize: 13,
    color: '#777',
    marginTop: 10,
  },

  // Quick Info Container
  quickInfoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },

  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C1810',
  },

  // Section Styles
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 8,
  },

  // Arrow Container
  arrowContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE4B5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // About Card
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#db9a4a',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  aboutText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },

  // Horizontal List (Expertise)
  horizontalList: {
    paddingVertical: 4,
  },

  expertiseCard: {
    width: 110,
    marginRight: 12,
    marginLeft: 4,
    marginVertical: 4,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    lineHeight: 16,
  },

  // Tiles Container (Skills/Remedies)
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
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  skillText: {
    fontSize: 13,
    color: '#2C1810',
    marginLeft: 6,
    fontWeight: '500',
  },

  remedyTile: {
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD580',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  remedyText: {
    fontSize: 13,
    color: '#2C1810',
    fontWeight: '500',
  },

  // Price Card
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  priceLeft: {
    flex: 1,
    paddingRight: 12,
  },

  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C1810',
    marginBottom: 4,
  },

  priceSubtext: {
    fontSize: 12,
    color: '#666',
  },

  priceRight: {
    alignItems: 'flex-end',
  },

  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#db9a4a',
  },

  // Social Card
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD580',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  socialText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },

  // Sticky Container (Bottom Buttons)
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0E8DC',
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  voiceButton: {
    backgroundColor: '#4CAF50',
  },

  videoButton: {
    backgroundColor: '#db9a4a',
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
