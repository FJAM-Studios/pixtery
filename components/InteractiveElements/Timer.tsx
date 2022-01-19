import * as React from "react";
import { Animated } from "react-native";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { useSelector } from "react-redux";

import { RootState } from "../../types";
import { secondsToTime } from "../../util";

export default function Timer({ time }: { time: number }): JSX.Element {
  const { width } = useSelector((state: RootState) => state.screenHeight);

  return (
    <CountdownCircleTimer
      isPlaying
      duration={60 * 60 * 24}
      initialRemainingTime={time / 1000}
      colors={[
        ["#004777", 0.4],
        ["#F7B801", 0.4],
        ["#A30000", 0.2],
      ]}
      size={width * 0.6}
    >
      {({ remainingTime }) => (
        <Animated.Text style={{ color: "#FFFFFF", fontSize: 40 }}>
          {secondsToTime(remainingTime)}
        </Animated.Text>
      )}
    </CountdownCircleTimer>
  );
}
