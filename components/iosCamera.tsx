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
  // can't use screen height because image does not take up entire height of screen
  const initialImageHeightOnScreen = imageBeforeCrop
    ? width * (imageBeforeCrop.height / imageBeforeCrop.width)
    : 0;

  const safeAreaViewInsets = useSafeAreaInsets();
  // calculate status bar height (bar at top with clock, etc)
  const statusBarHeight = safeAreaViewInsets.top;

  // absolute X Y coordinates (upper left coordinates) of cropbox
  const boxX = (width - boardSize) / 2;
  const boxY = (initialImageHeightOnScreen - boardSize) / 2;
  // absolute Y position of crop box, including status bar
  const boxYPlusStatusBar = boxY + statusBarHeight;
  const imageView = useRef<View>();

  // if (imageView.current) imageView.current.addListener(({ value }) => {
  //   console.log('value', value);
  // });

  // keeps track if the image is aligned to a side on the crop box
  const alignedAtBoxLeft = useRef(false);
  const alignedAtBoxRight = useRef(false);
  const alignedAtBoxTop = useRef(false);
  const alignedAtBoxBottom = useRef(false);

  // keeps track of last XY coordinates of image before next move; used to coordinate between Pan and Pinch handlers
  const lastPos = useRef({
    x: 0,
    y: statusBarHeight,
    imageWidth: width,
    imageHeight: 500,
  });

  const [released, setReleased] = useState(true);

  // pan (i.e. drag)
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);
  const lastOffset = useRef({ x: 0, y: 0 });

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
    setReleased(false);
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      console.log(
        "before pan",
        "last offset",
        lastOffset.current,
        "lastpos",
        lastPos.current
      );

      // measureInWindow gets absolute dimensions
      imageView.current!.measureInWindow(
        (x: number, y: number, imageWidth: number, imageHeight: number) => {
          console.log("x", x, "y", y);
          const rightImagePos = x + imageWidth;
          const bottomImagePos = y + imageHeight;
          const rightBoxPos = boxX + boardSize;
          const bottomBoxPos = boxYPlusStatusBar + boardSize;

          // if all bounds of image are outside the crop box, move image as user intends
          if (
            x <= boxX &&
            y <= boxYPlusStatusBar &&
            rightImagePos >= rightBoxPos &&
            bottomImagePos >= bottomBoxPos
          ) {
            // lastOffset.current.x += ev.nativeEvent.translationX;
            // lastOffset.current.y += ev.nativeEvent.translationY;
            lastOffset.current.x += x - lastPos.current.x;
            lastOffset.current.y += y - lastPos.current.y;

            translateX.setOffset(lastOffset.current.x);
            translateY.setOffset(lastOffset.current.y);
            translateX.setValue(0);
            translateY.setValue(0);

            // set image as not aligned to crop box
            alignedAtBoxRight.current = false;
            alignedAtBoxLeft.current = false;
            alignedAtBoxTop.current = false;
            alignedAtBoxBottom.current = false;

            // store ending image position and dimensions to coordinate with PinchHandler for zooming
            // lastPos.current.x = x;
            // lastPos.current.y = y;
            // lastPos.current.imageWidth = imageWidth;
            // lastPos.current.imageHeight = imageHeight;
          }
          // if all bounds of moved image are not outside crop box, snap back image to align to a side of crop box depending on where user tried to move image to
          else {
            const scaleVsOriginalX = imageWidth / width;
            const scaleVsOriginalY = imageHeight / initialImageHeightOnScreen;
            // const scaleVsOriginalX = imageWidth / lastPos.current.imageWidth;
            // const scaleVsOriginalY = imageHeight / lastPos.current.imageHeight;

            console.log(
              "scale vs original x",
              scaleVsOriginalX,
              "scale vs original Y",
              scaleVsOriginalY
            );
            // if image X moves to the right of crop box left side, and wasn't aligned there before, align image left side to crop box left side
            if (x > boxX && !alignedAtBoxLeft.current) {
              // offset is the difference between box absolute position and the last X starting position, adjusted by the current scale vs original proportions
              lastOffset.current.x += boxX - lastPos.current.x;
              translateX.setOffset(lastOffset.current.x);
              // store X absolute position (which is box X) as starting point for next movement
              lastPos.current.x = boxX;
              // set image as aligned at box left, and no longer at box right
              alignedAtBoxLeft.current = true;
              alignedAtBoxRight.current = false;
            }
            // if image right edge moves to the left of crop box's right side, and wasn't aligned there before, align image right side to crop box right side
            else if (
              rightImagePos < rightBoxPos &&
              !alignedAtBoxRight.current
            ) {
              // end goal of where imageX needs to be when image right side is aligned to right side of crop box
              const imageXWhenAlignedToBoxRight = rightBoxPos - imageWidth;
              // offset is the difference between where image X needs to be and the last X starting position, adjusted by the current scale vs original proportions
              lastOffset.current.x +=
                imageXWhenAlignedToBoxRight - lastPos.current.x;
              translateX.setOffset(lastOffset.current.x);
              // store X absolute position as starting point for next movement
              lastPos.current.x = imageXWhenAlignedToBoxRight;
              // set image as aligned at box right, and no longer at box left
              alignedAtBoxRight.current = true;
              alignedAtBoxLeft.current = false;
            }
            // if image Y moves below crop box top, and wasn't aligned there before, align image top side to crop box top
            if (y > boxYPlusStatusBar && !alignedAtBoxTop.current) {
              // offset is the difference between where image Y needs to be and the last Y starting position, adjusted by the current scale vs original proportions
              console.log("panning bottom");
              // 8/8/ part 2 start here - panning after zoom is not reflecting the last pos or offset. it might be going to 75 insteae of 71. the scale adj is wrong?
              // zoom position after pinch might be a tiny bit off - figure out how to add listner to get XY
              // const yAdj = (boxYPlusStatusBar - lastPos.current.y) / scaleVsOriginalY;
              const yAdj = boxYPlusStatusBar - lastPos.current.y;

              console.log("yadj", yAdj);
              lastOffset.current.y += yAdj;
              translateY.setOffset(lastOffset.current.y);
              // store Y absolute position as starting point for next movement
              lastPos.current.y = boxYPlusStatusBar;
              // set image as aligned at box top, and no longer at box bottom
              alignedAtBoxTop.current = true;
              alignedAtBoxBottom.current = false;
            }
            // if image bottom edge is above bottom of crop box, and wasn't aligned there before, align image bottom to crop box bottom
            else if (
              bottomImagePos < bottomBoxPos &&
              !alignedAtBoxBottom.current
            ) {
              // end goal of where imageY needs to be when image bottom side is aligned to bottom of crop box
              const boxYOnBottom = boxYPlusStatusBar + boardSize - imageHeight;
              // offset is the difference between where image Y needs to be and the last Y starting position, adjusted by the current scale vs original proportions
              lastOffset.current.y += boxYOnBottom - lastPos.current.y;
              translateY.setOffset(lastOffset.current.y);
              // store Y absolute position as starting point for next movement
              lastPos.current.y = boxYOnBottom;
              // set image as aligned at box bottom, and no longer at box top
              alignedAtBoxBottom.current = true;
              alignedAtBoxTop.current = false;
            }
            translateX.setValue(0);
            translateY.setValue(0);
            lastPos.current.imageWidth = imageWidth;
            console.log(
              "after pan",
              "last offset",
              lastOffset.current,
              "lastpos",
              lastPos.current
            );
            // setReleased(true)
          }
          setReleased(true);
        }
      );
    }
  };

  // pinch (i.e. zoom)
  const baseScale = useRef(new Animated.Value(1));
  const pinchScale = useRef(new Animated.Value(1));
  const lastScale = useRef(1);
  const _scale = Animated.multiply(baseScale.current, pinchScale.current);

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale.current } }],
    { useNativeDriver: USE_NATIVE_DRIVER }
  );

  const onPinchHandlerStateChange = (
    ev: PinchGestureHandlerStateChangeEvent
  ) => {
    setReleased(false);
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      console.log(
        "before pinch",
        "last offset",
        lastOffset.current,
        "lastpos",
        lastPos.current
      );
      // to persist original event; otherwise gets nullified
      ev.persist();
      imageView.current!.measureInWindow(
        (x: number, y: number, imageWidth: number, imageHeight: number) => {
          // if image is larger than crop box, zoom box as user intends
          if (imageWidth >= boardSize && imageHeight >= boardSize) {
            lastScale.current *= ev.nativeEvent.scale;
            lastPos.current.x = x;
            lastPos.current.y = y;
            lastPos.current.imageWidth = imageWidth;
            lastPos.current.imageHeight = imageHeight;

            alignedAtBoxLeft.current = false;
            alignedAtBoxRight.current = false;
          }
          // if box is not fit to both sides of crop box already, fit width in crop box
          else if (!alignedAtBoxLeft.current || !alignedAtBoxRight.current) {
            // set scale to fit in box
            lastScale.current = boardSize / width;
            // set crop box aligned at left and right both to be true
            alignedAtBoxLeft.current = true;
            alignedAtBoxRight.current = true;

            // XY centers of image before zoom, to calculate how much to adjust vs original center
            const imageCenterXBeforePinch =
              lastPos.current.x + lastPos.current.imageWidth / 2;
            const imageCenterYBeforePinch =
              lastPos.current.y + lastPos.current.imageHeight / 2;
            console.log(
              "imagecenterYbeforepinch",
              imageCenterYBeforePinch,
              "initial image height",
              initialImageHeightOnScreen
            );

            // offCenter represents difference between the center of the starting image and the actual screen center, in the event that the picture started off center
            // this adjusts for how much the image needs to shift to get to center of board
            const offCenterX =
              // diff between center before zoom and actual board center
              (imageCenterXBeforePinch - width / 2) *
              // adjust by the scale vs original before the zoom given that's the scale the center before zoom is being calculated at
              (boardSize / lastPos.current.imageWidth) *
              // adjust by scale to fit in box
              lastScale.current;
            // const offCenterY =
            // (imageCenterYBeforePinch -
            //   ((initialImageHeightOnScreen / 2) + statusBarHeight)) *
            // (boardSize / lastPos.current.imageWidth) *
            // lastScale;
            // const offCenterY =
            //   (lastPos.current.imageHeight - initialImageHeightOnScreen * (boardSize / lastPos.current.imageWidth))/2;
            console.log(
              "imagewidth",
              imageWidth,
              "imageheight",
              imageHeight,
              boardSize
            );

            const offCenterY =
              (lastPos.current.imageHeight -
                initialImageHeightOnScreen * (boardSize / width)) /
              2;

            // const offCenterY =
            //   (imageCenterYBeforePinch -
            //     (initialImageHeightOnScreen / 2)) *
            //   (boardSize / lastPos.current.imageWidth) *
            //   lastScale;

            // start here - 8/9 - the ending position Y after zoom is not getting recorded correctly
            console.log(
              "offcenter",
              offCenterX,
              offCenterY,
              "lastscale",
              lastScale.current
            );
            lastOffset.current.x -= offCenterX;
            // this worked for pan zoom pan
            // lastOffset.current.y -= offCenterY/2;

            // start here - is there a way to set lastOffset.current y as absolute y pos
            // lastOffset.current.y -= offCenterY;
            // lastOffset.current.y = lastPos.current.y;

            // lastOffset.current.y = lastPos.current.y - statusBarHeight;

            translateX.setOffset(lastOffset.current.x);
            // translateY.current.setOffset(lastOffset.current.y);
            translateY.setOffset(lastOffset.current.y - offCenterY);

            translateX.setValue(0);
            translateY.setValue(0);

            lastPos.current.x = boxX;
            // difference between last image height, and new height which would be scaled down proportionately to boardSize
            // lastPos.current.y +=
            //   (lastPos.current.imageHeight -
            //     boardSize * (initialImageHeightOnScreen / width)) /
            //   2;
            // lastPos.current.y -= offCenterY/2
            // lastPos.current.y -= offCenterY - statusBarHeight;
            // lastPos.current.y -= offCenterY;

            lastPos.current.imageWidth = boardSize;
            lastPos.current.imageHeight =
              boardSize * (initialImageHeightOnScreen / width);
          }
          // reset baseScale and pinchScale either way
          baseScale.current.setValue(lastScale.current);
          pinchScale.current.setValue(1);

          alignedAtBoxTop.current = false;
          alignedAtBoxBottom.current = false;
          console.log(
            "after pinch",
            "last offset",
            lastOffset.current,
            "lastpos",
            lastPos.current
          );
          setReleased(true);
        }
      );
    }
  };

  useEffect(() => {
    // if (imageView.current) getCurrentXY();
    if (released && imageView.current)
      imageView.current?.measureInWindow(
        (x: number, y: number, imageWidth: number, imageHeight: number) => {
          console.log("before pan x", x, "y", y);
          lastPos.current.x = x;
          lastPos.current.y = y;
          lastPos.current.imageHeight = imageHeight;
          lastPos.current.imageWidth = imageWidth;
        }
      );
  }, [released]);

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
        // alignedAtBoxRight.current = false;
        // alignedAtBoxLeft.current = false;
        // alignedAtBoxTop.current = false;
        // alignedAtBoxBottom.current = false;

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
                      left: lastOffset.current.x,
                      top: lastOffset.current.y,
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

// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// import * as ImageManipulator from "expo-image-manipulator";
// import * as ImagePicker from "expo-image-picker";
// import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
// import React, { useEffect, useState, useRef } from "react";
// import { Animated, ImageBackground, Text, View, Button } from "react-native";
// import {
//   PanGestureHandler,
//   State,
//   PanGestureHandlerStateChangeEvent,
//   PinchGestureHandler,
//   PinchGestureHandlerStateChangeEvent,
// } from "react-native-gesture-handler";
// import {
//   SafeAreaView,
//   useSafeAreaInsets,
// } from "react-native-safe-area-context";
// import { useSelector } from "react-redux";

// import { USE_NATIVE_DRIVER, COMPRESSION } from "../constants";
// import { RootState } from "../types";
// import { checkPermission } from "../util";

// const emptyImage = require("../assets/blank.jpg");

// export default function IosCamera({
//   setImageURI,
//   setiOSCameraLaunch,
// }: {
//   setImageURI: (uri: string) => void;
//   setiOSCameraLaunch: (camera: boolean) => void;
// }): JSX.Element {
//   const { width, height, boardSize } = useSelector(
//     (state: RootState) => state.screenHeight
//   );
//   const [imageBeforeCrop, setImageBeforeCrop] = useState<ImageInfo>();
//   // can't use screen height because image does not take up entire height of screen
//   const initialImageHeightOnScreen = imageBeforeCrop
//     ? width * (imageBeforeCrop.height / imageBeforeCrop.width)
//     : 0;

