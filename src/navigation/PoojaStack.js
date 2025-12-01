import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PoojaList from "../screens/PoojaList";

const Stack = createNativeStackNavigator();

export default function PoojaStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: "Book Pooja",
      }}
    >
      <Stack.Screen name="PoojaList" component={PoojaList} />
    </Stack.Navigator>
  );
}
