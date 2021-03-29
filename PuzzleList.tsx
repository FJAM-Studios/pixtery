import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";
import moment from "moment";
import Header from "./Header";
import { Puzzle } from "./types";

export default ({
  navigation,
  theme,
  receivedPuzzles,
}: {
  navigation: any;
  theme: any;
  receivedPuzzles: Puzzle[];
}) => {
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
      <Header
        theme={theme}
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      <View>
        {receivedPuzzles.map((receivedPuzzle, ix) => (
          <Card
            key={ix}
            style={{
              margin: 1,
              backgroundColor: receivedPuzzle.completed
                ? theme.colors.disabled
                : theme.colors.surface,
            }}
          >
            <Card.Title
              title={receivedPuzzle.senderName}
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
                </View>
              )}
            />
          </Card>
        ))}
      </View>
    </SafeAreaView>
  );
};
