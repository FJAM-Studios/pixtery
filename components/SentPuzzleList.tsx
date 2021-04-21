import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageBackground, View } from "react-native";
import { Card, IconButton } from "react-native-paper";
import moment from "moment";
import Header from "./Header";
import { Puzzle } from "../types";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { shareMessage } from "../util";

export default ({
  navigation,
  theme,
  receivedPuzzles,
  sentPuzzles,
  setSentPuzzles,
}: {
  navigation: any;
  theme: any;
  receivedPuzzles: Puzzle[];
  sentPuzzles: Puzzle[];
  setSentPuzzles: (puzzles: Puzzle[]) => void;
}) => {
  const sendPuzzle = (publicKey: string | undefined) => {
    const deepLink = Linking.createURL("", {
      queryParams: { puzzle: publicKey },
    });
    shareMessage(deepLink);
  };
  const deletePuzzle = async (puzzle: Puzzle) => {
    const newPuzzles = [
      ...sentPuzzles.filter((puz) => puz.publicKey !== puzzle.publicKey),
    ];
    await AsyncStorage.setItem(
      "@pixterySentPuzzles",
      JSON.stringify(newPuzzles)
    );
    setSentPuzzles(newPuzzles);
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
        {sentPuzzles.map((receivedPuzzle, ix) => (
          <Card
            key={ix}
            style={{
              margin: 1,
              backgroundColor: theme.colors.surface,
            }}
          >
            <Card.Title
              title={receivedPuzzle.message || "No message"}
              subtitle={moment(receivedPuzzle.dateReceived).calendar()}
              right={() => (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <IconButton
                    icon={"puzzle"}
                    onPress={() =>
                      navigation.navigate("Puzzle", {
                        ...receivedPuzzle,
                      })
                    }
                  />
                  <IconButton
                    icon={"delete"}
                    onPress={() => deletePuzzle(receivedPuzzle)}
                  />
                  <IconButton
                    icon={"send"}
                    onPress={() => sendPuzzle(receivedPuzzle.publicKey)}
                  />
                </View>
              )}
              left={() => (
                <ImageBackground
                  source={{
                    uri: receivedPuzzle.imageURI,
                  }}
                  style={{
                    flex: 1,
                    justifyContent: "space-around",
                    padding: 1,
                  }}
                ></ImageBackground>
              )}
            />
          </Card>
        ))}
      </View>
    </SafeAreaView>
  );
};
