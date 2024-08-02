const axios = require("axios");

// Base URL of the API
const apiUrl = "https://calculatedistanceandfare-no72p4gkhq-uc.a.run.app";

const fetchDistanceAndFare = async (sourceCoords, destinationCoords) => {
  try {
    const response = await axios.post(
      `${apiUrl}`, // Apply proxy if in development
      {
        sourceCoords,
        destinationCoords,
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
