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

export default function RegisterScreen({
  setScreen,
  onPress,
}: {
  setScreen: React.Dispatch<React.SetStateAction<string>>;
  onPress: (
    email: string,
    password: string,
    confirmPassword: string | null,
    errorCallback: React.Dispatch<React.SetStateAction<string>>,
    isRegister: boolean
  ) => void;
}): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState("");
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <View>
      <Headline style={{ textAlign: "center" }}>Create Account</Headline>
      <Subheading>Enter Email and Password</Subheading>
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
      <TextInput
        placeholder="Password"
        returnKeyType="done"
        textContentType="password"
        secureTextEntry
        value={password}
        onChangeText={(t) => setPassword(t)}
        style={{ marginBottom: 10 }}
        placeholderTextColor={theme.colors.text}
      />
      <TextInput
        placeholder="Confirm Password"
        returnKeyType="done"
        textContentType="password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(t) => setConfirmPassword(t)}
        style={{ marginBottom: 10 }}
        placeholderTextColor={theme.colors.text}
      />
      <Button
        icon="account"
        mode="contained"
        onPress={() =>
          onPress(email.trim(), password, confirmPassword, setErrors, true)
        }
        style={{ margin: 10 }}
        disabled={email.length === 0 || password.length === 0}
      >
        Create Account
      </Button>
      {errors.length ? <Text style={{ color: "red" }}>{errors}</Text> : null}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 3,
        }}
      >
        <Text
          style={{ textDecorationLine: "underline" }}
          onPress={() => setScreen("SignIn")}
        >
          Back To Sign In
        </Text>
      </View>
    </View>
  );
}
