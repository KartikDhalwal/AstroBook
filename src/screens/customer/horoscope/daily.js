import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import MyHeader from '../../../components/MyHeader';
import { colors } from '../../../config/Constants1';
import { SCREEN_WIDTH } from '../../../config/Screen';
import { Colors } from '../../../assets/style';

// Separate header component (outside render)
const DailyRashiHeader = ({ title, navigation }) => (
  <MyHeader
    title={title}
    navigation={navigation}
    statusBar={{
      backgroundColor: colors.background_theme2,
      barStyle: 'light-content',
    }}
  />
);

const DailyRashi = props => {
  const { navigation, route } = props;
  const { horoscope, data = {} } = route?.params || {};

  // Set header only once
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => <DailyRashiHeader title={horoscope} navigation={navigation} />,
    });
  }, [navigation, horoscope]);

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Emotions</Text>
        <Text style={styles.sectionText}>{data.emotions}</Text>

        <Text style={styles.sectionTitle}>Health</Text>
        <Text style={styles.sectionText}>{data.health}</Text>

        <Text style={styles.sectionTitle}>Luck</Text>
        <Text style={styles.sectionText}>{data.luck}</Text>

        <Text style={styles.sectionTitle}>Personal Life</Text>
        <Text style={styles.sectionText}>{data.personal_life}</Text>

        <Text style={styles.sectionTitle}>Profession</Text>
        <Text style={styles.sectionText}>{data.profession}</Text>

        <Text style={styles.sectionTitle}>Travel</Text>
        <Text style={styles.sectionText}>{data.travel}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fafdf6',
    width: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
    paddingBottom: 10,
  },
  sectionTitle: {
    color: 'black',
    fontWeight: 'bold',
    marginVertical: 5,
    fontSize: 18,
  },
  sectionText: {
    color: Colors.black,
    marginHorizontal: 7,
    fontSize: 16,
  },
});

export default DailyRashi;
