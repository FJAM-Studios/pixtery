// import React from "react";
// import { create, act } from "react-test-renderer";
// import ShallowRenderer from "react-test-renderer/shallow";
// import {
//   render,
//   fireEvent,
//   getByLabelText,
//   getByText,
// } from "@testing-library/react-native";
// import { theme } from "../App.tsx";
// import Puzzle from "../components/Puzzle";
// import {
//   Button,
//   IconButton,
//   Text,
//   Surface,
//   Headline,
//   TextInput,
// } from "react-native-paper";
// import { generateJigsawPiecePaths } from "../util";

// // other test ideas:
// // test for logging in twice?
// // test for pics and message rendering

// describe("Puzzle screen", () => {
//   let puzzleScreen;
//   let puzzleScreenInstance;

//   beforeAll(() => {
//     puzzleScreen = render(<Puzzle theme={theme} />);
//     puzzleScreenInstance = puzzleScreen.root;
//   });

//   test("Win message displays on win", () => {
//     // jest.mock("route", () => {
//     //   params: "";
//     // });
//     const route = {
//       params: { imageURI: "", puzzleType: "square", gridSize: 3, message: "" },
//     };
//     const gridSize = 3;
//     puzzleScreen = render(<Puzzle theme={theme} route={route} gridSize={3} />);

//     fireEvent(puzzleScreen, "checkWin", [0, 1, 2, 3, 4, 5, 6, 7, 8]);
//     // puzzleScreen.setCurrentBoard([0, 1, 2, 3, 4, 5, 6, 7, 8]);
//     const winMessage = puzzleScreen.getByText("Congrats");
//     expect(winMessage).toHaveLength(1);
//   });
// });
