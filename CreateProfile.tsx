import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Headline, Text, TextInput, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Logo from "./Logo";
import Title from "./Title";

import { Profile as ProfileType } from "./types";
import { View } from "react-native";

export default ({
  theme,
  profile,
  setProfile,
  navigation,
}: {
  theme: any;
  profile: ProfileType | null;
  setProfile: (profile: ProfileType) => void;
  navigation: any;
}) => {
  const [name, setName] = useState((profile && profile.name) || "");
  const [phone, setPhone] = useState((profile && profile.phone) || "");
  const [errors, setErrors] = useState("");
  return (
    <SafeAreaView
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
        }}
      >
        <Logo width="100" height="100" />
        <Title width="100" height="35" />
        <Headline>Create a Pixtery Profile</Headline>
      </View>
      <Text>Name</Text>
      <TextInput
        placeholder="Terry Pix"
        value={name}
        onChangeText={(name) => setName(name)}
      />
      <Text>Phone Number</Text>
      <TextInput
        placeholder="202-555-0550"
        value={phone}
        onChangeText={(phone) => setPhone(phone)}
      />
      <Button
        icon="camera-iris"
        mode="contained"
        onPress={async () => {
          //probably want to do some further username error checking, nicer phone # entry, etc.
          if (name.length && phone.length) {
            //save to local storage
            await AsyncStorage.setItem(
              "@pixteryProfile",
              JSON.stringify({ name, phone })
            );
            //update app state
            setProfile({ name, phone });
            //send ya on your way
            navigation.navigate("Home");
          } else {
            setErrors("Must enter name and number!");
          }
        }}
        style={{ margin: 10 }}
      >
        Create
      </Button>
      {errors.length ? <Text>{errors}</Text> : null}
    </SafeAreaView>
  );
};
