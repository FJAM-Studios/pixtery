import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import {
  Headline,
  Text,
  Card,
  IconButton,
  ActivityIndicator,
  Button,
} from "react-native-paper";
import { useSelector } from "react-redux";

import { functions } from "../../FirebaseApp";
import {
  ScreenNavigation,
  RootState,
  Puzzle,
  GalleryQueueRoute,
  StatusOfDaily,
} from "../../types";
import { formatDateFromTimestamp } from "../../util";
import { AdSafeAreaView, Header } from "../Layout";

export default function GalleryQueue({
  navigation,
  route,
}: {
  navigation: ScreenNavigation;
  route: GalleryQueueRoute;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  // these are fixed now, but later if we want to paginate or look at inactive gallery queue listings, we can
  const [limit] = useState(10);
  const [active] = useState(true);
  const [startAt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<Puzzle[]>([]);
  const [message, setMessage] = useState("");
  const loadQueue = async () => {
    try {
      setQueue([]);
      setLoading(true);
      const getGalleryQueue = functions.httpsCallable("getGalleryQueue");
      const res = await getGalleryQueue({
        active,
        startAt,
        limit,
      });
      if (res.data.length === 0) setMessage("Nothing in Gallery Queue.");
      else {
        setMessage("");
        setQueue(res.data);
      }
    } catch (e) {
      if (e instanceof Error) {
        setMessage(e.message);
        console.log(e.message);
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    if (route.params?.forceReload) loadQueue();
  }, [route.params]);
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
          flexDirection: "column",
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
        }}
      >
        <Headline>Submission Queue</Headline>
        <Text style={{ color: "red", backgroundColor: "white" }}>
          {message}
        </Text>
        {loading ? (
          <ActivityIndicator animating color={theme.colors.text} size="small" />
        ) : (
          <>
            <Button
              icon="calendar"
              mode="contained"
              onPress={() => navigation.navigate("DailyCalendar")}
            >
              View Daily Calendar
            </Button>
            <Button
              icon="reload"
              mode="contained"
              onPress={loadQueue}
              style={{ margin: 5 }}
            >
              Reload Queue (Max {limit} Results)
            </Button>
          </>
        )}
        <ScrollView
          style={{
            width: "100%",
            flex: 1,
          }}
        >
          {queue.map((puzzle) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("GalleryReview", {
                  puzzle,
                  // when navigating from GalleryQueue to GalleryReview, daily will be under review (not published)
                  statusOfDaily: StatusOfDaily.UNDER_REVIEW,
                })
              }
              key={puzzle.publicKey}
            >
              <Card style={{ margin: 5 }}>
                <Card.Title
                  title={puzzle.message || ""}
                  subtitle={`${puzzle.senderName} - ${
                    puzzle.dateQueued
                      ? formatDateFromTimestamp(puzzle.dateQueued)
                      : null
                  }`}
                  right={() => (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text>{puzzle.gridSize}</Text>
                      <IconButton
                        icon={
                          puzzle.puzzleType === "jigsaw"
                            ? "puzzle"
                            : "view-grid"
                        }
                      />
                    </View>
                  )}
                />
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </AdSafeAreaView>
  );
}
