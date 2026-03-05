import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Futzin dos cria ⚽🔥</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/config")}
      >
        <Text style={styles.buttonText}>Novo futebol</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Carregar futebol</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Excluir futebol</Text>
      </TouchableOpacity>
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
    fontSize: 28,
    color: "#00ff88",
    marginBottom: 40,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#00ff88",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#111",
    fontWeight: "bold",
  },
});
