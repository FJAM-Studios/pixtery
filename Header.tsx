import React from "react";
import { View, TouchableWithoutFeedback } from "react-native";
import { IconButton, Badge, Menu, Divider } from "react-native-paper";
import Logo from "./Logo";
import Title from "./Title";

export default ({
  navigation,
  notifications,
  theme,
}: {
  navigation: any;
  notifications: number;
  theme: any;
}) => {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);
  return (
    <View
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Title width="100" height="25" style={{ marginRight: 10 }} />
        <Logo width="25" height="25" />
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
          icon="send"
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
            // navigation.navigate("Squares");
          }}
          title="Friends"
          icon="account-multiple"
        />
        <Divider />
        <Menu.Item onPress={() => {}} title="Profile" icon="cog" />
      </Menu>
    </View>
  );
};
