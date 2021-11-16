import * as React from "react";
import { View } from "react-native";
import { IconButton, Text, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { setMessage } from "../store/reducers/message";
import { PixteryTheme, RootState } from "../types";

export default function MessageInput({
  height,
  margin,
  theme,
}: {
  height: number;
  margin: number;
  theme: PixteryTheme;
}): JSX.Element {
  const dispatch = useDispatch();
  const message = useSelector((state: RootState) => state.message);
  const messageLimit = 70;
  const messageDraft = message.length > 0;

  return (
    <View
      style={{
        marginTop: margin,
        marginLeft: margin,
        marginRight: margin,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: height * 0.25,
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
          <IconButton
            icon="delete-circle-outline"
            style={{
              margin: 0,
            }}
            size={20}
            color={messageDraft ? theme.colors.primary : theme.colors.disabled}
            disabled={!messageDraft}
            onPress={() => {
              dispatch(setMessage(""));
            }}
          />
        </View>
      </View>
      <TextInput
        placeholder="Congrats! You solved the puzzle!"
        multiline
        maxLength={messageLimit}
        mode="outlined"
        value={message}
        onChangeText={(message) => dispatch(setMessage(message))}
        outlineColor={theme.colors.primary}
        placeholderTextColor={theme.colors.primary}
        style={{
          minHeight: height * 0.75,
          marginTop: 0,
          justifyContent: "center",
        }}
      />
    </View>
  );
}