//   const safeAreaViewInsets = useSafeAreaInsets();
//   // calculate status bar height (bar at top with clock, etc)
//   const statusBarHeight = safeAreaViewInsets.top;

//   // absolute X Y coordinates (upper left coordinates) of cropbox
//   const boxX = (width - boardSize) / 2;
//   const boxY = (initialImageHeightOnScreen - boardSize) / 2;
//   // absolute Y position of crop box, including status bar
//   const boxYPlusStatusBar = boxY + statusBarHeight;
//   const imageView = useRef<View>();

//   // if (imageView.current) imageView.current.addListener(({ value }) => {
//   //   console.log('value', value);
//   // });

//   // keeps track if the image is aligned to a side on the crop box
//   const alignedAtBoxLeft = useRef(false);
//   const alignedAtBoxRight = useRef(false);
//   const alignedAtBoxTop = useRef(false);
//   const alignedAtBoxBottom = useRef(false);

//   // keeps track of last XY coordinates of image before next move; used to coordinate between Pan and Pinch handlers
//   const lastPos = useRef({
//     x: 0,
//     y: statusBarHeight,
//     imageWidth: width,
//     imageHeight: 500,
//   });

//   const [released, setReleased] = useState(true)

//   // pan (i.e. drag)
//   const translateX = new Animated.Value(0);
//   const translateY = new Animated.Value(0);
//   const lastOffset = useRef({ x: 0, y: 0 });

