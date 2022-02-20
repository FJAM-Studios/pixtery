const buildScreenPathObject = (
  // screenPath: (keyof StackScreens)[],
  screenPath: string[],
  // finalParams: { url?: string | null; publicKey?: string; sourceList?: string },
  index: number,
  finalParams?: object
): object => {
  if (index === screenPath.length - 1) {
    return {
      screen: screenPath[index],
      params: finalParams,
    };
  } else {
    return {
      screen: screenPath[index],
      params: buildScreenPathObject(screenPath, index + 1, finalParams),
    };
  }
};

export const goToScreen = async (
  navigation: any,
  screenPath: string[],
  params?: object
): Promise<void> => {
  if (screenPath.length === 1) {
    navigation.navigate(screenPath[0], params);
  } else {
    const chain = buildScreenPathObject(screenPath, 1, params);
    navigation.navigate(screenPath[0], chain);
  }
};

export const replaceScreen = async (
  navigation: any,
  screenPath: string[],
  options?: object
): Promise<void> => {
  const chain = buildScreenPathObject(screenPath, 1, options);
  navigation.replace(screenPath[0], chain);
};

export const resetNavigation = async (
  navigation: any,
  screenPath: string[],
  options?: object
): Promise<void> => {
  const chain = buildScreenPathObject(screenPath, 1, options);
  navigation.reset({
    index: 0,
    routes: [
      {
        name: screenPath[0],
        params: chain,
      },
    ],
  });
};
