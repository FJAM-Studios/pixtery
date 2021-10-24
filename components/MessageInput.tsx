import * as React from "react";
import { View } from "react-native";
import { Surface, Text, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { setMessage } from "../store/reducers/message";
import { PixteryTheme, RootState } from "../types";

export default function MessageInput({
  height,
  theme,
}: {
  height: number;
  theme: PixteryTheme;
}): JSX.Element {
  const dispatch = useDispatch();
  const messageLimit = 70;
  const message = useSelector((state: RootState) => state.message);
  const [textFocus, setTextFocus] = React.useState(false);

  return (
    <View>
      <Surface>
        <Text style={{ textAlign: "right" }}>
            {message.length}/{messageLimit} characters
        </Text>
        <TextInput
            placeholder="Message (optional, shows when solved)"
            multiline
            maxLength={messageLimit}
            mode="outlined"
            value={message}
            onChangeText={(message) => dispatch(setMessage(message))}
            onFocus={() => setTextFocus(true)}
            onBlur={() => setTextFocus(false)}
            outlineColor={theme.colors.primary}
            placeholderTextColor={theme.colors.primary}
            style={{
            minHeight: height,
            justifyContent: "center",
            }}
        />  
        </Surface>
    </View>
  );
}
