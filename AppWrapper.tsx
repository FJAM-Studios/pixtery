import { registerRootComponent } from "expo";
import React from "react";
import { Provider as StoreProvider } from "react-redux";

import App from "./App";
import store from "./store";

const AppWrapper = () => {
  return (
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  );
};

registerRootComponent(AppWrapper);
