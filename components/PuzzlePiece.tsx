import React, { useRef } from "react";
import {
  Svg,
  Image,
  Defs,
  ClipPath,
  Path,
  Rect,
  Circle,
} from "react-native-svg";
import { Animated } from "react-native";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  RotationGestureHandler,
  RotationGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";

import {
  SNAP_MARGIN,
  DEGREE_CONVERSION,
  USE_NATIVE_DRIVER,
} from "../constants";
import { Point, Piece } from "../types";
import { getPointsDistance } from "../util";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default ({
  piece,
  puzzleAreaDimensions,
  updateZ,
  snapPoints,
}: {
  piece: Piece;
  puzzleAreaDimensions: { puzzleAreaWidth: number; puzzleAreaHeight: number };
  updateZ: () => number;
  snapPoints: Point[];
}): JSX.Element | null => {
  const {
    href,
    pieceDimensions,
    piecePath,
    initialPlacement,
    initialRotation,
    solvedIndex,
    snapOffset,
  } = piece;

  const puzzleType = piecePath.length ? "jigsaw" : "squares";

  // these refs are only relevant if we decide to allow simultaneous drag and rotate,
  // which I feel is somewhat awkward to use

  // const moveRef = createRef<PanGestureHandler>();
  // const rotationRef = createRef<RotationGestureHandler>();
  const zIndex = useRef(new Animated.Value(0)).current;

  const pan = useRef(new Animated.ValueXY()).current;
  const lastOffset = { x: 0, y: 0 };

  const rotate = useRef(new Animated.Value(0)).current;
  const rotateStr = Animated.add(rotate, initialRotation).interpolate({
    inputRange: [-100, 100],
    outputRange: ["-100rad", "100rad"],
  });
  let lastRotate = 0;

  let isDragged = false;

  const onGestureEvent = Animated.event(
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
      // not sure if listener is performant; could possibly use this to "live limit" dragging off screen
      listener: () => {
        if (!isDragged) {
          isDragged = !isDragged;
          zIndex.setValue(updateZ());
        }
      },
    }
  );

  const onHandlerStateChange = (ev: PanGestureHandlerStateChangeEvent) => {
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      zIndex.setValue(updateZ());
      isDragged = !isDragged;
      lastOffset.x += ev.nativeEvent.translationX;
      lastOffset.y += ev.nativeEvent.translationY;

      //limit position on board
      lastOffset.x = Math.max(0 - initialPlacement.x, lastOffset.x);
      lastOffset.y = Math.max(0 - initialPlacement.y, lastOffset.y);
      lastOffset.x = Math.min(
        puzzleAreaDimensions.puzzleAreaWidth -
          pieceDimensions.width -
          initialPlacement.x,
        lastOffset.x
      );
      lastOffset.y = Math.min(
        puzzleAreaDimensions.puzzleAreaHeight -
          pieceDimensions.height -
          initialPlacement.y,
        lastOffset.y
      );
      // snap piece here using lastOffset
      const adjustedPiecePoint = {
        x: lastOffset.x + snapOffset.x,
        y: lastOffset.y + snapOffset.y,
      };

      for (let point of snapPoints) {
        const adjustedSnapPoint = {
          x: point.x - initialPlacement.x,
          y: point.y - initialPlacement.y,
        };

        if (
          getPointsDistance(adjustedSnapPoint, adjustedPiecePoint) <
          SNAP_MARGIN * Math.min(pieceDimensions.height, pieceDimensions.width)
        ) {
          lastOffset.x = adjustedSnapPoint.x - snapOffset.x;
          lastOffset.y = adjustedSnapPoint.y - snapOffset.y;
          //mark as snapped
          console.log("snap");
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
            ...pieceDimensions,
            left: initialPlacement.x,
            top: initialPlacement.y,
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
            height={pieceDimensions.height}
            width={pieceDimensions.width}
            style={[
              {
                transform: [{ rotate: rotateStr }, { perspective: 300 }],
              },
            ]}
          >
            <Defs>
              {/* for jigsaws, clip using piecePaths */}
              <ClipPath id="jigsaw">
                <Path d={piecePath} fill="white" stroke="white" />
              </ClipPath>
              <ClipPath id="squares">
                <Rect
                  fill="white"
                  stroke="white"
                  x={0}
                  y={0}
                  width={pieceDimensions.width}
                  height={pieceDimensions.height}
                />
              </ClipPath>
            </Defs>
            <Image
              href={href}
              width={pieceDimensions.width}
              height={pieceDimensions.height}
              clipPath={`url(#${puzzleType})`}
            />
            {/* <Circle fill="blue" cx={snapOffset.x} cy={snapOffset.y} r={5} /> */}
          </AnimatedSvg>
        </RotationGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};
