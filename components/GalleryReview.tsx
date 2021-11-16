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
import DateSelect from "./DateSelect";
import Header from "./Header";

export default function GalleryReview({
  navigation,
  route,
}: {
  navigation: ScreenNavigation;
  route: GalleryReviewRoute;
}): JSX.Element {
  const { puzzle, daily } = route.params;
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

  const addToCalendar = (publicKey: string, callback: () => void) => {
    return async (dailyDate: string) => {
      try {
        const addToGallery = functions.httpsCallable("addToGallery");
        setLoading(true);
        await addToGallery({ publicKey, dailyDate });
        callback();
      } catch (e) {
        console.log(e);
      }
    };
  };

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
              {daily ? <Text>Daily: {puzzle.dailyDate}</Text> : null}
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
                    if (daily) navigation.navigate("DailyCalendar");
                    else navigation.navigate("GalleryQueue");
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
                {daily ? null : (
                  <IconButton
                    icon="check"
                    size={40}
                    style={{ backgroundColor: theme.colors.primary }}
                    onPress={() => {
                      setModalVisible(true);
                      setActionType("confirm");
                    }}
                  />
                )}
              </View>
            </View>
          </>
        )}
        {modalVisible && !loading ? (
          <View
            style={{
              backgroundColor: theme.colors.backdrop,
              width: "80%",
              minHeight: "80%",
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
                  {daily
                    ? "Remove from date and move to Queue?"
                    : "Remove from Daily Puzzle Queue?"}
                </Headline>
                <IconButton
                  icon="delete-forever"
                  size={40}
                  style={{ backgroundColor: "red" }}
                  onPress={async () => {
                    const { publicKey } = puzzle;
                    setLoading(true);
                    if (daily) {
                      const removeDailyPuzzle = functions.httpsCallable(
                        "removeDailyPuzzle"
                      );
                      await removeDailyPuzzle({ publicKey });
                    } else {
                      const deactivateInQueue = functions.httpsCallable(
                        "deactivateInQueue"
                      );
                      await deactivateInQueue({ publicKey });
                    }
                    setModalVisible(false);
                    navigation.navigate("GalleryQueue", {
                      forceReload: true,
                    });
                  }}
                />
              </>
            ) : null}
            {actionType === "confirm" ? (
              <>
                <Headline style={{ textAlign: "center" }}>
                  Add to calendar and remove from Queue?
                </Headline>
                <DateSelect
                  navigation={navigation}
                  addToCalendar={addToCalendar(puzzle.publicKey, () => {
                    setModalVisible(false);
                    navigation.navigate("GalleryQueue", { forceReload: true });
                  })}
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
