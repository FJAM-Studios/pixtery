import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import {
  Button,
  IconButton,
  Text,
  Surface,
  TextInput,
  Headline,
  Title,
} from "react-native-paper";
import Header from "./Header";

export default ({ navigation, theme }: { navigation: any; theme: any }) => {
  const [imageURI, setImageURI] = React.useState("");
  const [puzzleType, setPuzzleType] = React.useState("jigsaw");
  const [gridSize, setGridSize] = React.useState(3);
  const [message, setMessage] = React.useState("");
  const [senderName, setSenderName] = React.useState("");
  const [err, setErr] = React.useState("");
  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
        justifyContent: "flex-start",
      }}
    >
      <Header theme={theme} notifications={0} navigation={navigation} />
      <Headline>Enter Info Server Will Send</Headline>
      <TextInput
        placeholder="Image URL (pick a real one)"
        mode="flat"
        value={imageURI}
        onChangeText={(imageURI) => setImageURI(imageURI)}
      />
      <Text>
        When we have a server, URL will be from Pixtery, eg
        https://pixtery.com/ER6Y9.jpg.
      </Text>
      <Text>
        For now, choose URL of a reasonably sized test image such as one below,
        which you can copy/paste:
      </Text>
      <Text selectable={true} style={{ padding: 2 }}>
        https://imgur.com/uHmfGfm.jpg
      </Text>
      <TextInput
        placeholder="Sender Name"
        mode="flat"
        value={senderName}
        onChangeText={(senderName) => setSenderName(senderName)}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
        }}
      >
        <Text>Type:</Text>
        <Surface
          style={{
            padding: 8,
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor:
              puzzleType === "jigsaw"
                ? theme.colors.surface
                : theme.colors.background,
          }}
        >
          <IconButton
            icon="puzzle"
            onPress={() => {
              setPuzzleType("jigsaw");
            }}
            animated={false}
          />
        </Surface>
        <Surface
          style={{
            padding: 8,
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor:
              puzzleType === "squares"
                ? theme.colors.surface
                : theme.colors.background,
          }}
        >
          <IconButton
            icon="view-grid"
            onPress={() => {
              setPuzzleType("squares");
            }}
            animated={false}
          />
        </Surface>
        <Text>Size:</Text>
        <Surface
          style={{
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor:
              gridSize === 2 ? theme.colors.surface : theme.colors.background,
          }}
        >
          <Button
            mode="text"
            onPress={() => setGridSize(2)}
            color="white"
            compact={true}
          >
            2
          </Button>
        </Surface>
        <Surface
          style={{
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor:
              gridSize === 3 ? theme.colors.surface : theme.colors.background,
          }}
        >
          <Button
            mode="text"
            onPress={() => setGridSize(3)}
            color="white"
            compact={true}
          >
            3
          </Button>
        </Surface>
        <Surface
          style={{
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            borderRadius: theme.roundness,
            backgroundColor:
              gridSize === 4 ? theme.colors.surface : theme.colors.background,
          }}
        >
          <Button
            mode="text"
            onPress={() => setGridSize(4)}
            color="white"
            compact={true}
          >
            4
          </Button>
        </Surface>
      </View>
      <TextInput
        placeholder="Message (optional)"
        mode="outlined"
        value={message}
        onChangeText={(message) => setMessage(message)}
      />
      <Title>JSON Pixtery Server Will Send:</Title>
      <Text>
        {JSON.stringify({
          puzzleType,
          gridSize,
          senderName,
          senderPhone: "555-5555",
          imageURI,
          message,
          dateReceived: new Date().toISOString(),
          completed: false,
        })}
      </Text>
      <Button
        icon="email-open"
        mode="contained"
        onPress={() => {
          if (imageURI.length && senderName.length) {
            navigation.navigate("AddPuzzle", {
              puzzleType,
              gridSize,
              senderName,
              senderPhone: "555-5555",
              imageURI,
              message,
              dateReceived: new Date().toISOString(),
              completed: false,
            });
          } else {
            setErr("Come on. Put in a URL and name.");
          }
        }}
        style={{ margin: 10 }}
      >
        Faux Open Link In App
      </Button>
      {err.length ? <Text>{err}</Text> : null}
    </SafeAreaView>
  );
};
