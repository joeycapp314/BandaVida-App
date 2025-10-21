import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./Home";
import InfoScreen from "./info";
import PlayersScreen from "./Players";
import SettingsScreen from "./Settings";
import AlertsScreen from "./Alerts";
import PlayerStatsScreen from "./PlayerStats";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{title: "Home"}}/>
        <Stack.Screen name="Info" component={InfoScreen} />
        <Stack.Screen name="Players" component={PlayersScreen} />
        <Stack.Screen name="Alerts" component={AlertsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name ="PlayerStats" component={PlayerStatsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
