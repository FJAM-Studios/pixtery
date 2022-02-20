const screenAncestorMap = {
  Gallery: "DailyContainer",
  AddToGallery: "DailyContainer",
  DailyContainer: "TabContainer",
  SentPuzzleList: "PuzzleListContainer",
  PuzzleList: "PuzzleListContainer",
  PuzzleListContainer: "LibraryContainer",
  AddPuzzle: "LibraryContainer",
  Puzzle: "LibraryContainer",
  LibraryContainer: "TabContainer",
  MakeContainer: "TabContainer",
  Settings: "SettingsContainer",
  Profile: "SettingsContainer",
  ManagePuzzles: "SettingsContainer",
  ContactUs: "SettingsContainer",
  SettingsContainer: "TabContainer",
  GalleryQueue: "AdminContainer",
  GalleryReview: "AdminContainer",
  DailyCalendar: "AdminContainer",
  AdminContainer: "TabContainer",
  Make: "MakeContainer",
  Tutorial: "MakeContainer",
};

// const buildScreenPathObject = (
//   // screenPath: (keyof StackScreens)[],
//   screenPath: string[],
//   // finalParams: { url?: string | null; publicKey?: string; sourceList?: string },
//   index: number,
//   finalParams?: object
// ): object => {
//   if (index === screenPath.length - 1) {
//     return {
//       screen: screenPath[index],
//       params: finalParams,
//     };
//   } else {
//     return {
//       screen: screenPath[index],
//       params: buildScreenPathObject(screenPath, index + 1, finalParams),
//     };
//   }
// };

const buildScreenPathObject = (
  currentScreen: string,
  finalParams = {},
  childNode = {},
  idx = 0
): { screen: string; params: object } => {
  const currentNode = {
    screen: currentScreen,
    params: {},
  };

  if (idx === 0) {
    currentNode.params = finalParams;
  } else currentNode.params = childNode;

  const parentScreen = screenAncestorMap[currentScreen];
  if (!parentScreen) return currentNode;
  else
    return buildScreenPathObject(
      parentScreen,
      finalParams,
      currentNode,
      idx + 1
    );
};

export const goToScreen = async (
  navigation: any,
  leafScreen: string,
  params?: object
): Promise<void> => {
  // if (screenPath.length === 1) {
  //   navigation.navigate(screenPath[0], params);
  // } else {
  const screenPath = buildScreenPathObject(leafScreen, params);
  navigation.navigate(screenPath.screen, screenPath.params);
  // }
};

export const replaceScreen = async (
  navigation: any,
  leafScreen: string,
  params?: object
): Promise<void> => {
  const screenPath = buildScreenPathObject(leafScreen, params);
  navigation.navigate(screenPath.screen, screenPath.params);
};

export const resetNavigation = async (
  navigation: any,
  leafScreen: string,
  params?: object
): Promise<void> => {
  const screenPath = buildScreenPathObject(leafScreen, params);
  console.log("SCREEN PATH IS", screenPath);
  navigation.reset({
    index: 0,
    routes: [
      {
        name: screenPath.screen,
        params: screenPath.params,
      },
    ],
  });
};
