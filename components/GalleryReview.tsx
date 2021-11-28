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
import {
  DailyDate,
  GalleryReviewRoute,
  RootState,
  ScreenNavigation,
  StatusOfDaily,
} from "../types";
import { downloadImage, convertDateStringToObject } from "../util";
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
  const { puzzle, statusOfDaily, publishedDate } = route.params;
  const { PUBLISHED } = StatusOfDaily;
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "confirm">();
  const { boardSize } = useSelector((state: RootState) => state.screenHeight);
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  useEffect(() => {
    setLoading(true);
    setModalVisible(false);
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
        // original dailyDate string is "YYYY-MM-DD"
        const { year, month, day } = convertDateStringToObject(dailyDate);
        await addToGallery({ publicKey, year, month, day });
        callback();
      } catch (e) {
        console.log(e);
      }
    };
  };

  const onUnmarkedDayPress = (dailyDate: string) => {
    const addPuzzle = addToCalendar(puzzle.publicKey, () => {
      setModalVisible(false);
      navigation.navigate("GalleryQueue", { forceReload: true });
    });
    addPuzzle(dailyDate);
  };

  const onMarkedDayPress = (dateString: string, markedDates: DailyDate) => {
    const { puzzle } = markedDates[dateString];
    setModalVisible(false);
    navigation.push("GalleryReview", {
      puzzle,
      // when navigating to GalleryReview from the calendar,
      // marked Daily will always be published (i.e. not under review)
      statusOfDaily: PUBLISHED,
      publishedDate: dateString,
    });
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
              {statusOfDaily === PUBLISHED ? (
                <Text>Daily: {publishedDate}</Text>
              ) : null}
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
                    navigation.goBack();
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
                {statusOfDaily === PUBLISHED ? null : (
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
                  {statusOfDaily === PUBLISHED
                    ? "Remove Daily from date and move to Queue?"
                    : "Remove from Daily Puzzle Queue?"}
                </Headline>
                <IconButton
                  icon="delete-forever"
                  size={40}
                  style={{ backgroundColor: "red" }}
                  onPress={async () => {
                    const { publicKey } = puzzle;
                    setLoading(true);
                    if (statusOfDaily === PUBLISHED && publishedDate) {
                      const removeDailyPuzzle = functions.httpsCallable(
                        "removeDailyPuzzle"
                      );
                      // publishedDate format "YYYY-MM-DD"
                      const { year, month, day } = convertDateStringToObject(
                        publishedDate
                      );
                      await removeDailyPuzzle({ publicKey, year, month, day });
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
                  onMarkedDayPress={onMarkedDayPress}
                  onUnmarkedDayPress={onUnmarkedDayPress}
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
