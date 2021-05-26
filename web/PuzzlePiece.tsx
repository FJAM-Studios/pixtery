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

  const svgRef = React.useRef<HTMLDivElement | null>(null);
  const dragStart = React.useRef({
    x: 0,
    y: 0,
    left: initialPlacement.x,
    top: initialPlacement.y,
  });

  const startDrag = (event: React.PointerEvent) => {
    if (svgRef.current) {
      const { target, clientX, clientY } = event;
      const { left, top } = svgRef.current.getBoundingClientRect();
      console.log(target);
      console.log("init", dragStart.current);
      dragStart.current.left = left - initialPlacement.x;
      dragStart.current.top = top - initialPlacement.y;
      dragStart.current.x = clientX;
      dragStart.current.y = clientY;
      window.addEventListener("pointermove", drag, false);
      window.addEventListener("pointerup", stopDrag, false);
    }
  };

  const drag = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
    if (svgRef.current) {
      svgRef.current.style.transform = `translate(${
        dragStart.current.left + clientX - dragStart.current.x
      }px, ${dragStart.current.top + clientY - dragStart.current.y}px)`;
    }
  };

  const stopDrag = () => {
    window.removeEventListener("pointermove", drag, false);
    window.removeEventListener("pointerup", stopDrag, false);
  };

  if (viewBox)
    return (
      <div
        ref={svgRef}
        onPointerDown={(ev) => startDrag(ev)}
        style={{
          width: pieceDimensions.width,
          height: pieceDimensions.height,
          position: "absolute",
          top: initialPlacement.y,
          left: initialPlacement.x,
          touchAction: "none",
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
          onDoubleClick={() => {
            setRotation(rotation + Math.PI / 2);
          }}
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
