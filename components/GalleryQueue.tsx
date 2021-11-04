import moment from "moment";
import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import {
  Headline,
  Text,
  Card,
  IconButton,
  ActivityIndicator,
  Button,
  TextInput,
} from "react-native-paper";
import { useSelector } from "react-redux";

import { functions } from "../FirebaseApp";
import { PUBLIC_KEY_LENGTH } from "../constants";
import {
  ScreenNavigation,
  RootState,
  Puzzle,
  GalleryQueueRoute,
} from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

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
  const [limit, setLimit] = useState(10);
  const [active, setActive] = useState(true);
  const [startAt, setStartAt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<Puzzle[]>([]);
  const [message, setMessage] = useState("");
  const [publicKey, setPublicKey] = useState<string>();
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
        <Headline>Gallery Queue</Headline>
        <Text style={{ color: "red", backgroundColor: "white" }}>
          {message}
        </Text>

        <ScrollView
          style={{
            width: "100%",
          }}
        >
          {loading ? (
            <ActivityIndicator
              animating
              color={theme.colors.text}
              size="small"
            />
          ) : (
            <Button
              icon="reload"
              mode="contained"
              onPress={loadQueue}
              style={{ margin: 5 }}
            >
              Reload Queue (Max {limit} Results)
            </Button>
          )}
          {queue.map((puzzle) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("GalleryReview", {
                  puzzle,
                })
              }
              key={puzzle.publicKey}
            >
              <Card style={{ margin: 5 }}>
                <Card.Title
                  title={puzzle.message || ""}
                  subtitle={
                    puzzle.senderName +
                    " - " +
                    moment(puzzle.dateReceived).calendar()
                  }
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
        <View
          style={{
            flexDirection: "row",
            position: "absolute",
            bottom: 10,
            alignItems: "center",
          }}
        >
          <TextInput
            placeholder="Submit a Pixtery publicKey to Gallery Queue"
            mode="outlined"
            style={{ flex: 1 }}
            value={publicKey}
            onChangeText={(t) => setPublicKey(t)}
          />
          <IconButton
            icon="arrow-up-bold-circle"
            onPress={async () => {
              const addToQueue = functions.httpsCallable("addToQueue");
              if (publicKey && publicKey.length === PUBLIC_KEY_LENGTH) {
                try {
                  await addToQueue({ publicKey });
                  loadQueue();
                } catch (e) {
                  if (e instanceof Error) {
                    setMessage(e.message);
                    console.log(e.message);
                  }
                }
                setPublicKey("");
              } else {
                setMessage(
                  `Pixtery publicKey is ${PUBLIC_KEY_LENGTH} characters.`
                );
              }
            }}
          />
        </View>
      </View>
    </AdSafeAreaView>
  );
}
