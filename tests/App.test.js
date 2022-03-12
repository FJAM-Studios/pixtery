import { create } from "react-test-renderer";
import TestRenderer from "react-test-renderer";
import ShallowRenderer from "react-test-renderer/shallow";
import {
  render,
  fireEvent,
  getByLabelText,
} from "@testing-library/react-native";
import App, { theme } from "../App.tsx";

describe("App", () => {
  it("App screen renders correctly", () => {
    //snapshot testing
    const tree = create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
