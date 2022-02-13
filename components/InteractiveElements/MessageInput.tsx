import * as React from "react";
import { View, TextInput } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { useSelector } from "react-redux";

import { RootState } from "../../types";

export default function MessageInput({
  message,
  setMessage,
}: {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const height =
    useSelector((state: RootState) => state.screenHeight.height) * 0.09;
  const margin =
    useSelector((state: RootState) => state.screenHeight.height) * 0.01;
  const [messageFocus, setMessageFocus] = React.useState(false);
  const messageLimit = 70;
  const messageDraft = message.length > 0;

  return (
    <View
      style={{
        marginTop: margin,
        marginLeft: margin,
        marginRight: margin,
        maxHeight: height,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderWidth: messageFocus ? 2.5 : 1,
          borderTopLeftRadius: theme.roundness,
          borderTopRightRadius: theme.roundness,
          borderBottomLeftRadius: messageFocus ? 0 : theme.roundness,
          borderBottomRightRadius: messageFocus ? 0 : theme.roundness,
          borderColor: theme.colors.primary,
          padding: 5,
          marginTop: 2.5,
          backgroundColor: theme.colors.background,
        }}
      >
        <TextInput
          placeholder="Message (optional, reveals when solved)"
          multiline
          maxLength={messageLimit}
          value={message}
          onChangeText={(message) => setMessage(message)}
          placeholderTextColor={theme.colors.text}
          onFocus={() => setMessageFocus(true)}
          onBlur={() => setMessageFocus(false)}
          style={{
            color: theme.colors.text,
            justifyContent: "center",
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
      {messageFocus ? (
        <Text
          style={{
            textAlign: "right",
            alignItems: "center",
            backgroundColor: theme.colors.primary,
            borderBottomLeftRadius: theme.roundness,
            borderBottomRightRadius: theme.roundness,
            paddingRight: 5,
            paddingBottom: 2.5,
          }}
        >
          {message.length}/{messageLimit} characters
        </Text>
      ) : null}
    </View>
  );
}
