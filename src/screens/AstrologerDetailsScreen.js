// screens/AstrologerDetailsScreen.js
import React, { useEffect, useRef, useState } from 'react';
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
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IMAGE_BASE_URL from '../imageConfig';
import axios from 'axios';
import api from '../apiConfig';

import { PixelRatio } from 'react-native';

const BASE_WIDTH = 375; // iPhone / standard Android baseline

const SCREEN_WIDTH = Dimensions.get('window').width;
const REVIEW_CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.88, 360);
const REVIEW_CARD_GAP = 16;

const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;

// Prevent huge scaling on tablets
const spacing = (size) => Math.min(scale(size), size * 1.3);
const H_PADDING = spacing(16);


const AstrologerDetailsScreen = ({ route, navigation, }) => {
  const insets = useSafeAreaInsets(); // 👈 IMPORTANT

  const { astrologer, mode } = route.params;
  const expertiseScrollRef = useRef(null);
  const reviewSliderRef = useRef(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (!reviews.length) return;

    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % reviews.length;
      reviewSliderRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [reviews]);


  useEffect(() => {
    if (!reviews.length) return;

    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % reviews.length;
      reviewSliderRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [reviews]);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await axios.post(
        `${api}/admin/get-astrologer-review`,
        { astrologerId: astrologer?._id },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(res.data, 'res.data')
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (error) {
      console.log('Review fetch error:', error);
    } finally {
      setLoadingReviews(false);
    }
  };
  const averageRating =
    reviews.length > 0
      ? (
        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        reviews.length
      ).toFixed(1)
      : null;


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
  const reviewSnapOffsets = reviews.map(
    (_, index) => index * (REVIEW_CARD_WIDTH + REVIEW_CARD_GAP)
  );


  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F4EF"
        translucent={false}
      />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: spacing(80) + Math.max(insets.bottom, 16) },
          ]}
        >
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
              {astrologer.rating !== 0 &&
              
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>
                  ⭐ {astrologer.rating || 'New'}
                </Text>
              </View>
              }
              <View style={[styles.infoBadge, { backgroundColor: '#E8F5E9' }]}>
                <Text style={[styles.infoBadgeText, { color: '#4CAF50' }]}>
                  {astrologer.experience}+ Years
                </Text>
              </View>
            </View>
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
          {/* Reviews Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>

            {reviews.length > 0 && (
              <View style={styles.reviewSummary}>
                <Text style={styles.avgRating}>⭐ {averageRating}</Text>
                <Text style={styles.reviewCount}>
                  {reviews.length} Reviews
                </Text>
              </View>
            )}

            {loadingReviews ? (
              <Text style={styles.loadingText}>Loading reviews...</Text>
            ) : reviews.length === 0 ? (
              <View style={styles.emptyReview}>
                <Text style={styles.emptyReviewText}>
                  No reviews yet
                </Text>
              </View>
            ) : (
              <View style={{ marginHorizontal: -H_PADDING }}>
                <FlatList
                  ref={reviewSliderRef}
                  data={reviews}
                  horizontal
                  showsHorizontalScrollIndicator={false}

                  snapToOffsets={reviewSnapOffsets}
                  snapToAlignment="center"
                  decelerationRate="fast"

                  keyExtractor={(_, index) => index.toString()}

                  contentContainerStyle={{
                    paddingHorizontal: (SCREEN_WIDTH - REVIEW_CARD_WIDTH) / 2,
                  }}

                  ItemSeparatorComponent={() => (
                    <View style={{ width: REVIEW_CARD_GAP }} />
                  )}

                  renderItem={({ item }) => (
                    <View style={[styles.reviewCard, { width: REVIEW_CARD_WIDTH, marginBottom: 4 }]}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewUser}>
                          {item.customerName || 'Anonymous'}
                        </Text>
                        <Text style={styles.reviewRating}>⭐ {item.rating}</Text>
                      </View>

                      <Text style={styles.reviewText} numberOfLines={4}>
                        {item.reviewText || 'No comment provided'}
                      </Text>

                      <Text style={styles.reviewDate}>
                        {new Date(item.createdAt).toDateString()}
                      </Text>
                    </View>
                  )}
                />
              </View>

            )}
          </View>


          {/* YouTube Link */}
          {astrologer?.youtubeLink && (
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
        </ScrollView>

        {/* Sticky Buttons */}
        <View
          style={[
            styles.stickyContainer,
            { 
              paddingBottom: Math.max(insets.bottom , 16),
              paddingLeft: Math.max(insets.left, 16),
              paddingRight: Math.max(insets.right, 16),
            },
          ]}
        >
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
    </SafeAreaView>
  );
};

export default AstrologerDetailsScreen;

// 🧾 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4EF',
  },
  scrollContent: {
    paddingTop: spacing(16),
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
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
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F4EF',
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
  quickInfoContainer: {
    flexDirection: 'row',
    paddingHorizontal: H_PADDING,
    marginTop: spacing(16),
    gap: spacing(12),
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
  section: {
    marginTop: spacing(20),
    paddingHorizontal: H_PADDING,
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  avgRating: {
    fontSize: 20,
    fontWeight: '700',
    color: '#db9a4a',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewUser: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C1810',
  },
  reviewRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#db9a4a',
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  noComment: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#999',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  emptyReview: {
    backgroundColor: '#FFF9F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyReviewText: {
    fontSize: 14,
    color: '#999',
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
    marginBottom: spacing(8),
  },
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
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
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