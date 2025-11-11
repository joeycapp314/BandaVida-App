import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ---------- REPLACE ASYNC STORAGE WITH BACKEND ----------
const API_BASE_URL = "http://10.132.14.200:5000"; // <-- put your server IP and port here

export default function PlayersScreen() {
  const [players, setPlayers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    restingHeartRate: "",
    activeHeartRate: "",
    baseBloodOx: "",
  });

  // ---------------- Load players from database ----------------
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/player`);
        if (!response.ok) throw new Error("Failed to fetch players");
        const data = await response.json();
        setPlayers(data);
      } catch (e) {
        console.warn("Failed to load players:", e);
      }
    };
    loadPlayers();
  }, []);

  // ---------------- Add player to database ----------------
  const handleAddPlayer = async () => {
    const { name, heightFeet, heightInches, weight, restingHR, activeHR, baseBO } = formData;

    const trimmedName = name.trim();
    const feet = parseInt(heightFeet, 10);
    const inches = parseInt(heightInches, 10);
    const parsedWeight = parseFloat(weight);
    const parsedResting = parseFloat(restingHR);
    const parsedActive = parseFloat(activeHR);
    const parsedBloodOxygen = parseFloat(baseBO);

    if (!trimmedName) {
      Alert.alert("Error", "Player name is required.");
      return;
    }
    if (isNaN(feet) || feet < 0) {
      Alert.alert("Error", "Height (feet) must be a non-negative number.");
      return;
    }
    if (isNaN(inches) || inches < 0 || inches > 11) {
      Alert.alert("Error", "Height (inches) must be between 0 and 11.");
      return;
    }
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      Alert.alert("Error", "Weight must be a positive number.");
      return;
    }
    if (isNaN(parsedResting) || parsedResting <= 0) {
      Alert.alert("Error", "Heartrate must be a positive number.");
      return;
    }
    if (isNaN(parsedActive) || parsedActive <= 0) {
      Alert.alert("Error", "Heartrate must be a positive number.");
      return;
    }
    if (isNaN(parsedBloodOxygen) || parsedBloodOxygen < 0 || parsedBloodOxygen > 100) {
      Alert.alert("Error", "Blood oxygen must be between 0 and 100 %.");
      return;
    }

    const newPlayer = {
      name: trimmedName,
      height_ft: feet,
      height_in: inches,
      weight: parsedWeight,
      rest_rate: parsedResting,
      active_rate: parsedActive,
      base_bloodox: parsedBloodOxygen,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/player`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlayer),
      });

      if (!response.ok) throw new Error("Failed to add player");

      setPlayers((prev) => [...prev, newPlayer]);
      setFormData({ name: "", heightFeet: "", heightInches: "", weight: "", restingHR: "", activeHR: "", baseBO: "", });
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to add player to the database.");
    }
  };

  // ---------------- Delete player from database ----------------
  const handleDeletePlayer = async (index) => {
    const playerToDelete = players[index];

    try {
      const response = await fetch(
        `${API_BASE_URL}/player/${encodeURIComponent(playerToDelete.name)}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete player");

      const updatedList = [...players];
      updatedList.splice(index, 1);
      setPlayers(updatedList);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to delete player from the database.");
    }
  };

  // ---------------- UI ----------------
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {players.map((player, index) => (
            <TouchableOpacity
              key={index}
              style={styles.playerItem}
              onPress={() =>
                router.push({
                  pathname: "/PlayerStats",
                  params: {
                    name: player.name,
                    height: `${player.height_ft}ft ${player.height_in}in`,
                    weight: `${player.weight} lbs`,
                    restingHeartRate: player.rest_rate,
                    activeHeartRate: player.active_rate,
                    baseBloodOx: player.base_bloodox,
                  },
                })
              }
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.playerName}>{player.name}</Text>
              </View>
              <View style={styles.playerIcons}>
                {player.alert && (
                  <Ionicons
                    name="alert"
                    size={20}
                    color="red"
                    style={styles.icon}
                  />
                )}
                <TouchableOpacity
                  onPress={() => handleDeletePlayer(index)}
                  style={styles.deleteButton}
                >
                  <Ionicons
                    name="trash"
                    size={20}
                    color="red"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Player</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalWrapper}
          >
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Player Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter name"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                />

                <Text style={styles.modalLabel}>Height</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.heightLabel}>Feet</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Feet"
                      keyboardType="numeric"
                      value={formData.heightFeet}
                      onChangeText={(text) =>
                        setFormData({ ...formData, heightFeet: text })
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.heightLabel}>Inches</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Inches"
                      keyboardType="numeric"
                      value={formData.heightInches}
                      onChangeText={(text) =>
                        setFormData({ ...formData, heightInches: text })
                      }
                    />
                  </View>
                </View>

                <Text style={styles.modalLabel}>Weight</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter weight in lbs"
                  keyboardType="numeric"
                  value={formData.weight}
                  onChangeText={(text) =>
                    setFormData({ ...formData, weight: text })
                  }
                />

                {/* Resting Heart Rate*/}
                <Text style={styles.modalLabel}>Resting Heart Rate</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter resting heart rate (bpm)"
                  keyboardType="numeric"
                  value={formData.restingHR}
                  onChangeText={(text) =>
                    setFormData({ ...formData, restingHR: text })
                  }
                />

                <Text style={styles.modalLabel}>Active Heart Rate</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter active heart rate (bpm)"
                  keyboardType="numeric"
                  value={formData.activeHR}
                  onChangeText={(text) =>
                    setFormData({ ...formData, activeHR: text })
                  }
                />

                <Text style={styles.modalLabel}>Average Blood Oxygen Level</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter base blood oxygen (%)"
                  keyboardType="numeric"
                  value={formData.baseBO}
                  onChangeText={(text) =>
                    setFormData({ ...formData, baseBO: text })
                  }
                />
                {/* New fields end here */}

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAddPlayer}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: "#ccc" }]}
                  onPress={() => {
                    setModalVisible(false);
                    setFormData({ name: "", heightFeet: "", heightInches: "", weight: "" });
                  }}
                >
                  <Text style={[styles.confirmButtonText, { color: "#333" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 0,
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#6b8ca6",
    padding: 15,
    marginBottom: 5,
    borderRadius: 4,
    alignItems: "center",
  },
  playerName: {
    fontSize: 16,
    color: "#000",
  },
  playerDetails: {
    fontSize: 12,
    color: "#222",
    marginTop: 4,
  },
  playerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    padding: 4,
  },
  icon: {
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: "#166b8c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalWrapper: {
    width: "100%",
    maxHeight: "90%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
    width: "100%",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ccc",
    width: "100%",
    borderRadius: 10,
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  heightLabel: {
    fontSize: 14,
    marginBottom: 3,
    color: "#333",
  },
  modalInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  measureButton: {
    backgroundColor: "#a5c4dd",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  measureButtonText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#166b8c",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
