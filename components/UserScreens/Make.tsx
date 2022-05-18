import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { AdMobInterstitial } from "expo-ads-admob";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useState, useEffect, useCallback } from "react";
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
  Title,
} from "react-native-paper";
import Toast from "react-native-root-toast";
import Svg, { Path } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import * as Sentry from "sentry-expo";
import shortid from "shortid";
import uuid from "uuid";

import { uploadBlob, uploadPuzzleSettingsCallable } from "../../FirebaseApp";
import {
  DEFAULT_IMAGE_SIZE,
  COMPRESSION,
  INTERSTITIAL_ID,
  ARGUABLY_CLEVER_PHRASES,
} from "../../constants";
import {
  generateJigsawPiecePaths,
  generateSquarePiecePaths,
} from "../../puzzleUtils";
import { setSentPuzzles } from "../../store/reducers/sentPuzzles";
import { Puzzle, RootState, MakeContainerProps } from "../../types";
import { createBlob, shareMessage, checkPermission } from "../../util";
import { IosCamera, MessageInput } from "../InteractiveElements";
import { AdSafeAreaView } from "../Layout";

const emptyImage = require("../../assets/blank.jpg");

AdMobInterstitial.setAdUnitID(INTERSTITIAL_ID);

export default function Make({
  navigation,
  route,
}: MakeContainerProps<"Make">): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const { height, boardSize } = useSelector(
    (state: RootState) => state.screenHeight
  );
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const profile = useSelector((state: RootState) => state.profile);
  const [imageURI, setImageURI] = useState("");
  const [puzzleType, setPuzzleType] = useState("jigsaw");
  const [gridSize, setGridSize] = useState(3);
  const [message, setMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [directToDaily, setDirectToDaily] = useState(
    !!route.params?.directToDaily
  );

  const [paths, setPaths] = useState(
    generateJigsawPiecePaths(gridSize, boardSize / (1.6 * gridSize), true)
  );
  const [buttonHeight, setButtonHeight] = useState(0);
  const [iOSCameraLaunch, setiOSCameraLaunch] = useState(false);

  // on navigating away from Make screen, reset to non-Daily version
  useFocusEffect(
    useCallback(() => {
      return () => {
        setDirectToDaily(false);
      };
    }, [navigation])
  );

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
    image: ImagePicker.ImageInfo
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
    Keyboard.dismiss();
    setModalVisible(true);
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
      if (newPuzzle) {
        if (newPuzzle.publicKey) {
          await addToSent(newPuzzle);
          // no need to generate link sharing if submitting direct to daily
          if (directToDaily) {
            navigation.push("TabContainer", {
              screen: "DailyContainer",
              params: {
                screen: "AddToGallery",
                params: {
                  puzzle: newPuzzle,
                },
              },
            });
          } else {
            generateLink(newPuzzle.publicKey);
            navigation.navigate("LibraryContainer", {
              screen: "PuzzleListContainer",
              params: {
                screen: "SentPuzzleList",
              },
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
      Toast.show(
        "Could not upload puzzle. Check connection and try again later.",
        {
          duration: Toast.durations.SHORT,
        }
      );
    }
    setModalVisible(false);
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
    await uploadBlob(fileName, blob);
    return resizedCompressedImage.uri;
  };

  const uploadPuzzleSettings = async (
    fileName: string
  ): Promise<Puzzle | undefined> => {
    const publicKey: string = shortid.generate();
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
      // uncomment below Error line to test Sentry
      // throw new Error("upload puzzle forced error for sentry");
      await uploadPuzzleSettingsCallable({ newPuzzle });
      return newPuzzle;
    } catch (error) {
      console.error(error);
      Sentry.Native.captureException(error);
      if (error instanceof Error) throw new Error(error.message);
    }
  };

  const generateLink = (publicKey: string): void => {
    //first param is an empty string to allow Expo to dynamically determine path to app based on runtime environment
    const deepLink = Linking.createURL(`pixtery.io/p/${publicKey}`, {
      scheme: "https",
    });
    shareMessage(deepLink);
  };

  useEffect(() => {
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
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={
          Platform.OS === "ios" ? 0 : buttonHeight + height * 0.21
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
            {imageURI.length ? null : <Title>Choose an Image</Title>}
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
        <MessageInput message={message} setMessage={setMessage} />
        <Button
          icon="send"
          mode="contained"
          onPress={submitToServer}
          style={{ margin: height * 0.01 }}
          disabled={imageURI.length === 0}
          onLayout={(ev) => setButtonHeight(ev.nativeEvent.layout.height)}
        >
          {directToDaily ? "Submit Daily" : "Send"}
        </Button>
      </KeyboardAwareScrollView>
    </AdSafeAreaView>
  );
}
