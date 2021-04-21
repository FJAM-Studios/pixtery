import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageBackground, View } from "react-native";
import { Card, IconButton, Headline } from "react-native-paper";
import moment from "moment";
import Header from "./Header";
import { Puzzle } from "../types";
import Modal from "react-native-modal";
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
  const [modalVisible, setModalVisible] = React.useState(false);
  const [puzzleToDelete, setPuzzleToDelete] = React.useState<Puzzle | null>(
    null
  );

  const showDeleteModal = (puzzle: Puzzle) => {
    setModalVisible(true);
    setPuzzleToDelete(puzzle);
  };

  const sendPuzzle = (publicKey: string | undefined) => {
    const deepLink = Linking.createURL("", {
      queryParams: { puzzle: publicKey },
    });
    shareMessage(deepLink);
  };
  const deletePuzzle = async (puzzle: Puzzle | null) => {
    if (puzzle) {
      const newPuzzles = [
        ...sentPuzzles.filter((puz) => puz.publicKey !== puzzle.publicKey),
      ];
      await AsyncStorage.setItem(
        "@pixterySentPuzzles",
        JSON.stringify(newPuzzles)
      );
      setSentPuzzles(newPuzzles);
    }
    setPuzzleToDelete(null);
    setModalVisible(false);
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
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn={"fadeIn"}
        animationOut={"fadeOut"}
        backdropTransitionOutTiming={0}
      >
        <View
          style={{
            padding: 50,
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.backdrop,
            borderRadius: theme.roundness,
          }}
        >
          <Headline>Delete Puzzle?</Headline>
          <View style={{ flexDirection: "row" }}>
            <IconButton
              icon="delete"
              onPress={() => deletePuzzle(puzzleToDelete)}
            />
            <IconButton icon="close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Header
        theme={theme}
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      <View>
        {sentPuzzles.map((sentPuzzle, ix) => (
          <Card
            key={ix}
            style={{
              margin: 1,
              backgroundColor: theme.colors.surface,
            }}
          >
            <Card.Title
              title={sentPuzzle.message || "No message"}
              subtitle={moment(sentPuzzle.dateReceived).calendar()}
              right={() => (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <IconButton
                    icon={"puzzle"}
                    onPress={() =>
                      navigation.navigate("Puzzle", {
                        publicKey: sentPuzzle.publicKey,
                      })
                    }
                  />
                  <IconButton
                    icon={"delete"}
                    onPress={() => showDeleteModal(sentPuzzle)}
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
        ))}
      </View>
    </SafeAreaView>
  );
};
