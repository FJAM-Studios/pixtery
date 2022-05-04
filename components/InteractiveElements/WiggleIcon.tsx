import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import { Animated, Easing, View } from "react-native";

import { PixteryTheme } from "../../types";
export default function DailyAgreement({
  focused,
  theme,
  active,
}: {
  focused: boolean;
  theme: PixteryTheme;
  active: boolean;
}): JSX.Element {
  const wiggle = useRef(new Animated.Value(0));
  const fade = useRef(new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      const incrementTime = setInterval(() => {
        handleAnimation();
      }, 3000);
      return () => clearInterval(incrementTime);
    }, [])
  );

  const handleAnimation = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(fade.current, {
          toValue: 0.25,
          duration: 400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(fade.current, {
          toValue: 0,
          duration: 400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        // start rotation in one direction (only half the time is needed)
        Animated.timing(wiggle.current, {
          toValue: 4.0,
          duration: 75,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // rotate in other direction, to minimum value (= twice the duration of above)
        Animated.timing(wiggle.current, {
          toValue: -4.0,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle.current, {
          toValue: 4.0,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // rotate in other direction, to minimum value (= twice the duration of above)
        Animated.timing(wiggle.current, {
          toValue: -4.0,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // return to begin position
        Animated.timing(wiggle.current, {
          toValue: 0.0,
          duration: 75,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };
  if (!active)
    return (
      <MaterialCommunityIcons
        size={24}
        name="puzzle"
        color={focused ? theme.colors.text : theme.colors.onSurface}
      />
    );
  return (
    <View>
      <Animated.View
        style={{
          backgroundColor: "white",
          top: -8,
          left: -8,
          height: 40,
          width: 40,
          borderRadius: 20,
          opacity: fade.current,
        }}
      />
      <Animated.View
        style={{
          top: -40,
          transform: [
            {
              rotate: wiggle.current.interpolate({
                inputRange: [-1, 1],
                outputRange: ["-0.1rad", "0.1rad"],
              }),
            },
          ],
        }}
      >
        <MaterialCommunityIcons
          size={24}
          name="puzzle"
          color={focused ? theme.colors.text : theme.colors.onSurface}
        />
      </Animated.View>
    </View>
  );
}
