import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const AboutUsScreen = ({ navigation }) => {
  const handleBookNow = () => {
    navigation.navigate("AstrolgersList", { mode: "video" })
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF7EE" />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <View style={styles.heroCard}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroSubtitle}>
                Celebrity Astrologer | Vastu Expert | Life Coach
              </Text>
              <Text style={styles.heroTitle}>
                Get One-to-One Consultation from Acharya LavBhushan
              </Text>
              <Text style={styles.heroDescription}>
                Acharya LavBhushan is a renowned Vedic astrologer and Vastu
                expert known for accurate predictions, practical remedies and
                result-oriented guidance in career, marriage, finance, health,
                business and overall life decisions.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleBookNow}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  Book Consultation
                </Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{
                uri: "https://www.acharyalavbhushan.com/achaarya_lavbhoosan.png",
              }}
              style={styles.heroImage}
            />
          </View>

          {/* About / Story Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Acharya LavBhushan</Text>
            <Text style={styles.sectionBodyText}>
              Acharya LavBhushan has spent years studying and practicing Vedic
              astrology, Vastu Shastra and related occult sciences. His approach
              combines traditional shastra-based wisdom with a very practical
              and modern outlook, so that guidance is not only spiritually
              correct but also implementable in daily life.
            </Text>
            <Text style={styles.sectionBodyText}>
              Over the years, he has guided people from all walks of life –
              students, professionals, business owners, homemakers and
              celebrities – helping them understand their horoscope, current
              planetary periods, upcoming opportunities and challenges, and the
              right timing for important decisions.
            </Text>
            <Text style={styles.sectionBodyText}>
              Every consultation is done personally with patience and clarity.
              Rather than creating fear, the focus is always on showing the
              right direction and giving you the confidence to move ahead with a
              clear mind.
            </Text>
          </View>

          {/* Highlights / USPs Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why People Trust Us</Text>
            <Text style={styles.sectionSubtitle}>
              Authentic Vedic guidance backed by experience, ethics and
              technology.
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Icon name="account-star" size={26} color="#B6732F" />
                <Text style={styles.statTitle}>Decades of Experience</Text>
                <Text style={styles.statText}>
                  Years of hands-on practice in astrology and Vastu with
                  thousands of charts analyzed and lives guided.
                </Text>
              </View>

              <View style={styles.statCard}>
                <Icon name="gesture-tap" size={26} color="#B6732F" />
                <Text style={styles.statTitle}>Personalised Guidance</Text>
                <Text style={styles.statText}>
                  Every chart is read in detail and remedies are suggested as
                  per your situation, capacity and comfort.
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Icon name="earth" size={26} color="#B6732F" />
                <Text style={styles.statTitle}>Online & Global Reach</Text>
                <Text style={styles.statText}>
                  Video / audio / chat-based consultations for clients across
                  India and abroad, from the comfort of your home.
                </Text>
              </View>

              <View style={styles.statCard}>
                <Icon name="shield-check" size={26} color="#B6732F" />
                <Text style={styles.statTitle}>Honest & Ethical</Text>
                <Text style={styles.statText}>
                  No fear-based predictions, no false promises – only honest,
                  clear and confidential guidance with full integrity.
                </Text>
              </View>
            </View>
          </View>

          {/* Mission / Philosophy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.sectionBodyText}>
              Our mission is to make astrology genuinely useful for everyone –
              not just as a predictive tool, but as a roadmap for life. We
              believe that when you understand your horoscope properly, you
              understand your strengths, weaknesses and life pattern with much
              more clarity.
            </Text>
            <Text style={styles.sectionBodyText}>
              Instead of creating dependency, we work to empower you. The aim of
              each session is to clear confusion, reduce anxiety and help you
              take better decisions – with the support of authentic Vedic
              knowledge and practical remedies.
            </Text>
          </View>

          {/* What We Offer – matching site sections: Consultation, Reports, Courses, Puja */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What We Offer</Text>
            <Text style={styles.sectionSubtitle}>
              End-to-end astrology solutions – from consultation to detailed
              reports, courses and puja.
            </Text>

            <View style={styles.serviceCard}>
              <View style={styles.serviceIconWrapper}>
                <Icon name="account-voice" size={22} color="#B6732F" />
              </View>
              <View style={styles.serviceTextWrapper}>
                <Text style={styles.serviceTitle}>
                  Personal Consultations
                </Text>
                <Text style={styles.serviceText}>
                  One-to-one sessions on love & marriage, career, business,
                  education, finance, health, family issues and more – with
                  detailed horoscope and dasha analysis.
                </Text>
              </View>
            </View>

            {/* <View style={styles.serviceCard}>
              <View style={styles.serviceIconWrapper}>
                <Icon name="file-document-star" size={22} color="#B6732F" />
              </View>
              <View style={styles.serviceTextWrapper}>
                <Text style={styles.serviceTitle}>Personalised Reports</Text>
                <Text style={styles.serviceText}>
                  In-depth written reports on life journey, career prospects,
                  marriage timing, yearly trends and other specific areas – so
                  you can refer back whenever needed.
                </Text>
              </View>
            </View> */}

            <View style={styles.serviceCard}>
              <View style={styles.serviceIconWrapper}>
                <Icon name="school-outline" size={22} color="#B6732F" />
              </View>
              <View style={styles.serviceTextWrapper}>
                <Text style={styles.serviceTitle}>Courses & Learning</Text>
                <Text style={styles.serviceText}>
                  Structured courses and mentorship for students who wish to
                  learn astrology and Vastu in a systematic and practical way.
                </Text>
              </View>
            </View>

            <View style={styles.serviceCard}>
              <View style={styles.serviceIconWrapper}>
                <Icon name="hand-coin" size={22} color="#B6732F" />
              </View>
              <View style={styles.serviceTextWrapper}>
                <Text style={styles.serviceTitle}>Puja & Remedies</Text>
                <Text style={styles.serviceText}>
                  Suggesting and arranging specific pujas, anushthans, mantra
                  jaap, daan and other karma-based remedies as per your chart
                  and requirements.
                </Text>
              </View>
            </View>
          </View>

          {/* How Consultations Work */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How a Session Works</Text>

            <View className="timeline">
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>1. Share Your Details</Text>
                  <Text style={styles.timelineText}>
                    You provide your birth date, time, place and a short note
                    about the main issues or questions you want to discuss
                    during the session.
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    2. Horoscope Preparation
                  </Text>
                  <Text style={styles.timelineText}>
                    Your kundli is prepared and examined in depth – including
                    lagna chart, Navamsha, planetary strengths, yogas, doshas
                    and current mahadasha / antardasha.
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    3. One-to-One Discussion
                  </Text>
                  <Text style={styles.timelineText}>
                    In the live session, you get clear explanations, timing
                    insights and practical guidance. All your questions are
                    addressed patiently.
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    4. Remedies & Follow-Up
                  </Text>
                  <Text style={styles.timelineText}>
                    Simple, doable remedies are suggested. Where needed, puja,
                    anushthan or follow-up sessions are recommended for deeper,
                    long-term results.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* USPs / Values */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Why Choose Acharya LavBhushan?
            </Text>

            <View style={styles.valuesRow}>
              <View style={styles.valueChip}>
                <Icon name="clock-outline" size={18} color="#B6732F" />
                <Text style={styles.valueChipText}>24x7 Chat Support</Text>
              </View>
              <View style={styles.valueChip}>
                <Icon name="account-group-outline" size={18} color="#B6732F" />
                <Text style={styles.valueChipText}>
                  Guidance for All Age Groups
                </Text>
              </View>
              <View style={styles.valueChip}>
                <Icon name="shield-check" size={18} color="#B6732F" />
                <Text style={styles.valueChipText}>Confidential & Safe</Text>
              </View>
              <View style={styles.valueChip}>
                <Icon name="star-four-points-outline" size={18} color="#B6732F" />
                <Text style={styles.valueChipText}>
                  Result-Oriented Remedies
                </Text>
              </View>
              <View style={styles.valueChip}>
                <Icon name="earth" size={18} color="#B6732F" />
                <Text style={styles.valueChipText}>Pan-India & Overseas</Text>
              </View>
            </View>

            <Text style={styles.sectionBodyText}>
              Every case is treated with sensitivity and respect. Your details
              and concerns remain private, and you get realistic, straight
              forward answers – whether the situation is positive or
              challenging. The intention behind every consultation is to bring
              clarity, courage and inner peace to your life.
            </Text>
          </View>

          {/* CTA / Footer */}
          <View style={styles.footerCard}>
            <Text style={styles.footerTitle}>Ready to Get Clarity?</Text>
            <Text style={styles.footerText}>
              If you feel stuck, confused or are standing at a major turning
              point in life, a focused astrology session with Acharya Lav
              Bhushan can help you understand the bigger picture and choose the
              right path ahead.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBookNow}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Schedule a Session</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF7EE",
  },
  container: {
    flex: 1,
    backgroundColor: "#FDF7EE",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },

  /* Hero */
  heroCard: {
    flexDirection: "row",
    backgroundColor: "#FFF8ED",
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    marginBottom: 18,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#00000030",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  heroTextContainer: {
    flex: 1.4,
    paddingRight: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B6732F",
    marginBottom: 4,
    width:1000
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
    width:280
  },
  heroDescription: {
    fontSize: 13,
    color: "#4A4A4A",
    lineHeight: 18,
    marginBottom: 10,
  },
  heroImage: {
    flex: 1,
    height: 110,
    borderRadius: 14,
  },

  primaryButton: {
    backgroundColor: "#B6732F",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  /* Sections */
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6A6A6A",
    marginBottom: 12,
  },
  sectionBodyText: {
    fontSize: 13,
    color: "#474747",
    lineHeight: 20,
    marginBottom: 8,
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 10,
    elevation: 1,
    shadowColor: "#00000020",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 6,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: "#5A5A5A",
    lineHeight: 17,
  },

  /* Services */
  serviceCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#00000015",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  serviceIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#F0D7B2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  serviceTextWrapper: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  serviceText: {
    fontSize: 12,
    color: "#555555",
    lineHeight: 18,
  },

  /* Timeline */
  timelineItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#B6732F",
    marginTop: 5,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  timelineText: {
    fontSize: 12,
    color: "#555555",
    lineHeight: 18,
  },

  /* Values / USP chips */
  valuesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  valueChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5E6",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  valueChipText: {
    fontSize: 12,
    color: "#7F4C15",
    marginLeft: 6,
    fontWeight: "500",
  },

  /* Footer */
  footerCard: {
    backgroundColor: "#FFF2DF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  footerText: {
    fontSize: 13,
    color: "#4A4A4A",
    lineHeight: 19,
    marginBottom: 10,
  },
  bottomSpace: {
    height: 10,
  },
});
