import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import { ImageBackground, View, TouchableOpacity } from "react-native";
import { Card, IconButton } from "react-native-paper";
import { useSelector } from "react-redux";

import { Puzzle, RootState } from "../../types";
import { saveToLibrary, shareMessage, formatDateFromString } from "../../util";

export default function SentPuzzleCard({
  puzzle,
  showDeleteModal,
  navigateToPuzzle,
}: {
  puzzle: Puzzle;
  showDeleteModal: Function;
  navigateToPuzzle: (publicKey: string) => void;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);

  const sendPuzzle = (publicKey: string | undefined) => {
    const deepLink = Linking.createURL(`pixtery.io/p/${publicKey}`, {
      scheme: "https",
    });
    shareMessage(deepLink);
  };

  return (
    <TouchableOpacity onPress={() => navigateToPuzzle(puzzle.publicKey)}>
      <Card
        style={{
          margin: 1,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Card.Title
          title={puzzle.message || ""}
          subtitle={
            puzzle.dateReceived
              ? formatDateFromString(puzzle.dateReceived)
              : null
          }
          right={() => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton
                icon="download-circle"
                onPress={() => saveToLibrary(puzzle.imageURI)}
              />
              <IconButton
                icon="delete"
                onPress={() => showDeleteModal(puzzle)}
              />
              <IconButton
                icon="send"
                onPress={() => sendPuzzle(puzzle.publicKey)}
              />
            </View>
          )}
          left={() => (
            <ImageBackground
              source={{
                uri: FileSystem.documentDirectory + puzzle.imageURI,
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
  );
}
