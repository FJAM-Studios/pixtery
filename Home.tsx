import React, { useEffect } from "react";
import { View, Text, Button, ImageBackground, TouchableHighlight, Image, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
const image = require("./assets/bg.jpg");

export default function HomeScreen({
  navigation,
  boardSize,
  imageURI,
  setImageURI,
}: {
  navigation: any;
  boardSize: number;
  imageURI: string;
  setImageURI: (uri: string) => void;
}) {

  // request gallery and camera permissions for iPhone. \
  // Expo gives you a weird notification if you've already given permissions to another expo project, but that won't matter in       production.
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        let response = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const libraryPermission = response.status
        if (libraryPermission !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        } else {
          response = await ImagePicker.requestCameraPermissionsAsync();
          const cameraPermission = response.status
          if (cameraPermission !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
          }
        }
      }
    })()
  }, []);

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

    console.log(result);

    if (!result.cancelled) {
      setImageURI(result.uri);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
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
        <View
        style={{
          alignSelf:"center",
          flexDirection: "row"
        }}>
        <Button title="Camera" onPress={() => selectImage(true)} />
        <Button title="Gallery" onPress={() => selectImage(false)} />
        </View>

        <TouchableHighlight
        onPress={()=>selectImage(false)}
      >
        <Image
          style={{ width: boardSize, height: boardSize }} source={imageURI ? { uri: imageURI } : require('./assets/camera.png')} />
      </TouchableHighlight>
      <View
        style={{
          alignSelf:"center",
          flexDirection: "row"
        }}>
        <Button
          title="Squares"
          onPress={() => navigation.navigate("Squares")}
          disabled={imageURI.length === 0}
        />
        <Button
          title="Jigsaw"
          onPress={() => navigation.navigate("Jigsaw")}
          disabled={imageURI.length === 0}
        />
        </View>
      </ImageBackground>
    </View>
  );
}
