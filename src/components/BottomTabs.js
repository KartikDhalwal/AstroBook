import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import VoiceCall from '../screens/Voicecall';
import { SafeAreaView } from 'react-native-safe-area-context';

const BottomTabs = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen />;
      case 'VoiceCall':
        return <VoiceCall />;
      case 'VideoCall':
        return <VoiceCall />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>

      {/* Custom Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TabButton
          label="Home"
          icon="🏠"
          isActive={activeTab === 'Home'}
          onPress={() => setActiveTab('Home')}
        />
        <TabButton
          label="Voice Call"
          icon="📞"
          isActive={activeTab === 'VoiceCall'}
          onPress={() => setActiveTab('VoiceCall')}
        />
        <TabButton
          label="Video Call"
          icon="🎥"
          isActive={activeTab === 'VideoCall'}
          onPress={() => setActiveTab('VideoCall')}
        />
        <TabButton
          label="Get Report"
          icon="📝"
          isActive={activeTab === 'Home'}
          onPress={() => setActiveTab('Home')}
        />
        <TabButton
          label="Book Pooja"
          icon="🙏"
          isActive={activeTab === 'Call'}
          onPress={() => setActiveTab('Call')}
        />
      </View>
    </SafeAreaView>
  );
};

const TabButton = ({ label, icon, isActive, onPress }) => {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.icon, isActive && styles.activeIcon]}>{icon}</Text>
      <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    color: '#777',
  },
  label: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  activeIcon: {
    color: '#000',
  },
  activeLabel: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default BottomTabs;
