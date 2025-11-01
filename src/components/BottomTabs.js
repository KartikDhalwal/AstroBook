import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AstroTalkHome from '../screens/HomeScreen';
import AstrolgersList from '../screens/AstrolgersList';
import PoojaList from '../screens/PoojaList';

const BottomTabs = () => {
  const [activeTab, setActiveTab] = useState('VideoCall');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <AstroTalkHome />;
      case 'VoiceCall':
        return <AstrolgersList mode="voice" />;
      case 'VideoCall':
        return <AstrolgersList mode="video" />;
      case 'LiveChat':
        return <AstrolgersList mode="chat" />;
      case 'PoojaList':
        return <PoojaList />;
      default:
        return <AstroTalkHome />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        <TabButton
          label="Home"
          icon="home-outline"
          activeIcon="home"
          isActive={activeTab === 'Home'}
          onPress={() => setActiveTab('Home')}
        />
        <TabButton
          label="Voice Call"
          icon="call-outline"
          activeIcon="call"
          isActive={activeTab === 'VoiceCall'}
          onPress={() => setActiveTab('VoiceCall')}
        />
        <TabButton
          label="Video Call"
          icon="videocam-outline"
          activeIcon="videocam"
          isActive={activeTab === 'VideoCall'}
          onPress={() => setActiveTab('VideoCall')}
        />
        <TabButton
          label="Live Chat"
          icon="chatbubble-outline"
          activeIcon="chatbubble"
          isActive={activeTab === 'LiveChat'}
          onPress={() => setActiveTab('LiveChat')}
        />
        <TabButton
          label="Book Pooja"
          icon="campfire"
          activeIcon="campfire"
          isActive={activeTab === 'PoojaList'}
          onPress={() => setActiveTab('PoojaList')}
          activeTab
        />
      </View>
    </SafeAreaView>
  );
};

const TabButton = ({ label, icon, activeIcon, isActive, onPress, activeTab }) => {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress} activeOpacity={0.7}>
      {activeTab ? (<MaterialCommunityIcons
        name={isActive ? activeIcon : icon}
        size={26}
        color={isActive ? '#000' : '#888'}
        style={{ marginBottom: 2 }}
      />):(<Ionicons
        name={isActive ? activeIcon : icon}
        size={26}
        color={isActive ? '#000' : '#888'}
        style={{ marginBottom: 2 }}
      />)}
      
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
    height: 65,
    borderTopWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fafafa',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  activeLabel: {
    color: '#000',
    fontWeight: '600',
  },
});

export default BottomTabs;
