import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "bold",
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
  homeButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
  homeButtonText: {
    color: "#007BFF",
    fontSize: 16,
  },
});