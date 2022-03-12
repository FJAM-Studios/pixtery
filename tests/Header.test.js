import { create, act } from "react-test-renderer";
import TestRenderer from "react-test-renderer";
import ShallowRenderer from "react-test-renderer/shallow";
import {
  render,
  fireEvent,
  getByLabelText,
} from "@testing-library/react-native";
import Header from "../components/Layout/Header";
import Home from "../components/Layout/Header";
import { theme } from "../App.tsx";
import { TouchableWithoutFeedback } from "react-native";

describe("Header", () => {
  let header;
  let headerInstance;
  beforeAll(() => {
    header = create(<Header theme={theme} />);
    headerInstance = header.root;
  });

  test("Header renders correctly", () => {
    //snapshot testing
    expect(header.toJSON()).toMatchSnapshot();
  });

  // in progress to test whether menu opens correctly
  // test('menu opens', () => {
  //   const menuButton = headerInstance.findByType(TouchableWithoutFeedback)

  //   // When testing, code that causes React state updates should be wrapped into act(...):
  //   act(() => {
  //     menuButton.props.onPress();
  //   });

  //   homeScreen = create(<Home theme={theme} receivedPuzzles={[]}/>);
  //   homeScreenInstance = homeScreen.root;

  //   console.log(header.toJSON())
  //   // Button is wrapped in Surface element where color is defined
  //   expect(header.toJSON()).toBe(theme.colors.surface)
  // })
});
