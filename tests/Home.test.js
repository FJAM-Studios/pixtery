import React from "react";
import { create, act } from "react-test-renderer";
import ShallowRenderer from "react-test-renderer/shallow";
import {
  render,
  fireEvent,
  getByLabelText,
} from "@testing-library/react-native";
import { theme } from "../App.tsx";
import Home from "../components/Home";
import {
  Button,
  IconButton,
  Text,
  Surface,
  Headline,
  TextInput,
} from "react-native-paper";

// other test ideas:
// test for logging in twice?
// test for pics and message rendering

describe("Home screen", () => {
  let homeScreen;
  let homeScreenInstance;

  beforeAll(() => {
    homeScreen = create(<Home theme={theme} receivedPuzzles={[]} />);
    homeScreenInstance = homeScreen.root;
  });

  test("Home screen renders correctly", () => {
    //snapshot testing
    expect(homeScreen.toJSON()).toMatchSnapshot();
  });

  test("has 7 children", () => {
    expect(homeScreen.toJSON().children.length).toBe(7);
  });

  test("has 6 Buttons (excluding puzzle type buttons)", () => {
    const buttons = homeScreenInstance.findAllByType(Button);
    expect(buttons.length).toEqual(6);
  });
  // could also test the 4 grid button
  test("button for two grids is highlighted when pressed, and three grid button fades to background", () => {
    const buttons = homeScreenInstance.findAllByType(Button);
    // button.props.children includes text
    const twoGridButton = buttons.filter((button) =>
      button.props.children.includes("2")
    );
    const threeGridButton = buttons.filter((button) =>
      button.props.children.includes("3")
    );

    // When testing, code that causes React state updates should be wrapped into act(...):
    act(() => {
      twoGridButton[0].props.onPress();
    });

    // Button is wrapped in Surface element where color is defined
    const surfaceForTwoButton = twoGridButton[0].parent;
    const surfaceForThreeButton = threeGridButton[0].parent;
    expect(surfaceForTwoButton.props.style.backgroundColor).toBe(
      theme.colors.surface
    );
    expect(surfaceForThreeButton.props.style.backgroundColor).toBe(
      theme.colors.background
    );
  });
});
