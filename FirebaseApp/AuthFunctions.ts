import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseError } from "firebase/app";
import {
  PhoneAuthProvider,
  initializeAuth,
  signOut as signOutFB,
  signInAnonymously,
  User,
  AuthCredential,
  EmailAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native";

import { SignInOptions } from "../types";
import { migratePuzzles, checkGalleryAdmin } from "./CloudFunctions";
import { app } from "./InitializeFirebase";

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const phoneProvider = new PhoneAuthProvider(auth);

export const signOut = (): Promise<void> => {
  return signOutFB(auth);
};

export const anonSignIn = async (): Promise<void> => {
  try {
    // Anonymous sign in. This should only fire the first time someone uses the app.
    if (!auth.currentUser) await signInAnonymously(auth);
  } catch (error) {
    console.log(error);
  }
};

export const signInOnFireBase = async (
  providerType: SignInOptions,
  id: string,
  verificationCode: string
): Promise<User> => {
  try {
    let newCredential: AuthCredential | null = null;

    if (providerType === SignInOptions.PHONE) {
      const authProvider = PhoneAuthProvider;
      newCredential = await authProvider.credential(id, verificationCode);
    }

    if (providerType === SignInOptions.EMAIL) {
      const authProvider = EmailAuthProvider;
      newCredential = await authProvider.credential(id, verificationCode);
    }

    if (!newCredential) throw new Error("Invalid sign in type.");

    // Get user credential using auth provider
    const prevUser = auth.currentUser;
    ////the below comes from https://firebase.google.com/docs/auth/web/account-linking
    // Sign in user with the account you want to link to
    const result = await signInWithCredential(auth, newCredential);
    // Merge prevUser and currentUser data stored in Firebase.
    if (prevUser && prevUser.uid !== result.user.uid)
      migratePuzzles(prevUser.uid);
    return result.user;
  } catch (error) {
    console.log(error);
    // throwing error so the Register component has an error message to display to the user.
    if (error instanceof FirebaseError) {
      if (error.code === "auth/wrong-password")
        throw new Error("Incorrect password.");
      if (error.code === "auth/user-not-found")
        throw new Error("User not found.");
      if (error.code === "auth/invalid-verification-code")
        throw new Error("Invalid verification code.");
    }
    throw new Error("Could not sign in at this time. Please try again.");
  }
};

export const signUpEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    // Get user credential using auth provider
    const prevUser = auth.currentUser;
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Merge prevUser and currentUser data stored in Firebase.
    if (prevUser && prevUser.uid !== result.user.uid)
      migratePuzzles(prevUser.uid);
    return result.user;
  } catch (error) {
    // throwing error so the Register component has an error message to display to the user.
    if (error instanceof FirebaseError) {
      if (error.code === "auth/wrong-password")
        throw new Error("Incorrect password.");
      if (error.code === "auth/user-not-found")
        throw new Error("User not found.");
    }
    throw new Error("Could not sign in at this time. Please try again.");
  }
};

export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    // get whether or not pixtery admin
    const res = await checkGalleryAdmin();
    const isGalleryAdmin = res.data;
    return isGalleryAdmin as boolean;
  } catch (e) {
    console.log("could not verify admin status");
    return false;
  }
};

export const sendResetEmail = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (e) {
    console.log(e);
    throw new Error(
      "Could not send reset email. Check email address or try again later."
    );
  }
};