//   const onPanGestureEvent = Animated.event(
//     [
//       {
//         nativeEvent: {
//           translationX: translateX,
//           translationY: translateY,
//         },
//       },
//     ],
//     { useNativeDriver: USE_NATIVE_DRIVER }
//   );

//   const onPanHandlerStateChange = (ev: PanGestureHandlerStateChangeEvent) => {
//     // to persist original event; otherwise gets nullified
//     ev.persist();
//     setReleased(false)
//     if (ev.nativeEvent.oldState === State.ACTIVE) {
//       console.log('before pan', "last offset", lastOffset.current, "lastpos", lastPos.current)

//       // measureInWindow gets absolute dimensions
//       imageView.current!.measureInWindow(
//         (x: number, y: number, imageWidth: number, imageHeight: number) => {
//           const rightImagePos = x + imageWidth;
//           const bottomImagePos = y + imageHeight;
//           const rightBoxPos = boxX + boardSize;
//           const bottomBoxPos = boxYPlusStatusBar + boardSize;

//           // if all bounds of image are outside the crop box, move image as user intends
//           if (
//             x <= boxX &&
//             y <= boxYPlusStatusBar &&
//             rightImagePos >= rightBoxPos &&
//             bottomImagePos >= bottomBoxPos
//           ) {
//             lastOffset.current.x += ev.nativeEvent.translationX;
//             lastOffset.current.y += ev.nativeEvent.translationY;
//             translateX.setOffset(lastOffset.current.x);
//             translateY.setOffset(lastOffset.current.y);
//             translateX.setValue(0);
//             translateY.setValue(0);

