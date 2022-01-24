import * as React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";
import { useSelector } from "react-redux";

import { Puzzle, ScreenNavigation, RootState } from "../../types";
import { saveToLibrary, formatDateFromString } from "../../util";

export default function ReceivedPuzzleCard({
  puzzle,
  showDeleteModal,
  navigation,
}: {
  puzzle: Puzzle;
  showDeleteModal: Function;
  navigation: ScreenNavigation;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Puzzle", {
          publicKey: puzzle.publicKey,
          sourceList: "received",
        })
      }
    >
      <Card
        style={{
          margin: 1,
          backgroundColor: puzzle.completed
            ? theme.colors.disabled
            : theme.colors.surface,
        }}
      >
        <Card.Title
          title={
            puzzle.message && puzzle.message.length && puzzle.completed
              ? puzzle.senderName + " - " + puzzle.message
              : puzzle.senderName
          }
          subtitle={
            puzzle.dateReceived
              ? formatDateFromString(puzzle.dateReceived)
              : null
          }
          right={() => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text>{puzzle.gridSize}</Text>
              <IconButton
                icon={puzzle.puzzleType === "jigsaw" ? "puzzle" : "view-grid"}
              />
              {puzzle.completed ? (
                <IconButton
                  icon="download-circle"
                  onPress={() => saveToLibrary(puzzle.imageURI)}
                />
              ) : null}
              <IconButton
                icon="delete"
                onPress={() => showDeleteModal(puzzle)}
              />
            </View>
          )}
        />
      </Card>
    </TouchableOpacity>
  );
}
