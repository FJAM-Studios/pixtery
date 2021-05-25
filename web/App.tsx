import * as React from "react";
import { storage, functions } from "../FirebaseApp";

import { PUBLIC_KEY_LENGTH } from "../constants";
import { Puzzle, AddPuzzleRoute, ScreenNavigation, RootState } from "../types";

export default function App(): JSX.Element {
  const [loading, setLoading] = React.useState(true);
  const [puzzle, setPuzzle] = React.useState<Puzzle>();

  React.useEffect(() => {
    const path = window.location.pathname.slice(1);
    fetchPuzzle(path);
  });

  const fetchPuzzle = async (publicKey: string): Promise<Puzzle | void> => {
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
        {/* pass puzzle to a Puzzle component built for the web*/}
        <img src={puzzle.imageURI} alt="Pixtery!" />
      </div>
    );
  }
  return (
    <div id="app">
      <img src="logo.svg" className="logo" alt="Pixtery!" />
      <img src="pixtery.svg" className="title" alt="Pixtery!" />
      <h1>Coming Soon!</h1>
      <img src="app-store.svg" className="logo" alt="Pixtery!" />
      <img src="play-store.svg" className="logo" alt="Pixtery!" />
      <h5 className="studio">© 2021 FJAM Studios</h5>
    </div>
  );
}
