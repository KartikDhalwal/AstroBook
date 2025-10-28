import React, { Component } from 'react';
import { View, Modal, ActivityIndicator } from 'react-native';
import { colors } from '../config/Constants1';
import { Animated, Easing } from 'react-native';

class MyLoader extends Component {
  fadeAnim = new Animated.Value(0);

  componentDidMount() {
    Animated.timing(this.fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  render() {
    return (
      <Modal visible={this.props.isVisible} transparent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background_theme2 + '10',
          }}>
          <Animated.View style={{ opacity: this.fadeAnim, backgroundColor: 'white', borderRadius: 1000, padding: 10 }}>
            <ActivityIndicator size="large" color={'black'} />
          </Animated.View>
        </View>
      </Modal>
    );
  }
}

export default MyLoader;
