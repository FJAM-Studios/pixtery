import * as React from "react";

import { storage, functions } from "../FirebaseApp";
import { PUBLIC_KEY_LENGTH } from "../constants";
import { Puzzle as PuzzleType } from "../types";
import Puzzle from "./Puzzle";

export default function App(): JSX.Element {
  const [loading, setLoading] = React.useState(true);
  const [puzzle, setPuzzle] = React.useState<PuzzleType>();

  React.useEffect(() => {
    const path = window.location.pathname;
    const publicKey = path.substring(path.lastIndexOf("/") + 1);
    fetchPuzzle(publicKey);
  }, []);

  const fetchPuzzle = async (publicKey: string): Promise<PuzzleType | void> => {
    const queryPuzzleCallable = functions.httpsCallable("queryPuzzle");
    if (publicKey.length === PUBLIC_KEY_LENGTH) {
      try {
        const puzzleData = (await queryPuzzleCallable({ publicKey })).data;
        const imageURI = puzzleData.imageURI;
        const downloadURL = await storage.ref("/" + imageURI).getDownloadURL();
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
        <h1>Loading...</h1>
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
      <h1>Coming Soon!</h1>
      <img src="/app-store.svg" className="logo" alt="Pixtery!" />
      <img src="/play-store.svg" className="logo" alt="Pixtery!" />
      <h5 className="studio">© 2021 FJAM Studios</h5>
    </div>
  );
}