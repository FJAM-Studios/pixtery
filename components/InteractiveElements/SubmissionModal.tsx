import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import React, { useState } from "react";
import { ActivityIndicator, Image, Linking, View } from "react-native";
import Modal from "react-native-modal";
import {
  Button,
  Checkbox,
  IconButton,
  Surface,
  Text,
} from "react-native-paper";
import Toast from "react-native-root-toast";
import Svg, { Path } from "react-native-svg";
import { useSelector } from "react-redux";
import shortid from "shortid";

import { addToQueue } from "../../FirebaseApp";
import {
  generateJigsawPiecePaths,
  generateSquarePiecePaths,
} from "../../puzzleUtils";
import { Puzzle, RootState, ScreenNavigation } from "../../types";
import EditSubmission from "./EditSubmission";

const emptyImage = require("../../assets/blank.jpg");
export default function SubmissionModal({
  modalVisible,
  setModalVisible,
  puzzle,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  puzzle: Puzzle;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const navigation = useNavigation<ScreenNavigation>();
  const { boardSize, height } = useSelector(
    (state: RootState) => state.screenHeight
  );
  const notificationToken = useSelector(
    (state: RootState) => state.notificationToken
  );

  const [newPuzzle, setNewPuzzle] = useState<Puzzle>({ ...puzzle });
  const [anonymousChecked, setAnonymousChecked] = React.useState(false);
  const [agreeToGuidelines, setAgreeToGuidelines] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [paths, setPaths] = useState([""]);
  const { imageURI } = puzzle;

  React.useEffect(() => {
    setNewPuzzle({ ...puzzle });
  }, [puzzle]);

  React.useEffect(() => {
    if (newPuzzle.puzzleType === "squares")
      setPaths(
        generateSquarePiecePaths(
          newPuzzle.gridSize,
          boardSize / (1.9 * newPuzzle.gridSize)
        )
      );
    else
      setPaths(
        generateJigsawPiecePaths(
          newPuzzle.gridSize,
          boardSize / (1.9 * newPuzzle.gridSize),
          true
        )
      );
  }, [newPuzzle.gridSize, newPuzzle.puzzleType, boardSize]);

  const clearEdit = () => {
    setModalVisible(false);
    setEditing(false);
    setNewPuzzle({ ...puzzle });
    setAgreeToGuidelines(false);
    setAnonymousChecked(false);
  };

  return (
    <Modal
      isVisible={modalVisible}
      onBackdropPress={clearEdit}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropTransitionOutTiming={0}
      avoidKeyboard
    >
      {editing ? (
        <EditSubmission
          setNewPuzzle={setNewPuzzle}
          newPuzzle={newPuzzle}
          setEditing={setEditing}
          anonymousChecked={anonymousChecked}
          setAnonymousChecked={setAnonymousChecked}
        />
      ) : (
        <>
          {loading ? (
            <ActivityIndicator
              animating
              color={theme.colors.text}
              size="large"
            />
          ) : (
            <View
              style={{
                backgroundColor: theme.colors.backdrop,
                borderRadius: theme.roundness,
                padding: 10,
              }}
            >
              <View
                style={{
                  alignSelf: "center",
                  alignItems: "center",
                }}
              >
                <Surface
                  style={{
                    padding: height * 0.0065,
                    alignItems: "center",
                    justifyContent: "center",
                    elevation: 4,
                    borderRadius: theme.roundness,
                    backgroundColor: theme.colors.accent,
                  }}
                >
                  <Image
                    source={
                      imageURI.length
                        ? { uri: FileSystem.documentDirectory + imageURI }
                        : emptyImage
                    }
                    style={{
                      width: boardSize / 1.9,
                      height: boardSize / 1.9,
                      alignSelf: "center",
                    }}
                  />
                  {imageURI.length ? (
                    <Svg
                      width={boardSize / 1.9}
                      height={boardSize / 1.9}
                      style={{ position: "absolute", top: 4, left: 4 }}
                    >
                      {paths.map((path, ix) => (
                        <Path
                          key={ix}
                          d={path}
                          stroke="white"
                          strokeWidth="1"
                        />
                      ))}
                    </Svg>
                  ) : null}
                </Surface>
                <Text
                  style={{
                    fontSize: 12,
                    alignSelf: "flex-end",
                  }}
                >
                  created by:{" "}
                  {anonymousChecked ? "Anonymous" : newPuzzle.senderName}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginHorizontal: 10,
                  padding: 10,
                }}
              >
                <Text>{newPuzzle.gridSize}</Text>
                <IconButton
                  icon={
                    newPuzzle.puzzleType === "jigsaw" ? "puzzle" : "view-grid"
                  }
                />
                <Text>{newPuzzle.message || "No message"}</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: 10,
                }}
              >
                <Checkbox.Android // Checkbox is invisible on iOS when unchecked, which is very confusing. Specifying .Android forces iOS to use Android style boxes instead.
                  status={agreeToGuidelines ? "checked" : "unchecked"}
                  color={theme.colors.surface}
                  onPress={() => {
                    setAgreeToGuidelines(!agreeToGuidelines);
                  }}
                />
                <Text>
                  This Pixtery is appropriate for all audiences and conforms to
                  our{" "}
                  <Text
                    style={{
                      color: "blue",
                      fontWeight: "bold",
                      textDecorationLine: "underline",
                    }}
                    onPress={() => {
                      Linking.openURL("https://www.pixtery.io/community.html");
                    }}
                  >
                    Community Guidelines
                  </Text>
                </Text>
              </View>

              <Button
                mode="contained"
                icon="check"
                disabled={!agreeToGuidelines}
                style={{
                  margin: 10,
                }}
                onPress={async () => {
                  setLoading(true);
                  try {
                    const newPublicKey: string = shortid.generate();
                    await addToQueue({
                      newPuzzle,
                      newPublicKey,
                      anonymousChecked,
                      notificationToken,
                    });
                    Toast.show(
                      "Thanks for your submission! The Pixtery team will review soon!",
                      {
                        duration: Toast.durations.LONG,
                        position: Toast.positions.CENTER,
                      }
                    );
                  } catch (e) {
                    if (e instanceof Error) {
                      console.log(e.message);
                    }
                    Toast.show("We're sorry, something went wrong :(", {
                      duration: Toast.durations.LONG,
                      position: Toast.positions.CENTER,
                    });
                  }
                  navigation.navigate("Gallery");
                  setLoading(false);
                  setEditing(false);
                  setModalVisible(false);
                }}
              >
                Submit
              </Button>
              <Button
                mode="contained"
                icon="pencil"
                onPress={() => {
                  setEditing(true);
                }}
                style={{
                  margin: 10,
                }}
              >
                Edit
              </Button>
              <Button
                mode="contained"
                icon="cancel"
                onPress={clearEdit}
                style={{
                  margin: 10,
                }}
              >
                Cancel
              </Button>
            </View>
          )}
        </>
      )}
    </Modal>
  );
}
