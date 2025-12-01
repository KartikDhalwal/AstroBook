import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AstrolgersList from "../screens/AstrolgersList";

const Stack = createNativeStackNavigator();

export default function VideoCallStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: "Video Call",
      }}
    >
      <Stack.Screen
        name="VideoList"
        component={props => <AstrolgersList {...props} mode="video" />}
      />
    </Stack.Navigator>
  );
}
