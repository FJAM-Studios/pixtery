import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Image, View } from "react-native";
import {
  Button,
  IconButton,
  Text,
  Surface,
  Headline,
  TextInput,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { setTutorialFinished } from "../store/reducers/tutorialFinished";
import { ScreenNavigation, RootState } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

const emptyImage = require("../assets/blank.jpg");

export default function Tutorial({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const { height, boardSize } = useSelector(
    (state: RootState) => state.screenHeight
  );
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const [step, setStep] = useState(0);
  const dispatch = useDispatch();

  const headlines = [
    "Welcome To Pixtery!",
    "Step 1:",
    "Step 2:",
    "Step 3:",
    "Step 4:",
  ];
  const instructions = [
    "Touch Start to learn how to use the app or Skip if you're ready to go!",
    "Snap a pic or choose one from your photo gallery",
    "Choose your puzzle type and size",
    "Enter an optional secret message to be revealed when the puzzle is solved",
    "Send your Pixtery to a friend!",
    "Touch the Menu to view sent and received Pixteries, your profile, the Pixtery Gallery and more!",
  ];
  const finishTutorial = async () => {
    await AsyncStorage.setItem(
      "@tutorialFinished",
      JSON.stringify({ tutorialFinished: true })
    );
    setStep(0);
    dispatch(setTutorialFinished(true));
    navigation.navigate("Home");
  };
  return (
    <AdSafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: height * 0.015,
        backgroundColor: theme.colors.background,
        justifyContent: "space-between",
      }}
    >
      {/* transparent overlay */}
      <View
        style={{
          position: "absolute",
          width: "120%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      />
      <Header
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
        headerStep={step === 5}
      />

      {/* instructions */}
      <View
        style={{
          width: "80%",
          position: "absolute",
          top: height * 0.14,
          alignSelf: "center",
          zIndex: 3,
        }}
      >
        <Surface
          style={{
            padding: height * 0.03,
            height: height * 0.15,
            borderRadius: theme.roundness,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
          }}
        >
          {step === 5 ? null : (
            <Headline style={{ textAlign: "center" }}>
              {headlines[step]}
            </Headline>
          )}
          <Text style={{ textAlign: "center" }}>{instructions[step]}</Text>
        </Surface>

        <Button
          style={{
            margin: 20,
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.onSurface,
          }}
          onPress={() => {
            if (step === 5) finishTutorial();
            else setStep(step + 1);
          }}
        >
          <Text>
            {step === 0 ? "Start Tutorial" : step === 5 ? "Finish!" : "Next"}
          </Text>
        </Button>

        {step === 0 ? null : (
          <Button
            style={{
              marginHorizontal: 20,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
            }}
            onPress={() => setStep(step - 1)}
          >
            <Text>Previous</Text>
          </Button>
        )}
      </View>

      {/* skip tutorial button */}
      {step === 0 ? (
        <Button
          style={{
            position: "absolute",
            top: height * 0.75,
            alignSelf: "center",
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.onSurface,
            zIndex: 3,
          }}
          onPress={finishTutorial}
        >
          <Text>Skip Tutorial</Text>
        </Button>
      ) : null}
      <View
        style={{
          alignSelf: "center",
          alignItems: "center",
          zIndex: 0,
        }}
      >
        <Surface
          style={{
            padding: height * 0.0065,
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.accent,
          }}
        >
          <Image
            source={emptyImage}
            style={{
              width: boardSize / 1.6,
              height: boardSize / 1.6,
              alignSelf: "center",
            }}
          />
          <Headline>Choose an Image</Headline>
        </Surface>
      </View>
      <View style={{ zIndex: step === 1 ? 3 : 0 }}>
        <Button
          icon="camera"
          mode="contained"
          style={{ margin: height * 0.01 }}
        >
          Camera
        </Button>
      </View>
      <View style={{ zIndex: step === 1 ? 3 : 0 }}>
        <Button
          icon="folder"
          mode="contained"
          style={{ margin: height * 0.01 }}
        >
          Gallery
        </Button>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          zIndex: step === 2 ? 3 : 0,
        }}
      >
        <Text>Type:</Text>
        <Surface
          style={{
            padding: height * 0.01,
            height: height * 0.06,
            width: height * 0.06,
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.background,
          }}
        >
          <IconButton icon="puzzle" animated={false} />
        </Surface>
        <Surface
          style={{
            padding: height * 0.01,
            height: height * 0.06,
            width: height * 0.06,
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.background,
          }}
        >
          <IconButton icon="view-grid" />
        </Surface>
        <Text>Size:</Text>
        <Surface
          style={{
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.background,
          }}
        >
          <Button mode="text" color="white" compact>
            2
          </Button>
        </Surface>
        <Surface
          style={{
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.background,
          }}
        >
          <Button mode="text" color="white" compact>
            3
          </Button>
        </Surface>
        <Surface
          style={{
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.background,
          }}
        >
          <Button mode="text" color="white" compact>
            4
          </Button>
        </Surface>
      </View>
      <TextInput
        placeholder="Message (optional, shows when solved)"
        multiline
        disabled
        mode="outlined"
        style={{
          minHeight: height * 0.09,
          justifyContent: "center",
          zIndex: step === 3 ? 3 : 0,
        }}
      />
      <View style={{ zIndex: step === 4 ? 3 : 0 }}>
        <Button icon="send" mode="contained" style={{ margin: height * 0.01 }}>
          Send
        </Button>
      </View>
    </AdSafeAreaView>
  );
}
