import { View} from 'react-native';
import { useEffect } from 'react';
import MyHeader from '../../../components/MyHeader';
import { colors } from '../../../config/Constants1';


const WeeklyRashi = props => {

  useEffect(() => {
    props.navigation.setOptions({
      headerShown: false,
      header: () => (
        <MyHeader
          title="Horoscope"
          navigation={props.navigation}
          statusBar={{
            backgroundColor: colors.background_theme2,
            barStyle: 'light-content',
          }}
        />
      ),
    });
  });

  return (
    
    <View style={{ flex: 1, backgroundColor: colors.background_theme1 }}>
     
     
    </View>
   
  );
};

export default WeeklyRashi;
