import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function AlertsScreen() {
  // Example alerts — these could come from your backend or local state
  const alerts = [
    {
      id: 1,
      player: "John Doe",
      type: "Heart Rate",
      level: "critical", // "critical" = red, "warning" = yellow
      message: "is critically above normal!",
      time: "10:45 AM",
    },
    {
      id: 2,
      player: "Sarah Lee",
      type: "Impact",
      level: "warning",
      message: "is above normal!",
      time: "10:50 AM",
    },
    {
      id: 3,
      player: "Joe Smith",
      type: "Blood Oxygen",
      level: "critical",
      message: "is below normal!",
      time: "11:00 AM",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {alerts.map((alert) => (
        <View
          key={alert.id}
          style={[
            styles.alertBox,
            alert.level === "critical"
              ? styles.criticalBackground
              : styles.warningBackground,
          ]}
        >
          <View style={styles.row}>
            <Text style={styles.exclamation}>❗</Text>
            <View style={styles.textContainer}>
              <Text style={styles.playerText}>
                Player: {alert.player}{" "}
                <Text style={styles.timeStamp}>({alert.time})</Text>
              </Text>
              <Text style={styles.messageText}>
                {alert.type} {alert.message}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  alertBox: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    padding: 10,
    marginVertical: 6,
  },
  criticalBackground: {
    backgroundColor: "#8f1515ff", // red
  },
  warningBackground: {
    backgroundColor: "#fbc02d", // yellow
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  exclamation: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  playerText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#ffffffff",
  },
  timeStamp: {
    fontWeight: "normal",
    fontSize: 14,
  },
  messageText: {
    fontSize: 15,
    color: "#ffffffff",
    marginTop: 4,
  },
});
