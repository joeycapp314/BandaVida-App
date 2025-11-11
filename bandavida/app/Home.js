import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import info from "./info";
// import Players from "./Players";
// import Settings from "./Settings";
// import Alerts from "./Alerts";
import { useRouter } from "expo-router";


export default function HomeScreen({ navigation }) {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BandaVida</Text>

      <Image
        source={require("../assets/images/bandavidalogo.jpeg")}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/Players")}
      >
        <Text style={styles.buttonText}>Players</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/Alerts")}
      >
        <Text style={styles.buttonText}>Alerts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/info")}
      >
        <Text style={styles.buttonText}>Info</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/Settings")}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 20,
  },
  logo: {
    width: 120,   // adjust size as needed
    height: 120,  // adjust size as needed
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#155d78",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 160,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
});