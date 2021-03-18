import * as React from "react";
import { View, Text, Button } from "react-native";

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
        margin: 100,
      }}
    >
      <Text>Pick A Puzzle Type</Text>
      <Button title="Squares" onPress={() => navigation.navigate("Squares")} />
      <Button title="Jigsaw" onPress={() => navigation.navigate("Jigsaw")} />
    </View>
  );
}