//             // set image as not aligned to crop box
//             alignedAtBoxRight.current = false;
//             alignedAtBoxLeft.current = false;
//             alignedAtBoxTop.current = false;
//             alignedAtBoxBottom.current = false;

//             // store ending image position and dimensions to coordinate with PinchHandler for zooming
//             lastPos.current.x = x;
//             lastPos.current.y = y;
//             lastPos.current.imageWidth = imageWidth;
//             lastPos.current.imageHeight = imageHeight;
//           }
//           // if all bounds of moved image are not outside crop box, snap back image to align to a side of crop box depending on where user tried to move image to
//           else {
//             const scaleVsOriginalX = imageWidth / width;
//             const scaleVsOriginalY = imageHeight / initialImageHeightOnScreen;
//             // const scaleVsOriginalX = imageWidth / lastPos.current.imageWidth;
//             // const scaleVsOriginalY = imageHeight / lastPos.current.imageHeight;

//             console.log('scale vs original x', scaleVsOriginalX, 'scale vs original Y', scaleVsOriginalY)
//             // if image X moves to the right of crop box left side, and wasn't aligned there before, align image left side to crop box left side
//             if (x > boxX && !alignedAtBoxLeft.current) {
//               // offset is the difference between box absolute position and the last X starting position, adjusted by the current scale vs original proportions
//               lastOffset.current.x += (boxX - lastPos.current.x) / scaleVsOriginalX;
//               translateX.setOffset(lastOffset.current.x);
//               // store X absolute position (which is box X) as starting point for next movement
//               lastPos.current.x = boxX;
//               // set image as aligned at box left, and no longer at box right
//               alignedAtBoxLeft.current = true;
//               alignedAtBoxRight.current = false;
//             }
//             // if image right edge moves to the left of crop box's right side, and wasn't aligned there before, align image right side to crop box right side
//             else if (
//               rightImagePos < rightBoxPos &&
//               !alignedAtBoxRight.current
//             ) {
//               // end goal of where imageX needs to be when image right side is aligned to right side of crop box
//               const imageXWhenAlignedToBoxRight = rightBoxPos - imageWidth;
//               // offset is the difference between where image X needs to be and the last X starting position, adjusted by the current scale vs original proportions
//               lastOffset.current.x +=
//                 (imageXWhenAlignedToBoxRight - lastPos.current.x) / scaleVsOriginalX;
//               translateX.setOffset(lastOffset.current.x);
//               // store X absolute position as starting point for next movement
//               lastPos.current.x = imageXWhenAlignedToBoxRight;
//               // set image as aligned at box right, and no longer at box left
//               alignedAtBoxRight.current = true;
//               alignedAtBoxLeft.current = false;
//             }
//             // if image Y moves below crop box top, and wasn't aligned there before, align image top side to crop box top
//             if (y > boxYPlusStatusBar && !alignedAtBoxTop.current) {
//               // offset is the difference between where image Y needs to be and the last Y starting position, adjusted by the current scale vs original proportions
//               console.log('panning bottom')
//               // 8/8/ part 2 start here - panning after zoom is not reflecting the last pos or offset. it might be going to 75 insteae of 71. the scale adj is wrong?
//               // zoom position after pinch might be a tiny bit off - figure out how to add listner to get XY
//               // const yAdj = (boxYPlusStatusBar - lastPos.current.y) / scaleVsOriginalY;
//               const yAdj = (boxYPlusStatusBar - lastPos.current.y);

