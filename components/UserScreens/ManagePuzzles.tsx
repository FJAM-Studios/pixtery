import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { setReceivedPuzzles } from "../../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../../store/reducers/sentPuzzles";
import { RootState } from "../../types";
import {
  safelyDeletePuzzleImage,
  deactivateAllPuzzlesOnServer,
} from "../../util";
import { AdSafeAreaView } from "../Layout";

export default function ManagePuzzles(): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const [restoring, setRestoring] = useState(false);
  return (
    <AdSafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
      }}
    >
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
      >
        <Button
          icon="delete"
          mode="contained"
          disabled={receivedPuzzles.length === 0}
          onPress={async () => {
            //delete local storage
            await AsyncStorage.removeItem("@pixteryPuzzles");
            //delete local images
            for (const receivedPuzzle of receivedPuzzles) {
              //only delete a recvd puzzle image if the image isn't also in sent list
              await safelyDeletePuzzleImage(
                receivedPuzzle.imageURI,
                sentPuzzles
              );
            }
            //update app state
            dispatch(setReceivedPuzzles([]));
            deactivateAllPuzzlesOnServer("received");
            //send you to splash
          }}
          style={{ margin: 10 }}
        >
          Delete Received Puzzles
        </Button>
        <Button
          icon="delete"
          mode="contained"
          disabled={sentPuzzles.length === 0}
          onPress={async () => {
            //delete local storage
            await AsyncStorage.removeItem("@pixterySentPuzzles");
            //delete local images
            for (const sentPuzzle of sentPuzzles) {
              //only delete a sent puzzle image if the image isn't also in recvd list
              await safelyDeletePuzzleImage(
                sentPuzzle.imageURI,
                receivedPuzzles
              );
            }
            //update app state
            dispatch(setSentPuzzles([]));
            deactivateAllPuzzlesOnServer("sent");
            //send you to splash
          }}
          style={{ margin: 10 }}
        >
          Delete Sent Puzzles
        </Button>
        {/* Button for restoring all puzzles with images disabled as it was replaced with log in / log out function */}
        {/* <Button
          icon="cloud-download"
          mode="contained"
          disabled={restoring}
          onPress={async () => {
            try {
              setRestoring(true);
              const [
                mergedReceivedPuzzles,
                mergedSentPuzzles,
              ] = await restorePuzzles(receivedPuzzles, sentPuzzles);
              dispatch(setReceivedPuzzles(mergedReceivedPuzzles));
              dispatch(setSentPuzzles(mergedSentPuzzles));
              setRestoring(false);
            } catch (error) {
              setRestoring(false);
              console.log(error);
            }
          }}
          style={{ margin: 10 }}
        >
          Restore Puzzles
        </Button> */}
      </KeyboardAwareScrollView>
    </AdSafeAreaView>
  );
}
