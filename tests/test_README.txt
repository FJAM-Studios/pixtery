Testing learnings so far...please augment

npm run test

Resources
Jest: https://jestjs.io/docs/api
- snapshot testing will take a snapshot of component and compare if there were any changes made, to avoid any unexpected changed to UI

React Native tests: https://reactnative.dev/docs/testing-overview - decent intro

expo-jest: https://docs.expo.io/guides/testing-with-jest/

React Test Renderer: https://reactjs.org/docs/test-renderer.html
- Renders components to JSON etc and has helpful finders e.g. findAll().
  MaterialUI / react-native-paper elements render differently than native elements. 
  I think I was able to find Button in react-native-paper via findAllByType

React native testing library: https://callstack.github.io/react-native-testing-library/
- My understanding is that this is (kind of) a substitute for Enzyme
  has fireEvent and query APIs