//               console.log('yadj', yAdj)
//               lastOffset.current.y += yAdj;
//               translateY.setOffset(lastOffset.current.y);
//               // store Y absolute position as starting point for next movement
//               lastPos.current.y = boxYPlusStatusBar;
//               // set image as aligned at box top, and no longer at box bottom
//               alignedAtBoxTop.current = true;
//               alignedAtBoxBottom.current = false;
//             }
//             // if image bottom edge is above bottom of crop box, and wasn't aligned there before, align image bottom to crop box bottom
//             else if (
//               bottomImagePos < bottomBoxPos &&
//               !alignedAtBoxBottom.current
//             ) {
//               // end goal of where imageY needs to be when image bottom side is aligned to bottom of crop box
//               const boxYOnBottom = boxYPlusStatusBar + boardSize - imageHeight;
//               // offset is the difference between where image Y needs to be and the last Y starting position, adjusted by the current scale vs original proportions
//               lastOffset.current.y += (boxYOnBottom - lastPos.current.y) / scaleVsOriginalY;
//               translateY.setOffset(lastOffset.current.y);
//               // store Y absolute position as starting point for next movement
//               lastPos.current.y = boxYOnBottom;
//               // set image as aligned at box bottom, and no longer at box top
//               alignedAtBoxBottom.current = true;
//               alignedAtBoxTop.current = false;
//             }
//             translateX.setValue(0);
//             translateY.setValue(0);
//             lastPos.current.imageWidth = imageWidth;
//             console.log('after pan', "last offset", lastOffset.current, "lastpos", lastPos.current)
//             setReleased(true)

//           }
//         }
//       );
//     }
//   };

//   // pinch (i.e. zoom)
//   const baseScale = useRef(new Animated.Value(1));
//   const pinchScale = useRef(new Animated.Value(1));
//   const lastScale = useRef(1);
//   const _scale = Animated.multiply(baseScale.current, pinchScale.current);

//   const onPinchGestureEvent = Animated.event(
//     [{ nativeEvent: { scale: pinchScale.current } }],
//     { useNativeDriver: USE_NATIVE_DRIVER }
//   );

//   const onPinchHandlerStateChange = (
//     ev: PinchGestureHandlerStateChangeEvent
//   ) => {
//     setReleased(false)
//     if (ev.nativeEvent.oldState === State.ACTIVE) {
//       console.log('before pinch', "last offset", lastOffset.current, "lastpos", lastPos.current)
//       // to persist original event; otherwise gets nullified
//       ev.persist();
//       imageView.current!.measureInWindow(
//         (x: number, y: number, imageWidth: number, imageHeight: number) => {
//           // if image is larger than crop box, zoom box as user intends
//           if (imageWidth >= boardSize && imageHeight >= boardSize) {
//             lastScale.current *= ev.nativeEvent.scale;
//             lastPos.current.x = x;
//             lastPos.current.y = y;
//             lastPos.current.imageWidth = imageWidth;
//             lastPos.current.imageHeight = imageHeight;

//             alignedAtBoxLeft.current = false;
//             alignedAtBoxRight.current = false;
//           }
//           // if box is not fit to both sides of crop box already, fit width in crop box
//           else if (!alignedAtBoxLeft.current || !alignedAtBoxRight.current) {
//             // set scale to fit in box
//             lastScale.current = boardSize / width;
//             // set crop box aligned at left and right both to be true
//             alignedAtBoxLeft.current = true;
//             alignedAtBoxRight.current = true;

//             // XY centers of image before zoom, to calculate how much to adjust vs original center
//             const imageCenterXBeforePinch = lastPos.current.x + lastPos.current.imageWidth / 2;
//             const imageCenterYBeforePinch = lastPos.current.y + lastPos.current.imageHeight / 2;
//             console.log('imagecenterYbeforepinch', imageCenterYBeforePinch, 'initial image height', initialImageHeightOnScreen)

