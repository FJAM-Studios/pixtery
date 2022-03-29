import * as Updates from "expo-updates";
import { useState, useEffect } from "react";
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

import { getGalleryQueue } from "../../FirebaseApp";
import {
  RootState,
  Puzzle,
  StatusOfDaily,
  AdminContainerProps,
} from "../../types";
import { formatDateFromString } from "../../util";
import { AdSafeAreaView } from "../Layout";

export default function GalleryQueue({
  navigation,
  route,
}: AdminContainerProps<"GalleryQueue">): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);

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
      const res = (
        await getGalleryQueue({
          active,
          startAt,
          limit,
        })
      ).data as Puzzle[];
      if (res.length === 0) setMessage("Nothing in Gallery Queue.");
      else {
        setMessage("");
        setQueue(res);
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
        <Text>Release Channel: {Updates.releaseChannel}</Text>
        <Text>ID: {Updates.updateId}</Text>
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
                      ? formatDateFromString(puzzle.dateQueued)
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
