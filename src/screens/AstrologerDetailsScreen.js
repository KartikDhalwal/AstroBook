// screens/AstrologerDetailsScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AstrologerDetailsScreen = ({ route, navigation }) => {
  const { astrologer } = route.params;

  if (!astrologer) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>No data available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{astrologer.astrologerName}</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${astrologer.profileImage?.startsWith('http') ? astrologer.profileImage : 'https://yourdomain.com/' + astrologer.profileImage}` }}
            style={styles.image}
          />
          <Text style={styles.tagline}>{astrologer.tagLine}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{astrologer.about || 'No description available.'}</Text>

          <Text style={styles.sectionTitle}>Experience</Text>
          <Text style={styles.valueText}>{astrologer.experience} Years</Text>

          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.valueText}>{astrologer.language?.join(', ') || 'N/A'}</Text>

          <Text style={styles.sectionTitle}>Expertise</Text>
          <Text style={styles.valueText}>
            {astrologer.mainExpertise?.length ? astrologer.mainExpertise.join(', ') : 'N/A'}
          </Text>

          <Text style={styles.sectionTitle}>Rating</Text>
          <Text style={styles.valueText}>⭐ {astrologer.rating || 'No rating yet'}</Text>

          <Text style={styles.sectionTitle}>Consultation Prices</Text>
          {astrologer.consultationPrices?.map((item, idx) => (
            <Text key={idx} style={styles.valueText}>
              • ₹{item.price} ({item.duration})
            </Text>
          ))}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('VoiceVideoCallScreen', {
                isVideo: false,
                astrologerData: astrologer,
              })
            }
          >
            <Text style={styles.actionText}>🔊 Start Voice Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF8C00' }]}
            onPress={() =>
              navigation.navigate('VoiceVideoCallScreen', {
                isVideo: true,
                astrologerData: astrologer,
              })
            }
          >
            <Text style={styles.actionText}>🎥 Start Video Call</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AstrologerDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  backText: {
    color: '#FF8C00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 20,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#FFD580',
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#444',
  },
  aboutText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  valueText: {
    fontSize: 13,
    color: '#555',
    marginTop: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 25,
  },
  actionButton: {
    backgroundColor: '#FFAE42',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
