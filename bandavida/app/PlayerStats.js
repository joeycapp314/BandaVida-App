// PlayerStats.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router"; // optional; harmless if you don't use expo-router

export default function PlayerStatsScreen({ route }) {
  // Support either route.params (React Navigation) OR useLocalSearchParams (expo-router)
  const localParams = useLocalSearchParams ? useLocalSearchParams() : null;
  const params = (route && route.params) || localParams || {};

  const { name = "Player", height = "-", weight = "-", barColor } = params;

  const [colors, setColors] = useState({
    impact: "#195d7c",
    heart: "#8ae68a",
    oxygen: "#ff4c4c",
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

  // Example stats (replace with your real data)
  const impact = 25;
  const heartRate = 100;
  const bloodOxygen = 97;

  return (
    <View style={styles.container}>
      {/* Centered player name */}
      <Text style={styles.nameText}>{name}</Text>

      {/* Bars area (simple stacked columns similar to your mockup) */}
      <View style={styles.graphRow}>
        <View style={styles.barColumn}>
          <View style={[styles.bar, { height: 120, backgroundColor: colors.impact }]}>
            <Text style={styles.barValueText}>25 G</Text>
          </View>
          <Text style={styles.barLabel}>Last Impact Taken</Text>
        </View>

        <View style={styles.barColumn}>
          <View style={[styles.bar, { height: 180, backgroundColor: colors.heart }]}>
            <Text style={styles.barValueText}>100 bpm</Text>
          </View>
          <Text style={styles.barLabel}>Heart Rate</Text>
        </View>

        <View style={styles.barColumn}>
          <View style={[styles.bar, { height: 220, backgroundColor: colors.oxygen }]}>
            <Text style={styles.barValueText}>97%</Text>
          </View>
          <Text style={styles.barLabel}>Blood Oxygen</Text>
        </View>
      </View>

      {/* Height & Weight Box */}
      <View
        style={[
          styles.infoBox,
          { backgroundColor: colors.heightWeight, borderColor: colors.heightWeight },
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
      </View>
    </View>
  );
}

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
  },
  bar: {
    width: 60,
    borderRadius: 6,
    justifyContent: "flex-end",
    paddingBottom: 12,
  },
  barValueText: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
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
    color: "white",
    marginBottom: 6,
    textAlign: "center",
  },
  infoLabel: {
    fontWeight: "700",
  },
});