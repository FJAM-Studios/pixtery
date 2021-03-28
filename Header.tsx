import React from "react";
import { View, TouchableWithoutFeedback } from "react-native";
import { IconButton, Badge, Menu, Divider } from "react-native-paper";
import Logo from "./Logo";
import Title from "./Title";

export default ({
  notifications,
  theme,
}: {
  notifications: number;
  theme: any;
}) => {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);
  return (
    <TouchableWithoutFeedback onPress={openMenu}>
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
          }
        >
          <Menu.Item onPress={() => {}} title="Make" icon="send" />
          <Divider />
          <Menu.Item onPress={() => {}} title="Solve" icon="puzzle" />
          <Divider />
          <Menu.Item
            onPress={() => {}}
            title="Friends"
            icon="account-multiple"
          />
          <Divider />
          <Menu.Item onPress={() => {}} title="Profile" icon="cog" />
        </Menu>
      </View>
    </TouchableWithoutFeedback>
  );
};
