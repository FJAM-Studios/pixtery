import { useState, useEffect } from "react";

import { queryPuzzleCallable } from "../FirebaseApp/CloudFunctions";
import { getPixteryURL } from "../FirebaseApp/StorageFunctions";
import { PUBLIC_KEY_LENGTH } from "../constants";
import { Puzzle as PuzzleType } from "../types";
import Puzzle from "./Puzzle";
import StoreLinks from "./StoreLinks";

export default function App(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [puzzle, setPuzzle] = useState<PuzzleType>();

  useEffect(() => {
    const path = window.location.pathname;
    const publicKey = path.substring(path.lastIndexOf("/") + 1);
    fetchPuzzle(publicKey);
  }, []);

  const fetchPuzzle = async (publicKey: string): Promise<PuzzleType | void> => {
    if (publicKey.length === PUBLIC_KEY_LENGTH) {
      try {
        const puzzleData = (await queryPuzzleCallable({ publicKey }))
          .data as Puzzle;
        const imageURI = puzzleData.imageURI;
        const downloadURL = await getPixteryURL("/" + imageURI);
        puzzleData.imageURI = downloadURL;
        setPuzzle(puzzleData);
      } catch (error) {
        console.error(error);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div id="app">
        <h1 style={{ fontFamily: "Shrikhand" }}>Loading...</h1>
      </div>
    );
  }
  if (puzzle) {
    return (
      <div id="app">
        <Puzzle puzzle={puzzle} />
      </div>
    );
  }
  return (
    <div id="app">
      <img src="/logo.svg" className="logo" alt="Pixtery!" />
      <img src="/pixtery.svg" className="title" alt="Pixtery!" />
      <StoreLinks />
      <div id="web-footer">
        <div id="web-footer-contents">
          <a href="https://pixtery.io/privacy.html">Privacy Policy</a>
          <span className="dot">&nbsp;&#x2022;&nbsp;</span>
          <a href="https://pixtery.io/community.html">Community Guidelines</a>
          <span className="dot">&nbsp;&#x2022;&nbsp;</span>
          <a href="https://pixtery.io/terms.html">Terms</a>
          <span className="dot">&nbsp;&#x2022;&nbsp;</span>
          <a href="mailto:contact@pixtery.io">contact@pixtery.io</a>
          <div>
            <span className="studio">© 2021 FJAM Studios</span>
          </div>
        </div>
      </div>
    </div>
  );
}