//             // offCenter represents difference between the center of the starting image and the actual screen center, in the event that the picture started off center
//             // this adjusts for how much the image needs to shift to get to center of board
//             const offCenterX =
//               // diff between center before zoom and actual board center
//               (imageCenterXBeforePinch - width / 2) *
//               // adjust by the scale vs original before the zoom given that's the scale the center before zoom is being calculated at
//               (boardSize / lastPos.current.imageWidth) *
//               // adjust by scale to fit in box
//               lastScale.current;
//               // const offCenterY =
//               // (imageCenterYBeforePinch -
//               //   ((initialImageHeightOnScreen / 2) + statusBarHeight)) *
//               // (boardSize / lastPos.current.imageWidth) *
//               // lastScale;
//             // const offCenterY =
//             //   (lastPos.current.imageHeight - initialImageHeightOnScreen * (boardSize / lastPos.current.imageWidth))/2;
//             console.log('imagewidth', imageWidth, 'imageheight', imageHeight, boardSize)

//             const offCenterY =
//               (lastPos.current.imageHeight - initialImageHeightOnScreen * (boardSize / width))/2;

//             // const offCenterY =
//             //   (imageCenterYBeforePinch -
//             //     (initialImageHeightOnScreen / 2)) *
//             //   (boardSize / lastPos.current.imageWidth) *
//             //   lastScale;

//             // start here - 8/9 - the ending position Y after zoom is not getting recorded correctly
//             console.log('offcenter', offCenterX, offCenterY, 'lastscale', lastScale.current)
//             lastOffset.current.x -= offCenterX;
//             // this worked for pan zoom pan
//             // lastOffset.current.y -= offCenterY/2;

//             // start here - is there a way to set lastOffset.current y as absolute y pos
//             // lastOffset.current.y -= offCenterY;
//             // lastOffset.current.y = lastPos.current.y;

//             // lastOffset.current.y = lastPos.current.y - statusBarHeight;

//             translateX.setOffset(lastOffset.current.x);
//             // translateY.current.setOffset(lastOffset.current.y);
//             translateY.setOffset(lastOffset.current.y - offCenterY);

//             translateX.setValue(0);
//             translateY.setValue(0);

//             lastPos.current.x = boxX;
//             // difference between last image height, and new height which would be scaled down proportionately to boardSize
//             // lastPos.current.y +=
//             //   (lastPos.current.imageHeight -
//             //     boardSize * (initialImageHeightOnScreen / width)) /
//             //   2;
//             // lastPos.current.y -= offCenterY/2
//             // lastPos.current.y -= offCenterY - statusBarHeight;
//             // lastPos.current.y -= offCenterY;

//             lastPos.current.imageWidth = boardSize;
//             lastPos.current.imageHeight =
//               boardSize * (initialImageHeightOnScreen / width);
//           }
//           // reset baseScale and pinchScale either way
//           baseScale.current.setValue(lastScale.current);
//           pinchScale.current.setValue(1);

//           alignedAtBoxTop.current = false;
//           alignedAtBoxBottom.current = false;
//           console.log('after pinch', "last offset", lastOffset.current, "lastpos", lastPos.current)
//           setReleased(true)

//         }
//       );
//     }
//     if (ev.nativeEvent.oldState === State.END) {
//       // to persist original event; otherwise gets nullified
//       ev.persist();
//       imageView.current!.measureInWindow(
//         (x: number, y: number, imageWidth: number, imageHeight: number) => {
//           console.log('x',x,'y',y)
//         })
//   }
//   };

//   const getCurrentXY = () => {
//     imageView.current!.measureInWindow(
//       (x: number, y: number, imageWidth: number, imageHeight: number) => {
//         console.log('curr x',x,'y',y)
//       });
//   };

//   useEffect(() => {
//   // if (imageView.current) getCurrentXY();
//   if(released && imageView.current) imageView.current?.measureInWindow((x: number, y: number, imageWidth: number, imageHeight: number) => {
//     console.log('before pan x', x, 'y', y)
//     lastPos.current.x = x;
//     lastPos.current.y = y;
//     lastPos.current.imageHeight = imageHeight;
//     lastPos.current.imageWidth = imageWidth;
//   })
// }, [released])
//   // if (imageView.current) getCurrentXY();

