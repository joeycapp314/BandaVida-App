import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function SettingsScreen({ navigation }) {
  const defaultSettings = [
    { label: "Impact", color: "#2E6375", on: true },
    { label: "Heart Rate", color: "#A7E36E", on: true },
    { label: "Blood Oxygen Level", color: "#E83030", on: true },
    { label: "Height & Weight", color: "#9FD7F0", on: true },
    { label: "Player Averages", color: "#000000", on: true },
    { label: "Above Average Alert", color: "#FFF200", on: false },
  ];

  const [settings, setSettings] = useState(defaultSettings);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);

  const colorOptions = [
    "#2E6375",
    "#A7E36E",
    "#E83030",
    "#9FD7F0",
    "#000000",
    "#FFF200",
    "#FF8C00",
    "#9B59B6",
    "#1ABC9C",
  ];

  // Helper: save to AsyncStorage (log errors)
  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem("userSettings", JSON.stringify(newSettings));
      console.log("Settings saved:", newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  // Load settings from AsyncStorage safely
  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("userSettings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings(parsed);
          console.log("Loaded settings from storage:", parsed);
        } catch (parseErr) {
          console.warn("Could not parse saved settings, using defaults.", parseErr);
          setSettings(defaultSettings);
        }
      } else {
        console.log("No saved settings found — using defaults.");
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setSettings(defaultSettings);
    }
  };

  // Reload settings every time screen gains focus
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!mounted) return;
        await loadSettings();
      })();
      return () => {
        mounted = false;
      };
    }, [])
  );

  // Toggle On/Off immutably and save
  const toggleSetting = (index, value) => {
    setSettings((prev) => {
      const updated = prev.map((s, i) => (i === index ? { ...s, on: value } : s));
      saveSettings(updated);
      return updated;
    });
  };

  // Open color picker
  const openColorPicker = (index) => {
    setCurrentIndex(index);
    setColorPickerVisible(true);
  };

  // Select color immutably and save
  const selectColor = (color) => {
    if (currentIndex === null) {
      setColorPickerVisible(false);
      return;
    }
    setSettings((prev) => {
      const updated = prev.map((s, i) => (i === currentIndex ? { ...s, color } : s));
      saveSettings(updated);
      return updated;
    });
    setColorPickerVisible(false);
    setCurrentIndex(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Table Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerText, { flex: 2 }]}>Display</Text>
          <Text style={styles.headerText}>      On</Text>
          <Text style={styles.headerText}>      Off</Text>
        </View>

        {/* Settings Rows */}
        {settings.map((item, index) => (
          <View key={index} style={styles.row}>
            <TouchableOpacity
              onPress={() => openColorPicker(index)}
              style={[styles.colorBox, { backgroundColor: item.color }]}
            />
            <Text style={styles.label}>{item.label}</Text>

            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() => toggleSetting(index, true)}
            >
              <View style={[styles.radioOuter]}>
                {item.on && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() => toggleSetting(index, false)}
            >
              <View style={[styles.radioOuter]}>
                {!item.on && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Color Picker Modal */}
      <Modal
        transparent={true}
        visible={colorPickerVisible}
        animationType="fade"
        onRequestClose={() => {
          setColorPickerVisible(false);
          setCurrentIndex(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choose a Color</Text>
            <View style={styles.colorGrid}>
              {colorOptions.map((color, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => selectColor(color)}
                  style={[styles.colorOption, { backgroundColor: color }]}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={() => {
                setColorPickerVisible(false);
                setCurrentIndex(null);
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    marginRight: 10,
  },
  label: {
    flex: 2,
    fontSize: 16,
  },
  radioContainer: {
    flex: 1,
    alignItems: "center",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#666",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "gray",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: 250,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 5,
    margin: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: "#007BFF",
    fontSize: 16,
  },
});
