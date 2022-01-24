export default ({ config }) => {
  return {
    ...config,
    extra: {
      functionEmulator: process.env.FUNC === "true",
    },
  };
};
