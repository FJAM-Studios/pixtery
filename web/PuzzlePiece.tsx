import * as React from "react";

import { DEFAULT_IMAGE_SIZE } from "../constants";
import { Piece } from "../types";

export default function PuzzlePiece({
  piece,
  scaleFactor,
}: {
  piece: Piece;
  scaleFactor: number;
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

  const [rotation, setRotation] = React.useState(initialRotation);

  const pivot = {
    x: snapOffset.x / pieceDimensions.width,
    y: snapOffset.y / pieceDimensions.height,
  };

  if (viewBox)
    return (
      <svg
        width={pieceDimensions.width}
        height={pieceDimensions.height}
        viewBox={`
        ${viewBox.originX}
        ${viewBox.originY}
        ${pieceDimensions.width}
        ${pieceDimensions.height}
        `}
        onDoubleClick={() => {
          setRotation(rotation + Math.PI / 2);
        }}
        style={{
          position: "absolute",
          top: initialPlacement.y,
          left: initialPlacement.x,
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
    );
  else return <div />;
}
