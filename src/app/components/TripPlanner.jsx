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
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LoopIcon from "@mui/icons-material/Loop";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";

const libraries = ["places"];
const center = { lat: 20.5937, lng: 78.9629 };

const TripPlanner = () => {
  const [pickupDatetime, setPickupDatetime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 35);
    return now;
  });
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
  const [hourlyRentalHours, setHourlyRentalHours] = useState(2); // Default to 2 hours
  const [loading, setLoading] = useState(false);

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

  // Update return datetime when pickup datetime changes (for round trips)
  useEffect(() => {
    if (tripType === "ROUND TRIP" && pickupDatetime) {
      // Default return time is 3 hours after pickup
      const suggestedReturn = new Date(
        pickupDatetime.getTime() + 3 * 60 * 60 * 1000
      );
      setReturnDatetime(suggestedReturn);
    }
  }, [tripType, pickupDatetime]);

  const getAddressFromCoords = useCallback((coords, callback) => {
    if (!window.google) return callback("Location services unavailable");

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
    let toastID = toast.loading("Finding address...");
    getAddressFromCoords(coords, (address) => {
      toast.success(`Location selected!`);
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
      setIsDialogOpen(true);
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
      setError("Please select a pickup location.");
      toast.error("Please select a pickup location");
      return;
    }

    if (tripType !== "HOURLY RENTAL") {
      if (!destinationCoords) {
        setError("Please select a destination location.");
        toast.error("Please select a destination location");
        return;
      }
    } else {
      if (!hourlyRentalHours) {
        setError("Please specify rental duration in hours.");
        toast.error("Please specify rental duration");
        return;
      }
    }

    if (!pickupDatetime) {
      setError("Please select pickup date and time.");
      toast.error("Please select pickup date and time");
      return;
    }

    const now = new Date();
    const minPickupDatetime = new Date(now.getTime() + 30 * 60000);

    if (pickupDatetime < minPickupDatetime) {
      setError("Pickup time must be at least 30 minutes from now.");
      toast.error("Pickup time must be at least 30 minutes from now");
      return;
    }

    if (tripType === "ROUND TRIP") {
      if (!returnDatetime) {
        setError("Please select a return date and time for round trip.");
        toast.error("Please select a return date and time");
        return;
      }

      if (returnDatetime <= pickupDatetime) {
        setError("Return time must be after pickup time.");
        toast.error("Return time must be after pickup time");
        return;
      }
    }

    setError("");
    setLoading(true);
    let loadingToast = toast.loading("Finding the best cabs for you...");

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
        hours: hourlyRentalHours,
      }),
      ...(tripType === "ROUND TRIP" && {
        returnDatetime: returnDatetime?.getTime(),
      }),
    };

    try {
      const distanceData = await processTripData(tripData);
      toast.dismiss(loadingToast);

      if (distanceData.error) {
        toast.error(distanceData.error);
        setError(distanceData.error);
        return;
      }

      const completeTripData = {
        ...tripData,
        distanceData: distanceData,
      };

      toast.success("Cabs found! Redirecting to selection...");

      router.push(
        "/cabSelection?" +
          new URLSearchParams({
            data: btoa(encodeURIComponent(JSON.stringify(completeTripData))),
          })
      );
    } catch (error) {
      toast.error("Oops! Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
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
        toast.info("Adjusted to minimum allowed pickup time");
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
        const adjustedTime = new Date(pickupDatetime.getTime() + 60 * 60000);
        setReturnDatetime(adjustedTime);
        toast.info("Adjusted return time to be after pickup");
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

            mapRef.panTo(newLocation);
            mapRef.setZoom(15);
            setUserLocation(newLocation);
          },
          (error) => {
            console.error("Error getting user location:", error);
            toast.error("Unable to get your current location");
          }
        );
      }
    }
  };

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
        <span className="ml-4 text-gray-600 font-medium">
          Loading map services...
        </span>
      </div>
    );

  const tripTypeIcons = {
    "ONE WAY": <DirectionsCarIcon className="mr-2" />,
    "ROUND TRIP": <LoopIcon className="mr-2" />,
    "HOURLY RENTAL": <AccessTimeIcon className="mr-2" />,
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 pb-16">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-blue-600">
          Plan Your Perfect Trip
        </h1>
        <p className="text-gray-600 text-center max-w-2xl">
          Enter your travel details below and we'll find the best cab options
          for your journey
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-xl p-8 mb-8 border border-gray-100">
        {/* Trip Type Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Choose Your Trip Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["ONE WAY", "ROUND TRIP", "HOURLY RENTAL"].map((type) => (
              <button
                key={type}
                className={`py-4 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                  tripType === type
                    ? "bg-blue-500 text-white shadow-md scale-105 transform"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow"
                }`}
                onClick={() => setTripType(type)}
              >
                {tripTypeIcons[type]}
                {type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Location Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <Tooltip title="Enter your pickup location or select from map">
              <div>
                <Autocomplete
                  onLoad={(autocomplete) => setSourceAutocomplete(autocomplete)}
                  onPlaceChanged={() => {
                    if (sourceAutocomplete) {
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
                    }
                  }}
                >
                  <TextField
                    label="Pickup Location"
                    variant="outlined"
                    fullWidth
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Enter pickup address"
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          aria-label="select source from map"
                          onClick={() => openMapModal("source")}
                          color="primary"
                        >
                          <LocationOnIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Autocomplete>
              </div>
            </Tooltip>
          </div>

          {tripType !== "HOURLY RENTAL" && (
            <div>
              <Tooltip title="Enter your drop location or select from map">
                <div>
                  <Autocomplete
                    onLoad={(autocomplete) =>
                      setDestinationAutocomplete(autocomplete)
                    }
                    onPlaceChanged={() => {
                      if (destinationAutocomplete) {
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
                      }
                    }}
                  >
                    <TextField
                      label="Drop Location"
                      variant="outlined"
                      fullWidth
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Enter destination address"
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            aria-label="select destination from map"
                            onClick={() => openMapModal("destination")}
                            color="primary"
                          >
                            <LocationOnIcon />
                          </IconButton>
                        ),
                      }}
                    />
                  </Autocomplete>
                </div>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Pickup Date
            </label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={pickupDatetime}
                onChange={handlePickupDateChange}
                disablePast
                minDate={getMinTime()}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" fullWidth />
                )}
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

        {tripType === "ROUND TRIP" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-4 bg-blue-50 rounded-lg">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Return Date
              </label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={returnDatetime}
                  onChange={handleReturnDateChange}
                  disablePast
                  minDate={pickupDatetime || getMinTime()}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" fullWidth />
                  )}
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

        {tripType === "HOURLY RENTAL" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-4 bg-blue-50 rounded-lg">
            <div>
              <TextField
                label="Rental Duration (hours)"
                variant="outlined"
                fullWidth
                type="number"
                inputProps={{
                  min: 1,
                  max: 8,
                }}
                value={hourlyRentalHours}
                onChange={handleHourlyRentalHoursChange}
                error={!!error && error.includes("hour")}
                helperText={
                  !!error && error.includes("hour")
                    ? error
                    : "Choose between 1 to 8 hours"
                }
              />
            </div>
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Hourly packages include unlimited
                  kilometers within city limits for the duration of your rental.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && !error.includes("hour") && (
          <div className="text-red-500 text-center font-bold mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <button
          className={`py-4 px-6 rounded-lg font-bold block w-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-1"
          }`}
          onClick={handleExploreCabs}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <CircularProgress size={24} color="inherit" className="mr-3" />
              Finding Available Cabs...
            </span>
          ) : (
            "Find Available Cabs"
          )}
        </button>
      </div>

      {/* Map Modal */}
      <Modal open={mapOpen} onClose={() => setMapOpen(false)}>
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl relative">
            <IconButton
              onClick={() => setMapOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <CloseIcon />
            </IconButton>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {currentMapType === "source"
                ? "Select Pickup Location"
                : "Select Drop Location"}
            </h2>
            <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={userLocation}
                  zoom={13}
                  onClick={handleMapClick}
                  onLoad={(map) => setMapRef(map)}
                  options={{
                    zoomControl: true,
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                  }}
                >
                  {userLocation && (
                    <Marker
                      position={userLocation}
                      title="Your Location"
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                    />
                  )}
                  {sourceCoords && (
                    <Marker
                      position={sourceCoords}
                      title="Pickup"
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                    />
                  )}
                  {destinationCoords && (
                    <Marker
                      position={destinationCoords}
                      title="Drop"
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <CircularProgress />
                  <span className="ml-3">Loading map...</span>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={handleCurrentLocationClick}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg font-bold flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
              >
                <MyLocationIcon className="mr-2" />
                Use Current Location
              </button>
              <p className="text-gray-600 text-sm italic mt-2">
                Click anywhere on the map to select a location
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Location Confirmation Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>
          {currentMapType === "source"
            ? "Confirm Pickup Location"
            : "Confirm Drop Location"}
        </DialogTitle>
        <DialogContent>
          <div className="py-2">
            <p className="font-medium mb-1">Selected Address:</p>
            <p className="text-gray-700 mb-4 border-l-4 border-blue-500 pl-3 py-1 bg-blue-50">
              {selectedAddress}
            </p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
              setMapOpen(false);
            }}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
            }}
            color="secondary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TripPlanner;
