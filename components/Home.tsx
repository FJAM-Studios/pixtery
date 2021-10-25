import "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AdMobInterstitial } from "expo-ads-admob";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import * as Linking from "expo-linking";
import * as React from "react";
import { Image, View, Platform, Keyboard } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Button,
  IconButton,
  Text,
  Surface,
  Headline,
  ActivityIndicator,
  Modal,
  Portal,
} from "react-native-paper";
import Svg, { Path } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import shortid from "shortid";
import uuid from "uuid";

import { storage, functions } from "../FirebaseApp";
import {
  DEFAULT_IMAGE_SIZE,
  COMPRESSION,
  INTERSTITIAL_ID,
  DISPLAY_PAINFUL_ADS,
  ARGUABLY_CLEVER_PHRASES,
} from "../constants";
import {
  generateJigsawPiecePaths,
  generateSquarePiecePaths,
} from "../puzzleUtils";
import { setSentPuzzles } from "../store/reducers/sentPuzzles";
import { Puzzle, ScreenNavigation, RootState } from "../types";
import { createBlob, shareMessage, goToScreen, checkPermission } from "../util";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";
import IosCamera from "./IosCamera";
import MessageInput from "./MessageInput";

const emptyImage = require("../assets/blank.jpg");

AdMobInterstitial.setAdUnitID(INTERSTITIAL_ID);

export default function Home({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const { height, boardSize } = useSelector(
    (state: RootState) => state.screenHeight
  );
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const profile = useSelector((state: RootState) => state.profile);
  const message = useSelector((state: RootState) => state.message);
  const [imageURI, setImageURI] = React.useState("");
  const [puzzleType, setPuzzleType] = React.useState("jigsaw");
  const [gridSize, setGridSize] = React.useState(3);
  const [modalVisible, setModalVisible] = React.useState(false);
  // const [message, setMessage] = React.useState("");

  const [paths, setPaths] = React.useState(
    generateJigsawPiecePaths(gridSize, boardSize / (1.6 * gridSize), true)
  );
  const [buttonHeight, setButtonHeight] = React.useState(0);
  const [iOSCameraLaunch, setiOSCameraLaunch] = React.useState(false);

  const selectImage = async (camera: boolean) => {
    const permission = await checkPermission(camera);
    if (permission === "granted") {
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
    if (DISPLAY_PAINFUL_ADS) {
      AdMobInterstitial.removeAllListeners();
      AdMobInterstitial.requestAdAsync();
    }
    const fileName: string = uuid.v4() + ".jpg";
    try {
      const localURI = await uploadImage(fileName);
      const newPuzzle = await uploadPuzzleSettings(fileName);
      if (newPuzzle) {
        //move to document directory
        const permanentURI = FileSystem.documentDirectory + fileName;
        await FileSystem.moveAsync({
          from: localURI,
          to: permanentURI,
        });
      }
      setModalVisible(false);
      if (newPuzzle) {
        if (newPuzzle.publicKey) {
          generateLink(newPuzzle.publicKey);
          addToSent(newPuzzle);
          goToScreen(navigation, "SentPuzzleList");
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
    const allPuzzles = [puzzle, ...sentPuzzles];
    await AsyncStorage.setItem(
      "@pixterySentPuzzles",
      JSON.stringify(allPuzzles)
    );
    dispatch(setSentPuzzles(allPuzzles));
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
      await uploadPuzzleSettingsCallable({ newPuzzle });
      return newPuzzle;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };

  const generateLink = (publicKey: string): void => {
    //first param is an empty string to allow Expo to dynamically determine path to app based on runtime environment
    const deepLink = Linking.createURL(`pixtery.io/p/${publicKey}`, {
      scheme: "https",
    });
    shareMessage(deepLink);
  };

  const displayPainfulAd = async () => {
    Keyboard.dismiss();
    if (DISPLAY_PAINFUL_ADS) {
      //I tried adding the event listeners in the useEffect but that caused the filename passed to the image manipulator to be blank so instead they're created here and then cleaned up in the submitToServer so it doesn't trigger repeatedly when making more than one puzzle
      AdMobInterstitial.addEventListener("interstitialDidClose", () => {
        submitToServer();
      });
      AdMobInterstitial.addEventListener("interstitialDidFailToLoad", () => {
        submitToServer();
      });
      try {
        await AdMobInterstitial.showAdAsync();
        setModalVisible(true);
      } catch (error) {
        console.log(error);
        submitToServer();
      }
    } else {
      setModalVisible(true);
      submitToServer();
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
  }, [gridSize, puzzleType, boardSize]);

  if (iOSCameraLaunch)
    return (
      <IosCamera
        setImageURI={setImageURI}
        setiOSCameraLaunch={setiOSCameraLaunch}
      />
    );

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
          <Headline>Building a Pixtery!</Headline>
          <Text>
            {
              ARGUABLY_CLEVER_PHRASES[
                Math.floor(ARGUABLY_CLEVER_PHRASES.length * Math.random())
              ]
            }
          </Text>
          <ActivityIndicator
            animating
            color={theme.colors.text}
            size="large"
            style={{ padding: 15 }}
          />
        </Modal>
      </Portal>
      <Header
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={
          Platform.OS === "ios" ? 0 : buttonHeight + height * 0.2
        }
        enableOnAndroid
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
          onPress={
            Platform.OS === "android"
              ? () => selectImage(true)
              : () => setiOSCameraLaunch(true)
          }
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
              onPress={() => setGridSize(2)}
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
                gridSize === 3 ? theme.colors.surface : theme.colors.background,
            }}
          >
            <Button
              mode="text"
              onPress={() => setGridSize(3)}
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
                gridSize === 4 ? theme.colors.surface : theme.colors.background,
            }}
          >
            <Button
              mode="text"
              onPress={() => setGridSize(4)}
              color={theme.colors.text}
              compact
            >
              4
            </Button>
          </Surface>
        </View>
        <MessageInput
          height={height * 0.09}
          margin={height * 0.01}
          theme={theme}
        />
        <Button
          icon="send"
          mode="contained"
          onPress={displayPainfulAd}
          style={{ margin: height * 0.01 }}
          disabled={imageURI.length === 0}
          onLayout={(ev) => setButtonHeight(ev.nativeEvent.layout.height)}
        >
          Send
        </Button>
      </KeyboardAwareScrollView>
    </AdSafeAreaView>
  );
}
