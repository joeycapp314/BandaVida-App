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
const API_BASE_URL = "http://10.132.30.49:5000"; // <-- put your server IP and port here

export default function PlayersScreen() {
  const [players, setPlayers] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [editingIndex, setEditingIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [seenAlerts, setSeenAlerts] = useState({});


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

  // ------------------- Fetches alerts from database -------------------
  useEffect(() => {
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/alert`);
      const data = await response.json();
      const activeAlerts = data.map((a) => a.PNAME);
      setAlerts(activeAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  fetchAlerts();
}, []);


  // ---------------- Add player to database ----------------
  const handleSavePlayer = async () => {
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
    if (isNaN(parsedResting) || parsedResting > 200) {
      Alert.alert("Error", "Heartrate cannot be greater than 200 bpm.");
      return;
    }
    if (isNaN(parsedActive) || parsedActive >  200) {
      Alert.alert("Error", "Heartrate cannot be greater than 200 bpm.");
      return;
    }
    if (isNaN(parsedResting) || isNaN(parsedActive) || parsedActive <= parsedResting) {
      Alert.alert("Error", "Active heartrate must be higher than resting heartrate.");
      return;
    }
    if (isNaN(parsedBloodOxygen) || parsedBloodOxygen < 0 || parsedBloodOxygen > 100) {
      Alert.alert("Error", "Blood oxygen must be between 0% and 100%.");
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
     if (editingIndex !== null) {
      // EDIT mode: update existing player
        const response = await fetch(
          `${API_BASE_URL}/player/${encodeURIComponent(players[editingIndex].name)}`,
          {
            method: "PUT", // <- make sure your backend supports PUT for updates
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPlayer),
          }
        );
        if (!response.ok) throw new Error("Failed to update player");

        const updatedPlayers = [...players];
        updatedPlayers[editingIndex] = newPlayer;
        setPlayers(updatedPlayers);
      } else {
        // ADD mode: create new player
        const response = await fetch(`${API_BASE_URL}/player`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPlayer),
        });
        if (!response.ok) throw new Error("Failed to add player");
        setPlayers((prev) => [...prev, newPlayer]);
      }

      //--------------- Reset modal -----------------------------
      setFormData({
        name: "", heightFeet: "", heightInches: "", weight: "", restingHR: "", activeHR: "", baseBO: ""
      });
      setEditingIndex(null);
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", editingIndex !== null ? "Unable to update player" : "Unable to add player");
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

  //-------------------Edit Player in DataBase ------------------
  const handleEditPlayer = (index) => {
    const player = players[index];

    // Load player info into form
    setFormData({
      name: player.name,
      heightFeet: player.height_ft.toString(),
      heightInches: player.height_in.toString(),
      weight: player.weight.toString(),
      restingHR: player.rest_rate.toString(),
      activeHR: player.active_rate.toString(),
      baseBO: player.base_bloodox.toString(),
    });

    // Store index for updating
    setEditingIndex(index);

    // Show modal
    setModalVisible(true);
  };

  //-------------- Delete player confirmation --------------------------
  const confirmDeletePlayer = (index) => {
    const playerToDelete = players[index];
    Alert.alert(
      "Delete Player",
      `Are you sure you want to delete ${playerToDelete.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDeletePlayer(index) },
      ],
      { cancelable: true }
    );
  };



  // ---------------- UI ----------------
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Search Bar */}
       <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search players"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {filteredPlayers.map((player, index) => (
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
                {/*--------------- Alert "!" ----------------- */}
                {alerts.includes(player.name) && !seenAlerts[player.name] && (
                  <TouchableOpacity
                    onPress={() => {
                      setSeenAlerts((prev) => ({ ...prev, [player.name]: true })); // hide it
                      router.push({pathname: "/Alerts"});  // open Alerts page
                    }}
                  >
                    <Ionicons
                      name="alert"
                      size={25}
                      color="gold"
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                )}

                {/* ----------------- Edit Player -------------*/}
                <TouchableOpacity
                  onPress={() => handleEditPlayer(index)}
                  style={styles.editButton}
                >
                  <Ionicons
                    name="pencil"
                    size={20}
                    color="#000"
                    style={styles.icon}
                  />
                </TouchableOpacity>

                {/* ----------------- Delete Player -------------*/}
                <TouchableOpacity
                  onPress={() => confirmDeletePlayer(index)}
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

        {/* ----------------- Add Player -------------*/}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setModalVisible(true); 
            setEditingIndex(null);
          }}
        >
          <Text style={styles.addButtonText}>Add Player</Text>
        </TouchableOpacity>
      </View>

      {/* ----------------- New Player Modal -------------*/}
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
                  onPress={handleSavePlayer}
                >
                  <Text style={styles.confirmButtonText}>
                    {editingIndex !== null ? "Save Changes" : "Confirm"}
                  </Text>
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
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
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
    marginBottom: 50,
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
searchInput: {
  backgroundColor: "#f0f0f0",
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: "#ccc",
},
searchContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#f0f0f0",
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 8,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: "#ccc",
},
searchIcon: {
  marginRight: 8,
},
searchInput: {
  flex: 1,
  fontSize: 16,
  color: "#000",
},
});
