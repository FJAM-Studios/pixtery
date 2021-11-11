import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import { View, Image } from "react-native";
import {
  ActivityIndicator,
  Button,
  Headline,
  IconButton,
  Text,
} from "react-native-paper";
import { useSelector } from "react-redux";

import { functions } from "../FirebaseApp";
import { GalleryReviewRoute, RootState, ScreenNavigation } from "../types";
import { downloadImage } from "../util";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

export default function GalleryReview({
  navigation,
  route,
}: {
  navigation: ScreenNavigation;
  route: GalleryReviewRoute;
}): JSX.Element {
  const { puzzle } = route.params;
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "confirm">();
  const { boardSize } = useSelector((state: RootState) => state.screenHeight);
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  useEffect(() => {
    const loadImage = async () => {
      await downloadImage(puzzle, true);
      setLoading(false);
    };
    loadImage();
  }, [puzzle]);

  return (
    <AdSafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
      }}
    >
      <Header
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignSelf: "center",
          width: boardSize,
        }}
      >
        {loading ? (
          <ActivityIndicator animating color={theme.colors.text} size="small" />
        ) : (
          <>
            <Image
              source={{
                uri:
                  FileSystem.cacheDirectory +
                  "ImageManipulator" +
                  puzzle.imageURI,
              }}
              style={{
                width: boardSize,
                height: boardSize,
              }}
            />
            <View style={{ flexDirection: "column", alignItems: "center" }}>
              <Text>Sender: {puzzle.senderName}</Text>
              <Text>Message: {puzzle.message}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text>{puzzle.gridSize}</Text>
                <IconButton
                  icon={puzzle.puzzleType === "jigsaw" ? "puzzle" : "view-grid"}
                />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IconButton
                  icon="arrow-left"
                  size={40}
                  style={{ backgroundColor: theme.colors.primary }}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate("GalleryQueue");
                  }}
                />
                <IconButton
                  icon="delete-forever"
                  size={40}
                  style={{ backgroundColor: theme.colors.primary }}
                  onPress={() => {
                    setModalVisible(true);
                    setActionType("delete");
                  }}
                />
                <IconButton
                  icon="check"
                  size={40}
                  style={{ backgroundColor: theme.colors.primary }}
                  onPress={() => {
                    setModalVisible(true);
                    setActionType("confirm");
                  }}
                />
              </View>
            </View>
          </>
        )}
        {modalVisible && !loading ? (
          <View
            style={{
              backgroundColor: theme.colors.backdrop,
              width: "80%",
              height: "80%",
              borderRadius: theme.roundness,
              position: "absolute",
              top: "10%",
              left: "10%",
              alignItems: "center",
              justifyContent: "space-evenly",
              padding: 10,
            }}
          >
            <Headline>Confirm?</Headline>
            {actionType === "delete" ? (
              <>
                <Headline style={{ textAlign: "center" }}>
                  Remove from Gallery Queue?
                </Headline>
                <IconButton
                  icon="delete-forever"
                  size={40}
                  style={{ backgroundColor: "red" }}
                  onPress={async () => {
                    const deactivateInQueue = functions.httpsCallable(
                      "deactivateInQueue"
                    );
                    const { publicKey } = puzzle;
                    setLoading(true);
                    await deactivateInQueue({ publicKey });
                    setModalVisible(false);
                    navigation.navigate("GalleryQueue", { forceReload: true });
                  }}
                />
              </>
            ) : null}
            {actionType === "confirm" ? (
              <>
                <Headline style={{ textAlign: "center" }}>
                  Add to Production Gallery and remove from Gallery Queue?
                </Headline>
                <IconButton
                  icon="check"
                  size={40}
                  style={{ backgroundColor: "green" }}
                  onPress={async () => {
                    try {
                      const addToGallery = functions.httpsCallable(
                        "addToGallery"
                      );
                      const { publicKey } = puzzle;
                      setLoading(true);
                      await addToGallery({ publicKey });
                    } catch (e) {
                      console.log(e);
                    }
                    setModalVisible(false);
                    navigation.navigate("GalleryQueue", { forceReload: true });
                  }}
                />
              </>
            ) : null}
            <Button mode="contained" onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
          </View>
        ) : null}
      </View>
    </AdSafeAreaView>
  );
}
