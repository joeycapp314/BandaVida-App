// PlayerStats.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
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

  useEffect(() => {
    const loadColors = async () => {
      try {
        const saved = await AsyncStorage.getItem("userSettings");
        if (saved) {
          const settings = JSON.parse(saved);
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
              settings.find((s) => s.label === "Average Line")?.color ||
              "#000000",
          };

          // If route param provided a single barColor, let it override all
          if (barColor) {
            setColors({
              impact: barColor,
              heart: barColor,
              oxygen: barColor,
              heightWeight: barColor,
            });
          } else {
            setColors(colorMap);
          }
        } else if (barColor) {
          // no saved settings but route gave a color
          setColors({ impact: barColor, heart: barColor, oxygen: barColor, heightWeight: barColor, });
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

  // Example stats (replace with real data)
  const impact = 25;
  const heartRate = 100;
  const bloodOxygen = 97;
  const avgImpact = 20;

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
  const avgImpactHeight = (avgImpact / MAX_IMPACT) * MAX_BAR_HEIGHT;
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
        <View style={styles.barColumn}>
          <View
            style={[
              styles.bar,
              { height: impactHeight, backgroundColor: colors.impact },
            ]}
          >
            <View
              style={[
                styles.avgLine,
                { backgroundColor: colors.avgLine, bottom: avgImpactHeight },
              ]}
            />
            <Text style={styles.barValueText}>{impact} G</Text>
          </View>
          <Text style={styles.barLabel}>Last Impact Taken</Text>
        </View>

      {/* Heart Rate Bar */}
    <View style={styles.barColumn}>
      {/* The bar itself */}
      <View
        style={[
          styles.bar,
          { height: heartHeight, backgroundColor: colors.heart },
        ]}
      >
        <Text style={styles.barValueText}>{heartRate} bpm</Text>
      </View>

      {/* Active Avg (max) line */}
      <View
        style={[
          styles.avgLine,
          {
            backgroundColor: "#000000ff",
            bottom: maxHeartHeight,
          },
        ]}
      />

      {/* Resting Avg (min) line */}
      <View
        style={[
          styles.avgLine,
          {
            backgroundColor: "#000000ff", // blue
            bottom: minHeartHeight, 
          },
        ]}
      />

      <Text style={styles.barLabel}>Heart Rate</Text>
    </View>

        {/* Blood Oxygen Bar */}
        <View style={styles.barColumn}>
          <View
            style={[
              styles.bar,
              { height: oxygenHeight, backgroundColor: colors.oxygen },
            ]}
          >
            <View
              style={[
                styles.avgLine,
                { backgroundColor: colors.avgLine, 
                  bottom: avgOxygenHeight, }
              ]}
            />
            <Text style={styles.barValueText}>{bloodOxygen}%</Text>
          </View>
          <Text style={styles.barLabel}>Blood Oxygen</Text>
        </View>
      </View>

      {/* Key / Legend */}
      <View style={styles.legendBox}>
        <View style={styles.legendContent}>
          <View style={styles.solidLine} />
          <Text style={styles.legendLabel}>Player Avg</Text>
        </View>
      </View>


      {/* Height & Weight Box */}
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
          <Text style={styles.infoLabel}>Active Heart Rate: </Text>
          {activeHeartRate}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Resting Heart Rate: </Text>
          {restingHeartRate}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Average Blood Oxygen: </Text>
          {baseBloodOx}
        </Text>
      </View>
    </View>
  );
}

// === Styles ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
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
  },
  avgLine: {
    position: "absolute",
    width: "100%",     // make it span the full width of the bar
    height: 3,         // line thickness
    backgroundColor: "black",
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
    height: 2,
    borderTopWidth: 2,
    borderColor: "#000",
    borderStyle: "solid",
    marginRight: 8,
    backgroundColor: "transparent",
  },

  legendLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
});