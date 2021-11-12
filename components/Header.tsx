import React from "react";
import { View, TouchableWithoutFeedback } from "react-native";
import { IconButton, Badge, Menu, Divider } from "react-native-paper";
import { useSelector } from "react-redux";

import { ScreenNavigation, RootState } from "../types";
import Logo from "./Logo";
import Title from "./Title";

export default function Header({
  navigation,
  notifications,
  headerStep,
}: {
  navigation: ScreenNavigation;
  notifications: number;
  headerStep?: boolean;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.profile);
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const { height } = useSelector((state: RootState) => state.screenHeight);
  const closeMenu = () => setVisible(false);
  return (
    <View
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        height: height * 0.05,
        zIndex: headerStep ? 3 : 0,
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
            navigation.navigate("Gallery");
          }}
          title="Gallery"
          icon="image-multiple"
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
        {profile && profile.isGalleryAdmin ? (
          <>
            <Divider />
            <Menu.Item
              onPress={() => {
                closeMenu();
                navigation.navigate("GalleryQueue");
              }}
              title="Gallery Queue"
              icon="account-lock"
            />
          </>
        ) : null}
      </Menu>
    </View>
  );
}
