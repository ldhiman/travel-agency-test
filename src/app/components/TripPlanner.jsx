"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  useJsApiLoader,
  Autocomplete,
  Marker,
  GoogleMap,
} from "@react-google-maps/api";
import {
  TextField,
  Modal,
  IconButton,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
  DirectionsCar as DirectionsCarIcon,
  Loop as LoopIcon,
  AccessTime as AccessTimeIcon,
  SwapVert as SwapVertIcon,
} from "@mui/icons-material";
import { processTripData } from "../api/processTripData";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { set } from "date-fns";

const libraries = ["places"];
const center = { lat: 20.5937, lng: 78.9629 }; // Default center of India

const TripPlanner = () => {
  // --- STATE MANAGEMENT ---
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
  const [tripType, setTripType] = useState("ONE WAY");
  const [userLocation, setUserLocation] = useState(center);
  const [mapOpen, setMapOpen] = useState(false);
  const [currentMapType, setCurrentMapType] = useState(null);
  const [sourceAutocomplete, setSourceAutocomplete] = useState(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [selectedLocationOnMap, setSelectedLocationOnMap] = useState(null);
  const [hourlyRentalHours, setHourlyRentalHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- GOOGLE MAPS API LOADER ---
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
    libraries,
  });

  // --- EFFECTS ---
  useEffect(() => {
    // This function converts an address string to coordinates
    const getCoordsFromAddress = async (address, type) => {
      if (!isLoaded || !address) return;

      const geocoder = new window.google.maps.Geocoder();
      try {
        const { results } = await geocoder.geocode({ address });
        if (results && results[0]) {
          const location = results[0].geometry.location;
          const coords = { lat: location.lat(), lng: location.lng() };

          // Set state for both address string and coordinates
          if (type === "source") {
            setSource(results[0].formatted_address);
            setSourceCoords(coords);
          } else {
            setDestination(results[0].formatted_address);
            setDestinationCoords(coords);
          }
        } else {
          toast.error(`Could not find location: ${address}`);
        }
      } catch (error) {
        console.error(`Geocoding error for ${address}:`, error);
      }
    };

    const sourceFromUrl = searchParams.get("source");
    const destinationFromUrl = searchParams.get("des"); // Note: it's "des" in your URL

    if (sourceFromUrl) {
      setLoading(true);
      getCoordsFromAddress(sourceFromUrl, "source");
      setLoading(false);
    }
    if (destinationFromUrl) {
      setLoading(true);
      getCoordsFromAddress(destinationFromUrl, "destination");
      setLoading(false);
    }
  }, [isLoaded]);

  // Get user's initial location
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

  // Auto-update return time for round trips
  useEffect(() => {
    if (tripType === "ROUND TRIP" && pickupDatetime != null) {
      const suggestedReturn = new Date(
        pickupDatetime.getTime() + 3 * 60 * 60 * 1000
      );
      setReturnDatetime(suggestedReturn);
    }
  }, [tripType]);

  // --- MEMOIZED VALUES ---
  const minPickupTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now;
  }, []);

  // --- HANDLERS & CALLBACKS ---

  const getAddressFromCoords = useCallback(async (coords) => {
    if (!window.google) return "Location services unavailable";
    const geocoder = new window.google.maps.Geocoder();
    try {
      const { results } = await geocoder.geocode({ location: coords });
      if (results && results[0]) {
        return results[0].formatted_address;
      }
      return "Unknown location";
    } catch (error) {
      console.error("Geocoder failed:", error);
      return "Could not fetch address";
    }
  }, []);

  const handleMapClick = useCallback(async (e) => {
    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setSelectedLocationOnMap(coords);
  }, []);

  const handleConfirmMapLocation = async () => {
    if (!selectedLocationOnMap) return;
    const toastID = toast.loading("Finding address...");
    const address = await getAddressFromCoords(selectedLocationOnMap);
    toast.dismiss(toastID);

    if (address.includes("unavailable") || address.includes("failed")) {
      toast.error(address);
      return;
    }

    toast.success(`Location selected!`);
    if (currentMapType === "source") {
      setSourceCoords(selectedLocationOnMap);
      setSource(address);
    } else {
      setDestinationCoords(selectedLocationOnMap);
      setDestination(address);
    }
    setMapOpen(false);
    setSelectedLocationOnMap(null);
  };

  const handlePlaceChanged = (autocomplete, type) => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const address = place.formatted_address;
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        if (type === "source") {
          setSource(address);
          setSourceCoords(coords);
        } else {
          setDestination(address);
          setDestinationCoords(coords);
        }
      }
    }
  };

  const handleSwapLocations = () => {
    if (!source && !destination) return;
    setSource(destination);
    setDestination(source);
    setSourceCoords(destinationCoords);
    setDestinationCoords(sourceCoords);
  };

  const validateForm = () => {
    if (!sourceCoords) {
      return "Please select a valid pickup location.";
    }
    if (tripType !== "HOURLY RENTAL" && !destinationCoords) {
      return "Please select a valid destination location.";
    }
    if (
      tripType === "HOURLY RENTAL" &&
      (!hourlyRentalHours || !rentalHoursOptions.includes(hourlyRentalHours))
    ) {
      return "Please select a valid rental duration (1-12 hours).";
    }
    if (!pickupDatetime || pickupDatetime < minPickupTime) {
      return "Pickup time must be at least 30 minutes from now.";
    }
    if (tripType === "ROUND TRIP") {
      if (!returnDatetime) {
        return "Please select a return date and time.";
      }
      if (returnDatetime <= pickupDatetime) {
        return "Return time must be after pickup time.";
      }
    }
    return "";
  };

  const handleExploreCabs = async () => {
    const errorMessage = validateForm();
    setFormError(errorMessage);
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Finding the best cabs for you...");

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
        setFormError(distanceData.error);
        setLoading(false);
        return;
      }

      const completeTripData = { ...tripData, distanceData };
      toast.success("Cabs found! Redirecting to selection...");
      sessionStorage.setItem("tripData", JSON.stringify(completeTripData));
      router.push("/cabSelection");
      // router.push(
      //   "/cabSelection?" +
      //     new URLSearchParams({
      //       data: btoa(encodeURIComponent(JSON.stringify(completeTripData))),
      //     })
      // );
    } catch (error) {
      toast.error("Oops! Something went wrong. Please try again.");
      console.error(error);
    } finally {
      // Keep loading true on success to allow for redirection
      if (formError) setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <CircularProgress />
        <span className="ml-4 text-gray-600 font-medium">
          Loading map services...
        </span>
      </div>
    );
  }

  const tripTypeIcons = {
    "ONE WAY": <DirectionsCarIcon className="mr-2" />,
    "ROUND TRIP": <LoopIcon className="mr-2" />,
    "HOURLY RENTAL": <AccessTimeIcon className="mr-2" />,
  };

  const rentalHoursOptions = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24,
  ];

  return (
    <div className="min-h-screen bg-gray-100/50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Your Journey,{" "}
            <span className="text-pink-600">Perfectly Planned</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Book reliable cabs for any trip. Enter your details to find the best
            rides available.
          </p>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 border border-gray-100">
          {/* Trip Type Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["ONE WAY", "ROUND TRIP", "HOURLY RENTAL"].map((type) => (
                <button
                  key={type}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center text-sm sm:text-base ${
                    tripType === type
                      ? "bg-blue-600 text-white shadow-lg scale-105 transform"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                  }`}
                  onClick={() => setTripType(type)}
                >
                  {tripTypeIcons[type]}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location Selection */}
          <div className="relative flex justify-around items-center gap-4 mb-6">
            <LocationInput
              label="Pickup Location"
              value={source}
              onValueChange={setSource}
              onAutocompleteLoad={setSourceAutocomplete}
              onPlaceChanged={() =>
                handlePlaceChanged(sourceAutocomplete, "source")
              }
              onMapClick={() => {
                setCurrentMapType("source");
                setMapOpen(true);
              }}
            />

            {tripType !== "HOURLY RENTAL" && (
              <div className="hidden md:flex items-center justify-center -mx-4">
                <Tooltip title="Swap locations">
                  <IconButton
                    onClick={handleSwapLocations}
                    className="bg-gray-200 hover:bg-blue-500 hover:text-white transition-all duration-300"
                  >
                    <SwapVertIcon />
                  </IconButton>
                </Tooltip>
              </div>
            )}

            {tripType !== "HOURLY RENTAL" && (
              <LocationInput
                label="Drop Location"
                value={destination}
                onValueChange={setDestination}
                onAutocompleteLoad={setDestinationAutocomplete}
                onPlaceChanged={() =>
                  handlePlaceChanged(destinationAutocomplete, "destination")
                }
                onMapClick={() => {
                  setCurrentMapType("destination");
                  setMapOpen(true);
                }}
              />
            )}

            {tripType === "HOURLY RENTAL" && (
              <div className="w-full overflow-x-auto">
                <div className="flex space-x-2">
                  {rentalHoursOptions.map((hour) => (
                    <button
                      key={hour}
                      onClick={() => setHourlyRentalHours(hour)}
                      className={`py-2 px-4 rounded-md font-semibold whitespace-nowrap transition-colors duration-200 ${
                        hourlyRentalHours === hour
                          ? "bg-blue-600 text-white"
                          : "bg-white text-blue-600 border border-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      {hour} hr
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Schedule & Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pickup Date & Time */}
            <div className="p-4 bg-gray-50 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Pickup Date"
                  value={pickupDatetime}
                  onChange={setPickupDatetime}
                  disablePast
                  minDate={minPickupTime}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <TimePicker
                  label="Pickup Time"
                  value={pickupDatetime}
                  onChange={setPickupDatetime}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </div>

            {/* Return or Hourly Options */}
            {tripType === "ROUND TRIP" && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Return Date"
                      value={returnDatetime}
                      onChange={setReturnDatetime}
                      minDate={pickupDatetime || minPickupTime}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                    <TimePicker
                      label="Return Time"
                      value={returnDatetime}
                      onChange={setReturnDatetime}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            )}
          </div>

          {formError && (
            <div className="text-red-600 text-center font-semibold mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
              {formError}
            </div>
          )}

          {/* CTA Button */}
          <button
            className={`w-full py-4 px-6 text-lg rounded-lg font-bold text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-1"
            }`}
            onClick={handleExploreCabs}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} color="inherit" className="mr-3" />
                Searching for Cabs...
              </>
            ) : (
              "Find Cabs"
            )}
          </button>
        </div>
      </div>

      {/* Map Modal */}
      <Modal open={mapOpen} onClose={() => setMapOpen(false)}>
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl w-full max-w-3xl relative flex flex-col h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {`Select ${
                  currentMapType === "source" ? "Pickup" : "Drop"
                } Location`}
              </h2>
              <IconButton onClick={() => setMapOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>
            <div className="flex-grow w-full rounded-lg overflow-hidden border border-gray-200 relative">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={userLocation}
                zoom={13}
                onClick={handleMapClick}
                onLoad={setMapRef}
                options={{
                  zoomControl: true,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                }}
              >
                {selectedLocationOnMap && (
                  <Marker position={selectedLocationOnMap} />
                )}
              </GoogleMap>
              <button
                onClick={() => mapRef && mapRef.panTo(userLocation)}
                className="absolute bottom-4 left-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
              >
                <Tooltip title="Pan to your location">
                  <MyLocationIcon color="primary" />
                </Tooltip>
              </button>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 text-sm text-center sm:text-left">
                Click on the map to choose a location.
              </p>
              <Button
                variant="contained"
                color="primary"
                disabled={!selectedLocationOnMap}
                onClick={handleConfirmMapLocation}
                className="w-full sm:w-auto"
              >
                Confirm Location
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// --- SUB-COMPONENTS ---

// Memoized LocationInput to prevent re-renders from parent state changes
const LocationInput = React.memo(function LocationInput({
  label,
  value,
  onValueChange,
  onAutocompleteLoad,
  onPlaceChanged,
  onMapClick,
}) {
  return (
    <div className="w-full">
      <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
        <TextField
          label={label}
          variant="outlined"
          fullWidth
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="Enter address or select from map"
          InputProps={{
            endAdornment: (
              <Tooltip title={`Select ${label} from map`}>
                <IconButton
                  aria-label={`select ${label} from map`}
                  onClick={onMapClick}
                  color="primary"
                >
                  <LocationOnIcon />
                </IconButton>
              </Tooltip>
            ),
          }}
        />
      </Autocomplete>
    </div>
  );
});

export default TripPlanner;
