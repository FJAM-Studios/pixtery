import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { LayoutRectangle, View } from "react-native";
import {
  Button,
  Text,
  Surface,
  Headline,
  IconButton,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { setTutorialFinished } from "../store/reducers/tutorialFinished";
import { RootState } from "../types";

export default function Tutorial({
  height,
  cameraButtonLayout,
  headerLayout,
  imageLayout,
  galleryButtonLayout,
  settingsLayout,
  textLayout,
  sendHeight,
}: {
  height: number;
  cameraButtonLayout: LayoutRectangle;
  headerLayout: LayoutRectangle;
  imageLayout: LayoutRectangle;
  galleryButtonLayout: LayoutRectangle;
  settingsLayout: LayoutRectangle;
  textLayout: LayoutRectangle;
  sendHeight: number;
}): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const adHeight = useSelector((state: RootState) => state.adHeight);
  const [step, setStep] = React.useState(0);
  const [pointerHeight, setPointerHeight] = React.useState(0);
  const finishTutorial = async () => {
    await AsyncStorage.setItem(
      "@tutorialFinished",
      JSON.stringify({ tutorialFinished: true })
    );
    setStep(0);
    dispatch(setTutorialFinished(true));
  };
  return (
    <View
      style={{
        position: "absolute",
        width: "120%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.15)",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {step === 0 ? (
        <>
          <Surface
            style={{
              padding: height * 0.033,
              width: "60%",
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
            }}
          >
            <Headline style={{ textAlign: "center" }}>
              Welcome to Pixtery!
            </Headline>
          </Surface>
          <Button
            mode="contained"
            style={{
              margin: height * 0.07,
              padding: height * 0.033,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
            }}
            onPress={() => setStep(step + 1)}
          >
            <Text>Next</Text>
          </Button>
          <Button
            mode="contained"
            style={{
              padding: height * 0.01,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
            }}
            onPress={finishTutorial}
          >
            <Text>Skip Tutorial</Text>
          </Button>
        </>
      ) : null}

      {step === 1 ? (
        <>
          <Surface
            style={{
              padding: height * 0.033,
              width: "60%",
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              top: height * 0.15,
            }}
          >
            <Headline style={{ textAlign: "center" }}>Step 1:</Headline>
            <Text style={{ textAlign: "center" }}>
              Snap a pic or choose one from your photo gallery
            </Text>
          </Surface>
          <IconButton
            icon="arrow-down-bold"
            style={{
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              top:
                headerLayout.height +
                imageLayout.height +
                cameraButtonLayout.height +
                // galleryButtonLayout.height +
                -pointerHeight +
                height * 0.02,
            }}
            onLayout={(ev) => {
              setPointerHeight(ev.nativeEvent.layout.height);
            }}
          />
          <Button
            mode="contained"
            style={{
              padding: height * 0.01,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              bottom: adHeight,
              left: "20%",
            }}
            onPress={() => setStep(step - 1)}
          >
            <Text>Previous</Text>
          </Button>
          <Button
            mode="contained"
            style={{
              padding: height * 0.01,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              bottom: adHeight,
              right: "20%",
            }}
            onPress={() => setStep(step + 1)}
          >
            <Text>Next</Text>
          </Button>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <Surface
            style={{
              padding: height * 0.033,
              width: "60%",
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              top: height * 0.15,
            }}
          >
            <Headline style={{ textAlign: "center" }}>Step 2:</Headline>
            <Text style={{ textAlign: "center" }}>
              Choose your puzzle type and size
            </Text>
          </Surface>
          <IconButton
            icon="arrow-down-bold"
            style={{
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              left: "30%",
              top:
                headerLayout.height +
                imageLayout.height +
                cameraButtonLayout.height +
                galleryButtonLayout.height +
                settingsLayout.height +
                -pointerHeight +
                height * 0.04,
            }}
            onLayout={(ev) => {
              setPointerHeight(ev.nativeEvent.layout.height);
            }}
          />
          <IconButton
            icon="arrow-down-bold"
            style={{
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              right: "20%",
              top:
                headerLayout.height +
                imageLayout.height +
                cameraButtonLayout.height +
                galleryButtonLayout.height +
                settingsLayout.height +
                -pointerHeight +
                height * 0.04,
            }}
            onLayout={(ev) => {
              setPointerHeight(ev.nativeEvent.layout.height);
            }}
          />
          <Button
            mode="contained"
            style={{
              padding: height * 0.01,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              bottom: adHeight,
              left: "20%",
            }}
            onPress={() => setStep(step - 1)}
          >
            <Text>Previous</Text>
          </Button>
          <Button
            mode="contained"
            style={{
              padding: height * 0.01,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              bottom: adHeight,
              right: "20%",
            }}
            onPress={() => setStep(step + 1)}
          >
            <Text>Next</Text>
          </Button>
        </>
      ) : null}
      {step === 3 ? (
        <>
          <Surface
            style={{
              padding: height * 0.033,
              width: "60%",
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              top: height * 0.15,
            }}
          >
            <Headline style={{ textAlign: "center" }}>Step 3:</Headline>
            <Text style={{ textAlign: "center" }}>
              Enter an optional secret message to be revealed when the puzzle is
              solved
            </Text>
          </Surface>
          <IconButton
            icon="arrow-down-bold"
            style={{
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              top:
                headerLayout.height +
                imageLayout.height +
                cameraButtonLayout.height +
                galleryButtonLayout.height +
                settingsLayout.height +
                textLayout.height +
                -pointerHeight +
                height * 0.04,
            }}
            onLayout={(ev) => {
              setPointerHeight(ev.nativeEvent.layout.height);
            }}
          />
          <Button
            mode="contained"
            style={{
              padding: height * 0.01,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              bottom: adHeight,
              left: "20%",
            }}
            onPress={() => setStep(step - 1)}
          >
            <Text>Previous</Text>
          </Button>
          <Button
            mode="contained"
            style={{
              padding: height * 0.01,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              bottom: adHeight,
              right: "20%",
            }}
            onPress={() => setStep(step + 1)}
          >
            <Text>Next</Text>
          </Button>
        </>
      ) : null}
      {step === 4 ? (
        <>
          <Surface
            style={{
              padding: height * 0.033,
              width: "60%",
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              top: height * 0.15,
            }}
          >
            <Headline style={{ textAlign: "center" }}>Step 4:</Headline>
            <Text style={{ textAlign: "center" }}>
              Send your Pixtery to a friend!
            </Text>
          </Surface>
          <Button
            mode="contained"
            style={{
              margin: height * 0.07,
              padding: height * 0.01,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
            }}
            onPress={() => setStep(step + 1)}
          >
            <Text>Next</Text>
          </Button>
          <Button
            mode="contained"
            style={{
              padding: height * 0.01,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
            }}
            onPress={() => setStep(step - 1)}
          >
            <Text>Previous</Text>
          </Button>
          <IconButton
            icon="arrow-down-bold"
            style={{
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              top:
                headerLayout.height +
                imageLayout.height +
                cameraButtonLayout.height +
                galleryButtonLayout.height +
                settingsLayout.height +
                textLayout.height +
                sendHeight -
                pointerHeight +
                height * 0.08,
            }}
            onLayout={(ev) => {
              setPointerHeight(ev.nativeEvent.layout.height);
            }}
          />
        </>
      ) : null}
      {step === 5 ? (
        <>
          <Surface
            style={{
              padding: height * 0.033,
              width: "60%",
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              top: height * 0.15,
            }}
          >
            <Text style={{ textAlign: "center" }}>
              View sent and received Pixteries, your profile, the Pixtery
              Gallery and more!
            </Text>
          </Surface>
          <Button
            mode="contained"
            style={{
              margin: height * 0.07,
              padding: height * 0.01,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
            }}
            onPress={finishTutorial}
          >
            <Text>Finish!</Text>
          </Button>
          <Button
            mode="contained"
            style={{
              padding: height * 0.01,
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
            }}
            onPress={() => setStep(step - 1)}
          >
            <Text>Previous</Text>
          </Button>
          <IconButton
            icon="arrow-up-bold"
            style={{
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.onSurface,
              position: "absolute",
              top: headerLayout.height + pointerHeight,
              right: "10%",
            }}
            onLayout={(ev) => {
              setPointerHeight(ev.nativeEvent.layout.height);
            }}
          />
        </>
      ) : null}
    </View>
  );
}
