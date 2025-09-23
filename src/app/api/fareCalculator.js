const axios = require("axios");

// Base URL of the API
const apiUrl = "https://calculatedistanceandfare-r7jlysgvba-uc.a.run.app";

const fetchDistanceAndFare = async (
  tripType,
  sourceCoords,
  destinationCoords,
  hours
) => {
  try {
    const response = await axios.post(
      `${apiUrl}`, // Apply proxy if in development
      {
        tripType,
        sourceCoords,
        destinationCoords,
        hours,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching distance and fare:", error);
    throw error;
  }
};

module.exports = { fetchDistanceAndFare };
