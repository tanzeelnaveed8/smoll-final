import { Alert } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { uaeCities } from "@/utils/country-codes";

interface LocationResult {
  city: string;
}

export const getCurrentLocation = (): Promise<LocationResult> => {
  return new Promise((resolve, reject) => {
    // Multiple attempts with different strategies
    let attempts = 0;
    const maxAttempts = 3;

    const tryGetLocation = () => {
      attempts++;
      console.log(`Attempt ${attempts} of ${maxAttempts}`);

      const options = {
        enableHighAccuracy: false,
        timeout: 10000, // 10 seconds per attempt
        maximumAge: attempts === 1 ? 0 : 300000, // Accept cached location on retry
        distanceFilter: attempts === 1 ? 10 : 1000, // Lower accuracy on retry
      };

      Geolocation.getCurrentPosition(
        async (position) => {
          console.log("Location received:", position);
          try {
            const { latitude, longitude } = position.coords;

            // Use a reverse geocoding service
            const city = await reverseGeocode(latitude, longitude);
            console.log("City found:", city);

            resolve({
              city,
            });
          } catch (error) {
            console.error("Error in location processing:", error);
            reject(error);
          }
        },
        (error) => {
          let errorMessage = "Unable to get your location after multiple attempts";

          switch (error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage =
                "Location permission denied. Please enable location services in Settings.";
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = "Location information unavailable. Please check if GPS is enabled.";
              break;
            case 3: // TIMEOUT
              errorMessage =
                "Location request timed out. Please try again or check your GPS signal.";
              break;
          }

          reject(new Error(errorMessage));
        },
        options
      );
    };

    tryGetLocation();
  });
};

// Simple reverse geocoding using a free service
const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    console.log("Reverse geocoding for:", latitude, longitude);

    // Add headers to avoid CORS issues
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "YourApp/1.0",
          "Accept-Language": "en",
        },
      }
    );

    if (!response.ok) {
      console.error("Geocoding response not ok:", response.status, response.statusText);
      throw new Error("Geocoding failed");
    }

    const data = await response.json();
    console.log("Geocoding response:", JSON.stringify(data, null, 2));

    const displayNameList = data.display_name?.split(", ");

    // Extract city from the response with better fallbacks
    const city =
      data.address?.state ||
      uaeCities.filter((item: any) => displayNameList.includes(item.state)) || // First part of display name
      "Unknown City";

    console.log("Extracted city:", city);
    return city;
  } catch (error) {
    console.error("Reverse geocoding error:", error);

    // Try alternative geocoding service as fallback
    try {
      console.log("Trying alternative geocoding service...");
      const altResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log("Alternative geocoding response:", altData);

        const altCity = altData.city || altData.locality || "Unknown City";
        console.log("Alternative city:", altCity);
        return altCity;
      }
    } catch (altError) {
      console.error("Alternative geocoding also failed:", altError);
    }

    throw new Error("Could not determine city from location");
  }
};
