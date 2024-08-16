"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import { processTripData } from "../api/processTripData";
import {
  useJsApiLoader,
  Autocomplete,
  Marker,
  GoogleMap,
} from "@react-google-maps/api";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import MyLocationIcon from "@mui/icons-material/MyLocation"; // Icon for current location
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";

const libraries = ["places"];
const center = { lat: 20.5937, lng: 78.9629 }; // Default center

const TripPlanner = () => {
  const [pickupDatetime, setPickupDatetime] = useState(null);
  const [returnDatetime, setReturnDatetime] = useState(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [sourceLocationName, setSourceLocationName] = useState("");
  const [destinationLocationName, setDestinationLocationName] = useState("");
  const [tripType, setTripType] = useState("ONE WAY");
  const [userLocation, setUserLocation] = useState(center);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [currentMapType, setCurrentMapType] = useState(null);
  const [sourceAutocomplete, setSourceAutocomplete] = useState(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [hourlyRentalHours, setHourlyRentalHours] = useState(""); // State for hourly rental hours

  const [loading, setLoading] = useState(false); // Add state for loading

  const router = useRouter();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    libraries,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => console.error("Error getting user location:", error)
    );
  }, []);

  const getAddressFromCoords = useCallback((coords, callback) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status === "OK" && results[0]) {
        callback(results[0].formatted_address);
      } else {
        callback("Unknown location");
      }
    });
  }, []);

  const handleMapClick = (e) => {
    const coords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    let toastID = toast.loading("Selecting Location..");
    getAddressFromCoords(coords, (address) => {
      toast.success(`Location Selected!!`);
      toast.dismiss(toastID);
      setSelectedAddress(address);
      setSelectedLocation(coords);
      if (currentMapType === "source") {
        setSourceCoords(coords);
        setSourceLocationName(address);
        setSource(address);
      } else if (currentMapType === "destination") {
        setDestinationCoords(coords);
        setDestinationLocationName(address);
        setDestination(address);
      }
      setIsDialogOpen(true); // Open the dialog
      // setMapOpen(false); // Close the map modal after selection
    });
  };

  const openMapModal = (type) => {
    setCurrentMapType(type);
    setMapOpen(true);
  };

  const handleHourlyRentalHoursChange = (e) => {
    const value = parseInt(e.target.value, 10);

    if (isNaN(value)) {
      setHourlyRentalHours("");
      setError("Please enter a valid number.");
      return;
    }

    if (value < 1) {
      setHourlyRentalHours(1);
      setError("Minimum is 1 hour.");
    } else if (value > 8) {
      setHourlyRentalHours(8);
      setError("Maximum is 8 hours.");
    } else {
      setHourlyRentalHours(value);
      setError("");
    }
  };

  const handleExploreCabs = async () => {
    if (!sourceCoords) {
      setError("Source location is required.");
      return;
    }

    if (tripType !== "HOURLY RENTAL") {
      if (!destinationCoords) {
        setError("Destination location is required.");
        return;
      }
    } else {
      if (!hourlyRentalHours) {
        setError("Hours is required.");
        return;
      }
    }

    if (!pickupDatetime) {
      setError("Pickup date and time are required.");
      return;
    }

    const now = new Date();
    const minPickupDatetime = new Date(now.getTime() + 30 * 60000);

    if (pickupDatetime < minPickupDatetime) {
      setError("Pickup date and time must be at least 30 minutes from now.");
      return;
    }

    if (tripType === "ROUND TRIP") {
      if (!returnDatetime) {
        setError("Return date and time are required for a round trip.");
        return;
      }

      if (returnDatetime <= pickupDatetime) {
        setError(
          "Return date and time must be later than the pickup date and time."
        );
        return;
      }
    }

    setError("");
    setLoading(true); // Set loading to true

    const tripData = {
      tripType,
      source,
      pickupDatetime: pickupDatetime?.getTime(),
      sourceCoords,
      ...(tripType !== "HOURLY RENTAL" && {
        destination,
        destinationCoords,
      }),
      ...(tripType === "HOURLY RENTAL" && {
        hourlyRentalHours,
      }),
      ...(tripType === "ROUND TRIP" && {
        returnDatetime: returnDatetime?.getTime(),
      }),
    };

    console.log("Trip Data:", JSON.stringify(tripData));
    try {
      const distanceData = await processTripData(tripData);

      // Check for errors
      if (distanceData.error) {
        toast.error(distanceData.error);
        console.error(distanceData.error);
        setError(distanceData.error);
        return;
      }

      // Add distance data to the trip data
      const completeTripData = {
        ...tripData,
        distanceData: distanceData, // Assuming distanceData contains the details you need
      };
      router.push(
        "/cabSelection?" +
          new URLSearchParams({ data: btoa(JSON.stringify(completeTripData)) })
      );
    } catch (error) {
      toast.error("An error occurred while processing the trip.");
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const getMinTime = () => new Date(new Date().getTime() + 30 * 60000);

  const handlePickupDateChange = (date) => {
    setPickupDatetime((prev) => {
      if (prev) {
        return new Date(date.setHours(prev.getHours(), prev.getMinutes()));
      }
      return new Date(date);
    });
  };

  const handlePickupTimeChange = (time) => {
    if (pickupDatetime) {
      const newDatetime = new Date(pickupDatetime);
      newDatetime.setHours(time.getHours());
      newDatetime.setMinutes(time.getMinutes());

      const minPickupDatetime = getMinTime();
      if (newDatetime < minPickupDatetime) {
        setPickupDatetime(minPickupDatetime);
      } else {
        setPickupDatetime(newDatetime);
      }
    }
  };

  const handleReturnDateChange = (date) => {
    setReturnDatetime((prev) => {
      if (prev) {
        return new Date(date.setHours(prev.getHours(), prev.getMinutes()));
      }
      return new Date(date);
    });
  };

  const handleReturnTimeChange = (time) => {
    if (returnDatetime) {
      const newDatetime = new Date(returnDatetime);
      newDatetime.setHours(time.getHours());
      newDatetime.setMinutes(time.getMinutes());

      if (newDatetime <= pickupDatetime) {
        setReturnDatetime(new Date(pickupDatetime.getTime() + 30 * 60000));
      } else {
        setReturnDatetime(newDatetime);
      }
    }
  };

  const handleCurrentLocationClick = () => {
    if (mapRef) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            // Pan to the new location with animation
            mapRef.panTo(newLocation);
            mapRef.setZoom(15); // Optionally adjust zoom level

            // Update user location
            setUserLocation(newLocation);
          },
          (error) => {
            console.error("Error getting user location:", error);
          }
        );
      }
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h1 className="text-4xl font-bold text-center mb-8">Plan Your Trip</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Source Input */}
          <div>
            {/* <label className="block text-gray-700 text-sm font-bold mb-2">
              Source
            </label> */}
            <div className="relative">
              <Autocomplete
                onLoad={(autocomplete) => setSourceAutocomplete(autocomplete)}
                onPlaceChanged={() => {
                  const place = sourceAutocomplete.getPlace();
                  if (place.geometry) {
                    setSource(place.formatted_address);
                    setSourceCoords({
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                    });
                    setSourceLocationName(
                      place.name || place.formatted_address
                    );
                  }
                }}
              >
                <TextField
                  label="Pickup"
                  variant="outlined"
                  fullWidth
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="select source from map"
                        onClick={() => openMapModal("source")}
                      >
                        <LocationOnIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Autocomplete>
            </div>
          </div>

          {/* Destination Input */}
          {tripType !== "HOURLY RENTAL" && (
            <div>
              {/* <label className="block text-gray-700 text-sm font-bold mb-2">
                Destination
              </label> */}
              <div className="relative">
                <Autocomplete
                  onLoad={(autocomplete) =>
                    setDestinationAutocomplete(autocomplete)
                  }
                  onPlaceChanged={() => {
                    const place = destinationAutocomplete.getPlace();
                    if (place.geometry) {
                      setDestination(place.formatted_address);
                      setDestinationCoords({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                      });
                      setDestinationLocationName(
                        place.name || place.formatted_address
                      );
                    }
                  }}
                >
                  <TextField
                    label="Drop Location"
                    variant="outlined"
                    fullWidth
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          aria-label="select destination from map"
                          onClick={() => openMapModal("destination")}
                        >
                          <LocationOnIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Autocomplete>
              </div>
            </div>
          )}
        </div>

        {/* Trip Type Selection */}
        <div className="mb-8">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Trip Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              className={`py-2 px-4 rounded-lg font-bold ${
                tripType === "ONE WAY"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setTripType("ONE WAY")}
            >
              One Way
            </button>
            <button
              className={`py-2 px-4 rounded-lg font-bold ${
                tripType === "ROUND TRIP"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setTripType("ROUND TRIP")}
            >
              Round Trip
            </button>
            <button
              className={`py-2 px-4 rounded-lg font-bold ${
                tripType === "HOURLY RENTAL"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setTripType("HOURLY RENTAL")}
            >
              Hourly Rental
            </button>
          </div>
        </div>

        {/* Pickup DateTime */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Pickup Date
            </label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={pickupDatetime}
                onChange={handlePickupDateChange}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" fullWidth />
                )}
                disablePast
                minDate={getMinTime()}
              />
            </LocalizationProvider>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Pickup Time
            </label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                value={pickupDatetime}
                onChange={handlePickupTimeChange}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" fullWidth />
                )}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* Return DateTime (Conditional) */}
        {tripType === "ROUND TRIP" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Return Date
              </label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={returnDatetime}
                  onChange={handleReturnDateChange}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" fullWidth />
                  )}
                  disablePast
                  minDate={pickupDatetime || getMinTime()}
                />
              </LocalizationProvider>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Return Time
              </label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  value={returnDatetime}
                  onChange={handleReturnTimeChange}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" fullWidth />
                  )}
                />
              </LocalizationProvider>
            </div>
          </div>
        )}

        {/* Hourly rental (Conditional) */}
        {tripType === "HOURLY RENTAL" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <TextField
              label="Hours"
              variant="outlined"
              fullWidth
              type="number"
              inputProps={{
                min: 1,
                max: 8,
              }}
              value={hourlyRentalHours}
              onChange={handleHourlyRentalHoursChange}
              error={!!error}
              helperText={error}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-center font-bold mb-4">{error}</div>
        )}

        {/* Explore Cabs Button */}
        <button
          className="bg-blue-500 text-white py-3 px-6 rounded-lg font-bold block w-full"
          onClick={handleExploreCabs}
          disabled={loading} // Disable button when loading
        >
          {loading ? "Loading..." : "Explore Cabs"}
        </button>
      </div>

      {/* Map Modal */}
      <Modal open={mapOpen} onClose={() => setMapOpen(false)}>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
            <IconButton
              onClick={() => setMapOpen(false)}
              className="absolute top-2 right-2"
            >
              <CloseIcon />
            </IconButton>

            <div className="h-96 w-full">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={userLocation}
                  zoom={10}
                  onClick={handleMapClick}
                  onLoad={(map) => setMapRef(map)}
                >
                  {userLocation && (
                    <Marker
                      position={userLocation}
                      title="Your Location"
                      icon="https://mt.google.com/vt/icon/name=icons/spotlight/directions_destination_measle_8x.png&scale=1.1"
                    />
                  )}

                  {sourceCoords && (
                    <Marker
                      position={sourceCoords}
                      title="Pickup"
                      icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    />
                  )}

                  {destinationCoords && (
                    <Marker
                      position={destinationCoords}
                      title="Drop"
                      icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    />
                  )}
                </GoogleMap>
              ) : (
                <p>Loading map...</p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Location Confirmation Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Confirm Location</DialogTitle>
        <DialogContent>
          <p>Address: {selectedAddress}</p>
          <p>Coordinates: {JSON.stringify(selectedLocation)}</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
              setMapOpen(false);
            }}
            color="primary"
          >
            Confirm
          </Button>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
            }}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TripPlanner;
