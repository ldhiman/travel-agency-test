export default {
  async rewrites() {
    return [
      {
        source: "/api/calculateDistanceAndFare",
        destination: "https://calculatedistanceandfare-r7jlysgvba-uc.a.run.app",
      },
    ];
  },
};
