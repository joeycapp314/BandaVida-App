import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Update this URL if you’re running the backend elsewhere (e.g. partner’s machine)
  const API_BASE_URL = "http://10.132.30.49:5000";  

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/alert`);
        const data = await response.json();

        // Map database fields to what the UI expects
        const mappedAlerts = data.map((a, index) => ({
          id: a.ALERT_ID || index,
          player: a.PNAME,
          type: a.ALERT_TYPE,
          level: a.SEVERITY.toLowerCase(), // "major" or "minor"
          message: a.HILO === "high"
            ? "is above normal!"
            : "is below normal!",
          time: a.ALERT_TIME,
        }))
        .sort((a, b) => {
          // Sort by severity: major before minor
          if (a.level === "major" && b.level !== "major") return -1;
          if (a.level !== "major" && b.level === "major") return 1;

          // If same severity, sort by time (earlier first)
          return new Date(a.time) - new Date(b.time);
        });

        setAlerts(mappedAlerts);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {alerts.map((alert) => (
        <View
          key={alert.id}
          style={[
            styles.alertBox,
            alert.level === "major"
              ? styles.majorBackground
              : styles.minorBackground,
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
  majorBackground: {
    backgroundColor: "#8f1515ff", // red
  },
  minorBackground: {
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
