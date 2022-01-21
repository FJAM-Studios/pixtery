import * as React from "react";
import { View, TextInput } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { useSelector } from "react-redux";

import { RootState } from "../../types";

export default function MessageInput({
  style,
  message,
  setMessage,
}: {
  style: {
    height: number;
    margin: number;
  };
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const [messageFocus, setMessageFocus] = React.useState(false);
  const messageLimit = 70;
  const messageDraft = message.length > 0;

  return (
    <View
      style={{
        marginTop: style.margin,
        marginLeft: style.margin,
        marginRight: style.margin,
        maxHeight: style.height,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            textAlign: "left",
          }}
        >
          Secret Message:
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              textAlign: "right",
            }}
          >
            {message.length}/{messageLimit} characters
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          borderWidth: messageFocus ? 2.5 : 1,
          borderRadius: theme.roundness,
          borderColor: theme.colors.primary,
          padding: 5,
          marginTop: 2.5,
        }}
      >
        <TextInput
          placeholder="Congrats! You solved the puzzle!"
          multiline
          maxLength={messageLimit}
          value={message}
          onChangeText={(message) => setMessage(message)}
          placeholderTextColor={theme.colors.primary}
          onFocus={() => setMessageFocus(true)}
          onBlur={() => setMessageFocus(false)}
          style={{
            color: theme.colors.text,
            margin: 0,
            justifyContent: "center",
            backgroundColor: theme.colors.background,
            width: "90%",
          }}
        />
        <IconButton
          icon="close-circle-outline"
          style={{
            margin: 0,
          }}
          color={messageDraft ? theme.colors.primary : theme.colors.disabled}
          disabled={!messageDraft}
          onPress={() => {
            setMessage("");
          }}
        />
      </View>
    </View>
  );
}
