/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import React, { useEffect, useState, useRef } from "react";
import { Animated, ImageBackground, Button, Text } from "react-native";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { USE_NATIVE_DRIVER, COMPRESSION } from "../constants";
import { RootState } from "../types";
import { checkPermission } from "../util";

const emptyImage = require("../assets/blank.jpg");

const width = 375;

export default function IosCamera({
  setImageURI,
  setiOSCameraLaunch,
}: {
  setImageURI: (uri: string) => void;
  setiOSCameraLaunch: (camera: boolean) => void;
}): JSX.Element {
  const { height, boardSize } = useSelector(
    (state: RootState) => state.screenHeight
  );
  const [imageBeforeCrop, setImageBeforeCrop] = useState<ImageInfo>();
  const [cropPosition, setCropPosition] = useState({
    x: (width - boardSize) / 2,
    y: (height - boardSize) / 2,
  });
  // const [imageLayoutHeight, setImageLayoutHeight] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;
  const onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: pan.x,
          translationY: pan.y,
        },
      },
    ],
    {
      useNativeDriver: USE_NATIVE_DRIVER,
    }
  );

  const onPanHandlerStateChange = (ev: PanGestureHandlerStateChangeEvent) => {
    console.log("event", ev.nativeEvent);
    console.log("pan", pan);
    setCropPosition({
      x: cropPosition.x + ev.nativeEvent.translationX,
      y: cropPosition.y + ev.nativeEvent.translationY,
    });
    // reset distance tracker to 0
    pan.setValue({ x: 0, y: 0 });
  };

  const launchIosCamera = async () => {
    const permission = await checkPermission(true);
    if (permission === "granted") {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.cancelled) {
        setImageBeforeCrop(result);
      }
    }
  };

  const setCrop = async (): Promise<void> => {
    // adjustment factor for actual image pixels vs screen px measurement; adjusted on widths
    const pixelToScreenRatio = imageBeforeCrop!.width / width;
    console.log('finalcropX', cropPosition.x, 'finalcropy', cropPosition.y)
    const croppedImage = await ImageManipulator.manipulateAsync(
      imageBeforeCrop!.uri,
      [
        {
          crop: {
            // Origin X / Y are upper left coordinates where cropping begins
            originX: cropPosition.x * pixelToScreenRatio,
            originY: cropPosition.y * pixelToScreenRatio,
            width: boardSize * pixelToScreenRatio,
            height: boardSize * pixelToScreenRatio,
          },
        },
      ],
      { compress: COMPRESSION, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImageURI(croppedImage.uri);
    setiOSCameraLaunch(false);
  };

  useEffect(() => {
    launchIosCamera();
  }, []);
  console.log("running");
  if (imageBeforeCrop)
    return (
      <SafeAreaView>
        <ImageBackground
          source={imageBeforeCrop ? { uri: imageBeforeCrop.uri } : emptyImage}
          style={{
            width: "100%",
            height: width * imageBeforeCrop.height / imageBeforeCrop.width,
          }}
          // onLayout={(evt) => {
          //   const {width, height} = evt.nativeEvent.layout
          //   console.log("LAYOUT", evt.nativeEvent.layout)
          //   console.log('img actual width: '+width)
          //   console.log('img actual height: '+height)
          //   setImageLayoutHeight(height);
          // }}
        >
          {imageBeforeCrop ? (
            <PanGestureHandler
              onGestureEvent={onPanGestureEvent}
              onHandlerStateChange={onPanHandlerStateChange}
            >
              <Animated.View
                style={[
                  {
                    height: boardSize,
                    width: boardSize,
                    borderColor: "white",
                    borderWidth: 2,
                    left: cropPosition.x,
                    top: cropPosition.y,
                    position: "absolute",
                  },
                  {
                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
                  },
                ]}
              />
            </PanGestureHandler>
          ) : null}
        </ImageBackground>
        <Button onPress={setCrop} title="Crop" />
      </SafeAreaView>
    );
  return <Text>Loading</Text>;
}
