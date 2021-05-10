import { CommonActions } from "@react-navigation/native";
import { Share } from "react-native";

//convert URI into a blob to transmit to server
export const createBlob = (localUri: string): Promise<Blob> => {
  //converts the image URI into a blob. there are references to using fetch online,
  // but it looks like that was broken in the latest version of expo

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", localUri, true);
    xhr.send(null);
  });
};

export const getRandomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const shareMessage = async (pixUrl: string): Promise<void> => {
  try {
    const content = {
      message:
        "Can you solve this Pixtery?" +
        String.fromCharCode(0xd83d, 0xdcf7) +
        String.fromCharCode(0xd83d, 0xdd75) +
        "\r\n" +
        pixUrl,
    };
    const options = {
      subject: "Someone sent you a Pixtery to solve!",
    };
    const result = await Share.share(content, options);

    // All of these conditionals are empty. What is supposed to be happening here?
    // if (result.action === Share.sharedAction) {
    //   if (result.activityType) {
    //   } else {
    //   }
    // } else if (result.action === Share.dismissedAction) {
    // }
  } catch (error) {
    alert(error.message);
  }
};

export const goToScreen = (
  navigation: any,
  screen: string,
  options: { url?: string; publicKey?: string } = { url: "", publicKey: "" }
): void => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: screen, params: options }],
    })
  );
};
