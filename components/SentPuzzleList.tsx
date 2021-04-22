import * as React from "react";
import AdSafeAreaView from "./AdSafeAreaView";
import { ImageBackground, View, TouchableOpacity } from "react-native";
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
    <AdSafeAreaView
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
        {sentPuzzles.map((sentPuzzle, ix) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Puzzle", {
                publicKey: sentPuzzle.publicKey,
              })
            }
            key={ix}
          >
            <Card
              style={{
                margin: 1,
                backgroundColor: theme.colors.surface,
              }}
            >
              <Card.Title
                title={sentPuzzle.message || ""}
                subtitle={moment(sentPuzzle.dateReceived).calendar()}
                right={() => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconButton
                      icon={"delete"}
                      onPress={() => deletePuzzle(sentPuzzle)}
                    />
                    <IconButton
                      icon={"send"}
                      onPress={() => sendPuzzle(sentPuzzle.publicKey)}
                    />
                  </View>
                )}
                left={() => (
                  <ImageBackground
                    source={{
                      uri: sentPuzzle.imageURI,
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
          </TouchableOpacity>
        ))}
      </View>
    </AdSafeAreaView>
  );
};
