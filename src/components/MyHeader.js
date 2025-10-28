import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import { colors, } from '../config/Constants1';

import { Fonts } from '../assets/style';
import TranslatedText from '../language/TranslatedText';



const MyHeader = ({ title, navigation}) => {

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.black_color2 }}
      forceInset={{ top: 'always', bottom: 'never' }}>
      <View
        style={{
          flex: 0,
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingVertical: 12,
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack()
          }}
          style={{
            flex: 0,
            width: '15%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image source={require('../assets/astrobookimages/back_navigation.png')} style={{ width: 15, height: 15, objectFit: "contain" }} />
        </TouchableOpacity>
        <View style={{ flex: 0.8 }}>
          <Text 
          style={{
            ...Fonts.primaryHelvetica,
            color: "#000",
            fontSize: 16,
          }}>
            <TranslatedText title={title} />
          </Text>
            
        
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MyHeader;
