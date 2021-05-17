import "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AdMobInterstitial } from "expo-ads-admob";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import * as Linking from "expo-linking";
import * as React from "react";
import { Image, View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Button,
  IconButton,
  Text,
  Surface,
  Headline,
  TextInput,
  ActivityIndicator,
  Modal,
  Portal,
} from "react-native-paper";
import { Theme } from "react-native-paper/lib/typescript/types";
import Svg, { Path } from "react-native-svg";
import shortid from "shortid";
import uuid from "uuid";
// var shortid = require('shortid');

import { storage, functions } from "../FirebaseApp";
import {
  DEFAULT_IMAGE_SIZE,
  COMPRESSION,
  INTERSTITIAL_ID,
  DISPLAY_PAINFUL_ADS,
} from "../constants";
import {
  generateJigsawPiecePaths,
  generateSquarePiecePaths,
} from "../puzzleUtils";
import { Puzzle, Profile, ScreenNavigation } from "../types";
import { createBlob, shareMessage } from "../util";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const emptyImage = require("../assets/blank.jpg");

AdMobInterstitial.setAdUnitID(INTERSTITIAL_ID);

export default function Home({
  navigation,
  boardSize,
  theme,
  receivedPuzzles,
  profile,
  sentPuzzles,
  setSentPuzzles,
  height,
}: {
  navigation: ScreenNavigation;
  boardSize: number;
  theme: Theme;
  receivedPuzzles: Puzzle[];
  profile: Profile | null;
  sentPuzzles: Puzzle[];
  setSentPuzzles: (puzzles: Puzzle[]) => void;
  height: number;
}): JSX.Element {
  const [imageURI, setImageURI] = React.useState("");
  const [puzzleType, setPuzzleType] = React.useState("jigsaw");
  const [gridSize, setGridSize] = React.useState(3);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [paths, setPaths] = React.useState(
    generateJigsawPiecePaths(gridSize, boardSize / (1.6 * gridSize), true)
  );

  const selectImage = async (camera: boolean) => {
    const result = camera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 4],
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 4],
          quality: 1,
        });

    if (!result.cancelled) {
      // if the resulting image is not a square because user did not zoom to fill image select box
      if (result.width !== result.height)
        result.uri = await cropToSquare(result);
      setImageURI(result.uri);
    }
  };

  const cropToSquare = async (
    image: { cancelled: false } & ImageInfo
  ): Promise<string> => {
    const { uri, width, height } = image;
    const lengthOfSquare = Math.min(width, height);
    const squareImage = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          crop: {
            // Origin X / Y are upper left coordinates where cropping begins
            // if width / height is larger than the square length, calculates coordinate (midpoint - half of the square)
            originX:
              width > lengthOfSquare ? width / 2 - lengthOfSquare / 2 : 0,
            originY:
              height > lengthOfSquare ? height / 2 - lengthOfSquare / 2 : 0,
            width: lengthOfSquare,
            height: lengthOfSquare,
          },
        },
      ],
      { compress: COMPRESSION, format: ImageManipulator.SaveFormat.JPEG }
    );
    return squareImage.uri;
  };

  const submitToServer = async (): Promise<void> => {
    setModalVisible(true);
    await displayPainfulAd();
    const fileName: string = uuid.v4();
    try {
      const localURI = await uploadImage(fileName);
      const newPuzzle = await uploadPuzzleSettings(fileName);
      if (newPuzzle) {
        newPuzzle.imageURI = localURI;
      }
      setModalVisible(false);
      if (newPuzzle) {
        if (newPuzzle.publicKey) {
          generateLink(newPuzzle.publicKey);
          addToSent(newPuzzle);
        }
      }
    } catch (error) {
      console.log(error);
      alert("Could not upload puzzle. Check connection and try again later.");
      setModalVisible(false);
    }
    // need to add else for error handling if uploadPuzzSettings throws error
  };

  const addToSent = async (puzzle: Puzzle) => {
    const allPuzzles = [...sentPuzzles, puzzle];
    await AsyncStorage.setItem(
      "@pixterySentPuzzles",
      JSON.stringify(allPuzzles)
    );
    setSentPuzzles(allPuzzles);
  };

  const uploadImage = async (fileName: string): Promise<string> => {
    //resize and compress the image for upload
    const resizedCompressedImage = await ImageManipulator.manipulateAsync(
      imageURI,
      [
        {
          resize: DEFAULT_IMAGE_SIZE,
        },
      ],
      { compress: COMPRESSION, format: ImageManipulator.SaveFormat.JPEG }
    );
    const blob: Blob = await createBlob(resizedCompressedImage.uri);
    const ref = storage.ref().child(fileName);
    await ref.put(blob);
    return resizedCompressedImage.uri;
  };

  const uploadPuzzleSettings = async (
    fileName: string
  ): Promise<Puzzle | undefined> => {
    const publicKey: string = shortid.generate();
    const uploadPuzzleSettingsCallable = functions.httpsCallable(
      "uploadPuzzleSettings"
    );
    const newPuzzle = {
      puzzleType,
      gridSize,
      senderName: profile ? profile.name : "No Sender",
      imageURI: fileName,
      publicKey,
      message,
      dateReceived: new Date().toISOString(),
    };
    try {
      await uploadPuzzleSettingsCallable({
        fileName,
        newPuzzle,
      });
      return newPuzzle;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };

  const generateLink = (publicKey: string): void => {
    //first param is an empty string to allow Expo to dynamically determine path to app based on runtime environment
    const deepLink = Linking.createURL(`/${publicKey}`);
    shareMessage(deepLink);
  };

  const displayPainfulAd = async () => {
    if (DISPLAY_PAINFUL_ADS) {
      await AdMobInterstitial.requestAdAsync();
      await AdMobInterstitial.showAdAsync();
    }
  };

  React.useEffect(() => {
    if (puzzleType === "squares")
      setPaths(
        generateSquarePiecePaths(gridSize, boardSize / (1.6 * gridSize))
      );
    else
      setPaths(
        generateJigsawPiecePaths(gridSize, boardSize / (1.6 * gridSize), true)
      );
  }, [gridSize, puzzleType]);

  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        let response = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const libraryPermission = response.status;
        if (libraryPermission !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        } else {
          response = await ImagePicker.requestCameraPermissionsAsync();
          const cameraPermission = response.status;
          if (cameraPermission !== "granted") {
            alert("Sorry, we need camera permissions to make this work!");
          }
        }
      }
    })();
  }, []);
  return (
    <AdSafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: height * 0.015,
        backgroundColor: theme.colors.background,
        justifyContent: "space-between",
      }}
    >
      {/* this isn't the nicest looking modal, but RN Paper was not being compliant, not sure why. Not the worst either, though. */}
      <Portal>
        <Modal
          visible={modalVisible}
          dismissable={false}
          contentContainerStyle={{ alignItems: "center" }}
        >
          {gridSize % 2 ? <Text>Yeah you&apos;re working.</Text> : null}
          <Headline>Building a Pixtery!</Headline>
          {gridSize % 2 ? null : <Text>And choosing so carefully</Text>}
          <ActivityIndicator
            animating
            color={theme.colors.text}
            size="large"
            style={{ padding: 15 }}
          />
        </Modal>
      </Portal>
      <Header
        theme={theme}
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
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
              source={imageURI.length ? { uri: imageURI } : emptyImage}
              style={{
                width: boardSize / 1.6,
                height: boardSize / 1.6,
                alignSelf: "center",
              }}
            />
            {imageURI.length ? (
              <Svg
                width={boardSize / 1.6}
                height={boardSize / 1.6}
                style={{ position: "absolute", top: 4, left: 4 }}
              >
                {paths.map((path, ix) => (
                  <Path key={ix} d={path} stroke="white" strokeWidth="1" />
                ))}
              </Svg>
            ) : null}
            {imageURI.length ? null : <Headline>Choose an Image</Headline>}
          </Surface>
        </View>
        <Button
          icon="camera"
          mode="contained"
          onPress={() => selectImage(true)}
          style={{ margin: height * 0.01 }}
        >
          Camera
        </Button>
        <Button
          icon="folder"
          mode="contained"
          onPress={() => selectImage(false)}
          style={{ margin: height * 0.01 }}
        >
          Gallery
        </Button>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
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
                puzzleType === "jigsaw"
                  ? theme.colors.surface
                  : theme.colors.background,
            }}
          >
            <IconButton
              icon="puzzle"
              onPress={() => {
                setPuzzleType("jigsaw");
              }}
              disabled={!imageURI.length}
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
                puzzleType === "squares"
                  ? theme.colors.surface
                  : theme.colors.background,
            }}
          >
            <IconButton
              icon="view-grid"
              onPress={() => {
                setPuzzleType("squares");
              }}
              disabled={!imageURI.length}
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
                gridSize === 2 ? theme.colors.surface : theme.colors.background,
            }}
          >
            <Button
              mode="text"
              disabled={!imageURI.length}
              onPress={() => setGridSize(2)}
              color="white"
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
                gridSize === 3 ? theme.colors.surface : theme.colors.background,
            }}
          >
            <Button
              mode="text"
              disabled={!imageURI.length}
              onPress={() => setGridSize(3)}
              color="white"
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
                gridSize === 4 ? theme.colors.surface : theme.colors.background,
            }}
          >
            <Button
              mode="text"
              disabled={!imageURI.length}
              onPress={() => setGridSize(4)}
              color="white"
              compact
            >
              4
            </Button>
          </Surface>
        </View>
        <TextInput
          placeholder="Message (optional)"
          disabled={!imageURI.length}
          mode="outlined"
          value={message}
          onChangeText={(message) => setMessage(message)}
          style={{
            height: height * 0.09,
            justifyContent: "center",
          }}
        />
        <Button
          icon="send"
          mode="contained"
          onPress={submitToServer}
          style={{ margin: height * 0.01 }}
          disabled={imageURI.length === 0}
        >
          Send
        </Button>
      </KeyboardAwareScrollView>
    </AdSafeAreaView>
  );
}
