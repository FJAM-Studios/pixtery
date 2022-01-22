import dayjs from "dayjs";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as React from "react";
import { ImageBackground, View, TouchableOpacity } from "react-native";
import { Card, IconButton } from "react-native-paper";
import { useSelector } from "react-redux";

import { DATE_FORMAT } from "../../constants";
import { Puzzle, ScreenNavigation, RootState } from "../../types";
import { saveToLibrary, shareMessage } from "../../util";

export default function SentPuzzleCard({
  puzzle,
  showDeleteModal,
  navigation,
}: {
  puzzle: Puzzle;
  showDeleteModal: Function;
  navigation: ScreenNavigation;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);

  const sendPuzzle = (publicKey: string | undefined) => {
    const deepLink = Linking.createURL(`pixtery.io/p/${publicKey}`, {
      scheme: "https",
    });
    shareMessage(deepLink);
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Puzzle", {
          publicKey: puzzle.publicKey,
          sourceList: "sent",
        })
      }
    >
      <Card
        style={{
          margin: 1,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Card.Title
          title={puzzle.message || ""}
          subtitle={dayjs(puzzle.dateReceived).format(DATE_FORMAT)}
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
