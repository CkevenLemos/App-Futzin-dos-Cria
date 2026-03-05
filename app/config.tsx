import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Config() {
  const router = useRouter();
  const [teamSize, setTeamSize] = useState<number | null>(null);

  const handleNext = () => {
    if (teamSize) {
      router.push({
        pathname: "/players",
        params: { teamSize: teamSize.toString() },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha o formato do jogo ⚽</Text>

      {[4, 5, 6, 7].map((size) => (
        <TouchableOpacity
          key={size}
          style={[
            styles.button,
            teamSize === size && styles.selectedButton,
          ]}
          onPress={() => setTeamSize(size)}
        >
          <Text style={styles.buttonText}>{size} x {size}</Text>
        </TouchableOpacity>
      ))}

      {teamSize && (
        <TouchableOpacity style={styles.confirmButton} onPress={handleNext}>
          <Text style={styles.confirmText}>Confirmar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    color: "#00ff88",
    marginBottom: 30,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    width: 200,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#00ff88",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  confirmButton: {
    marginTop: 30,
    backgroundColor: "#00ff88",
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
  },
  confirmText: {
    fontWeight: "bold",
    color: "#111",
  },
});

