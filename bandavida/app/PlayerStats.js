import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PlayerStatsScreen({ route }) {
  const { name, height, weight } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.info}><Text style={styles.bold}>Height:</Text> {height}</Text>
      <Text style={styles.info}><Text style={styles.bold}>Weight:</Text> {weight}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
});
