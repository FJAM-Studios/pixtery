import React from "react";
import { View, TouchableWithoutFeedback, Dimensions } from "react-native";
import { IconButton, Badge, Menu, Divider } from "react-native-paper";

import Logo from "./Logo";
import Title from "./Title";

export default function Header({
  navigation,
  notifications,
  theme,
}: {
  navigation: any;
  notifications: number;
  theme: any;
}): JSX.Element {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const { height } = Dimensions.get("screen");

  const closeMenu = () => setVisible(false);
  return (
    <View
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        height: height * 0.05,
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Title width="100" height={height * 0.04} style={{ marginRight: 10 }} />
        <Logo width="25" height={height * 0.04} />
      </View>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableWithoutFeedback onPress={openMenu}>
            <View>
              <IconButton icon="menu" />
              <Badge
                visible={!!notifications}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 0,
                  backgroundColor: theme.colors.surface,
                }}
              >
                {notifications}
              </Badge>
            </View>
          </TouchableWithoutFeedback>
        }
      >
        <Menu.Item
          onPress={() => {
            closeMenu();
            navigation.navigate("Home");
          }}
          title="Make"
          icon="camera-iris"
        />
        <Divider />
        <Menu.Item
          onPress={() => {
            closeMenu();
            navigation.navigate("PuzzleList");
          }}
          title="Solve"
          icon="puzzle"
        />
        <Divider />
        <Menu.Item
          onPress={() => {
            closeMenu();
            navigation.navigate("SentPuzzleList");
          }}
          title="Sent"
          icon="send"
        />
        <Divider />
        <Menu.Item
          onPress={() => {
            closeMenu();
            navigation.navigate("Profile");
          }}
          title="Profile"
          icon="cog"
        />
        <Menu.Item
          onPress={() => {
            closeMenu();
            navigation.navigate("DevTest");
          }}
          title="DevTest"
          icon="laptop"
          style={{ backgroundColor: theme.colors.accent }}
        />
      </Menu>
    </View>
  );
}
