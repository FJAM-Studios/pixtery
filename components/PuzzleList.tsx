import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, TouchableOpacity } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";
import moment from "moment";
import Header from "./Header";
import { Puzzle } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default ({
  navigation,
  theme,
  receivedPuzzles,
  setReceivedPuzzles,
}: {
  navigation: any;
  theme: any;
  receivedPuzzles: Puzzle[];
  setReceivedPuzzles: (puzzles: Puzzle[]) => void;
}) => {
  const deletePuzzle = async (puzzle: Puzzle) => {
    const newPuzzles = [
      ...receivedPuzzles.filter((puz) => puz.publicKey !== puzzle.publicKey),
    ];
    await AsyncStorage.setItem("@pixteryPuzzles", JSON.stringify(newPuzzles));
    setReceivedPuzzles(newPuzzles);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
        justifyContent: "flex-start",
      }}
    >
      <Header
        theme={theme}
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      <View>
        {receivedPuzzles.map((receivedPuzzle, ix) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Puzzle", {
                ...receivedPuzzle,
              })
            }
            key={ix}
          >
            <Card
              style={{
                margin: 1,
                backgroundColor: receivedPuzzle.completed
                  ? theme.colors.disabled
                  : theme.colors.surface,
              }}
            >
              <Card.Title
                title={
                  receivedPuzzle.completed
                    ? `${receivedPuzzle.senderName} - ${
                        receivedPuzzle.message && receivedPuzzle.message.length
                          ? receivedPuzzle.message
                          : "(No Message)"
                      }`
                    : receivedPuzzle.senderName
                }
                subtitle={moment(receivedPuzzle.dateReceived).calendar()}
                right={() => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text>{receivedPuzzle.gridSize}</Text>
                    <IconButton
                      icon={
                        receivedPuzzle.puzzleType === "jigsaw"
                          ? "puzzle"
                          : "view-grid"
                      }
                    />
                    {receivedPuzzle.completed ? (
                      <IconButton
                        icon={"delete"}
                        onPress={() => deletePuzzle(receivedPuzzle)}
                      />
                    ) : null}
                  </View>
                )}
              />
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};
