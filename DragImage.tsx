import Draggable from "react-native-draggable";
import React, { useState, useEffect } from "react";
import * as ImageManipulator from "expo-image-manipulator";
import { Asset } from "expo-asset";
import { SquareProps } from "./SquaresPuzzle";
import { Image } from "react-native";

/** This is an individual tile piece */
export default (props: SquareProps) => {
  const { squareSize, initX, initY, squareX, squareY, gridSize } = props;
  const [ready, setReady] = useState(false);
  const [image, setImage] = useState<ImageManipulator.ImageResult | null>(null);

  useEffect(() => {
    const manipulateImage = async () => {
      setReady(false);
      const image = Asset.fromModule(require("./assets/earth.jpg"));
      const croppedImage = await ImageManipulator.manipulateAsync(
        image.localUri || image.uri,
        [
          {
            resize: {
              width: squareSize * gridSize,
              height: squareSize * gridSize,
            },
          },
          {
            crop: {
              originX: squareSize * squareX,
              originY: squareSize * squareY,
              width: squareSize,
              height: squareSize,
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImage(croppedImage);
      setReady(true);
    };

    manipulateImage();
  }, [props]);

  const _renderImage = () => {
    if (image)
      return (
        <Image
          source={{ uri: image.uri }}
          style={{
            width: squareSize,
            height: squareSize,
            resizeMode: "contain",
          }}
        />
      );
  };

  if (!ready) return null;
  return (
    <Draggable x={initX * squareSize} y={initY * squareSize}>
      {ready && _renderImage()}
    </Draggable>
  );
};
