import React, { useState } from "react";

import {
  sendResetEmail,
  signInOnFireBase,
  signUpEmail,
} from "../../FirebaseApp";
import { SignInOptions } from "../../types";
import { isEmail } from "../../util";
import ForgotScreen from "./ForgotScreen";
import RegisterScreen from "./RegisterScreen";
import SignInScreen from "./SignInScreen";

export default function Email({
  onFinish,
  url,
}: {
  onFinish: () => void;
  url?: string;
}): JSX.Element {
  const [screen, setScreen] = useState("SignIn");

  const attemptEmailSignIn = async (
    email: string,
    password: string,
    setErrors: (errors: string) => void
  ) => {
    try {
      if (isEmail(email)) throw new Error("Valid email required");
      if (password.length < 6) throw new Error("Password too short");
      await signInOnFireBase(SignInOptions.EMAIL, email, password);
      onFinish();
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
      await signUpEmail(email, password);
      onFinish();
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
    return <RegisterScreen setScreen={setScreen} onPress={registerAccount} />;
  if (screen === "Forgot")
    return <ForgotScreen setScreen={setScreen} onPress={resetPassword} />;
  return <SignInScreen setScreen={setScreen} onPress={attemptEmailSignIn} />;
}
