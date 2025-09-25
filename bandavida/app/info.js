// InfoScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

export default function InfoScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Information</Text>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>
            Welcome to <Text style={styles.link}>Bandavida</Text>!
          </Text>
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Players:</Text> The players tab will display all players previously added. To add a player, simply press "add player" and <Text style={styles.link}>Bandavida</Text> will begin taking baseline vitals for them!
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Alerts:</Text> The alerts menu will show you any alerts to come from any players. All alerts are <Text style={styles.link}>timestamped</Text> and alerts of higher importance will be pushed to the top and displayed in a darker red.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Settings:</Text> The settings menu will allow you to choose which vitals you would like to have displayed. You are also given the option to choose what color you would like each vital displayed in!
        </Text>
      </ScrollView>
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
