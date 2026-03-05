import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STORAGE_KEY = "FUTEBOL_MATCH_STATE";

export default function Match() {
  const { teamSize, players } = useLocalSearchParams();

  const [teams, setTeams] = useState<string[][]>([]);
  const [currentMatch, setCurrentMatch] = useState<[number, number] | null>(null);

  const [showRanking, setShowRanking] = useState(false);

  const [minutes, setMinutes] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);

  const [wins, setWins] = useState<{ [key: string]: number }>({});

  const [newPlayer, setNewPlayer] = useState("");

  const [lastState, setLastState] = useState<any>(null);

  // =========================
  // CARREGAR ESTADO SALVO
  // =========================

  const loadState = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const data = JSON.parse(saved);

      setTeams(data.teams);
      setCurrentMatch(data.currentMatch);
      setWins(data.wins);
      setSecondsLeft(data.secondsLeft);
      setIsRunning(data.isRunning);
      setStartTime(data.startTime);
      setDuration(data.duration);
    } catch {
      console.log("erro ao carregar estado");
    }
  };

  // =========================
  // SALVAR ESTADO
  // =========================

  const saveState = async () => {
    try {
      const data = {
        teams,
        currentMatch,
        wins,
        secondsLeft,
        isRunning,
        startTime,
        duration,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.log("erro ao salvar estado");
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    saveState();
  }, [teams, currentMatch, wins, secondsLeft, isRunning]);

  // =========================
  // GERAR TIMES
  // =========================

  useEffect(() => {
    if (players && teamSize && teams.length === 0) {
      const parsedPlayers: string[] = JSON.parse(players as string);
      const size = Number(teamSize);

      const generatedTeams: string[][] = [];

      for (let i = 0; i < parsedPlayers.length; i += size) {
        generatedTeams.push(parsedPlayers.slice(i, i + size));
      }

      setTeams(generatedTeams);

      if (generatedTeams.length >= 2) {
        setCurrentMatch([0, 1]);
      }
    }
  }, []);

  // =========================
  // TIMER REAL
  // =========================

  useEffect(() => {
    let interval: any;

    if (isRunning && startTime !== null) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = duration - elapsed;

        if (remaining <= 0) {
          setSecondsLeft(0);
          setIsRunning(false);
        } else {
          setSecondsLeft(remaining);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // =========================
  // TIME VENCEDOR
  // =========================

  const handleWinner = (winnerIndex: number) => {
    if (!currentMatch) return;

    setLastState({
      teams,
      currentMatch,
      wins,
    });

    setIsRunning(false);
    setSecondsLeft(0);

    const loserIndex =
      currentMatch[0] === winnerIndex ? currentMatch[1] : currentMatch[0];

    const winnerTeam = teams[winnerIndex];
    const loserTeam = teams[loserIndex];

    setWins((prev) => {
      const updated = { ...prev };

      winnerTeam.forEach((player) => {
        updated[player] = (updated[player] || 0) + 1;
      });

      return updated;
    });

    const size = Number(teamSize);

    const otherPlayers = teams.filter((_, i) => i !== winnerIndex).flat();

    const reorderedQueue = [
      ...otherPlayers.filter((p) => !loserTeam.includes(p)),
      ...loserTeam,
    ];

    const rebuiltTeams: string[][] = [winnerTeam];

    for (let i = 0; i < reorderedQueue.length; i += size) {
      rebuiltTeams.push(reorderedQueue.slice(i, i + size));
    }

    setTeams(rebuiltTeams);

    if (rebuiltTeams.length >= 2 && rebuiltTeams[1].length === size) {
      setCurrentMatch([0, 1]);
    } else {
      setCurrentMatch(null);
    }
  };

  // =========================
  // DESFAZER PARTIDA
  // =========================

  const undoMatch = () => {
    if (!lastState) return;

    setTeams(lastState.teams);
    setCurrentMatch(lastState.currentMatch);
    setWins(lastState.wins);
  };

  // =========================
  // ADICIONAR JOGADOR
  // =========================

  const handleAddPlayer = () => {
    if (!newPlayer.trim()) return;

    const size = Number(teamSize);
    const updatedTeams = [...teams];

    for (let i = 2; i < updatedTeams.length; i++) {
      if (updatedTeams[i].length < size) {
        updatedTeams[i] = [...updatedTeams[i], newPlayer.trim()];
        setTeams(updatedTeams);
        setNewPlayer("");
        return;
      }
    }

    updatedTeams.push([newPlayer.trim()]);
    setTeams(updatedTeams);
    setNewPlayer("");
  };

  // =========================
  // REMOVER JOGADOR
  // =========================

  const handleRemovePlayer = (playerToRemove: string) => {
    const size = Number(teamSize);

    const allPlayers = teams.flat();

    const updatedPlayers = allPlayers.filter(
      (player) => player !== playerToRemove
    );

    const rebuiltTeams: string[][] = [];

    for (let i = 0; i < updatedPlayers.length; i += size) {
      rebuiltTeams.push(updatedPlayers.slice(i, i + size));
    }

    setTeams(rebuiltTeams);

    if (
      rebuiltTeams.length >= 2 &&
      rebuiltTeams[0].length === size &&
      rebuiltTeams[1].length === size
    ) {
      setCurrentMatch([0, 1]);
    } else {
      setCurrentMatch(null);
    }
  };

  if (!currentMatch) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Não há times suficientes.</Text>
      </View>
    );
  }

  const teamA = teams[currentMatch[0]];
  const teamB = teams[currentMatch[1]];
  const nextTeams = teams.slice(2);

  const startTimer = () => {
    if (!minutes || minutes <= 0) return;

    const totalSeconds = secondsLeft > 0 ? secondsLeft : minutes * 60;

    setDuration(totalSeconds);
    setStartTime(Date.now());
    setSecondsLeft(totalSeconds);
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(0);
    setStartTime(null);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Partida Atual ⚽🔥</Text>

          <TouchableOpacity onPress={() => setShowRanking(!showRanking)}>
            <Text style={{ fontSize: 26 }}>🏆</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: "#fff" }}>Adicionar jogador na fila:</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#aaa"
          value={newPlayer}
          onChangeText={setNewPlayer}
        />

        <TouchableOpacity style={styles.winButton} onPress={handleAddPlayer}>
          <Text style={styles.winText}>Adicionar Jogador</Text>
        </TouchableOpacity>

        <View style={styles.teamContainer}>
          <Text style={styles.teamTitle}>Time A</Text>

          {teamA.map((player, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleRemovePlayer(player)}
            >
              <Text style={styles.player}>{player} ❌</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.winButton}
            onPress={() => handleWinner(currentMatch[0])}
          >
            <Text style={styles.winText}>Time A venceu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.teamContainer}>
          <Text style={styles.teamTitle}>Time B</Text>

          {teamB.map((player, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleRemovePlayer(player)}
            >
              <Text style={styles.player}>{player} ❌</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.winButton}
            onPress={() => handleWinner(currentMatch[1])}
          >
            <Text style={styles.winText}>Time B venceu</Text>
          </TouchableOpacity>
        </View>

        {nextTeams.length > 0 && (
          <>
            <Text style={[styles.teamTitle, { marginTop: 10 }]}>
              Próximos Times na Fila 🔥
            </Text>

            {nextTeams.map((team, teamIndex) => (
              <View key={teamIndex} style={styles.teamContainer}>
                <Text style={styles.teamTitle}>
                  Time da Fila #{teamIndex + 1}
                </Text>

                {team.map((player, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRemovePlayer(player)}
                  >
                    <Text style={styles.player}>{player} ❌</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        )}

        <Text style={styles.timer}>
          {Math.floor(secondsLeft / 60).toString().padStart(2, "0")}:
          {(secondsLeft % 60).toString().padStart(2, "0")}
        </Text>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={minutes.toString()}
          onChangeText={(text) => setMinutes(Number(text) || 0)}
        />

        <TouchableOpacity
          style={styles.winButton}
          onPress={isRunning ? pauseTimer : startTimer}
        >
          <Text style={styles.winText}>
            {isRunning ? "Pausar" : "Iniciar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.winButton, { backgroundColor: "#aa3333", marginBottom: 30 }]}
          onPress={resetTimer}
        >
          <Text style={styles.winText}>Resetar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.winButton, { backgroundColor: "#f59e0b" }]}
          onPress={undoMatch}
        >
          <Text style={styles.winText}>Desfazer última partida</Text>
        </TouchableOpacity>

        {showRanking && (
          <View style={styles.rankingPanel}>
            <TouchableOpacity onPress={() => setShowRanking(false)}>
              <Text style={{ color: "red", marginBottom: 10 }}>Fechar ✖</Text>
            </TouchableOpacity>

            <Text style={styles.teamTitle}>🏆 Top 3</Text>

            {Object.entries(wins)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([player, winCount], index) => {
                const medal =
                  index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";

                return (
                  <Text key={player} style={styles.player}>
                    {medal} {player} - {winCount}
                  </Text>
                );
              })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#0f172a",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },

  teamTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00ff88",
    marginBottom: 6,
  },

  player: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },

  teamContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#1e293b",
  },

  winButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    alignItems: "center",
  },

  winText: {
    color: "#fff",
    fontWeight: "600",
  },

  timer: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#22c55e",
    marginVertical: 20,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    textAlign: "center",
  },

  rankingPanel: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "65%",
    height: "100%",
    backgroundColor: "#111827",
    padding: 20,
    elevation: 10,
  },
});
