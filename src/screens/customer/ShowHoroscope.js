import React, { useLayoutEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import MyHeader from '../../components/MyHeader';
import { colors, fonts, getFontSize } from '../../config/Constants1';
import DailyRashi from './horoscope/daily';
import WeeklyRashi from './horoscope/weekly';
import { SafeAreaView } from 'react-native-safe-area-context';

// ✅ Separate Header Component
const HoroscopeHeader = ({ navigation }) => (
  <MyHeader
    title="Horoscope"
    navigation={navigation}
    statusBar={{
      backgroundColor: colors.background_theme2,
      barStyle: 'light-content',
    }}
  />
);

const ShowHoroscope = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('daily');
  const [indicatorAnim] = useState(new Animated.Value(0)); // for smooth transition

  const horoscopeData = route?.params?.data || {};

  // ✅ Header setup
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => <HoroscopeHeader navigation={navigation} />,
    });
  }, [navigation]);

  // ✅ Animate indicator when tab changes
  const switchTab = (tab) => {
    setActiveTab(tab);
    Animated.timing(indicatorAnim, {
      toValue: tab === 'daily' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // ✅ Interpolated indicator position
  const indicatorTranslate = indicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    // <View>
      <View style={styles.container}>
        {/* Custom Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'daily' && styles.activeTab]}
            onPress={() => switchTab('daily')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'daily' && styles.activeTabText,
              ]}
            >
              {t('daily1')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'weekly' && styles.activeTab]}
            onPress={() => switchTab('weekly')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'weekly' && styles.activeTabText,
              ]}
            >
              {t('weekly')}
            </Text>
          </TouchableOpacity>

          {/* Animated Indicator */}
          <Animated.View
            style={[
              styles.indicator,
              { transform: [{ translateX: indicatorTranslate }] },
            ]}
          />
        </View>

        {/* Dynamic Screen Content */}
        <View style={styles.contentContainer}>
          {activeTab === 'daily' ? (
            <DailyRashi route={{ params: { data: horoscopeData } }} navigation={navigation} />
          ) : (
            <WeeklyRashi route={{ params: { data: horoscopeData } }} navigation={navigation} />
          )}
        </View>
      </View>
    // </View>
  );
};

export default ShowHoroscope;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background_theme1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background_theme1,
    borderBottomWidth: 1,
    borderColor: colors.background_theme2,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontSize: getFontSize(1.5),
    // fontFamily: fonts.medium,
    color: colors.text_secondary || '#777',
  },
  activeTabText: {
    color: colors.background_theme2,
    fontWeight: 'bold',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50%',
    height: 3,
    backgroundColor: colors.background_theme2,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 5,
  },
});
