import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { View, ScrollView } from "react-native";
import Modal from "react-native-modal";
import { Button, Headline } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { sortPuzzles } from "../../puzzleUtils";
import { setSentPuzzles } from "../../store/reducers/sentPuzzles";
import { Puzzle, PuzzleListContainerProps, RootState } from "../../types";
import {
  safelyDeletePuzzleImage,
  deactivatePuzzleOnServer,
  goToScreen,
} from "../../util";
import { SentPuzzleCard } from "../InteractiveElements";
import { AdSafeAreaView } from "../Layout";

export default function SentPuzzleList({
  navigation,
}: PuzzleListContainerProps<"SentPuzzleList">): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const [modalVisible, setModalVisible] = useState(false);
  const [puzzleToDelete, setPuzzleToDelete] = useState<Puzzle | null>(null);
  // the setSortBy/setSortOrder are currently unused, but set up for future sort optionality
  const [sortBy] = useState<keyof Puzzle>("dateReceived");
  // "desc" = descending or "asc" = ascending
  const [sortOrder] = useState<string>("desc");

  const showDeleteModal = (puzzle: Puzzle) => {
    setModalVisible(true);
    setPuzzleToDelete(puzzle);
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

  const navigateToPuzzle = (publicKey: string) => {
    goToScreen(navigation, ["LibraryContainer", "Puzzle"], {
      publicKey,
      sourceList: "sent",
    });
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
      <ScrollView>
        <>
          {sentPuzzles.length ? (
            sentPuzzles
              .sort(sortPuzzles(sortBy, sortOrder))
              .map((sentPuzzle, ix) => (
                <SentPuzzleCard
                  key={ix}
                  puzzle={sentPuzzle}
                  showDeleteModal={showDeleteModal}
                  navigateToPuzzle={navigateToPuzzle}
                />
              ))
          ) : (
            <View
              style={{
                alignItems: "center",
              }}
            >
              <Headline
                style={{
                  marginTop: 10,
                }}
              >
                You haven&apos;t sent any puzzles!
              </Headline>
              <Button
                mode="contained"
                onPress={() => {
                  goToScreen(navigation, ["MakeContainer", "Make"]);
                }}
                style={{
                  marginTop: 10,
                }}
              >
                Make a Puzzle
              </Button>
            </View>
          )}
        </>
      </ScrollView>
    </AdSafeAreaView>
  );
}
