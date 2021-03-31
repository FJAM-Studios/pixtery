import {app, db, storage} from '../FirebaseApp'
import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, View, Platform } from "react-native";
import {
  Button,
  IconButton,
  Text,
  Surface,
  Headline,
  TextInput,
  ActivityIndicator,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import Header from "./Header";
const emptyImage = require("../assets/blank.jpg");
import Logo from "./Logo";
import Title from "./Title";
import Svg, { Path } from "react-native-svg";
import { generateJigsawPiecePaths, generateSquarePiecePaths, createBlob } from "../util";
import { Puzzle } from "../types";
import uuid from 'uuid';

export default ({
  navigation,
  boardSize,
  theme,
  receivedPuzzles,
}: {
  navigation: any;
  boardSize: number;
  theme: any;
  receivedPuzzles: Puzzle[];
}) => {
  const [imageURI, setImageURI] = React.useState("");
  const [puzzleType, setPuzzleType] = React.useState("jigsaw");
  const [gridSize, setGridSize] = React.useState(3);

  const selectImage = async (camera: boolean) => {
    let result = camera
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
      setImageURI(result.uri);
    }
  };

  const [message, setMessage] = React.useState("");
  const [isLoading, setLoading] = React.useState(true);
  const [paths, setPaths] = React.useState(
    generateJigsawPiecePaths(gridSize, boardSize / (1.6 * gridSize), true)
  );

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

  setTimeout(() => setLoading(false), 1500);
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          padding: 10,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Logo width="100" height="100" />
        <Title width="100" height="35" />
        <Headline>Pretending To Load</Headline>
        <ActivityIndicator
          animating={true}
          color={theme.colors.text}
          size="large"
        />
      </View>
    );
  }


  const submitToServer = async (): uuid => {

    const fileName: uuid = uuid.v4();
    const cloudURL: string = await uploadImage(fileName);
    const publicKey: uuid = uploadPuzzleSettings(cloudURL, fileName);

    //for now this function just returns a uuid
    //@todo use that key to build a public SMS
    return publicKey
  }

  const uploadImage = async (fileName: string) : Promise<string> => {
    const blob: Blob = await createBlob(imageURI);
    const ref = storage.ref().child(fileName);
    const snapshot = await ref.put(blob);
    return snapshot.ref.getDownloadURL();
  }

  const uploadPuzzleSettings = async (cloudURL: string, fileName: uuid): uuid => {
    //  @todo connect to realtime database, store the filename with the puzzle settings and user info. create and store a path for the text message or can that just be the uuid??
    console.log("public URL is", cloudURL);
    const publicKey: uuid = uuid.v4()
    await db.collection("puzzles").doc(fileName).set({
      imageRef: fileName,
      publicKey: publicKey,
      type: puzzleType,
      gridSize: gridSize,
    })

    return publicKey
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
        justifyContent: "space-between",
      }}
    >
      <Header
        theme={theme}
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      <View
        style={{
          alignSelf: "center",
          alignItems: "center",
        }}
      >
        <Surface
          style={{
            padding: 4,
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
        style={{ margin: 10 }}
      >
        Camera
      </Button>
      <Button
        icon="folder"
        mode="contained"
        onPress={() => selectImage(false)}
        style={{ margin: 10 }}
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
            padding: 8,
            height: 40,
            width: 40,
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
            padding: 8,
            height: 40,
            width: 40,
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
            compact={true}
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
            compact={true}
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
            compact={true}
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
      />
      <Button
        icon="send"
        mode="contained"
        onPress={submitToServer}
        style={{ margin: 10 }}
      >
        Send
      </Button>
    </SafeAreaView>
  );
};
