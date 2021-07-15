/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import React, { useEffect, useState, useRef, createRef } from "react";
import { Animated, ImageBackground, Button, Text, View } from "react-native";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PinchGestureHandler,
} from "react-native-gesture-handler";
import { measure } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { USE_NATIVE_DRIVER, COMPRESSION } from "../constants";
import { RootState } from "../types";
import { checkPermission } from "../util";

const emptyImage = require("../assets/blank.jpg");

// start here: insight is that all i need is the end scale and end box position
// or, i constantly need to multiply scale to panhandler set state
// start here: either measure the view of image, or adjust by cumulative scale (so if image ends up being the same original size, then scale should be 1)
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
  const imageWidth = useRef(imageBeforeCrop ? imageBeforeCrop.width : 0);
  const imageHeight = useRef(imageBeforeCrop ? imageBeforeCrop.height : 0);

  const imagePinch = createRef();
  const imagePan = createRef();
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
  // const pinchScale = new Animated.Value(1);
  // const baseScale = new Animated.Value(1);
  let lastScale = 1;
  const _scale = Animated.multiply(baseScale, pinchScale);
  const scaleNumber = useRef();
  // Need to convert value from _scale which is an Animated object
  _scale.addListener((valueObj) => (scaleNumber.current = valueObj.value));

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: USE_NATIVE_DRIVER }
  );

  const onPinchHandlerStateChange = (ev) => {
    if (imageWidth.current === 0) imageWidth.current = imageBeforeCrop?.width;
    if (imageHeight.current === 0)
      imageHeight.current = imageBeforeCrop?.height;

    console.log(
      "PINCH event",
      ev.nativeEvent,
      State,
      "imagewidthbeforecroppress",
      imageWidth
    );
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      console.log(
        "pinching",
        "scale",
        ev.nativeEvent.scale,
        "pinchscale",
        pinchScale,
        "cropX",
        imagePosition.x,
        "cropy",
        imagePosition.y,
        "lastscale",
        lastScale
      );
      lastScale *= ev.nativeEvent.scale;
      baseScale.setValue(lastScale);
      pinchScale.setValue(1);
      imageWidth.current *= ev.nativeEvent.scale;
      imageHeight.current *= ev.nativeEvent.scale;

      console.log("image width current", imageWidth.current);

      // baseScale.current = lastScale;
      // pinchScale.current = 1;
      // start here - update width and height of image crop
      const oldImageWidth = imageBeforeCrop!.width;
      const oldImageHeight = imageBeforeCrop!.height;
      // setImageBeforeCrop({
      //   width: oldImageWidth * scaleNumber.current,
      //   height: oldImageHeight * scaleNumber.current,
      //   uri: imageBeforeCrop.uri,
      // });
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

  console.log(
    "cropX",
    imagePosition.x,
    "cropy",
    imagePosition.y,
    "scale",
    _scale,
    "imagewidth",
    imageBeforeCrop?.width,
    "imageheight",
    imageBeforeCrop?.height
  );

  const setCrop = async (): Promise<void> => {
    // adjustment factor for actual image pixels vs screen px measurement; adjusted on widths
    const pixelToScreenRatio = imageBeforeCrop!.width / width;
    // finalScale adjusts for zoomed image width vs uri width
    // const finalScaleX = imageWidth.current / imageBeforeCrop!.width;
    // const finalScaleY = imageHeight.current / imageBeforeCrop!.height;
    const finalScaleX = imageWidth.current / width;
    const finalScaleY = imageHeight.current / height;


    console.log(
      "finalcropX",
      imagePosition.x,
      "finalcropy",
      imagePosition.y,
      // "final scale",
      // scaleNumber.current,
      // "typeof",
      // typeof scaleNumber.current,
      "boxX",
      boxX,
      "boxY",
      boxY,
      "pixelToScreenRatio",
      pixelToScreenRatio,
      "lastscale",
      lastScale,
      "finalScaleX",
      finalScaleX,
      "finalscaleY",
      finalScaleY,
      'image width zoomed', imageWidth.current, 'imageheightzoomed', imageHeight.current
    );
    // const originX =
    //   (boxX * scaleNumber.current - imagePosition.x * scaleNumber.current) *
    //   pixelToScreenRatio *
    //   scaleNumber.current;
    // const originY =
    //   (boxY * scaleNumber.current - imagePosition.y * scaleNumber.current) *
    //   pixelToScreenRatio *
    //   scaleNumber.current;
    // const cropWidth = (boardSize * pixelToScreenRatio) / scaleNumber.current;
    // const cropHeight = (boardSize * pixelToScreenRatio) / scaleNumber.current;
    // adjust box distance with final scale (vs base uri image), then, adjust to size of original image 
    const originX =
      (boxX - imagePosition.x) * pixelToScreenRatio * finalScaleX * (imageBeforeCrop.width / imageWidth.current);
    const originY =
      (boxY - imagePosition.y) * pixelToScreenRatio * finalScaleY * (imageBeforeCrop.height / imageHeight.current);
    const cropWidth = (boardSize * pixelToScreenRatio) / finalScaleX;
    const cropHeight = (boardSize * pixelToScreenRatio) / finalScaleY;

    console.log("originX", originX, "originY", originY, "cropwidth", cropWidth);

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
            // width: (boardSize * pixelToScreenRatio),
            // height: (boardSize * pixelToScreenRatio),
          },
        },
      ],
      { compress: COMPRESSION, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImageURI(croppedImage.uri);
    setiOSCameraLaunch(false);
  };
  // const [imageWidth, setImageWidth] = useState();
  // start here - measure ref to image. also, the scaling is only relative to prior measurement
  // const measureOnZoom = (ev) => {
  //   console.log("layout", ev.nativeEvent.layout);
  //   setImageWidth(ev.nativeEvent.layout.width);
  // };

  useEffect(() => {
    launchIosCamera();
  }, []);

  if (imageBeforeCrop)
    return (
      <SafeAreaView>
        {/* <View
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
        /> */}
        <PanGestureHandler
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanHandlerStateChange}
          // ref={imagePan}
          // simultaneousHandlers={imagePinch}
        >
          {/* <Animated.View> */}
          <Animated.View
          // style={{
          //   transform: [
          //     { translateX: pan.x },
          //     { translateY: pan.y },
          //     // { scale: _scale },
          //   ],
          // }}
          >
            <PinchGestureHandler
              onGestureEvent={onPinchGestureEvent}
              onHandlerStateChange={onPinchHandlerStateChange}
              // ref={imagePinch}
              // simultaneousHandlers={imagePan}
            >
              <Animated.View>
                <Animated.View
                  // onLayout={(ev) => measureOnZoom(ev)}
                  style={[
                    {
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
                        left: imagePosition.x,
                        top: imagePosition.y,
                        backgroundColor: "red",
                      },
                      {
                        width: "100%",
                        height:
                          (width * imageBeforeCrop.height) /
                          imageBeforeCrop.width,
                      },
                      // {
                      //   transform: [
                      //     { translateX: pan.x },
                      //     { translateY: pan.y },
                      //     // { scale: _scale },
                      //   ],
                      // },
                    ]}
                  >
                    {/* <ImageBackground
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
            > */}
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
                    {/* </ImageBackground> */}
                  </ImageBackground>
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
            {/* </Animated.View> */}
            {/* <View
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
            /> */}
          </Animated.View>
        </PanGestureHandler>
        <Button onPress={setCrop} title="Crop" />
      </SafeAreaView>
    );
  return <Text>Loading</Text>;
}
