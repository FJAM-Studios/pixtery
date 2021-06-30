import { registerRootComponent } from "expo";
import React from "react";
import { RootSiblingParent } from "react-native-root-siblings";
import { Provider as StoreProvider } from "react-redux";

import App from "./App";
import store from "./store";

const AppWrapper = () => {
  return (
    <StoreProvider store={store}>
      <RootSiblingParent>
        <App />
      </RootSiblingParent>
    </StoreProvider>
  );
};

registerRootComponent(AppWrapper);
