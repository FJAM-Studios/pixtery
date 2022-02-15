import * as FileSystem from "expo-file-system";
import * as React from "react";
import { useState } from "react";
import {
  ImageBackground,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Card, Headline, IconButton, Text } from "react-native-paper";
import { useSelector } from "react-redux";

import { ScreenNavigation, RootState } from "../../types";
import { formatDateFromString } from "../../util";
import { SubmissionModal } from "../InteractiveElements";
import { AdSafeAreaView } from "../Layout";

export default function AddToGallery({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle>();

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
      <ScrollView>
        <Text style={{ alignSelf: "center", textAlign: "center" }}>
          You can edit the secret message after selecting
        </Text>
        <>
          {sentPuzzles.length ? (
            sentPuzzles.map((sentPuzzle, ix) => (
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                  setSelectedPuzzle(sentPuzzle);
                }}
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
                    subtitle={
                      sentPuzzle.dateReceived
                        ? formatDateFromString(sentPuzzle.dateReceived)
                        : null
                    }
                    right={() => (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text>{sentPuzzle.gridSize}</Text>
                        <IconButton
                          icon={
                            sentPuzzle.puzzleType === "jigsaw"
                              ? "puzzle"
                              : "view-grid"
                          }
                        />
                      </View>
                    )}
                    left={() => (
                      <ImageBackground
                        source={{
                          uri:
                            FileSystem.documentDirectory + sentPuzzle.imageURI,
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
              <Headline>You haven&apos;t sent any puzzles!</Headline>
            </View>
          )}
        </>
      </ScrollView>
      {selectedPuzzle ? (
        <SubmissionModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          puzzle={selectedPuzzle}
        />
      ) : null}
    </AdSafeAreaView>
  );
}
