import * as ImageManipulator from "expo-image-manipulator";
import React, { useRef, createRef, useState } from "react";
import {
  Svg,
  Image,
  Defs,
  ClipPath,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import {
  Animated,
  Platform,
  View,
  StyleSheet,
  PanResponder,
  Text,
  NativeSyntheticEvent,
} from "react-native";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  RotationGestureHandler,
  RotationGestureHandlerStateChangeEvent,
  RotationGestureHandlerGestureEvent,
  GestureHandlerGestureEvent,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerEventExtra,
} from "react-native-gesture-handler";

import {
  SNAP_MARGIN,
  DEGREE_CONVERSION,
  USE_NATIVE_DRIVER,
} from "../constants";
import { GridSections } from "../types";
import { getInitialDimensions, getPointsDistance } from "../util";
import Draggable from "./CustomDraggable";
import { black } from "react-native-paper/lib/typescript/styles/colors";
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default ({
  num,
  ix,
  gridSize,
  squareSize,
  puzzleType,
  boardSize,
  piecePath,
  imageURI,
  gridSections,
  currentBoard,
  setCurrentBoard,
  setErrorMessage,
  puzzleAreaDimensions,
  z,
  moveToTop,
}: {
  num: number;
  ix: number;
  gridSize: number;
  squareSize: number;
  puzzleType: string;
  boardSize: number;
  piecePath: string;
  imageURI: string;
  gridSections: GridSections;
  currentBoard: (number | null)[];
  setCurrentBoard: Function;
  setErrorMessage: Function;
  puzzleAreaDimensions: { puzzleAreaWidth: number; puzzleAreaHeight: number };
  z: number;
  moveToTop: Function;
}): JSX.Element | null => {
  //temporary values
  const pieceWidth = squareSize;
  const pieceHeight = squareSize;
  const pieceStartX = 0;
  const pieceStartY = 0;
  const snapPoints = [
    { x: 0, y: 0 },
    { x: squareSize, y: 0 },
    { x: squareSize * 2, y: 0 },
    { x: 0, y: squareSize },
    { x: squareSize, y: squareSize },
    { x: squareSize * 2, y: squareSize },
    { x: 0, y: squareSize * 2 },
    { x: squareSize, y: squareSize * 2 },
    { x: squareSize * 2, y: squareSize * 2 },
  ];

  // these refs are only relevant if we decide to allow simultaneous drag and rotate,
  // which I feel is somewhat awkward to use

  // const moveRef = createRef<PanGestureHandler>();
  // const rotationRef = createRef<RotationGestureHandler>();
  const zIndex = useRef(new Animated.Value(0)).current;

  const pan = useRef(new Animated.ValueXY()).current;
  const lastOffset = { x: 0, y: 0 };

  const rotate = useRef(new Animated.Value(0)).current;
  const rotateStr = rotate.interpolate({
    inputRange: [-100, 100],
    outputRange: ["-100rad", "100rad"],
  });
  let lastRotate = 0;

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: pan.x,
          translationY: pan.y,
          numberOfPointers: zIndex,
        },
      },
    ],
    {
      useNativeDriver: USE_NATIVE_DRIVER,
      // not sure if listener is performant; could possibly use this to "live limit" dragging off screen
      // listener: (ev: NativeSyntheticEvent<PanGestureHandlerEventExtra>) => {
      //   console.log(ev.nativeEvent);
      // },
    }
  );

  const onHandlerStateChange = (ev: PanGestureHandlerStateChangeEvent) => {
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      zIndex.setValue(0);
      lastOffset.x += ev.nativeEvent.translationX;
      lastOffset.y += ev.nativeEvent.translationY;

      //limit position on board
      lastOffset.x = Math.max(0, lastOffset.x);
      lastOffset.y = Math.max(0, lastOffset.y);
      lastOffset.x = Math.min(
        puzzleAreaDimensions.puzzleAreaWidth - pieceWidth,
        lastOffset.x
      );
      lastOffset.y = Math.min(
        puzzleAreaDimensions.puzzleAreaHeight - pieceHeight,
        lastOffset.y
      );
      //snap piece here using lastOffset
      for (let point of snapPoints) {
        if (getPointsDistance(point, lastOffset) < SNAP_MARGIN * pieceHeight) {
          lastOffset.x = point.x;
          lastOffset.y = point.y;
          //mark as snapped
          break;
        }
      }

      pan.setOffset(lastOffset);
      pan.setValue({ x: 0, y: 0 });
    }
  };

  const onRotateGestureEvent = Animated.event(
    [{ nativeEvent: { rotation: rotate } }],
    {
      useNativeDriver: USE_NATIVE_DRIVER,
    }
  );

  const onRotateHandlerStateChange = (
    ev: RotationGestureHandlerStateChangeEvent
  ) => {
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      lastRotate += ev.nativeEvent.rotation;
      // convert rotation to between 0 and 2 * pi
      lastRotate = lastRotate % (Math.PI * 2);
      lastRotate += 2 * Math.PI;
      lastRotate = lastRotate % (Math.PI * 2);
      // 'snap' rotation to whichever angle it's closest to
      if (
        lastRotate >= 315 * DEGREE_CONVERSION ||
        lastRotate < 45 * DEGREE_CONVERSION
      ) {
        lastRotate = 0;
      } else if (
        lastRotate >= 45 * DEGREE_CONVERSION &&
        lastRotate < 135 * DEGREE_CONVERSION
      ) {
        lastRotate = 90 * DEGREE_CONVERSION;
      } else if (
        lastRotate >= 135 * DEGREE_CONVERSION &&
        lastRotate < 225 * DEGREE_CONVERSION
      ) {
        lastRotate = 180 * DEGREE_CONVERSION;
      } else {
        lastRotate = 270 * DEGREE_CONVERSION;
      }
      rotate.setOffset(lastRotate);
      rotate.setValue(0);
    }
  };

  return (
    <PanGestureHandler
      // ref={moveRef}
      // simultaneousHandlers={rotationRef}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          {
            width: pieceWidth,
            height: pieceHeight,
            top: pieceStartY,
            left: pieceStartX,
            position: "absolute",
            zIndex: zIndex,
          },
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
      >
        <RotationGestureHandler
          // ref={rotationRef}
          // simultaneousHandlers={moveRef}
          onGestureEvent={onRotateGestureEvent}
          onHandlerStateChange={onRotateHandlerStateChange}
        >
          <AnimatedSvg
            height={pieceWidth}
            width={pieceHeight}
            style={[
              { zIndex },
              { transform: [{ rotate: rotateStr }, { perspective: 300 }] },
            ]}
          >
            {/* <Image
              href={{ uri: imageURI }}
              width={pieceWidth}
              height={pieceHeight}
              // clipPath={`url(#${puzzleType})`}
            /> */}
            <Rect
              width={pieceWidth}
              height={pieceHeight}
              fill="rgb(0,0,255)"
              stroke="white"
            />
            <SvgText
              fill="none"
              stroke="white"
              fontSize="60"
              fontWeight="bold"
              x={pieceWidth / 2}
              y={pieceHeight / 2}
              textAnchor="middle"
            >
              {ix}
            </SvgText>
          </AnimatedSvg>
        </RotationGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};
