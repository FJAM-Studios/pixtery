/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import React, { useEffect, useState, useRef } from "react";
import { Animated, ImageBackground, View, Button, Modal } from "react-native";
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

import { USE_NATIVE_DRIVER, COMPRESSION } from "../../constants";
import { RootState } from "../../types";
import { checkPermission } from "../../util";

const emptyImage = require("../../assets/blank.jpg");

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
  // right side of crop box
  const rightBoxPos = boxX + boardSize;
  // bottom of crop box
  const bottomBoxPos = boxYPlusStatusBar + boardSize;

  // ref for Animated View image element
  const imageView = useRef<View>();

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
    imageHeight: initialImageHeightOnScreen,
  });

  // keeps track of when user has released image, so that on release (i.e. released state is true), lastPos is updated with actual X Y coordinates
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
      // measureInWindow gets absolute dimensions
      imageView.current!.measureInWindow(
        (x: number, y: number, imageWidth: number, imageHeight: number) => {
          // evaluate image X position relative to crop box
          evaluateXPos(x, imageWidth);
          // evaluate image Y position relative to crop box
          evaluateYPos(y, imageHeight);

          translateX.setValue(0);
          translateY.setValue(0);
          setReleased(true);
        }
      );
    }
  };

  // evaluate image X position relative to crop box
  const evaluateXPos = (x: number, imageWidth: number) => {
    const rightImagePos = x + imageWidth;

    // if image x position is outside of crop box, move image X position as user desires
    if (x <= boxX && rightImagePos >= rightBoxPos) {
      // set offset to difference between new position and last position
      lastOffset.current.x += x - lastPos.current.x;
      translateX.setOffset(lastOffset.current.x);

      // set image as not aligned to crop box
      alignedAtBoxRight.current = false;
      alignedAtBoxLeft.current = false;
    }
    // else if X position of moved image are not outside crop box, snap back image to align to a side of crop box depending on where user tried to move image to
    else {
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
      else if (rightImagePos < rightBoxPos && !alignedAtBoxRight.current) {
        // end goal of where imageX needs to be when image right side is aligned to right side of crop box
        const imageXWhenAlignedToBoxRight = rightBoxPos - imageWidth;
        // offset is the difference between where image X needs to be and the last X starting position, adjusted by the current scale vs original proportions
        lastOffset.current.x += imageXWhenAlignedToBoxRight - lastPos.current.x;
        translateX.setOffset(lastOffset.current.x);
        // store X absolute position as starting point for next movement
        lastPos.current.x = imageXWhenAlignedToBoxRight;
        // set image as aligned at box right, and no longer at box left
        alignedAtBoxRight.current = true;
        alignedAtBoxLeft.current = false;
      }
    }
  };

  // evaluate image Y position relative to crop box
  const evaluateYPos = (y: number, imageHeight: number) => {
    const bottomImagePos = y + imageHeight;
    // if image Y position is outside of crop box, move image Y position as user desires
    if (y <= boxYPlusStatusBar && bottomImagePos >= bottomBoxPos) {
      // set offset to diff between new position and last position
      lastOffset.current.y += y - lastPos.current.y;
      translateY.setOffset(lastOffset.current.y);

      // set image as not aligned to crop box
      alignedAtBoxTop.current = false;
      alignedAtBoxBottom.current = false;
    }
    // else if Y position of moved image is not outside crop box, snap back image to align to a side of crop box depending on where user tried to move image to
    else {
      // if image Y moves below crop box top, and wasn't aligned there before, align image top side to crop box top
      if (y > boxYPlusStatusBar && !alignedAtBoxTop.current) {
        // offset is the difference between where image Y needs to be and the last Y starting position, adjusted by the current scale vs original proportions
        lastOffset.current.y += boxYPlusStatusBar - lastPos.current.y;
        translateY.setOffset(lastOffset.current.y);
        // store Y absolute position as starting point for next movement
        lastPos.current.y = boxYPlusStatusBar;
        // set image as aligned at box top, and no longer at box bottom
        alignedAtBoxTop.current = true;
        alignedAtBoxBottom.current = false;
      }
      // if image bottom edge is above bottom of crop box, and wasn't aligned there before, align image bottom to crop box bottom
      else if (bottomImagePos < bottomBoxPos && !alignedAtBoxBottom.current) {
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
      // to persist original event; otherwise gets nullified
      ev.persist();
      imageView.current!.measureInWindow(
        (x: number, y: number, imageWidth: number, imageHeight: number) => {
          // if image is larger than crop box, zoom box as user intends
          if (imageWidth >= boardSize && imageHeight >= boardSize) {
            lastScale.current *= ev.nativeEvent.scale;
            alignedAtBoxLeft.current = false;
            alignedAtBoxRight.current = false;
            alignedAtBoxTop.current = false;
            alignedAtBoxBottom.current = false;

            // below code adjusts image to cropbox corner(s) if after pinch, image is moved so that it is inside crop box
            const rightImagePos = x + imageWidth;
            // if after pinch, image right (X) or left positions are inside crop box, snap back to closer side
            if (x > boxX || rightImagePos < rightBoxPos) {
              // set lastPos before the evaluatePos function (since the function calcs offset from that position)
              lastPos.current.x = x;
              evaluateXPos(x, imageWidth);
              translateX.setValue(0);
            }

            const bottomImagePos = y + imageHeight;
            // if after pinch, image top (Y) or bottom positions are inside crop box, snap back to closer side
            if (y > boxYPlusStatusBar || bottomImagePos < bottomBoxPos) {
              // set lastPos before the evaluatePos function (since the function calcs offset from that position)
              lastPos.current.y = y;
              evaluateYPos(y, imageHeight);
              translateY.setValue(0);
            }
          }

          // else if pinched image is smaller tham cropbox, and box is not fit to both sides of crop box already, fit width in crop box
          else if (!alignedAtBoxLeft.current || !alignedAtBoxRight.current) {
            // set scale to fit in box
            lastScale.current = boardSize / width;

            // XY centers of image before pinch, to calculate how much to adjust vs original screen midpoint
            const imageCenterXBeforePinch =
              lastPos.current.x + lastPos.current.imageWidth / 2;
            const imageCenterYBeforePinch =
              lastPos.current.y + lastPos.current.imageHeight / 2;

            // shrink Y represents how much image height will shrink on either side when image is pinched so that the width fits in crop box
            const shrinkY =
              (lastPos.current.imageHeight -
                initialImageHeightOnScreen * (boardSize / width)) /
              2;

            // if image vertical center before pinch is greater than screen midpoint, shrink value is positive relative to midpoint (i.e. to the bottom); if not, value is negative relative to midpoint
            const shrinkYAdjForRelativeCenter =
              imageCenterYBeforePinch >= initialImageHeightOnScreen / 2
                ? shrinkY
                : shrinkY;

            // offCenterX is difference between the center of the starting image and the actual screen center, in the event that the picture started off center
            // this adjusts for how much the image X needs to adjust shift after pinching to get to center of board
            const offCenterX = imageCenterXBeforePinch - width / 2;

            // bottom position of image after shrinking from pinch
            const bottomYAfterShrink =
              lastPos.current.y +
              lastPos.current.imageHeight -
              shrinkYAdjForRelativeCenter * 2;

            // if due to pinching, image bottom ends up above the bottom of crop box, calc adjustment factor
            const offsetAdjToBoxBottom =
              bottomYAfterShrink < bottomBoxPos
                ? bottomBoxPos - bottomYAfterShrink
                : 0;

            // adjustments made via offsets from positions due to organic pinching
            // X is adjusted so image fits in crop box width
            lastOffset.current.x -= offCenterX;
            // Y is adjusted to original Y, with additional offset if that adjustment results in image bottom being above crop box
            lastOffset.current.y -=
              shrinkYAdjForRelativeCenter - offsetAdjToBoxBottom;

            translateX.setOffset(lastOffset.current.x);
            translateY.setOffset(lastOffset.current.y);
            translateX.setValue(0);
            translateY.setValue(0);

            lastPos.current.x = boxX;
            lastPos.current.imageWidth = boardSize;
            lastPos.current.imageHeight =
              boardSize * (initialImageHeightOnScreen / width);

            // set crop box aligned at left and right both to be true
            alignedAtBoxLeft.current = true;
            alignedAtBoxRight.current = true;
          }
          // reset baseScale and pinchScale either way
          baseScale.current.setValue(lastScale.current);
          pinchScale.current.setValue(1);

          setReleased(true);
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
        lastPos.current.imageHeight = width * (result.height / result.width);
        setImageBeforeCrop(result);
      } else {
        setiOSCameraLaunch(false);
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

  // on release (i.e. released state is true), gets actual X Y coordinates and updates lastPos
  useEffect(() => {
    if (released && imageView.current)
      imageView.current?.measureInWindow(
        (x: number, y: number, imageWidth: number, imageHeight: number) => {
          lastPos.current.x = x;
          lastPos.current.y = y;
          lastPos.current.imageHeight = imageHeight;
          lastPos.current.imageWidth = imageWidth;
        }
      );
  }, [released]);

  if (imageBeforeCrop && initialImageHeightOnScreen)
    return (
      <Modal>
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
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
            <Button color="white" onPress={setCrop} title="Crop" />
          </View>
        </SafeAreaView>
      </Modal>
    );
  return null;
}
