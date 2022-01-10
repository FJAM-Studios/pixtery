import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import {
  checkAdminStatus,
  sendResetEmail,
  signInOnFireBase,
  signUpEmail,
} from "../../FirebaseApp";
import { setProfile } from "../../store/reducers/profile";
import { ScreenNavigation, SignInOptions } from "../../types";
import { goToScreen, isEmail } from "../../util";
import ForgotScreen from "./ForgotScreen";
import RegisterScreen from "./RegisterScreen";
import SignInScreen from "./SignInScreen";

export default function Email({
  name,
  setModalVisible,
}: {
  name: string;
  setModalVisible?: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const navigation = useNavigation<ScreenNavigation>();
  const dispatch = useDispatch();

  const [screen, setScreen] = useState("SignIn");

  const attemptEmailSignIn = async (
    email: string,
    password: string,
    setErrors: (errors: string) => void
  ) => {
    try {
      if (isEmail(email)) throw new Error("Valid email required");
      if (password.length < 6) throw new Error("Password too short");
      const authResult = await signInOnFireBase(
        SignInOptions.EMAIL,
        email,
        password
      );
      if (authResult) {
        const isGalleryAdmin = await checkAdminStatus(name);
        //update app state
        dispatch(
          setProfile({ name, isGalleryAdmin, loginMethod: SignInOptions.EMAIL })
        );

        // if from profile page, don't nav, just set modal invisible:
        if (setModalVisible) {
          setModalVisible(false);
        } else {
          //to Home
          goToScreen(navigation, "Home");
        }
      }
    } catch (e) {
      // @todo nicer errors
      console.log(e);
      if (e instanceof Error) setErrors(e.message);
    }
  };

  const registerAccount = async (
    email: string,
    password: string,
    confirmPassword: string,
    setErrors: (errors: string) => void
  ) => {
    try {
      if (isEmail(email)) throw new Error("Valid email required");
      if (password.length < 6) throw new Error("Password too short");
      if (confirmPassword !== password)
        throw new Error("Passwords do not match");
      const authResult = await signUpEmail(email, password);
      if (authResult) {
        const isGalleryAdmin = await checkAdminStatus(name);
        //update app state
        dispatch(
          setProfile({ name, isGalleryAdmin, loginMethod: SignInOptions.EMAIL })
        );

        // if from profile page, don't nav, just set modal invisible:
        if (setModalVisible) {
          setModalVisible(false);
        } else {
          //to Home
          goToScreen(navigation, "Home");
        }
      }
    } catch (e) {
      // @todo nicer errors
      console.log(e);
      if (e instanceof Error) setErrors(e.message);
    }
  };

  const resetPassword = async (
    email: string,
    setErrors: (errors: string) => void,
    setMessage: (message: string) => void
  ) => {
    try {
      if (isEmail(email)) throw new Error("Valid email required");
      await sendResetEmail(email);
      setErrors("");
      setMessage("A link to reset your password has been sent.");
    } catch (e) {
      console.log(e);
      if (e instanceof Error) setErrors(e.message);
    }
  };

  if (screen === "Register")
    return (
      <RegisterScreen
        name={name}
        setScreen={setScreen}
        onPress={registerAccount}
      />
    );
  if (screen === "Forgot")
    return (
      <ForgotScreen name={name} setScreen={setScreen} onPress={resetPassword} />
    );
  return (
    <SignInScreen
      name={name}
      setScreen={setScreen}
      onPress={attemptEmailSignIn}
    />
  );
}
