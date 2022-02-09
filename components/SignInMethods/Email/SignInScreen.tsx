import { ThemeProvider } from "@react-navigation/native";
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

export default function SignInScreen({
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
  const [errors, setErrors] = useState("");
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <View>
      <Headline style={{ textAlign: "center" }}>Sign In</Headline>
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
        style={{ marginBottom: 2 }}
        placeholderTextColor={theme.colors.text}
      />
      <Button
        icon="camera-iris"
        mode="contained"
        onPress={() => onPress(email, password, null, setErrors, false)}
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
