import { useState } from "react";
import { View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Subheading,
  Headline,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "../../../types";

export default function ForgotScreen({
  setScreen,
  onPress,
}: {
  setScreen: React.Dispatch<React.SetStateAction<string>>;
  onPress: (
    email: string,
    errorCallback: React.Dispatch<React.SetStateAction<string>>,
    messageCallback: React.Dispatch<React.SetStateAction<string>>
  ) => void;
}): JSX.Element {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState("");
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <View>
      <Headline style={{ textAlign: "center" }}>Forgot Password</Headline>
      <Subheading>Enter Email</Subheading>
      <TextInput
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="Email Address"
        value={email}
        onChangeText={(email) => setEmail(email)}
        style={{ marginBottom: 10 }}
        placeholderTextColor={theme.colors.text}
      />
      <Button
        icon="email"
        mode="contained"
        disabled={message.length > 0 || email.length === 0}
        onPress={() => onPress(email, setErrors, setMessage)}
        style={{ margin: 10 }}
      >
        Send Password Reset Email
      </Button>
      {errors.length ? <Text style={{ color: "red" }}>{errors}</Text> : null}
      {message.length ? (
        <Text style={{ color: "black" }}>{message}</Text>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          marginTop: 3,
        }}
      >
        <Text
          style={{ textDecorationLine: "underline", marginTop: 3 }}
          onPress={() => setScreen("SignIn")}
        >
          Back To Sign In
        </Text>
      </View>
    </View>
  );
}
