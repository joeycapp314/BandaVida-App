// PlayerStats.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router"; // optional; harmless if you don't use expo-router


export default function PlayerStatsScreen({ route }) {
  // Support either route.params (React Navigation) OR useLocalSearchParams (expo-router)
  const localParams = useLocalSearchParams ? useLocalSearchParams() : null;
  const params = (route && route.params) || localParams || {};
  const { name = "Player", height = "-", weight = "-", barColor, restingHeartRate = "-", activeHeartRate = "-", baseBloodOx = "-" } = params;



  const [colors, setColors] = useState({
    impact: "#195d7c",
    heart: "#8ae68a",
    oxygen: "#ff4c4c",
    heightWeight: "#9FD7F0",
    avgLine: "#000000",
  });

  const [enabled, setEnabled] = useState({
    impact: true,
    heart: true,
    oxygen: true,
    heightWeight: true,
    averages: true,
  });

  const [playerAlerts, setPlayerAlerts] = useState([]);
  const [alertLookup, setAlertLookup] = useState({});
  const [alertModalVisible, setAlertModalVisible] = useState(false);


  // Build latest alert per stat
  const latestStatValues = {};
  playerAlerts.forEach(alert => {
    const type = alert.type.toLowerCase();
    if (
      !latestStatValues[type] ||
      alert.id > latestStatValues[type].id
    ) {
      latestStatValues[type] = alert;
    }
  });




 // ------------ Use Effect for the colors ---------------------
  useEffect(() => {
    const loadColors = async () => {
      try {
        const saved = await AsyncStorage.getItem("userSettings");
        if (saved) {
          const settings = JSON.parse(saved);

          // Added: load toggles for enabled features
          const enabledMap = {
            impact: settings.find((s) => s.label === "Impact")?.on ?? true,
            heart: settings.find((s) => s.label === "Heart Rate")?.on ?? true,
            oxygen: settings.find((s) => s.label === "Blood Oxygen Level")?.on ?? true,
            heightWeight: settings.find((s) => s.label === "Height & Weight")?.on ?? true,
            averages: settings.find((s) => s.label === "Player Averages")?.on ?? true,
            alerts: settings.find((s) => s.label === "Show Alert on Stat")?.on ?? true,

          };
          setEnabled(enabledMap);

          const colorMap = {
            impact:
              settings.find((s) => s.label === "Impact")?.color ||
              colors.impact,
            heart:
              settings.find((s) => s.label === "Heart Rate")?.color ||
              colors.heart,
            oxygen:
              settings.find((s) => s.label === "Blood Oxygen Level")?.color ||
              colors.oxygen,
            heightWeight:
              settings.find((s) => s.label === "Height & Weight")?.color ||
              colors.heightWeight,
            avgLine:
              settings.find((s) => s.label === "Player Averages")?.color ||
              colors.avgLine,
            alertIcon:
              settings.find((s) => s.label === "Show Alert on Stat")?.color ||
              colors.alertIcon, 
          };

          // If route param provided a single barColor, let it override all
          if (barColor) {
            setColors({
              impact: barColor,
              heart: barColor,
              oxygen: barColor,
              heightWeight: barColor,
              avgLine: colorMap.avgLine,
              alertIcon: colorMap.alertIcon,
            });
          } else {
            setColors(colorMap);
          }
        } else if (barColor) {
          // no saved settings but route gave a color
          setColors({ impact: barColor, heart: barColor, oxygen: barColor, heightWeight: barColor, avgLine: "000000", });
        }
      } catch (err) {
        console.error("Error loading colors:", err);
        // if barColor provided, still use it
        if (barColor) {
          setColors({ impact: barColor, heart: barColor, oxygen: barColor, heightWeight: barColor, });
        }
      }
    };

    loadColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barColor]);

  // -------------- Use effect for the alerts history ---------------
  useEffect(() => {
  const loadPlayerAlerts = async () => {
    try {
      const response = await fetch("http://10.132.7.139:5000/alert");
      const data = await response.json();

      const alertsForPlayer = data
        .filter(a => a.PNAME === name) // only this player's alerts
        .map(a => ({
          id: a.ALERT_ID,
          type: a.ALERT_TYPE,
          level: a.SEVERITY.toLowerCase(),
          message: a.HILO === "high" ? "is above normal!" : "is below normal!",
          time: a.ALERT_TIME,
          magnitude: a.MAGNITUDE,
        }))
        .sort((a, b) => {
          // Sort by time, most recent first
          return new Date(b.time) - new Date(a.time); // new → old
        });

      setPlayerAlerts(alertsForPlayer);

      // Build a lookup of stat → alert severity
      const alertLookup = {};
      alertsForPlayer.forEach((a) => {
        alertLookup[a.type.toLowerCase()] = a.level; // "heart rate" → "major"
      });

      setAlertLookup(alertLookup);

    } catch (err) {
      console.error("Error loading player alerts:", err);
    }
  };

  loadPlayerAlerts();
}, [name]);


  // Example stats (replace with real data)
  let impact = 25;
  let heartRate = 100;
  let bloodOxygen = 97;

  if(latestStatValues["impact"]?.magnitude != null) {
    impact = latestStatValues["impact"]?.magnitude;
  }

  if(latestStatValues["heart rate"]?.magnitude != null) {
    heartRate = latestStatValues["heart rate"]?.magnitude;
  }

  if(latestStatValues["blood oxygen"]?.magnitude != null) {
    bloodOxygen = latestStatValues["blood oxygen"]?.magnitude;
  }

  // Max values of each metric
  const MAX_IMPACT = 150;
  const MAX_HEARTRATE = 200;
  const MAX_BLOODOXYGEN = 100;

  //Each bar's height
  const MAX_BAR_HEIGHT = 220;

  const impactHeight = (impact / MAX_IMPACT) * MAX_BAR_HEIGHT;
  const heartHeight = (heartRate / MAX_HEARTRATE) * MAX_BAR_HEIGHT;
  const oxygenHeight = (bloodOxygen / MAX_BLOODOXYGEN) * MAX_BAR_HEIGHT;

  // Average line positions (same relative scaling)
  const maxHeartHeight = (activeHeartRate / MAX_HEARTRATE) * MAX_BAR_HEIGHT;
  const minHeartHeight = (restingHeartRate / MAX_HEARTRATE) * MAX_BAR_HEIGHT;
  const avgOxygenHeight = (baseBloodOx / MAX_BLOODOXYGEN) * MAX_BAR_HEIGHT;

 return (
    <View style={styles.container}>
      {/* Centered player name */}
      <Text style={styles.nameText}>{name}</Text>

      {/* Bars section */}
      <View style={styles.graphRow}>
        {/* Impact Bar */}
        {enabled.impact && (<View style={styles.barColumn}>
          <View
            style={[
              styles.bar,
              { height: impactHeight, backgroundColor: colors.impact },
            ]}
          >
            <Text style={styles.barValueText}>{impact} G</Text>
          </View>
          <Text style={styles.barLabel}>
            {enabled.alerts && alertLookup["impact"] && (
              <Text style={[styles.alertIcon, { color: colors.alertIcon }]}>!</Text>
            )} Last Impact Taken
          </Text>
        </View>
        )}

      {/* Heart Rate Bar */}
      {enabled.heart && (<View style={styles.barColumn}>
        {/* The bar itself */}
        <View style={[styles.bar, { height: heartHeight, backgroundColor: colors.heart }]}>
        {enabled.averages && (
          <View style={[styles.avgLine, { backgroundColor: colors.avgLine, bottom: maxHeartHeight }]} />
        )}  
        {enabled.averages && (
          <View style={[styles.avgLine, { backgroundColor: colors.avgLine, bottom: minHeartHeight }]} />
        )}
        <Text style={styles.barValueText}>{heartRate} bpm</Text>
    
        </View>
        <Text style={styles.barLabel}>
          {enabled.alerts && alertLookup["heart rate"] && (
            <Text style={[styles.alertIcon, { color: colors.alertIcon }]}>!</Text>
          )} Heart Rate
        </Text>
      </View>
      )}

        {/* Blood Oxygen Bar */}
        {enabled.oxygen && (<View style={styles.barColumn}>
          <View
            style={[
              styles.bar,
              { height: oxygenHeight, backgroundColor: colors.oxygen },
            ]}
          >
            {enabled.averages && (
              <View
                style={[
                  styles.avgLine,
                  { backgroundColor: colors.avgLine, 
                    bottom: avgOxygenHeight, }
                ]}
              />
            )}
            <Text style={styles.barValueText}>{bloodOxygen}%</Text>
          </View>
          <Text style={styles.barLabel}>
            {enabled.alerts && alertLookup["blood oxygen"] && (
              <Text style={[styles.alertIcon, { color: colors.alertIcon }]}>!</Text>
            )} Blood Oxygen
          </Text>
        </View>
        )}
      </View>
            

      {/* Key / Legend */}
      {enabled.averages &&(
      <View style={styles.legendBox}>
        <View style={styles.legendContent}>
          <View style={[styles.solidLine, { backgroundColor: colors.avgLine }]} />
          <Text style={styles.legendLabel}>Player Avg</Text>
        </View>
      </View>
      )}

      {/* Height & Weight Box */}
      {enabled.heightWeight && (
      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: colors.heightWeight,
            borderColor: colors.heightWeight,
          },
        ]}
      >
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Height: </Text>
          {height}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Weight: </Text>
          {weight}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Resting Heart Rate: </Text>
          {restingHeartRate}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Active Heart Rate: </Text>
          {activeHeartRate}
        </Text>

        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Average Blood Oxygen: </Text>
          {baseBloodOx}
        </Text>
      </View>
      )}

      {/*  ----------- Player Alert History ------------------- */}
      {playerAlerts.length > 0 && (
        <TouchableOpacity
          style={styles.alertHistoryButton}
          onPress={() => setAlertModalVisible(true)}
        >
          <Text style={styles.alertHistoryButtonText}>See Alert History</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={alertModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAlertModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertModalBox}>
            <Text style={styles.alertHistoryTitle}>Alert History</Text>

            <ScrollView
              style={{ maxHeight: 300 }}
              nestedScrollEnabled={true}
            >
              {playerAlerts.map(alert => (
                <View
                  key={alert.id}
                  style={[
                    styles.alertItem,
                    alert.level === "major"
                      ? styles.majorBackground
                      : styles.minorBackground
                  ]}
                >
                  <Text style={styles.alertText}>
                    {alert.type} {alert.message} ({alert.magnitude}) ({alert.time})
                  </Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeAlertModalButton}
              onPress={() => setAlertModalVisible(false)}
            >
              <Text style={styles.closeAlertModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// === Styles ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
    alignItems: "center",
  },
  nameText: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  graphRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    width: "90%",
    marginTop: 10,
    minHeight: 260,
  },
  barColumn: {
    alignItems: "center",
    width: 80,
    position: "relative",
  },
  bar: {
    width: 60,
    borderRadius: 6,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 12,
    position: "relative",
    minHeight: 30,
  },
  avgLine: {
    position: "absolute",
    width: "100%",     
    height: 3,         
    borderRadius: 2,
    zIndex: 10,
  },
  barValueText: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
    zIndex: 1,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    height: 40,
  },
  infoBox: {
    width: "85%",
    borderWidth: 1.5,
    padding: 14,
    marginTop: 36,
    borderRadius: 6,
  },
  infoText: {
    fontSize: 16,
    color: "black",
    marginBottom: 6,
    textAlign: "center",
  },
  infoLabel: {
    fontWeight: "700",
  },

  legendBox: {
  borderWidth: 1,
  borderColor: "#000",
  borderRadius: 4,
  paddingVertical: 6,
  paddingHorizontal: 12,
  alignSelf: "center",
  marginTop: 16,
  backgroundColor: "#fff",
  },

  legendContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  solidLine: {
    width: 30,
    height: 3,
    borderRadius: 2,
    marginRight: 8,
  },

  legendLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },

  alertHistoryBox: {
  width: "85%",
  marginTop: 20,
  padding: 12,
  borderWidth: 1.5,
  borderRadius: 6,
  borderColor: "#ccc",
  backgroundColor: "#f9f9f9",
  maxHeight: 160,
  },

  alertHistoryTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },

  alertItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginVertical: 4,
  },

  majorBackground: {
    backgroundColor: "#8f1515ff",
  },

  minorBackground: {
    backgroundColor: "#fbc02d",
  },

  alertText: {
    color: "#fff",
    fontSize: 14,
  },

  alertIcon: {
  fontSize: 18,
  marginLeft: 6,
  fontWeight: "bold",
  },
  alertScroll: {
    maxHeight: 180,
    marginTop: 5,
  },
  alertHistoryButton: {
    backgroundColor: "#E83030",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 50,
  },
  alertHistoryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  alertModalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "70%",
    elevation: 5,
  },

  closeAlertModalButton: {
    marginTop: 15,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#2E6375",
    borderRadius: 8,
  },

  closeAlertModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

});