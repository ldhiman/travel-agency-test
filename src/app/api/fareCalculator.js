const axios = require("axios");

// Determine if we are in a development environment
const isDevelopment = process.env.NODE_ENV === "development";

// Proxy URL for development
const corsProxy = isDevelopment ? "https://cors-anywhere.herokuapp.com/" : "";

// Base URL of the API
const apiUrl =
  "https://us-central1-travel-agency-18664.cloudfunctions.net/calculateDistanceAndFare";

const fetchDistanceAndFare = async (sourceCoords, destinationCoords) => {
  try {
    const response = await axios.post(
      `${corsProxy}${apiUrl}`, // Apply proxy if in development
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
