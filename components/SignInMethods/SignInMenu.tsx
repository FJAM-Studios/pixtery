import React from "react";
import { Button } from "react-native-paper";

import { SignInOptions } from "../../types";

export default function SignInMenu({
  onPress,
}: {
  onPress: Function;
}): JSX.Element {
  return (
    <>
      <Button
        icon="email"
        mode="contained"
        onPress={() => onPress(SignInOptions.EMAIL)}
        style={{ margin: 10 }}
      >
        Sign In / Register By Email
      </Button>
      <Button
        icon="phone"
        mode="contained"
        onPress={() => onPress(SignInOptions.PHONE)}
        style={{ margin: 10 }}
      >
        Sign In / Register By Phone
      </Button>
    </>
  );
}
