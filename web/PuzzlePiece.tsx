import { useState, useRef } from "react";

import { DEFAULT_IMAGE_SIZE, SNAP_MARGIN } from "../constants";
import { getPointsDistance, snapAngle } from "../puzzleUtils";
import { BoardSpace, Piece, Point } from "../types";

export default function PuzzlePiece({
  piece,
  scaleFactor,
  updateZ,
  snapPoints,
  currentBoard,
  checkWin,
  boardRef,
}: {
  piece: Piece;
  scaleFactor: number;
  updateZ: () => number;
  snapPoints: Point[];
  currentBoard: BoardSpace[];
  checkWin: () => void;
  boardRef: HTMLDivElement | null;
}): JSX.Element {
  const {
    viewBox,
    pieceDimensions,
    piecePath,
    solvedIndex,
    initialPlacement,
    initialRotation,
    snapOffset,
  } = piece;
  const href = piece.href as string;

  const [rotation, setRotation] = useState(initialRotation);

  const pivot = {
    x: snapOffset.x / pieceDimensions.width,
    y: snapOffset.y / pieceDimensions.height,
  };

  const pieceRef = useRef<HTMLDivElement | null>(null);
  const position = useRef({
    _x: 0,
    _y: 0,
    left: initialPlacement.x,
    top: initialPlacement.y,
  });
  const zIndex = useRef(0);

  const startDrag = (event: React.PointerEvent) => {
    if (pieceRef.current) {
      const { clientX, clientY } = event;
      const { left, top } = pieceRef.current.getBoundingClientRect();
      position.current.left = left - initialPlacement.x;
      position.current.top = top - initialPlacement.y;
      position.current._x = clientX;
      position.current._y = clientY;
      zIndex.current = updateZ();
      pieceRef.current.style.zIndex = "" + zIndex.current;
      window.addEventListener("pointermove", drag, false);
      window.addEventListener("pointerup", stopDrag, false);
    }
  };

  const drag = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
    if (pieceRef.current) {
      pieceRef.current.style.transform = `translate(${
        position.current.left + clientX - position.current._x
      }px, ${position.current.top + clientY - position.current._y}px)`;
    }
  };

  const stopDrag = ({
    clientX,
    clientY,
  }: {
    clientX: number;
    clientY: number;
  }) => {
    if (pieceRef.current && boardRef) {
      const { left, top } = pieceRef.current.getBoundingClientRect();
      position.current.left = left - initialPlacement.x;
      position.current.top = top - initialPlacement.y;
      position.current._x = clientX;
      position.current._y = clientY;

      const adjustedPiecePoint = {
        x: initialPlacement.x + position.current.left + snapOffset.x,
        y: initialPlacement.y + position.current.top + snapOffset.y,
      };

      let notSnapped = true;
      //check for snap
      for (let pointIndex = 0; pointIndex < snapPoints.length; pointIndex++) {
        const point = snapPoints[pointIndex];

        const adjustedSnapPoint = {
          x: point.x + boardRef.offsetLeft,
          y: point.y + boardRef.offsetTop,
        };
        if (
          getPointsDistance(adjustedSnapPoint, adjustedPiecePoint) <
          SNAP_MARGIN * Math.min(pieceDimensions.height, pieceDimensions.width)
        ) {
          const blockingPieces = currentBoard.filter(
            (pos) =>
              pos &&
              pos.pointIndex === pointIndex &&
              pos.solvedIndex !== solvedIndex
          );
          if (blockingPieces.length) break;

          position.current.left +=
            adjustedSnapPoint.x - adjustedPiecePoint.x + 2;
          position.current.top +=
            adjustedSnapPoint.y - adjustedPiecePoint.y + 2;
          pieceRef.current.style.transform = `translate(${
            position.current.left + clientX - position.current._x
          }px, ${position.current.top + clientY - position.current._y}px)`;

          notSnapped = false;

          const spliceIx = currentBoard.findIndex(
            (pos) => pos && pos.solvedIndex === solvedIndex
          );
          if (spliceIx > -1) currentBoard.splice(spliceIx, 1);
          //add to current board at current point index
          currentBoard.push({
            pointIndex,
            solvedIndex,
            rotation,
          });
          checkWin();
          break;
        }

        //remove from current board if not snapped
        if (notSnapped) {
          const spliceIx = currentBoard.findIndex(
            (pos) => pos && pos.solvedIndex === solvedIndex
          );
          if (spliceIx > -1) currentBoard.splice(spliceIx, 1);
        }
      }
      window.removeEventListener("pointermove", drag, false);
      window.removeEventListener("pointerup", stopDrag, false);
    }
  };

  const rotatePiece = () => {
    const newAngle = snapAngle(rotation + Math.PI / 2);
    setRotation(newAngle);
    //if it's snapped in, update rotation on the board
    const matchingPieces = currentBoard.filter(
      (pos) => pos && pos.solvedIndex === solvedIndex
    );
    if (matchingPieces.length) {
      const matchingPiece = matchingPieces[0];
      matchingPiece.rotation = newAngle;
    }

    checkWin();
  };

  if (viewBox)
    return (
      <div
        ref={pieceRef}
        onPointerDown={(ev) => startDrag(ev)}
        style={{
          width: pieceDimensions.width,
          height: pieceDimensions.height,
          position: "absolute",
          top: initialPlacement.y,
          left: initialPlacement.x,
          touchAction: "none",
          zIndex: zIndex.current,
        }}
      >
        <svg
          width={pieceDimensions.width}
          height={pieceDimensions.height}
          viewBox={`
        ${viewBox.originX}
        ${viewBox.originY}
        ${pieceDimensions.width}
        ${pieceDimensions.height}
        `}
          onDoubleClick={rotatePiece}
          style={{
            transformOrigin: `${pieceDimensions.width * pivot.x}px ${
              pieceDimensions.height * pivot.y
            }px`,
            transform: `rotate(${rotation}rad)`,
          }}
        >
          <clipPath id={`jigsaw${solvedIndex}`}>
            <path d={piecePath} />
          </clipPath>

          <image
            id="piece"
            href={href}
            width={DEFAULT_IMAGE_SIZE.width * scaleFactor}
            height={DEFAULT_IMAGE_SIZE.height * scaleFactor}
            clipPath={piecePath.length ? `url(#jigsaw${solvedIndex})` : ""}
          />
        </svg>
      </div>
    );
  else return <div />;
}
