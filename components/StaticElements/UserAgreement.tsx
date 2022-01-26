import React from "react";
import { Linking } from "react-native";
import { Text } from "react-native-paper";

export default function UserAgreements({
  buttonText,
}: {
  buttonText: string;
}): JSX.Element {
  return (
    <Text
      style={{
        textAlign: "center",
      }}
    >
      By clicking {buttonText},{"\n"} you agree to our{" "}
      <Text
        style={{
          color: "blue",
          fontWeight: "bold",
          textDecorationLine: "underline",
        }}
        onPress={() => {
          Linking.openURL("https://www.pixtery.io/terms.html");
        }}
      >
        Terms
      </Text>{" "}
      &{" "}
      <Text
        style={{
          color: "blue",
          fontWeight: "bold",
          textDecorationLine: "underline",
        }}
        onPress={() => {
          Linking.openURL("https://www.pixtery.io/privacy.html");
        }}
      >
        Privacy Policy
      </Text>
    </Text>
  );
}
