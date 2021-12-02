import * as FileSystem from "expo-file-system";
import moment from "moment";
import * as React from "react";
import { useState } from "react";
import {
  ImageBackground,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  ActivityIndicator,
  Button,
  Card,
  Checkbox,
  Headline,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";
import Toast from "react-native-root-toast";
import { useSelector } from "react-redux";
import shortid from "shortid";

import { functions } from "../FirebaseApp";
import { ScreenNavigation, RootState } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

export default function AddToGallery({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const { height } = useSelector((state: RootState) => state.screenHeight);
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publicKey, setPublicKey] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [anonymousChecked, setAnonymousChecked] = useState(true);

  return (
    <AdSafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
        justifyContent: "flex-start",
      }}
    >
      <Header
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      {modalVisible ? (
        <KeyboardAwareScrollView
          resetScrollToCoords={{ x: 0, y: 0 }}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={Platform.OS === "ios" ? 0 : height * 0.2}
          enableOnAndroid
          style={{
            backgroundColor: theme.colors.backdrop,
            flex: 1,
            // width: "100%",
            // height: "100%",
            borderRadius: theme.roundness,
            // position: "absolute",

            padding: 10,
          }}
          contentContainerStyle={{
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator
              animating
              color={theme.colors.text}
              size="large"
            />
          ) : (
            <>
              <Headline>Confirm?</Headline>
              <Text style={{ textAlign: "center" }}>
                This is legalese that says we can use your Pixtery. But also we
                might not.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignContent: "center",
                  margin: 10,
                }}
              >
                <Checkbox
                  status={anonymousChecked ? "checked" : "unchecked"}
                  color={theme.colors.surface}
                  onPress={() => {
                    setAnonymousChecked(!anonymousChecked);
                  }}
                />
                <Text>
                  Submit Anonymously (Your Pixtery name will not be included)
                </Text>
              </View>
              <View
                style={{
                  // flexDirection: "row",
                  alignContent: "center",
                  margin: 10,
                }}
              >
                <Text>Edit secret message:</Text>
                <TextInput
                  multiline
                  maxLength={70}
                  mode="outlined"
                  value={message}
                  onChangeText={(message) => setMessage(message)}
                  outlineColor={theme.colors.primary}
                  placeholderTextColor={theme.colors.primary}
                  style={{ justifyContent: "center", width: "100%" }}
                />
              </View>
              <Button
                mode="contained"
                icon="cancel"
                onPress={() => {
                  setPublicKey("");
                  setMessage("");
                  setModalVisible(false);
                }}
                style={{
                  margin: 10,
                }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                icon="check"
                onPress={async () => {
                  setLoading(true);
                  const addToQueue = functions.httpsCallable("addToQueue");
                  try {
                    const newPublicKey: string = shortid.generate();
                    await addToQueue({
                      publicKey,
                      anonymousChecked,
                      message,
                      newPublicKey,
                    });
                    Toast.show(
                      "Thanks for your submission! The Pixtery team will review soon!",
                      {
                        duration: Toast.durations.LONG,
                        position: Toast.positions.CENTER,
                      }
                    );
                  } catch (e) {
                    if (e instanceof Error) {
                      console.log(e.message);
                    }
                    Toast.show("We're sorry, something went wrong :(", {
                      duration: Toast.durations.LONG,
                      position: Toast.positions.CENTER,
                    });
                  }
                  navigation.navigate("Gallery");
                  setLoading(false);
                  setModalVisible(false);
                }}
              >
                Submit To Daily Pixtery
              </Button>
            </>
          )}
        </KeyboardAwareScrollView>
      ) : (
        <ScrollView>
          <Headline style={{ alignSelf: "center", textAlign: "center" }}>
            Choose A Puzzle
          </Headline>
          <Text style={{ alignSelf: "center", textAlign: "center" }}>
            Edit secret message after selecting
          </Text>
          <>
            {sentPuzzles.length ? (
              sentPuzzles.map((sentPuzzle, ix) => (
                <TouchableOpacity
                  onPress={() => {
                    setPublicKey(sentPuzzle.publicKey);
                    setMessage(sentPuzzle.message || "");
                    setModalVisible(true);
                  }}
                  key={ix}
                >
                  <Card
                    style={{
                      margin: 1,
                      backgroundColor: theme.colors.surface,
                    }}
                  >
                    <Card.Title
                      title={sentPuzzle.message || ""}
                      subtitle={moment(sentPuzzle.dateReceived).calendar()}
                      right={() => (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text>{sentPuzzle.gridSize}</Text>
                          <IconButton
                            icon={
                              sentPuzzle.puzzleType === "jigsaw"
                                ? "puzzle"
                                : "view-grid"
                            }
                          />
                        </View>
                      )}
                      left={() => (
                        <ImageBackground
                          source={{
                            uri:
                              FileSystem.documentDirectory +
                              sentPuzzle.imageURI,
                          }}
                          style={{
                            flex: 1,
                            justifyContent: "space-around",
                            padding: 1,
                          }}
                        />
                      )}
                    />
                  </Card>
                </TouchableOpacity>
              ))
            ) : (
              <View
                style={{
                  alignItems: "center",
                }}
              >
                <Headline>You haven&apos;t sent any puzzles!</Headline>
              </View>
            )}
          </>
        </ScrollView>
      )}
    </AdSafeAreaView>
  );
}
