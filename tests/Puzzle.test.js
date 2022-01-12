import React, { useState } from "react";
import { create, act } from "react-test-renderer";
import ShallowRenderer from "react-test-renderer/shallow";
import {
  render,
  fireEvent,
  getByLabelText,
  getByText,
  update,
  rerender,
  cleanup,
} from "@testing-library/react-native";
import { theme } from "../App.tsx";
import Puzzle from "../components/Puzzle/Puzzle";
import {
  Button,
  IconButton,
  Text,
  Surface,
  Headline,
  TextInput,
} from "react-native-paper";
import { generateJigsawPiecePaths } from "../util";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import Header from "../components/Header";

// other test ideas:
// test for logging in twice?
// test for pics and message rendering

describe("Puzzle screen", () => {
  let puzzleScreen;
  let puzzleScreenInstance;

  beforeAll(() => {
    puzzleScreen = render(
      <Puzzle
        theme={theme}
        route={{ params: { gridSize: 3 } }}
        receivedPuzzles={[]}
      />
    );
    puzzleScreenInstance = puzzleScreen.root;
  });
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });
  // afterEach(cleanup);

  test("Win message displays on win", () => {
    const realUseState = React.useState;
    const piecePaths = [];
    const puzzleAreaDimensions = {
      puzzleAreaWidth: 0,
      puzzleAreaHeight: 0,
    };
    const gridSections = {
      rowDividers: [],
      colDividers: [],
    };
    const shuffledPieces = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const currentBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const winMessage = "";
    const errorMessage = "";
    const firstSnap = false;

    // React.useState = jest
    //   .spyOn(React, "useState")
    //   .mockImplementationOnce(() => realUseState(piecePaths))
    //   .mockImplementationOnce(() => realUseState(puzzleAreaDimensions))
    //   .mockImplementationOnce(() => realUseState(gridSections))
    //   .mockImplementationOnce(() => realUseState(shuffledPieces))
    //   .mockImplementationOnce(() => realUseState(currentBoard));

    React.useState = jest
      .fn()
      .mockReturnValueOnce([piecePaths, {}])
      .mockReturnValueOnce([puzzleAreaDimensions, {}])
      .mockReturnValueOnce([gridSections, {}])
      .mockReturnValueOnce([shuffledPieces, {}])
      .mockReturnValueOnce([currentBoard, {}])
      .mockReturnValueOnce([winMessage, {}])
      .mockReturnValueOnce([errorMessage, {}])
      .mockReturnValueOnce([firstSnap, {}]);
    // React.useState = jest
    //   .fn()
    //   .mockReturnValueOnce([[], {}])
    //   .mockReturnValueOnce([{}, {}])
    //   .mockReturnValueOnce([{}, {}])
    //   .mockReturnValueOnce([[], {}])
    //   .mockReturnValueOnce([[], {}])
    //   .mockReturnValueOnce(["", {}])
    //   .mockReturnValueOnce(["", {}])
    //   .mockReturnValueOnce([false, {}]);

    jest.mock("../components/Header");
    const { getByText, update } = render(
      <Puzzle
        theme={theme}
        route={{ params: { gridSize: 3 } }}
        receivedPuzzles={[
          {
            puzzleType: "",
            gridSize: 3,
            senderName: "",
            senderPhone: "",
            imageURI: "",
            publicKey: "",
            message: null,
            dateReceived: "",
            completed: false,
          },
        ]}
      />
    );

    // update(
    //   <Puzzle
    //     theme={theme}
    //     route={{ params: { gridSize: 3 } }}
    //     receivedPuzzles={[]}
    //   />
    // );
    // // jest.mock("route", () => {
    //   params: "";
    // });
    // const route = {
    //   params: { imageURI: "", puzzleType: "square", gridSize: 3, message: "" },
    // };
    // const gridSize = 3;
    // puzzleScreen = render(
    //   <Puzzle theme={theme} route={{ params: "" }} gridSize={3} />
    // );
    // container.currentBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // container.props.setCurrentBoard([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    // puzzleScreen.setCurrentBoard([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    // fireEvent(container, "setCurrentBoard", [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    // puzzleScreen.setCurrentBoard([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const winMessageResult = getByText("Congrats");
    expect(winMessageResult).toHaveLength(1);
  });
});
