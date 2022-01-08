import React, { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, Subheading } from "react-native-paper";

export default function ForgotScreen({
  name,
  setScreen,
  onPress,
}: {
  name: string;
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

  return (
    <View>
      <Subheading>Forgot Password</Subheading>
      <TextInput
        autoCompleteType="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="Email Address"
        value={email}
        onChangeText={(email) => setEmail(email)}
        style={{ marginBottom: 10 }}
      />
      <Button
        icon="email"
        mode="contained"
        disabled={message.length > 0}
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
