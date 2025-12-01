import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AstrolgersList from "../screens/AstrolgersList";

const Stack = createNativeStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: "Live Chat",
      }}
    >
      <Stack.Screen
        name="ChatList"
        component={props => <AstrolgersList {...props} mode="chat" />}
      />
    </Stack.Navigator>
  );
}
