import * as ImageManipulator from "expo-image-manipulator";
import React, { useRef, createRef } from "react";
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
import { getInitialDimensions } from "../util";
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
  // these refs are only relevant if we decide to allow simultaneous drag and rotate,
  // which I feel is somewhat awkward to use

  // const moveRef = createRef<PanGestureHandler>();
  // const rotationRef = createRef<RotationGestureHandler>();

  const pan = useRef(new Animated.ValueXY()).current;
  const lastOffset = { x: 0, y: 0 };

  const rotate = useRef(new Animated.Value(0)).current;
  const rotateStr = rotate.interpolate({
    inputRange: [-100, 100],
    outputRange: ["-100rad", "100rad"],
  });
  let lastRotate = 0;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
    {
      useNativeDriver: USE_NATIVE_DRIVER,
      // not sure if listener is performant; could possibly use this to "live limit" dragging off screen
      // listener: (ev: NativeSyntheticEvent<PanGestureHandlerEventExtra>) => {
      //   if (ev.nativeEvent.translationX + lastOffset.x < 0)
      //
      // },
    }
  );

  const onHandlerStateChange = (ev: PanGestureHandlerStateChangeEvent) => {
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      lastOffset.x += ev.nativeEvent.translationX;
      lastOffset.y += ev.nativeEvent.translationY;

      //limit position on board
      lastOffset.x = Math.max(0, lastOffset.x);
      lastOffset.y = Math.max(0, lastOffset.y);
      //@todo - limit max position based on board size

      //snap piece here using lastOffset

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
            borderColor: "black",
            borderWidth: 1,
            width: 150,
            height: 150,
            top: 0,
            left: 0,
            position: "absolute",
          },
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { rotate: rotateStr },
              { perspective: 300 },
            ],
          },
        ]}
      >
        <RotationGestureHandler
          // ref={rotationRef}
          // simultaneousHandlers={moveRef}
          onGestureEvent={onRotateGestureEvent}
          onHandlerStateChange={onRotateHandlerStateChange}
        >
          <AnimatedSvg height={150} width={150}>
            {/* <Image
                href={{ uri: imageURI }}
                width={150}
                height={150}
                // clipPath={`url(#${puzzleType})`}
              /> */}
            <Rect width={150} height={150} fill="rgb(0,0,255)" />
            <SvgText
              fill="none"
              stroke="white"
              fontSize="60"
              fontWeight="bold"
              x="75"
              y="75"
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
