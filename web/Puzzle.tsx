import * as React from "react";

import { DEGREE_CONVERSION, TESTING_MODE } from "../constants";
import {
  fillArray,
  generateJigsawPiecePaths,
  getInitialDimensions,
  shuffle,
} from "../puzzleUtils";
import { Puzzle as PuzzleType, Piece } from "../types";
import PuzzlePiece from "./PuzzlePiece";

//disable shuffling for testing
const disableShuffle = TESTING_MODE;

export default function Puzzle({
  puzzle,
}: {
  puzzle: PuzzleType;
}): JSX.Element {
  const [height, setHeight] = React.useState(0);
  const [solved, setSolved] = React.useState(false);
  const [pieces, setPieces] = React.useState<Piece[]>([]);

  React.useEffect(() => {
    const boardSize =
      0.95 * Math.min(window.innerWidth, window.innerHeight * 0.5);
    setHeight(boardSize);
    const { gridSize, puzzleType, imageURI } = puzzle;
    const squareSize = boardSize / gridSize;
    const numPieces = gridSize * gridSize;
    const minSandboxY = boardSize * 1.05;
    const maxSandboxY = window.innerHeight - squareSize;

    const shuffleOrder = shuffle(fillArray(gridSize), disableShuffle);

    const _pieces: Piece[] = [];
    const piecePaths =
      puzzleType === "jigsaw"
        ? generateJigsawPiecePaths(gridSize, squareSize, true)
        : [];
    // manipulate images in Puzzle component instead to save on renders
    for (let shuffledIndex = 0; shuffledIndex < numPieces; shuffledIndex++) {
      const solvedIndex = shuffleOrder[shuffledIndex];
      const {
        pieceDimensions,
        initialPlacement,
        viewBox,
        snapOffset,
      } = getInitialDimensions(
        puzzleType,
        minSandboxY,
        maxSandboxY,
        solvedIndex,
        shuffledIndex,
        gridSize,
        squareSize,
        boardSize
      );

      const href = imageURI;

      const piece: Piece = {
        href,
        pieceDimensions,
        piecePath: piecePaths.length ? piecePaths[solvedIndex] : "",
        initialPlacement,
        initialRotation: Math.floor(Math.random() * 4) * 90 * DEGREE_CONVERSION,
        solvedIndex,
        snapOffset,
        viewBox,
      };

      piece.initialPlacement.x += (window.innerWidth - boardSize) / 2;
      _pieces.push(piece);
    }
    setPieces(_pieces);
  }, [puzzle]);

  return (
    <div id="game" style={{ height: 0.95 * window.innerHeight }}>
      <div id="banner" style={{ width: height }}>
        <img src="pixtery.svg" style={{ width: height / 3 }} alt="Pixtery!" />
        <img
          src="app-store.svg"
          style={{
            marginLeft: "auto",
            height: height / 12,
          }}
          alt="Pixtery!"
        />
        <img
          src="play-store.svg"
          style={{
            height: height / 12,
          }}
          alt="Pixtery!"
        />
      </div>
      <div id="board" style={{ width: height, height }}>
        <h3>Drag pieces onto the board!</h3>
        <h3>Double tap a piece to rotate!</h3>
      </div>
      {pieces.length
        ? pieces.map((piece, ix) => (
            <PuzzlePiece key={ix} piece={piece} scaleFactor={height / 1080} />
          ))
        : null}
      {solved ? <h1>{puzzle.message}</h1> : null}
    </div>
  );
}
