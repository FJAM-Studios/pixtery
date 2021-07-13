/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import React, { useEffect, useState, useRef } from "react";
import { Animated, ImageBackground, Button, Text, View } from "react-native";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PinchGestureHandler,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { USE_NATIVE_DRIVER, COMPRESSION } from "../constants";
import { RootState } from "../types";
import { checkPermission } from "../util";

const emptyImage = require("../assets/blank.jpg");

// const width = 375;

export default function IosCamera({
  setImageURI,
  setiOSCameraLaunch,
}: {
  setImageURI: (uri: string) => void;
  setiOSCameraLaunch: (camera: boolean) => void;
}): JSX.Element {
  const { width, height, boardSize } = useSelector(
    (state: RootState) => state.screenHeight
  );
  const [imageBeforeCrop, setImageBeforeCrop] = useState<ImageInfo>();
  const [imagePosition, setImagePosition] = useState({
    x: 0,
    y: 0,
  });
  console.log('width', width)
  // const boxX = (width - boardSize) / 2;
  // const boxY = (height - boardSize) / 2;
  const boxX = (width - boardSize) / 2;
  const boxY = 20;

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
    setImagePosition({
      x: imagePosition.x + ev.nativeEvent.translationX,
      y: imagePosition.y + ev.nativeEvent.translationY,
    });
    // reset distance tracker to 0
    pan.setValue({ x: 0, y: 0 });
  };

  const pinchScale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(new Animated.Value(1)).current;
  let lastScale = 1;
  const scale = Animated.multiply(baseScale, pinchScale);

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: USE_NATIVE_DRIVER }
  );

  const onPinchHandlerStateChange = (ev) => {
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      lastScale *= ev.nativeEvent.scale;
      baseScale.setValue(lastScale);
      pinchScale.setValue(1);
    }
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
    console.log("finalcropX", imagePosition.x, "finalcropy", imagePosition.y);
    const croppedImage = await ImageManipulator.manipulateAsync(
      imageBeforeCrop!.uri,
      [
        {
          crop: {
            // Origin X / Y are upper left coordinates where cropping begins
            originX: (boxX - imagePosition.x) * pixelToScreenRatio,
            originY: (boxY - imagePosition.y) * pixelToScreenRatio,
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

  if (imageBeforeCrop)
    return (
      <SafeAreaView>
        <View
          style={{
            left: boxX,
            top: boxY,
            width: boardSize,
            height: boardSize,
            borderColor: "white",
            borderWidth: 2,
            position: "absolute",
            zIndex: 1,
          }}
        />
        {/* <PinchGestureHandler
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchHandlerStateChange}
        > */}
        {/* <Animated.View
            style={[
              {
                transform: [{ scale }],
              },
            ]}
          > */}
        <PanGestureHandler
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanHandlerStateChange}
        >
          <Animated.View
            style={[
              {
                left: imagePosition.x,
                top: imagePosition.y,
              },
              {
                transform: [{ translateX: pan.x }, { translateY: pan.y }],
              },
            ]}
          >
            <ImageBackground
              source={
                imageBeforeCrop ? { uri: imageBeforeCrop.uri } : emptyImage
              }
              style={[
                {
                  width: "100%",
                  height:
                    (width * imageBeforeCrop.height) / imageBeforeCrop.width,
                },
              ]}
            >
              {/* <Animated.View
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
                        transform: [
                          { translateX: pan.x },
                          { translateY: pan.y },
                        ],
                      },
                    ]}
                  /> */}
            </ImageBackground>
          </Animated.View>
        </PanGestureHandler>
        {/* </Animated.View> */}
        {/* </PinchGestureHandler> */}
        <Button onPress={setCrop} title="Crop" />
      </SafeAreaView>
    );
  return <Text>Loading</Text>;
}
