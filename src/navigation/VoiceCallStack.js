import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AstrolgersList from "../screens/AstrolgersList";

const Stack = createNativeStackNavigator();

export default function VoiceCallStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: "Voice Call",
      }}
    >
      <Stack.Screen
        name="VoiceList"
        component={props => <AstrolgersList {...props} mode="voice" />}
      />
    </Stack.Navigator>
  );
}
