import React, { useState } from "react";
import { View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Subheading,
  Headline,
} from "react-native-paper";

export default function SignInScreen({
  name,
  setScreen,
  onPress,
}: {
  name: string;
  setScreen: React.Dispatch<React.SetStateAction<string>>;
  onPress: (
    email: string,
    password: string,
    errorCallback: React.Dispatch<React.SetStateAction<string>>
  ) => void;
}): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");

  return (
    <View>
      <Headline style={{ textAlign: "center" }}>Sign In</Headline>
      <Subheading>Enter Email and Password</Subheading>
      <TextInput
        autoCompleteType="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="Email Address"
        value={email}
        onChangeText={(email) => setEmail(email)}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        returnKeyType="done"
        textContentType="password"
        secureTextEntry
        value={password}
        onChangeText={(t) => setPassword(t)}
        style={{ marginBottom: 2 }}
      />
      <Button
        icon="camera-iris"
        mode="contained"
        onPress={() => onPress(email, password, setErrors)}
        style={{ margin: 10 }}
        disabled={email.length === 0 || password.length === 0}
      >
        Sign In
      </Button>
      {errors.length ? <Text style={{ color: "red" }}>{errors}</Text> : null}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 3,
        }}
      >
        <Text
          style={{ textDecorationLine: "underline" }}
          onPress={() => setScreen("Forgot")}
        >
          Forgot Password?
        </Text>
        <Text
          style={{ textDecorationLine: "underline" }}
          onPress={() => setScreen("Register")}
        >
          Create an Account
        </Text>
      </View>
    </View>
  );
}
