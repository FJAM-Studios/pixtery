const image = require("./assets/earth.jpg");
import { Puzzle as PuzzleType } from "./types";

export const dummyPuzzles: PuzzleType[] = [
  {
    puzzleType: "jigsaw",
    gridSize: 3,
    senderName: "Tony Q",
    senderPhone: "212-111-11111",
    imageURI: image.uri,
    message: "You found the secret!",
    dateReceived: "2021-03-29T18:25:43.511Z",
    completed: false,
  },
  {
    puzzleType: "squares",
    gridSize: 2,
    senderName: "Tina Z",
    senderPhone: "212-555-5555",
    imageURI: image.uri,
    message: "Nicely done!",
    dateReceived: "2021-03-28T18:25:43.511Z",
    completed: false,
  },
  {
    puzzleType: "squares",
    gridSize: 4,
    senderName: "Bob R",
    senderPhone: "212-444-5555",
    imageURI: image.uri,
    message: "Check it out!",
    dateReceived: "2021-03-27T18:25:43.511Z",
    completed: true,
  },
];
