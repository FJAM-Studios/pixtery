import { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, Button, Headline } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { anonSignIn } from "../../FirebaseApp";
import { RootStackScreenProps, RootState, SignInOptions } from "../../types";
import { goToScreen } from "../../util";
import SignInMenu from "../SignInMethods/SignInMenu";
import SignInModal from "../SignInMethods/SignInModal";
import { LoadingModal, Logo, Title, UserAgreements } from "../StaticElements";

export default function CreateProfile({
  navigation,
  route,
}: RootStackScreenProps<"CreateProfile">): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [signInType, setSignInType] = useState<SignInOptions | null>(null);

  const signIn = (signInType: SignInOptions) => {
    switch (signInType) {
      case SignInOptions.ANON:
        signInAnonymously();
        break;
      case SignInOptions.EMAIL:
        signInWithEmail();
        break;
      case SignInOptions.PHONE:
        signInWithPhone();
        break;
    }
  };

  const signInAnonymously = async () => {
    setLoadingModalVisible(true);
    try {
      await anonSignIn();
      goToScreen(navigation, "EnterName", {
        url: route.params.url,
      });
    } catch (e) {
      console.log("error signing in anonymously");
    }
    setLoadingModalVisible(false);
  };

  const signInWithEmail = async () => {
    setModalVisible(true);
    setSignInType(SignInOptions.EMAIL);
  };

  const signInWithPhone = async () => {
    setModalVisible(true);
    setSignInType(SignInOptions.PHONE);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          flexDirection: "column",
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Logo width="100" height="100" />
        <Title width="100" height="35" />
      </View>
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        <Headline style={{ textAlign: "center" }}>Welcome to Pixtery!</Headline>

        <SignInMenu onPress={signIn} />
        <Text style={{ textAlign: "center" }}>
          Signing in allows you to submit Daily Pixteries and access your
          account across devices.{"\n\n"}
          If you don&apos;t want to create an account now, you can register
          later from the Profile menu.
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "grey" }} />
          <View>
            <Text style={{ marginHorizontal: 20, textAlign: "center" }}>
              or
            </Text>
          </View>
          <View style={{ flex: 1, height: 1, backgroundColor: "gray" }} />
        </View>
        <Button
          icon="camera-iris"
          mode="contained"
          onPress={() => signIn(SignInOptions.ANON)}
          style={{ margin: 10 }}
        >
          Continue Without Sign In
        </Button>
        <UserAgreements />
      </KeyboardAwareScrollView>
      <SignInModal
        isVisible={modalVisible}
        setModalVisible={setModalVisible}
        setLoadingModalVisible={setLoadingModalVisible}
        signInType={signInType}
        url={route.params.url}
      />
      <LoadingModal isVisible={loadingModalVisible} />
    </SafeAreaView>
  );
}
