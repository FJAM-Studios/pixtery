import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import moment from "moment";
import * as React from "react";
import {
  ImageBackground,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Modal from "react-native-modal";
import { Card, IconButton, Button, Headline } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { sortPuzzles } from "../puzzleUtils";
import { setSentPuzzles } from "../store/reducers/sentPuzzles";
import { Puzzle, ScreenNavigation, RootState } from "../types";
import {
  saveToLibrary,
  safelyDeletePuzzleImage,
  shareMessage,
  deactivatePuzzleOnServer,
} from "../util";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

export default function SentPuzzleList({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const { height } = useSelector((state: RootState) => state.screenHeight);

  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [puzzleToDelete, setPuzzleToDelete] = React.useState<Puzzle | null>(
    null
  );
  // the setSortBy/setSortOrder are currently unused, but set up for future sort optionality
  const [sortBy] = React.useState<keyof Puzzle>("dateReceived");
  // "desc" = descending or "asc" = ascending
  const [sortOrder] = React.useState<string>("desc");

  const showDeleteModal = (puzzle: Puzzle) => {
    setModalVisible(true);
    setPuzzleToDelete(puzzle);
  };

  const sendPuzzle = (publicKey: string | undefined) => {
    const deepLink = Linking.createURL(`pixtery.io/p/${publicKey}`, {
      scheme: "https",
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
      await safelyDeletePuzzleImage(puzzle.imageURI, receivedPuzzles);
      dispatch(setSentPuzzles(newPuzzles));
      deactivatePuzzleOnServer(puzzle.publicKey, "sent");
    }
    setPuzzleToDelete(null);
    setModalVisible(false);
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
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}
      >
        <View
          style={{
            padding: 30,
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.backdrop,
            borderRadius: theme.roundness,
          }}
        >
          <Headline>Delete Puzzle?</Headline>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Button
              icon="delete"
              mode="contained"
              onPress={() => deletePuzzle(puzzleToDelete)}
              style={{ margin: 5 }}
            >
              Delete
            </Button>
            <Button
              icon="close"
              mode="contained"
              onPress={() => setModalVisible(false)}
              style={{ margin: 5 }}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
      <Header
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      <ScrollView>
        <>
          {sentPuzzles.length ? (
            sentPuzzles
              .sort(sortPuzzles(sortBy, sortOrder))
              .map((sentPuzzle, ix) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Puzzle", {
                      publicKey: sentPuzzle.publicKey,
                      sourceList: "sent",
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
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <IconButton
                            icon="download-circle"
                            onPress={() => saveToLibrary(sentPuzzle.imageURI)}
                          />
                          <IconButton
                            icon="delete"
                            onPress={() => showDeleteModal(sentPuzzle)}
                          />
                          <IconButton
                            icon="send"
                            onPress={() => sendPuzzle(sentPuzzle.publicKey)}
                          />
                        </View>
                      )}
                      left={() => (
                        <ImageBackground
                          source={{
                            uri:
                              FileSystem.documentDirectory +
                              sentPuzzle.imageURI,
                          }}
                          style={{
                            flex: 1,
                            justifyContent: "space-around",
                            padding: 1,
                          }}
                        />
                      )}
                    />
                  </Card>
                </TouchableOpacity>
              ))
          ) : (
            <View
              style={{
                alignItems: "center",
              }}
            >
              <Headline
                style={{
                  marginTop: height * 0.3,
                }}
              >
                You haven&apos;t sent any puzzles!
              </Headline>
            </View>
          )}
        </>
      </ScrollView>
    </AdSafeAreaView>
  );
}
