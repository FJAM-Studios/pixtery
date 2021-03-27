import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, View } from "react-native";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import Hamburger from "./Hamburger";
const emptyImage = require("./assets/earth.jpg");

export default ({
  navigation,
  imageURI,
  setImageURI,
  boardSize,
}: {
  navigation: any;
  imageURI: string;
  setImageURI: (uri: string) => void;
  boardSize: number;
}) => {
  const selectImage = async (camera: boolean) => {
    let result = camera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 4],
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 4],
          quality: 1,
        });

    if (!result.cancelled) {
      setImageURI(result.uri);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
      }}
    >
      <Hamburger notifications={0} />
      <View
        style={{
          width: boardSize,
          height: boardSize,
          marginBottom: 10,
        }}
      >
        <Image
          source={imageURI.length ? { uri: imageURI } : emptyImage}
          style={{
            width: boardSize,
            height: boardSize,
            borderRadius: 10,
          }}
        />
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
      {/* <Button
        title="Squares"
        onPress={() => navigation.navigate("Squares")}
        disabled={imageURI.length === 0}
      />
      <Button
        title="Jigsaw"
        onPress={() => navigation.navigate("Jigsaw")}
        disabled={imageURI.length === 0}
      /> */}
    </SafeAreaView>
  );
};
