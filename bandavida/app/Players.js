import React, { useState } from "react";
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

export default function PlayersScreen({ navigation }) {
  const [players, setPlayers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
  });

  const handleAddPlayer = () => {
    const { name, heightFeet, heightInches, weight } = formData;

    // Trim and validate inputs
    const trimmedName = name.trim();
    const feet = parseInt(heightFeet, 10);
    const inches = parseInt(heightInches, 10);
    const parsedWeight = parseFloat(weight);

    // Validation
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

    const newPlayer = {
      name: trimmedName,
      height: `${feet}ft ${inches}in`,
      weight: `${parsedWeight} lbs`,
      alert: trimmedName === "Player X",
    };

    setPlayers([...players, newPlayer]);
    setFormData({ name: "", heightFeet: "", heightInches: "", weight: "" });
    setModalVisible(false);
  };

  const handleDeletePlayer = (index) => {
    const updatedPlayers = [...players];
    updatedPlayers.splice(index, 1);
    setPlayers(updatedPlayers);
  };

  return (
    <View style={styles.container}>
      {/* Player List */}
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {players.map((player, index) => (
            <View key={index} style={styles.playerItem}>
              <View>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerDetails}>
                  {player.height} | {player.weight}
                </Text>
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
                <TouchableOpacity onPress={() => handleDeletePlayer(index)}>
                  <Ionicons
                    name="trash"
                    size={20}
                    color="red"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Add Player Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Player</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
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

                {/* Placeholder buttons (no functionality yet) */}
                <TouchableOpacity style={styles.measureButton}>
                  <Text style={styles.measureButtonText}>
                    Measure Baseline Blood Oxygen Level
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.measureButton}>
                  <Text style={styles.measureButtonText}>
                    Measure Resting Heartrate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.measureButton}>
                  <Text style={styles.measureButtonText}>
                    Measure Active Heartrate
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAddPlayer}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
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
