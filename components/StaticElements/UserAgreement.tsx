import { Linking } from "react-native";
import { Text } from "react-native-paper";

export default function UserAgreements({
  buttonText,
}: {
  buttonText?: string;
}): JSX.Element {
  let conditionText = buttonText
    ? `By clicking ${buttonText}`
    : `By using this app`;
  conditionText += `,\n you agree to our `;
  return (
    <Text
      style={{
        textAlign: "center",
      }}
    >
      {conditionText}
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
