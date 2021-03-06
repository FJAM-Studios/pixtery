import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { View, ScrollView } from "react-native";
import Modal from "react-native-modal";
import { TextInput, IconButton, Button, Headline } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { sortPuzzles } from "../../puzzleUtils";
import { setReceivedPuzzles } from "../../store/reducers/receivedPuzzles";
import { Puzzle, PuzzleListContainerProps, RootState } from "../../types";
import { safelyDeletePuzzleImage, deactivatePuzzleOnServer } from "../../util";
import { ReceivedPuzzleCard } from "../InteractiveElements";
import { AdSafeAreaView } from "../Layout";

export default function PuzzleList({
  navigation,
}: PuzzleListContainerProps<"PuzzleList">): JSX.Element {
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
  const [puzzleURL, setPuzzleURL] = useState<string>("");

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
      deactivatePuzzleOnServer(puzzle.publicKey, "received");
    }
    setPuzzleToDelete(null);
    setModalVisible(false);
  };

  const downloadPuzzle = () => {
    //parse the public key from the text, so users can enter either the public key or the whole url.
    const publicKey = puzzleURL.slice(puzzleURL.lastIndexOf("/") + 1);
    navigation.navigate("LibraryContainer", {
      screen: "AddPuzzle",
      params: { publicKey, sourceList: "received" },
    });
  };

  const navigateToPuzzle = (publicKey: string) => {
    navigation.navigate("LibraryContainer", {
      screen: "Puzzle",
      params: {
        publicKey,
        sourceList: "received",
      },
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: "2%",
        }}
      >
        <TextInput
          mode="outlined"
          placeholder="Enter puzzle ID or URL"
          value={puzzleURL}
          onChangeText={(text) => setPuzzleURL(text)}
          onSubmitEditing={() => {
            if (puzzleURL.length > 8) downloadPuzzle();
          }}
          outlineColor={theme.colors.primary}
          placeholderTextColor={theme.colors.primary}
          // maxLength={50}
          style={{ flex: 2 }}
        />
        <IconButton
          icon="arrow-down-bold-circle"
          onPress={downloadPuzzle}
          style={{ flex: 0 }}
          size={40}
          disabled={puzzleURL.length < 9}
        />
      </View>
      <ScrollView>
        <>
          {receivedPuzzles.length ? (
            receivedPuzzles
              .sort(sortPuzzles(sortBy, sortOrder))
              .map((receivedPuzzle, ix) => (
                <ReceivedPuzzleCard
                  key={ix}
                  navigateToPuzzle={navigateToPuzzle}
                  puzzle={receivedPuzzle}
                  showDeleteModal={showDeleteModal}
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
                You have no puzzles to solve!
              </Headline>
            </View>
          )}
        </>
      </ScrollView>
    </AdSafeAreaView>
  );
}
