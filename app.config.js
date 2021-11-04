export default ({ config }) => {
  console.log("Loading custom config...");
  return {
    ...config,
    extra: {
      functionEmulator: process.env.FUNC === "true",
    },
  };
};
