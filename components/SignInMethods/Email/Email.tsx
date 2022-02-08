import React, { useState } from "react";

import {
  sendResetEmail,
  signInOnFireBase,
  signUpEmail,
} from "../../../FirebaseApp";
import { SignInOptions } from "../../../types";
import { isEmail } from "../../../util";
import ForgotScreen from "./ForgotScreen";
import RegisterScreen from "./RegisterScreen";
import SignInScreen from "./SignInScreen";

export default function Email({
  onFinish,
  setLoadingModalVisible,
}: {
  onFinish: () => void;
  setLoadingModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const [screen, setScreen] = useState("SignIn");

  const registerOrSignIn = async (
    email: string,
    password: string,
    confirmPassword: string | null,
    setErrors: (errors: string) => void,
    isRegister?: boolean | null
  ) => {
    setLoadingModalVisible(true);
    try {
      if (isEmail(email)) throw new Error("Valid email required");
      if (password.length < 6) throw new Error("Password too short");
      if (isRegister && confirmPassword !== password)
        throw new Error("Passwords do not match");
      if (isRegister) await signUpEmail(email, password);
      else await signInOnFireBase(SignInOptions.EMAIL, email, password);
      await onFinish();
    } catch (e) {
      // @todo nicer errors
      console.log(e);
      if (e instanceof Error) setErrors(e.message);
    }
    setLoadingModalVisible(false);
  };

  const resetPassword = async (
    email: string,
    setErrors: (errors: string) => void,
    setMessage: (message: string) => void
  ) => {
    setLoadingModalVisible(true);
    try {
      if (isEmail(email)) throw new Error("Valid email required");
      await sendResetEmail(email);
      setErrors("");
      setMessage("A link to reset your password has been sent.");
    } catch (e) {
      console.log(e);
      if (e instanceof Error) setErrors(e.message);
    }
    setLoadingModalVisible(false);
  };

  if (screen === "Register")
    return <RegisterScreen setScreen={setScreen} onPress={registerOrSignIn} />;
  if (screen === "Forgot")
    return <ForgotScreen setScreen={setScreen} onPress={resetPassword} />;
  return <SignInScreen setScreen={setScreen} onPress={registerOrSignIn} />;
}
