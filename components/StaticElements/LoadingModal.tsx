import React from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { ActivityIndicator } from "react-native-paper";

export default function LoadingModal({
  isVisible,
}: {
  isVisible: boolean;
}): JSX.Element {
  return (
    <Modal isVisible={isVisible}>
      <View
        style={{
          position: "absolute",
          top: "2.5%",
          left: "2.5%",
          elevation: 5,
          width: "95%",
          height: "95%",
          opacity: 0.5,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    </Modal>
  );
}
