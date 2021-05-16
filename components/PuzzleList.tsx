import moment from "moment";
import * as React from "react";
import { View, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Text, Card, IconButton, Button, Headline } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { deleteReceivedPuzzle } from "../store/reducers/receivedPuzzles";
import { Puzzle, ScreenNavigation, RootState } from "../types";
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
  const [modalVisible, setModalVisible] = React.useState(false);
  const [puzzleToDelete, setPuzzleToDelete] = React.useState<Puzzle | null>(
    null
  );

  const showDeleteModal = (puzzle: Puzzle) => {
    setModalVisible(true);
    setPuzzleToDelete(puzzle);
  };

  const deletePuzzle = async (puzzle: Puzzle | null) => {
    if (puzzle) {
      dispatch(deleteReceivedPuzzle(puzzle.publicKey));
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
      <View>
        {receivedPuzzles.map((receivedPuzzle, ix) => (
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
                    ? receivedPuzzle.senderName + " - " + receivedPuzzle.message
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
                    <IconButton
                      icon="delete"
                      onPress={() => showDeleteModal(receivedPuzzle)}
                    />
                  </View>
                )}
              />
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </AdSafeAreaView>
  );
}
