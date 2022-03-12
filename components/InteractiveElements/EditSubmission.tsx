import * as React from "react";
import { View, Text } from "react-native";
import { Button, Headline, IconButton, Surface } from "react-native-paper";
import { useSelector } from "react-redux";

import { Puzzle, RootState } from "../../types";
import MessageInput from "./MessageInput";

export default function EditSubmission({
  setNewPuzzle,
  setEditing,
  newPuzzle,
}: {
  setNewPuzzle: React.Dispatch<React.SetStateAction<Puzzle>>;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  newPuzzle: Puzzle;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const { height } = useSelector((state: RootState) => state.screenHeight);

  return (
    <View
      style={{
        backgroundColor: theme.colors.backdrop,
        borderRadius: theme.roundness,
        padding: 10,
      }}
    >
      <Headline style={{ alignSelf: "center", marginBottom: 10 }}>
        Edit Puzzle Settings
      </Headline>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          marginBottom: 10,
        }}
      >
        <Text>Type:</Text>
        <Surface
          style={{
            padding: height * 0.01,
            height: height * 0.06,
            width: height * 0.06,
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor:
              newPuzzle.puzzleType === "jigsaw"
                ? theme.colors.surface
                : theme.colors.background,
          }}
        >
          <IconButton
            icon="puzzle"
            onPress={() => {
              setNewPuzzle({ ...newPuzzle, puzzleType: "jigsaw" });
            }}
            animated={false}
          />
        </Surface>
        <Surface
          style={{
            padding: height * 0.01,
            height: height * 0.06,
            width: height * 0.06,
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor:
              newPuzzle.puzzleType === "squares"
                ? theme.colors.surface
                : theme.colors.background,
          }}
        >
          <IconButton
            icon="view-grid"
            onPress={() => {
              setNewPuzzle({ ...newPuzzle, puzzleType: "squares" });
            }}
            animated={false}
          />
        </Surface>
        <Text>Size:</Text>
        <Surface
          style={{
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor:
              newPuzzle.gridSize === 2
                ? theme.colors.surface
                : theme.colors.background,
          }}
        >
          <Button
            mode="text"
            onPress={() => {
              setNewPuzzle({ ...newPuzzle, gridSize: 2 });
            }}
            color={theme.colors.text}
            compact
          >
            2
          </Button>
        </Surface>
        <Surface
          style={{
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor:
              newPuzzle.gridSize === 3
                ? theme.colors.surface
                : theme.colors.background,
          }}
        >
          <Button
            mode="text"
            onPress={() => {
              setNewPuzzle({ ...newPuzzle, gridSize: 3 });
            }}
            color={theme.colors.text}
            compact
          >
            3
          </Button>
        </Surface>
        <Surface
          style={{
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor:
              newPuzzle.gridSize === 4
                ? theme.colors.surface
                : theme.colors.background,
          }}
        >
          <Button
            mode="text"
            onPress={() => {
              setNewPuzzle({ ...newPuzzle, gridSize: 4 });
            }}
            color={theme.colors.text}
            compact
          >
            4
          </Button>
        </Surface>
      </View>
      <MessageInput
        message={newPuzzle.message || ""}
        setMessage={(text) => setNewPuzzle({ ...newPuzzle, message: text })}
      />
      <Button
        mode="contained"
        icon="pencil"
        onPress={() => {
          setEditing(false);
          setNewPuzzle(newPuzzle);
        }}
        style={{
          margin: 20,
        }}
      >
        OK
      </Button>
    </View>
  );
}
