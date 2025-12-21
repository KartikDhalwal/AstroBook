import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AstrolgersList from "../screens/AstrolgersList";
import AboutUsScreen from "../screens/AboutUsScreen";
import BlogDetailsScreen from "../screens/BlogDetailsScreen";
import BlogScreen from "../screens/BlogScreen";
import BookedPoojaListScreen from "../screens/BookedPoojaListScreen";
import KundliDetailScreen from "../screens/KundliDetailScreen";
import KundliScreen from "../screens/KundliScreen";
import SignUp from "../screens/SignUp";
import UserConsultationList from "../screens/UserConsultationList";
import CartScreen from "../screens/CartScreen";
import PoojaDetails from "../screens/PoojaDetails";

const Stack = createNativeStackNavigator();

export default function VideoCallStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // headerTitle: "Video Call",
      }}
    >
      <Stack.Screen
        name="VideoList"
        component={props => <AstrolgersList {...props} mode="video" />}
      />
      <Stack.Screen name="About Us" component={AboutUsScreen} options={{ headerShown: true, title: "About Us" }} />
      <Stack.Screen name="Blogs" component={BlogScreen} options={{ headerShown: true, title: "Blogs" }} />
      <Stack.Screen name="Blog" component={BlogDetailsScreen} options={{ headerShown: true, title: "Blog" }} />
      <Stack.Screen
        name="BookedPoojaListScreen"
        component={BookedPoojaListScreen}
        options={{ headerShown: true, title: 'Booked Pooja' }}
      />
      <Stack.Screen
        name="AstrolgersList"
        component={props => <AstrolgersList {...props} mode="videocall" />}
        options={{ headerShown: true, title: 'Astrologers' }}
      />
      <Stack.Screen name="Free Kundli" component={KundliScreen} options={{ headerShown: true, title: "Free Kundlis" }} />

      <Stack.Screen name="Kundli Details" component={KundliDetailScreen} options={{ headerShown: true, title: "Kundli Details" }} />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerShown: true, title: 'Profile' }}
      />
      <Stack.Screen name="UserConsultationList" component={UserConsultationList} options={{ headerShown: true, title: "My Consultations" }} />
      <Stack.Screen
        name="CartScreen"
        component={CartScreen}
        options={{ headerShown: true, title: 'Pooja Cart' }}
      />
              <Stack.Screen
          name="PoojaDetails"
          component={PoojaDetails}
          options={{ headerShown: true, title: 'Pooja Details' }}
        />
    </Stack.Navigator>
  );
}
