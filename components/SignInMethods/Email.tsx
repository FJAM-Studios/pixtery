import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, Subheading } from "react-native-paper";
import { useDispatch } from "react-redux";

import {
  checkAdminStatus,
  signInOnFireBase,
  signUpEmail,
} from "../../FirebaseApp";
import { setProfile } from "../../store/reducers/profile";
import { ScreenNavigation, SignInOptions } from "../../types";
import { goToScreen } from "../../util";

// for some reason, app kept crashing when I split these screens into separate components.
// figure it has something to do w/ Modals.

function SignInScreen({
  name,
  setScreen,
}: {
  name: string;
  setScreen: React.Dispatch<React.SetStateAction<string>>;
}): JSX.Element {
  const navigation = useNavigation<ScreenNavigation>();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");

  const attemptEmailSignIn = async () => {
    try {
      if (!email.length || !email.includes("@"))
        throw new Error("Valid email required");
      if (password.length < 6) throw new Error("Password too short");
      const authResult = await signInOnFireBase(
        SignInOptions.EMAIL,
        email,
        password
      );
      if (authResult) {
        const isGalleryAdmin = await checkAdminStatus(name);
        //update app state
        dispatch(setProfile({ name, isGalleryAdmin }));

        //to Home
        goToScreen(navigation, "Home");
      }
    } catch (e) {
      // @todo nicer errors
      console.log(e);
      if (e instanceof Error) setErrors(e.message);
    }
  };

  return (
    <View>
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
        onPress={attemptEmailSignIn}
        style={{ margin: 10 }}
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
          Forgot Password
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

function RegisterScreen({
  name,
  setScreen,
}: {
  name: string;
  setScreen: React.Dispatch<React.SetStateAction<string>>;
}): JSX.Element {
  const navigation = useNavigation<ScreenNavigation>();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");

  const registerAccount = async () => {
    if (!email.length || !email.includes("@"))
      throw new Error("Valid email required");
    if (password.length < 6) throw new Error("Password too short");
    try {
      const authResult = await signUpEmail(email, password);
      if (authResult) {
        const isGalleryAdmin = await checkAdminStatus(name);
        //update app state
        dispatch(setProfile({ name, isGalleryAdmin }));

        //to Home
        goToScreen(navigation, "Home");
      }
    } catch (e) {
      // @todo nicer errors
      console.log(e);
      if (e instanceof Error) setErrors(e.message);
    }
  };

  return (
    <View>
      <Subheading>Create Account</Subheading>
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
        onPress={registerAccount}
        style={{ margin: 10 }}
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

function ForgotScreen({
  name,
  setScreen,
}: {
  name: string;
  setScreen: React.Dispatch<React.SetStateAction<string>>;
}): JSX.Element {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");
  const sendReset = () => {
    console.log("reset email");
  };

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
        icon="camera-iris"
        mode="contained"
        onPress={sendReset}
        style={{ margin: 10 }}
      >
        Send Password Reset Email
      </Button>
      {errors.length ? <Text style={{ color: "red" }}>{errors}</Text> : null}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
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

export default function Email({ name }: { name: string }): JSX.Element {
  const [screen, setScreen] = useState("SignIn");
  if (screen === "Register")
    return <RegisterScreen name={name} setScreen={setScreen} />;
  if (screen === "Forgot")
    return <ForgotScreen name={name} setScreen={setScreen} />;
  return <SignInScreen name={name} setScreen={setScreen} />;
}
