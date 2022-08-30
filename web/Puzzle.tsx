import { useState, useEffect, useRef } from "react";

import { DEGREE_CONVERSION, TESTING_MODE } from "../constants";
import {
  fillArray,
  generateJigsawPiecePaths,
  getInitialDimensions,
  getSnapPoints,
  shuffle,
  validateBoard,
} from "../puzzleUtils";
import { Puzzle as PuzzleType, Piece, Point, BoardSpace } from "../types";
import PuzzlePiece from "./PuzzlePiece";
import StoreLinks from "./StoreLinks";

//disable shuffling for testing
const disableShuffle = TESTING_MODE;

export default function Puzzle({
  puzzle,
  startSolved,
}: {
  puzzle: PuzzleType;
  startSolved: boolean;
}): JSX.Element {
  const [height, setHeight] = useState(0);
  const [solved, setSolved] = useState(startSolved);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [snapPoints, setSnapPoints] = useState<Point[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);
  // when a piece is moved, it is given new maxZ through updateZ function below
  const maxZ = useRef(0);

  const updateZ = () => {
    maxZ.current += 1;
    return maxZ.current;
  };

  // store current pieces snapped to board
  const currentBoard = useRef<BoardSpace[]>([]);

  const checkWin = () => {
    console.log(currentBoard.current);
    if (validateBoard(currentBoard.current, puzzle.gridSize)) {
      setSolved(true);
    }
  };

  useEffect(() => {
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
    setSnapPoints(getSnapPoints(gridSize, squareSize));
  }, [puzzle]);

  return (
    <div id="game" style={{ height: 0.95 * window.innerHeight }}>
      <div id="banner" style={{ width: height }}>
        <img src="/pixtery.svg" style={{ width: height / 3 }} alt="Pixtery!" />
        <StoreLinks height={height} />
      </div>
      {solved ? (
        <>
          <div
            id="board"
            style={{
              width: height,
              height,
              backgroundImage: `url(${puzzle.imageURI})`,
              backgroundSize: `${height}px ${height}px`,
            }}
          />
          {puzzle.senderName && puzzle.senderName.length ? (
            <h4 id="web-sender-name">created by:{puzzle.senderName}</h4>
          ) : null}
          <div
            id="callToAction"
            style={{ marginLeft: "auto", marginRight: "auto", width: height }}
          >
            <h2 id="web-win-message">
              {puzzle.message && puzzle.message.length
                ? puzzle.message
                : "Congrats! You solved the puzzle!"}
            </h2>

            <h3 id="callToAction-text">
              Download the Pixtery app to send your own puzzle!
            </h3>
            <StoreLinks />
          </div>
        </>
      ) : (
        <>
          <div id="board" style={{ width: height, height }} ref={boardRef}>
            <h3>Drag pieces onto the board!</h3>
            <h3>Double tap a piece to rotate!</h3>
          </div>
          {pieces.length
            ? pieces
                // .slice(0, 1)
                .map((piece, ix) => (
                  <PuzzlePiece
                    key={ix}
                    piece={piece}
                    scaleFactor={height / 1080}
                    updateZ={updateZ}
                    snapPoints={snapPoints}
                    currentBoard={currentBoard.current}
                    checkWin={checkWin}
                    boardRef={boardRef.current}
                  />
                ))
            : null}
        </>
      )}
    </div>
  );
}
