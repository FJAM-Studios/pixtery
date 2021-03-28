import React from "react";
import { View, TouchableWithoutFeedback } from "react-native";
import { IconButton, Text, Badge, Menu, Divider } from "react-native-paper";

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
        <Text
          style={{
            fontSize: 35,
            color: theme.colors.surface,
            fontWeight: "bold",
          }}
        >
          Pixtery
        </Text>
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
