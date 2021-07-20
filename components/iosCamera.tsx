/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import React, { useEffect, useState, useRef } from "react";
import { Animated, ImageBackground, Text, View, Button } from "react-native";
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
  // can't use height because image does not take up entire height of screen
  const initialImageHeightOnScreen = imageBeforeCrop
    ? width * (imageBeforeCrop.height / imageBeforeCrop.width)
    : 0;
  const boxX = (width - boardSize) / 2;
  const boxY = (initialImageHeightOnScreen - boardSize) / 2;
  const safeAreaViewInsets = useSafeAreaInsets();
  // absolute Y position of crop box, including status bar
  const boxYPlusStatusBar = boxY + safeAreaViewInsets.top;
  const imageView = useRef<View>();

  // pan (i.e. drag)
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);
  const lastOffset = { x: 0, y: 0 };

  const onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: USE_NATIVE_DRIVER }
  );

  const onPanHandlerStateChange = (ev: PanGestureHandlerStateChangeEvent) => {
    // to persist original event; otherwise gets nullified
    ev.persist();
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      // measureInWindow gets absolute dimensions
      imageView.current!.measureInWindow(
        (x: number, y: number, imageWidth: number, imageHeight: number) => {
          const rightImagePos = x + imageWidth;
          const bottomImagePos = y + imageHeight;
          const rightBoxPos = boxX + boardSize;
          const bottomBoxPos = boxYPlusStatusBar + boardSize;
          // if all bounds of image are outside the crop box, move box
          if (
            x <= boxX &&
            y <= boxYPlusStatusBar &&
            rightImagePos >= rightBoxPos &&
            bottomImagePos >= bottomBoxPos
          ) {
            lastOffset.x += ev.nativeEvent.translationX;
            lastOffset.y += ev.nativeEvent.translationY;
            translateX.setOffset(lastOffset.x);
            translateY.setOffset(lastOffset.y);
          }
          translateX.setValue(0);
          translateY.setValue(0);
        }
      );
    }
  };

  // pinch (i.e. zoom)
  const baseScale = new Animated.Value(1);
  const pinchScale = new Animated.Value(1);
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
      // to persist original event; otherwise gets nullified
      ev.persist();
      imageView.current!.measureInWindow(
        (x: number, y: number, imageWidth: number, imageHeight: number) => {
          // if image is larger than crop box, zoom box
          if (imageWidth >= boardSize && imageHeight >= boardSize)
            lastScale *= ev.nativeEvent.scale;
          // reset baseScale and pinchScale either way
          baseScale.setValue(lastScale);
          pinchScale.setValue(1);
        }
      );
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

  const setCrop = (): void => {
    // adjustment factor for actual image pixels vs screen px measurement; adjusted on width
    const pixelToScreenRatio = imageBeforeCrop!.width / width;
    // measureInWindow gets absolute dimensions on screen
    imageView.current!.measureInWindow(
      async (
        finalX: number,
        finalY: number,
        finalImageWidth: number,
        finalImageHeight: number
      ) => {
        const originX =
          // distance from top of image to crop box X
          ((boxX - finalX) *
            // scale image to original picture (relevant if zoomed)
            imageBeforeCrop!.width) /
          finalImageWidth;

        const originY =
          // distance from top of image to crop box Y
          // add status bar height to crop box Y given positions are absolutes
          ((boxYPlusStatusBar - finalY) *
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

        // crop image with above coordinates
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
        // set image URI, and iOS Camera Launch state to false on Home component
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
                  style={[
                    {
                      transform: [
                        { scale: _scale },
                        { translateX },
                        { translateY },
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
        <View
          style={{
            top: height - 80,
            position: "absolute",
            alignSelf: "center",
          }}
        >
          <Button onPress={setCrop} title="Crop" />
        </View>
      </SafeAreaView>
    );
  return <Text>Loading</Text>;
}
