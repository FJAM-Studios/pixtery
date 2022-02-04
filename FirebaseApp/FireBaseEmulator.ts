import Constants from "expo-constants";
import { connectFunctionsEmulator } from "firebase/functions";

import { functions } from ".";

// uncomment if not using block below for func emu testing
// import { MY_LAN_IP } from "./ip";
// functions.useFunctionsEmulator(`${MY_LAN_IP}:5001`);

if (
  Constants.manifest &&
  Constants.manifest.extra &&
  Constants.manifest.extra.functionEmulator &&
  Constants.manifest.debuggerHost
) {
  const host = `${Constants.manifest.debuggerHost.split(":")[0]}`;
  const port = 5001;
  console.log(
    "\x1b[34m%s\x1b[0m",
    `using functions emulator on ${host}:${port}`
  );
  connectFunctionsEmulator(functions, host, port);
}
