import { NavigationProp, useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import React, { useState } from "react";
import { ActivityIndicator, Image, Linking, View } from "react-native";
import Modal from "react-native-modal";
import { Button, Checkbox, Surface, Text } from "react-native-paper";
import Toast from "react-native-root-toast";
import Svg, { Path } from "react-native-svg";
import { useSelector } from "react-redux";
import shortid from "shortid";

import { addToQueue, getPixteryURL } from "../../FirebaseApp";
import {
  generateJigsawPiecePaths,
  generateSquarePiecePaths,
} from "../../puzzleUtils";
import { Puzzle, RootStackParamList, RootState } from "../../types";
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
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { boardSize, height } = useSelector(
    (state: RootState) => state.screenHeight
  );
  const notificationToken = useSelector(
    (state: RootState) => state.notificationToken
  );

  const [newPuzzle, setNewPuzzle] = useState<Puzzle>({ ...puzzle });
  const [anonymousChecked, setAnonymousChecked] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [paths, setPaths] = useState([""]);
  const { imageURI } = puzzle;

  React.useEffect(() => {
    const prepareImage = async () => {
      setLoading(true);
      const fileInfo = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + imageURI
      );
      if (!fileInfo.exists) {
        const fileName = imageURI.slice(imageURI.lastIndexOf("/") + 1);
        const extension = imageURI.slice(-4) === ".jpg" ? "" : ".jpg";
        const localURI = FileSystem.documentDirectory + fileName + extension;
        const downloadURL = await getPixteryURL("/" + imageURI);
        await FileSystem.downloadAsync(downloadURL, localURI);
      }
      setNewPuzzle({ ...puzzle });
      setLoading(false);
    };
    prepareImage();
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
                  padding: 10,
                }}
              >
                <Text>{newPuzzle.message || "No message"}</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  // padding: 10,
                }}
              >
                <Checkbox.Android
                  // Checkbox is invisible on iOS when unchecked, which is very confusing.
                  // Specifying .Android forces iOS to use Android style boxes instead.
                  status={anonymousChecked ? "checked" : "unchecked"}
                  color={theme.colors.surface}
                  onPress={() => {
                    setAnonymousChecked(!anonymousChecked);
                  }}
                />
                <Text style={{ color: theme.colors.text }}>
                  Submit Anonymously
                </Text>
              </View>
              {/* 
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

              </View> */}

              <Button
                mode="contained"
                icon="check"
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
                  navigation.navigate("TabContainer", {
                    screen: "DailyContainer",
                    params: { screen: "Gallery" },
                  });
                  setLoading(false);
                  setEditing(false);
                  setModalVisible(false);
                }}
              >
                Submit
              </Button>
              <Text style={{ margin: 10 }}>
                Make sure your Pixtery is appropriate for all audiences and
                meets our{" "}
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
                . The Pixtery team will review your submission soon!
              </Text>
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
