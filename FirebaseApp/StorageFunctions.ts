import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";

import { app } from "./InitializeFirebase";

//////////////////////////////////////////////

const storage = getStorage(app);

export const getPixteryURL = async (str: string): Promise<string> => {
  const url = await getDownloadURL(ref(storage, str));
  return url;
};

export const uploadBlob = async (
  fileName: string,
  blob: Blob
): Promise<void> => {
  try {
    await uploadBytes(ref(storage, fileName), blob);
  } catch (e) {
    console.log(e);
  }
};
