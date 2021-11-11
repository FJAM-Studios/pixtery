import * as ImageManipulator from "expo-image-manipulator";
import React, { useRef } from "react";
import { Animated } from "react-native";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import { Svg, Image, Defs, ClipPath, Path, Rect } from "react-native-svg";
import { useSelector } from "react-redux";

import {
  DEGREE_CONVERSION,
  SNAP_MARGIN,
  USE_NATIVE_DRIVER,
} from "../constants";
import { getPointsDistance, snapAngle } from "../puzzleUtils";
import { Point, Piece, BoardSpace, RootState } from "../types";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default function PuzzlePiece({
  piece,
  puzzleAreaDimensions,
  updateZ,
  snapPoints,
  currentBoard,
  checkWin,
  lowerBound,
}: {
  piece: Piece;
  puzzleAreaDimensions: { puzzleAreaWidth: number; puzzleAreaHeight: number };
  updateZ: () => number;
  snapPoints: Point[];
  currentBoard: BoardSpace[];
  checkWin: () => void;
  lowerBound: number;
}): JSX.Element {
  const {
    pieceDimensions,
    piecePath,
    initialPlacement,
    initialRotation,
    solvedIndex,
    snapOffset,
  } = piece;
  const href = piece.href as ImageManipulator.ImageResult;
  const puzzleType = piecePath.length ? "jigsaw" : "squares";

  const zIndex = useRef(new Animated.Value(0)).current;

  const pan = useRef(new Animated.ValueXY()).current;
  const lastOffset = { x: 0, y: 0 };

  const rotate = useRef(new Animated.Value(0)).current;
  const rotateStr = Animated.add(rotate, initialRotation).interpolate({
    inputRange: [-100, 100],
    outputRange: ["-100rad", "100rad"],
  });
  let lastRotate = 0;
  const pivot = {
    x: snapOffset.x / pieceDimensions.width,
    y: snapOffset.y / pieceDimensions.height,
  };
  const profile = useSelector((state: RootState) => state.profile);
  const sound = useSelector((state: RootState) => state.sound);

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
      lastOffset.x = Math.max(
        0 - initialPlacement.x - pieceDimensions.width * 0.5,
        lastOffset.x
      );
      lastOffset.y = Math.max(
        0 - initialPlacement.y - pieceDimensions.height * 0.5,
        lastOffset.y
      );
      lastOffset.x = Math.min(
        pieceDimensions.width * 0.5 +
          puzzleAreaDimensions.puzzleAreaWidth -
          pieceDimensions.width -
          initialPlacement.x,
        lastOffset.x
      );
      lastOffset.y = Math.min(
        lowerBound - pieceDimensions.height * 0.5 - initialPlacement.y,
        lastOffset.y
      );
      // snap piece here using lastOffset, adjust for centered snapping points
      const adjustedPiecePoint = {
        x: lastOffset.x + snapOffset.x,
        y: lastOffset.y + snapOffset.y,
      };

      let notSnapped = true;
      // loop through possible snap points
      for (let pointIndex = 0; pointIndex < snapPoints.length; pointIndex++) {
        const point = snapPoints[pointIndex];

        const adjustedSnapPoint = {
          x: point.x - initialPlacement.x,
          y: point.y - initialPlacement.y,
        };

        if (
          getPointsDistance(adjustedSnapPoint, adjustedPiecePoint) <
          SNAP_MARGIN * Math.min(pieceDimensions.height, pieceDimensions.width)
        ) {
          // check if there's a different piece on the board at that point index
          // and, if so, break loop
          const blockingPieces = currentBoard.filter(
            (pos) =>
              pos &&
              pos.pointIndex === pointIndex &&
              pos.solvedIndex !== solvedIndex
          );
          if (blockingPieces.length) break;

          lastOffset.x = adjustedSnapPoint.x - snapOffset.x;
          lastOffset.y = adjustedSnapPoint.y - snapOffset.y;

          notSnapped = false;
          // remove from current board if already snapped elsewhere
          // must be done w in-place array methods
          const spliceIx = currentBoard.findIndex(
            (pos) => pos && pos.solvedIndex === solvedIndex
          );
          if (spliceIx > -1) currentBoard.splice(spliceIx, 1);
          //add to current board at current point index
          const rotation = (lastRotate + initialRotation) % (Math.PI * 2);
          currentBoard.push({ pointIndex, solvedIndex, rotation });
          checkWin();
          if (!profile.noSound) playSnapSound();
          break;
        }
      }
      //remove from current board if not snapped
      if (notSnapped) {
        const spliceIx = currentBoard.findIndex(
          (pos) => pos && pos.solvedIndex === solvedIndex
        );
        if (spliceIx > -1) currentBoard.splice(spliceIx, 1);
      }
      pan.setOffset(lastOffset);
      pan.setValue({ x: 0, y: 0 });
    }
  };

  const onTapHandlerStateChange = (ev: TapGestureHandlerStateChangeEvent) => {
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      lastRotate += 90 * DEGREE_CONVERSION;
      Animated.timing(rotate, {
        toValue: lastRotate,
        duration: 150,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start(() => {
        lastRotate = snapAngle(lastRotate);
        rotate.setValue(lastRotate);
      });

      //if it's snapped in, update rotation on the board
      const matchingPieces = currentBoard.filter(
        (pos) => pos && pos.solvedIndex === solvedIndex
      );
      if (matchingPieces.length) {
        const matchingPiece = matchingPieces[0];
        const rotation = (lastRotate + initialRotation) % (Math.PI * 2);
        matchingPiece.rotation = rotation;
      }
      checkWin();
      if (!profile.noSound) playSnapSound();
    }
  };

  const playSnapSound = async () => {
    await sound?.replayAsync();
  };

  return (
    <PanGestureHandler
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
            zIndex,
          },
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
      >
        <TapGestureHandler
          onHandlerStateChange={onTapHandlerStateChange}
          numberOfTaps={2}
        >
          <AnimatedSvg
            height={pieceDimensions.height}
            width={pieceDimensions.width}
            style={[
              {
                transform: [
                  { perspective: 300 },
                  { translateY: pieceDimensions.height * (pivot.y - 0.5) },
                  { translateX: pieceDimensions.width * (pivot.x - 0.5) },
                  { rotate: rotateStr },
                  { translateX: pieceDimensions.width * (0.5 - pivot.x) },
                  { translateY: pieceDimensions.height * (0.5 - pivot.y) },
                ],
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
          </AnimatedSvg>
        </TapGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
}
