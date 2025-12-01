import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AstroTalkHome from '../screens/HomeScreen';
import HoroscopeScreen from '../screens/HoroscopeScreen';
import HoroscopeDetailScreen from '../screens/HoroscopeDetailScreen';
import KundliMatchingScreen from '../screens/KundliMatchingScreen';
import KundliMatchingReportScreen from '../screens/KundliMatchingReportScreen';
import AstrolgersList from '../screens/AstrolgersList';
import AstrologerDetailsScreen from '../screens/AstrologerDetailsScreen';
import PoojaList from '../screens/PoojaList';
import PoojaDetails from '../screens/PoojaDetails';
import KundliScreen from '../screens/KundliScreen';
import KundliDetailScreen from '../screens/KundliDetailScreen';
import ConsultationDetailsScreen from '../screens/ConsultationDetailsScreen';
import AboutUsScreen from '../screens/AboutUsScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTitleStyle: { fontSize: 18, fontWeight: '700' },
        
      }}
    >

      {/* HOME screen (header hidden) */}
      <Stack.Screen
        name="HomeMain"
        component={AstroTalkHome}
        options={{ headerShown: false }}
      />

      {/* All inner screens (header and back button automatically shown) */}
      <Stack.Screen name="HoroscopeScreen" component={HoroscopeScreen} options={{ title: "Horoscope" }} />
      <Stack.Screen name="HoroscopeDetailScreen" component={HoroscopeDetailScreen} options={{ title: "Details" }} />
      <Stack.Screen name="KundliMatchingScreen" component={KundliMatchingScreen} options={{ title: "Kundli Matching" }} />
      <Stack.Screen name="KundliMatchingReportScreen" component={KundliMatchingReportScreen} options={{ title: "Match Report" }} />
      <Stack.Screen name="AstrolgersList" component={AstrolgersList} options={{ title: "Astrologers" }} />
      <Stack.Screen name="AstrologerDetailsScreen" component={AstrologerDetailsScreen} options={{ title: "Astrologer" }} />
      <Stack.Screen name="PoojaList" component={PoojaList} options={{ title: "Book Pooja" }} />
      <Stack.Screen name="PoojaDetails" component={PoojaDetails} options={{ title: "Pooja Details" }} />
      <Stack.Screen name="Free Kundli" component={KundliScreen} options={{ title: "Free Kundlis" }} />
      <Stack.Screen name="Kundli Details" component={KundliDetailScreen} options={{ title: "Kundli Details" }} />
      <Stack.Screen name="Consultation Details" component={ConsultationDetailsScreen} options={{ title: "Kundli Details" }} />
      <Stack.Screen name="About Us" component={AboutUsScreen} options={{ title: "About Us" }} />


    </Stack.Navigator>
  );
}
