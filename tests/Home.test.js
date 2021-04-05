import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App.tsx';

test('Home screen renders correctly', () => {
  const tree = renderer.create(<App />).toJSON();
  expect(tree).toMatchSnapshot();
});
