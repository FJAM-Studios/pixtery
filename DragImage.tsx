import Draggable from "react-native-draggable";
import React, { useState, useEffect } from "react";
import * as ImageManipulator from "expo-image-manipulator";
import { Asset } from "expo-asset";
import { SquareProps } from "./Puzzle";
import Svg, { Image, Defs, ClipPath, Path } from "react-native-svg";

export default (props: SquareProps) => {
  const { squareSize, initX, initY, squareX, squareY } = props;
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
              width: squareSize * 3,
              height: squareSize * 3,
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
        // <Image
        //   source={{ uri: image.uri }}
        //   style={{
        //     width: squareSize,
        //     height: squareSize,
        //     resizeMode: "contain",
        //   }}
        // />
        <Svg height={squareSize} width={squareSize}>
          {/* 
          TODO implement jigsaw path
          <Defs>
            <ClipPath id="clip">
              <Path />
            </ClipPath>
          </Defs> */}
          <Image
            x={0}
            y={0}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            href={image}
            clipPath="url(#clip)"
          />
        </Svg>
      );
  };

  if (!ready) return null;

  return (
    <Draggable x={initX * squareSize} y={initY * squareSize}>
      {ready && _renderImage()}
    </Draggable>
  );
};
