import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Players() {
  const { teamSize } = useLocalSearchParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [players, setPlayers] = useState<string[]>([]);

  const addPlayer = () => {
    if (name.trim() !== "") {
      setPlayers([...players, name]);
      setName("");
    }
  };

  const handleConfirm = () => {
    router.push({
      pathname: "/match",
      params: {
        teamSize: teamSize?.toString(),
        players: JSON.stringify(players),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar jogadores ⚽</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o nome"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
        <Text style={styles.addText}>Adicionar</Text>
      </TouchableOpacity>

      <FlatList
        data={players}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.playerItem}>
            {index + 1}. {item}
          </Text>
        )}
      />

      {players.length >= Number(teamSize) * 2 && (
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Confirmar jogadores</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: "#00ff88",
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#00ff88",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  addText: {
    fontWeight: "bold",
    color: "#111",
  },
  playerItem: {
    color: "#fff",
    padding: 8,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: "#00ff88",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: {
    fontWeight: "bold",
    color: "#111",
  },
});
