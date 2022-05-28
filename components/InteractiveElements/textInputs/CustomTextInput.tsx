import GraphemeSplitter from "grapheme-splitter";
import { useEffect, useState } from "react";
import { View, TextInput } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { useSelector } from "react-redux";

import { RootState } from "../../../types";

export default function CustomTextInput({
  text,
  setText,
  textLimit = 70,
  initalizeWithCounter = true,
  placeHolderText,
}: {
  text: string;
  setText: (text: string) => void;
  textLimit?: number;
  initalizeWithCounter?: boolean;
  placeHolderText: string;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const height =
    useSelector((state: RootState) => state.screenHeight.height) * 0.09;
  const margin =
    useSelector((state: RootState) => state.screenHeight.height) * 0.01;
  const [textFocus, setTextFocus] = useState(false);
  const [textGraphemes, setTextGraphemes] = useState(0);
  const [showCounter, setShowCounter] = useState(initalizeWithCounter);
  const splitter = new GraphemeSplitter();
  const textDraft = textGraphemes > 0;
  const isCounterDisplayed = textFocus && showCounter;
  const atOrOverTheLimit = textGraphemes >= textLimit;
  const overTheLimit = textGraphemes > textLimit;

  useEffect(() => {
    const graphemeCount = splitter.countGraphemes(text);
    setTextGraphemes(graphemeCount);
  }, [text]);

  useEffect(() => {
    if (atOrOverTheLimit) {
      setShowCounter(true);
    }
  }, [atOrOverTheLimit]);

  useEffect(() => {
    if (overTheLimit) {
      const graphemes = splitter.splitGraphemes(text);
      const slicedGraphemes = graphemes.slice(0, textLimit).join("");
      setText(slicedGraphemes);
    }
  }, [overTheLimit]);

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
          borderWidth: textFocus ? 2.5 : 1,
          borderTopLeftRadius: theme.roundness,
          borderTopRightRadius: theme.roundness,
          borderBottomLeftRadius: isCounterDisplayed ? 0 : theme.roundness,
          borderBottomRightRadius: isCounterDisplayed ? 0 : theme.roundness,
          borderColor: theme.colors.primary,
          padding: 5,
          marginTop: 2.5,
          backgroundColor: theme.colors.background,
        }}
      >
        <TextInput
          placeholder={placeHolderText}
          multiline
          maxLength={textGraphemes >= textLimit ? text.length : textLimit * 14}
          value={text}
          onChangeText={(text) => {
            if (text[text.length - 1] !== "\n") {
              setText(text);
            }
          }}
          placeholderTextColor={theme.colors.placeholder}
          onFocus={() => setTextFocus(true)}
          onBlur={() => setTextFocus(false)}
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
          color={textDraft ? theme.colors.primary : theme.colors.disabled}
          disabled={!textDraft}
          onPress={() => {
            setText("");
          }}
        />
      </View>
      {isCounterDisplayed ? (
        <Text
          style={{
            textAlign: "right",
            alignItems: "center",
            color: overTheLimit ? theme.colors.error : theme.colors.text,
            backgroundColor: theme.colors.primary,
            borderBottomLeftRadius: theme.roundness,
            borderBottomRightRadius: theme.roundness,
            paddingRight: 5,
            paddingBottom: 2.5,
          }}
        >
          {textGraphemes}/{textLimit} characters
        </Text>
      ) : null}
    </View>
  );
}
