import React from 'react';
import renderer from 'react-test-renderer';
import TestRenderer from 'react-test-renderer';
import { View, useWindowDimensions } from "react-native";
import ShallowRenderer from 'react-test-renderer/shallow';
import { render, fireEvent, getByLabelText } from '@testing-library/react-native';
import App, { theme } from '../App.tsx';
import Home from '../Home.tsx'
import {
  Button,
  IconButton,
  Text,
  Surface,
  Headline,
  TextInput,
} from "react-native-paper";
const emptyImage = require("../assets/blank.jpg");

// need to shallow render
describe('App', () => {
  it('App screen renders correctly', () => { //snapshot testing
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  }); 
})
// look at expo guide https://docs.expo.io/guides/testing-with-jest/
