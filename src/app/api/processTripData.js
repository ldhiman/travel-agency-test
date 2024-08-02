const { fetchDistanceAndFare } = require("./fareCalculator");

module.exports.processTripData = async (data) => {
  try {
    // Fetch distance
    const distanceData = await fetchDistanceAndFare(
      data.sourceCoords,
      data.destinationCoords
    );

    if (distanceData) {
      console.log("Distance Data:", distanceData);
      // Optionally, process the distanceData further or return it
      return distanceData;
    } else {
      console.error("Error fetching distance or distance data is null.");
      // Optionally, handle the error or return a default value
      return { error: "Unable to fetch distance data." };
    }
  } catch (error) {
    console.error("Error processing trip data:", error);
    // Optionally, handle the error or return a default value
    return { error: "An error occurred while processing the trip data." };
  }
};
