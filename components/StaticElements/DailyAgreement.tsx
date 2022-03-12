import { Linking, View } from "react-native";
import { Text } from "react-native-paper";

export default function DailyAgreement(): JSX.Element {
  return (
    <View
      style={{
        marginTop: 10,
      }}
    >
      <Text
        style={{
          textAlign: "center",
        }}
      >
        Before submitting, please make sure your Pixtery is appropriate for all
        audiences.
      </Text>
      <Text
        style={{
          textAlign: "center",
          marginTop: 10,
        }}
      >
        Read the
        <Text
          style={{
            color: "blue",
            fontWeight: "bold",
            textDecorationLine: "underline",
          }}
          onPress={() => {
            Linking.openURL("https://www.pixtery.io/community.html");
          }}
        >
          Community Guidelines
        </Text>{" "}
        to learn more.
      </Text>
    </View>
  );
}
