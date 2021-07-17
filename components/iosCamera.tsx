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
  PinchGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { USE_NATIVE_DRIVER, COMPRESSION } from "../constants";
import { RootState } from "../types";
import { checkPermission } from "../util";

const emptyImage = require("../assets/blank.jpg");

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
  // can't use height because image does not take up entire height of screen
  const initialImageHeightOnScreen = imageBeforeCrop
    ? width * (imageBeforeCrop.height / imageBeforeCrop.width)
    : 0;
  const boxX = (width - boardSize) / 2;
  const boxY = (initialImageHeightOnScreen - boardSize) / 2;
  const imageView = useRef<View>();
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

  const safeAreaViewInsets = useSafeAreaInsets();

  const onPanHandlerStateChange = (ev: PanGestureHandlerStateChangeEvent) => {
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      setImagePosition({
        x: imagePosition.x + ev.nativeEvent.translationX,
        y: imagePosition.y + ev.nativeEvent.translationY,
      });
      // reset distance tracker to 0
      pan.setValue({ x: 0, y: 0 });
    }
  };

  const pinchScale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(new Animated.Value(1)).current;
  let lastScale = 1;
  const _scale = Animated.multiply(baseScale, pinchScale);

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: USE_NATIVE_DRIVER }
  );

  const onPinchHandlerStateChange = (
    ev: PinchGestureHandlerStateChangeEvent
  ) => {
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
    // adjustment factor for actual image pixels vs screen px measurement; adjusted on width
    const pixelToScreenRatio = imageBeforeCrop!.width / width;
    const statusBarHeight = safeAreaViewInsets.top;
    // measureInWindow gets absolute dimensions on screen
    await imageView.current!.measureInWindow(
      async (
        finalX: number,
        finalY: number,
        finalImageWidth: number,
        finalImageHeight: number
      ) => {
        console.log(
          "finalx",
          finalX,
          "finalY",
          finalY,
          "finalwidth",
          finalImageWidth,
          "finalheight",
          finalImageHeight, "status bar",
          statusBarHeight
        );
        // start here - need to add statusbarheight only if zoom/pan goes beyond status bar
        const originX =
          // distance from top of image to crop box X
          ((boxX - finalX) *
            // scale image to original picture (relevant if zoomed)
            imageBeforeCrop!.width) /
          finalImageWidth;

        const originY =
          // distance from top of image to crop box Y
          // add status bar height to crop box Y given positions are absolutes
          ((boxY + statusBarHeight - finalY) *
            // scale image to original picture (relevant if zoomed)
            imageBeforeCrop!.height) /
          finalImageHeight;

        const cropWidth =
          // scale boardSize on screen to original image size
          (boardSize * pixelToScreenRatio) /
          // reduce this board size by the zoom scale
          (finalImageWidth / width);

        const cropHeight =
          (boardSize * pixelToScreenRatio) /
          (finalImageHeight / initialImageHeightOnScreen);

        console.log(
          "originX",
          originX,
          "originY",
          originY,
          "cropwidth",
          cropWidth,
          "cropheight",
          cropHeight,
          "boardSize",
          boardSize,
          "height",
          height,
          "width",
          width,
          "boxX",
          boxX,
          "boxY",
          boxY
        );

        const croppedImage = await ImageManipulator.manipulateAsync(
          imageBeforeCrop!.uri,
          [
            {
              crop: {
                // Origin X / Y are upper left coordinates where cropping begins
                originX,
                originY,
                width: cropWidth,
                height: cropHeight,
              },
            },
          ],
          { compress: COMPRESSION, format: ImageManipulator.SaveFormat.JPEG }
        );
        setImageURI(croppedImage.uri);
        setiOSCameraLaunch(false);
      }
    );
  };

  useEffect(() => {
    launchIosCamera();
  }, []);

  if (imageBeforeCrop)
    return (
      <SafeAreaView>
        <PanGestureHandler
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanHandlerStateChange}
        >
          <Animated.View>
            <PinchGestureHandler
              onGestureEvent={onPinchGestureEvent}
              onHandlerStateChange={onPinchHandlerStateChange}
            >
              <Animated.View>
                <Animated.View
                  ref={imageView}
                  // onLayout={undefined}
                  style={[
                    {
                      left: imagePosition.x,
                      top: imagePosition.y,
                      transform: [
                        { scale: _scale },
                        { translateX: pan.x },
                        { translateY: pan.y },
                      ],
                    },
                  ]}
                >
                  <ImageBackground
                    source={
                      imageBeforeCrop
                        ? { uri: imageBeforeCrop.uri }
                        : emptyImage
                    }
                    style={[
                      {
                        width: "100%",
                        height: initialImageHeightOnScreen,
                      },
                    ]}
                  />
                </Animated.View>
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
              </Animated.View>
            </PinchGestureHandler>
          </Animated.View>
        </PanGestureHandler>
        <Button onPress={setCrop} title="Crop" />
      </SafeAreaView>
    );
  return <Text>Loading</Text>;
}
