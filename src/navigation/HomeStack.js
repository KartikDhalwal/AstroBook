import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AstroTalkHome from '../screens/HomeScreen';
import HoroscopeScreen from '../screens/HoroscopeScreen';
import HoroscopeDetailScreen from '../screens/HoroscopeDetailScreen';
import KundliMatchingScreen from '../screens/KundliMatchingScreen';
import KundliMatchingReportScreen from '../screens/KundliMatchingReportScreen';
import AstrolgersList from '../screens/AstrolgersList';
import PoojaList from '../screens/PoojaList';
import PoojaDetails from '../screens/PoojaDetails';
import KundliScreen from '../screens/KundliScreen';
import KundliDetailScreen from '../screens/KundliDetailScreen';
import ConsultationDetailsScreen from '../screens/ConsultationDetailsScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import BlogScreen from '../screens/BlogScreen';
import BlogDetailsScreen from '../screens/BlogDetailsScreen';
import SignUp from '../screens/SignUp';
import UserConsultationList from '../screens/UserConsultationList';
import BookedPoojaListScreen from '../screens/BookedPoojaListScreen';
import CartScreen from '../screens/CartScreen';
import AstrologerDetailsScreen from '../screens/AstrologerDetailsScreen';

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
      <Stack.Screen
        name="AstrologerDetailsScreen"
        component={AstrologerDetailsScreen}
        options={{ headerShown: true, title: "Astrologers Details" }}
      />
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
      <Stack.Screen name="PoojaList" component={PoojaList} options={{ title: "Book Pooja" }} />
      <Stack.Screen name="PoojaDetails" component={PoojaDetails} options={{ title: "Pooja Details" }} />
      <Stack.Screen name="Free Kundli" component={KundliScreen} options={{ title: "Free Kundlis" }} />
      <Stack.Screen name="Kundli Details" component={KundliDetailScreen} options={{ headerShown: true, title: "Kundli Details" }} />
      <Stack.Screen name="Consultation Details" component={ConsultationDetailsScreen} options={{ title: "Consultation Details" }} />
      <Stack.Screen name="About Us" component={AboutUsScreen} options={{ title: "About Us" }} />
      <Stack.Screen name="Blogs" component={BlogScreen} options={{ title: "Blogs" }} />
      <Stack.Screen name="Blog" component={BlogDetailsScreen} options={{ title: "Blog" }} />
      {/* <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: "AstroBook Chat" }} /> */}
      <Stack.Screen name="UserConsultationList" component={UserConsultationList} options={{ headerShown: true, title: "My Consultations" }} />
      <Stack.Screen
        name="BookedPoojaListScreen"
        component={BookedPoojaListScreen}
        options={{ headerShown: true, title: 'Booked Pooja' }}
      />
      <Stack.Screen
        name="VideoList"
        component={props => <AstrolgersList {...props} mode="video" />}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerShown: true, title: 'Profile' }}
      />
      <Stack.Screen
        name="CartScreen"
        component={CartScreen}
        options={{ headerShown: true, title: 'Pooja Cart' }}
      />

    </Stack.Navigator>
  );
}
