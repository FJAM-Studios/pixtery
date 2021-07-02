import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import * as React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Text, Card, IconButton, Button, Headline } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { sortPuzzles } from "../puzzleUtils";
import { setReceivedPuzzles } from "../store/reducers/receivedPuzzles";
import { Puzzle, ScreenNavigation, RootState } from "../types";
import { saveToLibrary, safelyDeletePuzzleImage } from "../util";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

export default function PuzzleList({
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
  // the sortBy/sortOrder options are currently unused, but set up for future sort optionality
  const [sortBy, setSortBy] = React.useState("dateReceived");
  const [sortOrder, setSortOrder] = React.useState("desc");
  const [receivedPuzzlesSorted, setReceivedPuzzlesSorted] = React.useState(
    sortPuzzles("dateReceived", "desc", receivedPuzzles)
  );

  const showDeleteModal = (puzzle: Puzzle) => {
    setModalVisible(true);
    setPuzzleToDelete(puzzle);
  };

  const deletePuzzle = async (puzzle: Puzzle | null) => {
    if (puzzle) {
      const newPuzzles = [
        ...receivedPuzzles.filter((puz) => puz.publicKey !== puzzle.publicKey),
      ];
      await AsyncStorage.setItem("@pixteryPuzzles", JSON.stringify(newPuzzles));
      //delete local image
      await safelyDeletePuzzleImage(puzzle.imageURI, sentPuzzles);
      dispatch(setReceivedPuzzles(newPuzzles));
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
          {receivedPuzzlesSorted.length ? (
            receivedPuzzlesSorted.map((receivedPuzzle, ix) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Puzzle", {
                    publicKey: receivedPuzzle.publicKey,
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
                      receivedPuzzle.message &&
                      receivedPuzzle.message.length &&
                      receivedPuzzle.completed
                        ? receivedPuzzle.senderName +
                          " - " +
                          receivedPuzzle.message
                        : receivedPuzzle.senderName
                    }
                    subtitle={moment(receivedPuzzle.dateReceived).calendar()}
                    right={() => (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
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
                            icon="download-circle"
                            onPress={() =>
                              saveToLibrary(receivedPuzzle.imageURI)
                            }
                          />
                        ) : null}
                        <IconButton
                          icon="delete"
                          onPress={() => showDeleteModal(receivedPuzzle)}
                        />
                      </View>
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
                You have no puzzles to solve!
              </Headline>
            </View>
          )}
        </>
      </ScrollView>
    </AdSafeAreaView>
  );
}
