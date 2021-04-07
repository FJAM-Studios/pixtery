import React from 'react';
import renderer from 'react-test-renderer';
import TestRenderer from 'react-test-renderer';
import ShallowRenderer from 'react-test-renderer/shallow';
import { render, fireEvent, getByLabelText } from '@testing-library/react-native';
import { theme } from '../App.tsx';
import Home from '../Home.tsx'
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
// look into pressing buttons on home screen

describe('Home screen', () => {
  test('Home screen renders correctly', () => { //snapshot testing
    const tree = renderer.create(<Home theme={theme} receivedPuzzles={[]}/>).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('has 7 children', () => {
    const tree = renderer.create(<Home theme={theme} receivedPuzzles={[]}/>).toJSON();
    expect(tree.children.length).toBe(7);
  });
  test('has 6 Buttons (excl IconButtons)', () => {
    const testRenderer = TestRenderer.create(<Home theme={theme} receivedPuzzles={[]}/>);
    const testInstance = testRenderer.root;
    const buttons = testInstance.findAllByType(Button)
    expect(buttons.length).toEqual(6)
  });
  
})