//   const launchIosCamera = async () => {
//     const permission = await checkPermission(true);
//     if (permission === "granted") {
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false,
//         quality: 1,
//       });
//       if (!result.cancelled) {
//         setImageBeforeCrop(result);
//       }
//     }
//   };

//   const setCrop = (): void => {
//     // adjustment factor for actual image pixels vs screen px measurement; adjusted on width
//     const pixelToScreenRatio = imageBeforeCrop!.width / width;
//     // measureInWindow gets absolute dimensions on screen
//     imageView.current!.measureInWindow(
//       async (
//         finalX: number,
//         finalY: number,
//         finalImageWidth: number,
//         finalImageHeight: number
//       ) => {
//         const originX =
//           // distance from top of image to crop box X
//           ((boxX - finalX) *
//             // scale image to original picture (relevant if zoomed)
//             imageBeforeCrop!.width) /
//           finalImageWidth;

//         const originY =
//           // distance from top of image to crop box Y
//           // add status bar height to crop box Y given positions are absolutes
//           ((boxYPlusStatusBar - finalY) *
//             // scale image to original picture (relevant if zoomed)
//             imageBeforeCrop!.height) /
//           finalImageHeight;

//         const cropWidth =
//           // scale boardSize on screen to original image size
//           (boardSize * pixelToScreenRatio) /
//           // reduce this board size by the zoom scale
//           (finalImageWidth / width);

//         const cropHeight =
//           (boardSize * pixelToScreenRatio) /
//           (finalImageHeight / initialImageHeightOnScreen);

//         // crop image with above coordinates
//         const croppedImage = await ImageManipulator.manipulateAsync(
//           imageBeforeCrop!.uri,
//           [
//             {
//               crop: {
//                 // Origin X / Y are upper left coordinates where cropping begins
//                 originX,
//                 originY,
//                 width: cropWidth,
//                 height: cropHeight,
//               },
//             },
//           ],
//           { compress: COMPRESSION, format: ImageManipulator.SaveFormat.JPEG }
//         );
//         // set image URI, and iOS Camera Launch state to false on Home component
//         // alignedAtBoxRight.current = false;
//         // alignedAtBoxLeft.current = false;
//         // alignedAtBoxTop.current = false;
//         // alignedAtBoxBottom.current = false;

//         setImageURI(croppedImage.uri);
//         setiOSCameraLaunch(false);
//       }
//     );
//   };

//   useEffect(() => {
//     launchIosCamera();
//   }, []);

//   if (imageBeforeCrop)
//     return (
//       <SafeAreaView>
//         <PanGestureHandler
//           onGestureEvent={onPanGestureEvent}
//           onHandlerStateChange={onPanHandlerStateChange}
//         >
//           <Animated.View>
//             <PinchGestureHandler
//               onGestureEvent={onPinchGestureEvent}
//               onHandlerStateChange={onPinchHandlerStateChange}
//             >
//               <Animated.View>
//                 <Animated.View
//                   ref={imageView}
//                   style={[
//                     {
//                       left: lastOffset.current.x,
//                       top: lastOffset.current.y,
//                       transform: [
//                         { scale: _scale },
//                         { translateX: translateX },
//                         { translateY: translateY },
//                       ],
//                     },
//                   ]}
//                 >
//                   <ImageBackground
//                     source={
//                       imageBeforeCrop
//                         ? { uri: imageBeforeCrop.uri }
//                         : emptyImage
//                     }
//                     style={[
//                       {
//                         width: "100%",
//                         height: initialImageHeightOnScreen,
//                       },
//                     ]}
//                   />
//                 </Animated.View>
//                 <View
//                   style={{
//                     left: boxX,
//                     top: boxY,
//                     width: boardSize,
//                     height: boardSize,
//                     borderColor: "white",
//                     borderWidth: 2,
//                     position: "absolute",
//                     zIndex: 1,
//                   }}
//                 />
//               </Animated.View>
//             </PinchGestureHandler>
//           </Animated.View>
//         </PanGestureHandler>
//         <View
//           style={{
//             top: height - 80,
//             position: "absolute",
//             alignSelf: "center",
//           }}
//         >
//           <Button onPress={setCrop} title="Crop" />
//         </View>
//       </SafeAreaView>
//     );
//   return <Text>Loading</Text>;
// }
