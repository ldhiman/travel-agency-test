export default {
  async rewrites() {
    return [
      {
        source: "/api/calculateDistanceAndFare",
        destination:
          "https://us-central1-travel-agency-18664.cloudfunctions.net/calculateDistanceAndFare",
      },
    ];
  },
};
