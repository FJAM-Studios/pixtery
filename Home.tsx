import * as React from "react";
import { View, Text, Button, ImageBackground } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { testingMode } from "./constants";
const image = require("./assets/bg.jpg");

export default function HomeScreen({
  navigation,
  imageURI,
  setImageURI,
}: {
  navigation: any;
  imageURI: string;
  setImageURI: (uri: string) => void;
}) {
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
    <View
      style={{
        flex: 1,
        flexDirection: "column",
      }}
    >
      <ImageBackground
        source={
          imageURI.length ? { uri: imageURI, width: 300, height: 300 } : image
        }
        style={{
          flex: 1,
          justifyContent: "space-around",
          padding: 10,
        }}
        imageStyle={{ opacity: 0.3 }}
      >
        <Text style={{ alignSelf: "center", fontSize: 20, fontWeight: "bold" }}>
          Pick An Image Then A Puzzle Type
        </Text>

        <Button title="Camera" onPress={() => selectImage(true)} />
        <Button title="Gallery" onPress={() => selectImage(false)} />
        <Button
          title="Squares"
          onPress={() => navigation.navigate("Squares")}
          disabled={testingMode ? false : imageURI.length === 0}
        />
        <Button
          title="Jigsaw"
          onPress={() => navigation.navigate("Jigsaw")}
          disabled={testingMode ? false : imageURI.length === 0}
        />
      </ImageBackground>
    </View>
  );
}
