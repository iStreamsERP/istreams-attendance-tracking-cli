import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

// Optional: Replace this with your actual API key (e.g., Google Maps or OpenCage)
const GEOCODING_API_KEY = 'AIzaSyA67GzW-GGF8hxrIYi1LMmtnJHFbCydPKc';

async function reverseGeocode(latitude, longitude) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GEOCODING_API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return 'Address not found';
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return 'Error fetching address';
  }
}

// ⬇️ Wrap Geolocation in a Promise so it can be awaited
function getCurrentPositionPromise(options = {}) {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, options);
  });
}

// ⬇️ Main service function to get location and address
export async function LocationService(setLocationName, setCoordinates, setAddress) {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonPositive: 'OK',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setLocationName('Permission denied');
        return;
      }
    }

    const position = await getCurrentPositionPromise({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });

    const { latitude, longitude } = position.coords;
    const coords = `${latitude}, ${longitude}`;

    // Set coordinates
    setCoordinates(coords);

    // Reverse geocode to get address
    const address = await reverseGeocode(latitude, longitude);

    // Set location name and address
    setLocationName(address);
    setAddress(address);
  } catch (err) {
    console.error('LocationService exception:', err);
    setCoordinates('');
    setLocationName('Error fetching location');
    setAddress('');
  }
}