import { getFunctions, httpsCallable } from "firebase/functions";
import { useState, useEffect } from "react";

// removing to avoid problems with Expo-Constants and webpack
// import { queryPuzzleCallable, getDaily } from "../FirebaseApp/CloudFunctions";
import { app } from "../FirebaseApp/InitializeFirebase";
import { getPixteryURL } from "../FirebaseApp/StorageFunctions";
import { PUBLIC_KEY_LENGTH } from "../constants";
import { Puzzle as PuzzleType } from "../types";
import Puzzle from "./Puzzle";
import StoreLinks from "./StoreLinks";

// replacing imports for webpack
const functions = getFunctions(app);
const queryPuzzleCallable = httpsCallable(functions, "queryPuzzle");
const getDaily = httpsCallable(functions, "getDaily");

export default function App(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [startSolved, setStartSolved] = useState(false);
  const [puzzle, setPuzzle] = useState<PuzzleType>();

  useEffect(() => {
    const path = window.location.pathname;
    const publicKey = path.substring(path.lastIndexOf("/") + 1);
    fetchPuzzle(publicKey);
  }, []);

  const fetchPuzzle = async (publicKey: string): Promise<PuzzleType | void> => {
    const populatePuzzleData = async (puzzleData: Puzzle) => {
      const imageURI = puzzleData.imageURI;
      const downloadURL = await getPixteryURL("/" + imageURI);
      puzzleData.imageURI = downloadURL;
      setPuzzle(puzzleData);
      if (
        publicKey.slice(PUBLIC_KEY_LENGTH, PUBLIC_KEY_LENGTH + 7) === "_SOLVED"
      )
        setStartSolved(true);
    };

    try {
      const subKey = publicKey.slice(0, PUBLIC_KEY_LENGTH);
      const puzzleData =
        subKey === "the_daily"
          ? ((await getDaily()).data as Puzzle)
          : ((await queryPuzzleCallable({ publicKey: subKey })).data as Puzzle);
      await populatePuzzleData(puzzleData);
    } catch (error) {
      console.error(error);
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
        <Puzzle puzzle={puzzle} startSolved={startSolved} />
      </div>
    );
  }
  return (
    <div id="app">
      <img src="/logo.svg" className="logo" alt="Pixtery!" />
      <img src="/pixtery.svg" className="title" alt="Pixtery!" />
      <b>
        <a style={{ fontFamily: "Shrikhand" }} href="/p/the_daily">
          Play the Daily Pixtery!
        </a>
      </b>
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
