import moment from "moment-timezone";
import React, { useEffect, useState } from "react";
import { StyleSheet, Animated, LayoutChangeEvent, View } from "react-native";
import { Text } from "react-native-paper";
import { Theme } from "react-native-paper/lib/typescript/types";
import { useSelector } from "react-redux";

import { DAILY_TIMEZONE } from "../constants";
import { RootState } from "../types";
import { secondsToTime } from "../util";

const DAY_IN_SECONDS = 24 * 60 * 60;
const TICK_INTERVAL = 1000;

export default function Clock({
  setError,
}: {
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const [index] = useState(new Animated.Value(0));
  const [tick] = useState(new Animated.Value(0));

  const secondDegrees = Animated.multiply(index, 6);

  const interpolated = {
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  };

  const transformSeconds = {
    transform: [{ rotate: secondDegrees.interpolate(interpolated) }],
  };

  const rotateMinutes = Animated.divide(secondDegrees, new Animated.Value(60));
  const transformMinutes = {
    transform: [{ rotate: rotateMinutes.interpolate(interpolated) }],
  };

  const rotateHours = Animated.divide(rotateMinutes, new Animated.Value(12));

  const transformHours = {
    transform: [{ rotate: rotateHours.interpolate(interpolated) }],
  };

  const animateClock = () => {
    Animated.timing(index, {
      toValue: tick,
      duration: TICK_INTERVAL / 2,
      useNativeDriver: true,
    }).start();
  };
  const [time, setTime] = useState<number>(0);

  const getSecondsToMidnight = (): number => {
    const now = moment().tz(DAILY_TIMEZONE);
    const tomorrow = now.clone().add(1, "day").startOf("day");
    const time = tomorrow.diff(now, "seconds");
    if (time <= TICK_INTERVAL) setError(null);
    return time;
  };

  const initializeClock = () => {
    const secondsToMidnight = getSecondsToMidnight();
    tick.setValue(DAY_IN_SECONDS - secondsToMidnight);
    index.setValue(DAY_IN_SECONDS - secondsToMidnight);
    animateClock();
    setTime(secondsToMidnight);
  };

  const [clockSize, setClockSize] = useState(1);

  const measureClockArea = (ev: LayoutChangeEvent): void => {
    const { width, height } = ev.nativeEvent.layout;
    const clockSize = 0.8 * Math.min(width, height);
    setClockSize(clockSize);
  };

  useEffect(() => {
    initializeClock();

    const incrementTime = setInterval(() => {
      const secondsToMidnight = getSecondsToMidnight();
      tick.setValue(DAY_IN_SECONDS - secondsToMidnight);
      setTime(secondsToMidnight);
    }, TICK_INTERVAL);

    return () => clearInterval(incrementTime);
  }, []);

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View
        onLayout={(ev) => measureClockArea(ev)}
        style={styles({ clockSize, theme }).container}
      >
        <Animated.View style={styles({ clockSize, theme }).circleContainer}>
          <View style={[styles({ clockSize, theme }).circle]} />
          <Animated.View
            style={[styles({ clockSize, theme }).mover, transformHours]}
          >
            <Animated.View style={[styles({ clockSize, theme }).hours]} />
          </Animated.View>
          <Animated.View
            style={[styles({ clockSize, theme }).mover, transformMinutes]}
          >
            <Animated.View style={[styles({ clockSize, theme }).minutes]} />
          </Animated.View>
          <Animated.View
            style={[styles({ clockSize, theme }).mover, transformSeconds]}
          >
            <Animated.View style={[styles({ clockSize, theme }).seconds]} />
          </Animated.View>
        </Animated.View>
      </View>
      <Text style={[styles({ clockSize, theme }).text]}>
        {secondsToTime(time)}
      </Text>
    </View>
  );
}

const styles = ({ clockSize, theme }: { clockSize: number; theme: Theme }) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.backdrop,
      width: "100%",
      flex: 1,
      borderRadius: theme.roundness,
    },
    circleContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    mover: {
      position: "absolute",
      width: clockSize,
      height: clockSize,
      borderRadius: clockSize / 2,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    hours: {
      backgroundColor: theme.colors.onSurface,
      height: "25%",
      marginTop: "25%",
      width: 4,
    },
    minutes: {
      backgroundColor: theme.colors.onSurface,
      height: "35%",
      marginTop: "15%",
      width: 3,
    },
    seconds: {
      backgroundColor: theme.colors.accent,
      height: "40%",
      marginTop: "10%",
      width: 2,
    },
    circle: {
      width: clockSize * 0.8,
      height: clockSize * 0.8,
      borderRadius: clockSize * 0.4,
      backgroundColor: theme.colors.surface,
      position: "absolute",
    },
    text: {
      opacity: 0.75,
      fontSize: 20,
      position: "absolute",
      alignSelf: "center",
      top: "40%",
      backgroundColor: theme.colors.primary,
      padding: theme.roundness,
      borderRadius: theme.roundness,
      color: theme.colors.onSurface,
    },
  });
