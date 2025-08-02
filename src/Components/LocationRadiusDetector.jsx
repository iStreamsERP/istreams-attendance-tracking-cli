import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { LocationService } from '../Logics/LocationService';
import { GlobalStyles } from '../Styles/styles';
import { useAuth } from '../Context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from './Header';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../Context/ThemeContext';
import { colors } from '../Styles/colors';

const LocationRadiusDetector = ({
    onLocationCheck,
    onLocationUpdate,
    onAccessGranted,
    onAccessDenied,
    onRadiusUpdate,
    showAlerts = true,
    autoRetry = true,
    children,
}) => {
    const { userData } = useAuth();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();
    const { darkMode, theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const { returnTo } = route.params || {};

    // State for location detection
    const [locationLoading, setLocationLoading] = useState(false);
    const [distance, setDistance] = useState(null);
    const [canAccess, setCanAccess] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [checkinRadius, setCheckinRadius] = useState(null);
    const [address, setAddress] = useState('');
    const [locationCheckComplete, setLocationCheckComplete] = useState(false);
    const [locationCheckResult, setLocationCheckResult] = useState(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');

    // State for project selection
    const [siteLocations, setSiteLocations] = useState([]);
    const [showprojLocPopup, setShowprojLocPopup] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredLocations, setFilteredLocations] = useState([]);

    // Location calculation functions
    const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }, []);

    const parseCoordinates = useCallback((coordString) => {
        if (!coordString || typeof coordString !== 'string') return { latitude: 0, longitude: 0 };
        const coords = coordString.trim().split(',');
        if (coords.length !== 2) return { latitude: 0, longitude: 0 };

        const lat = parseFloat(coords[0]);
        const lon = parseFloat(coords[1]);

        return (isNaN(lat) || isNaN(lon)) ? { latitude: 0, longitude: 0 } : { latitude: lat, longitude: lon };
    }, []);

    // Fetch project locations
    const getData = async () => {
        try {
            const PrjSiteLocations_SQLQueryParameter = {
                SQLQuery: 'SELECT * FROM project_site_locations_view'
            };

            const PrjSiteLocationsList = await callSoapService(userData.clientURL, 'DataModel_GetDataFrom_Query', PrjSiteLocations_SQLQueryParameter);

            if (PrjSiteLocationsList !== null) {
                setSiteLocations(PrjSiteLocationsList);
                setFilteredLocations(PrjSiteLocationsList);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    // Filter locations based on search text
    const filterLocations = useCallback((text) => {
        if (!text.trim()) {
            setFilteredLocations(siteLocations);
        } else {
            const filtered = siteLocations.filter(item =>
                item.PROJECT_NAME?.toLowerCase().includes(text.toLowerCase()) ||
                item.PROJECT_NO?.toLowerCase().includes(text.toLowerCase()) ||
                item.SITE_LOCATION?.toLowerCase().includes(text.toLowerCase()) ||
                item.DETAIL_DESCRIPTION?.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredLocations(filtered);
        }
    }, [siteLocations]);

    // Handle location selection
    const handleItemSelect = (item) => {
        const projectName = item.PROJECT_NAME ?? ""; // <-- if null or undefined, use empty string
        const locationData = {
            coordinates: item.GPS_LOCATION || `${item.GPS_LATITUDE},${item.GPS_LONGITUDE}`,
            name: `${item.PROJECT_NO} - ${projectName}`,
            siteLocation: item.SITE_LOCATION,
            description: item.DETAIL_DESCRIPTION,
            GPS_LATITUDE: item.GPS_LATITUDE,
            GPS_LONGITUDE: item.GPS_LONGITUDE,
            checkinRadius: parseFloat(item.CHECK_IN_RADIOUS || 0)
        };

        setSelectedLocation(locationData);
        setCheckinRadius(locationData.checkinRadius);
        setShowprojLocPopup(false);
        setSearchText(`${item.PROJECT_NO} - ${projectName} (${item.SITE_LOCATION})`);
        setLocationCheckComplete(false);
        setLocationCheckResult(null);

        AsyncStorage.setItem('CURRENT_OFC_LOCATION', JSON.stringify(locationData));

        setTimeout(() => checkLocationDistance(locationData), 500);
    };

    // Main location checking function
    const checkLocationDistance = useCallback(async (targetLocation = null) => {
        setLocationLoading(true);
        setLocationCheckComplete(false);
        setLocationCheckResult(null);

        try {
            const targetLoc = targetLocation || selectedLocation;
            if (!targetLoc) {
                if (showAlerts) Alert.alert('Error', 'Please select a project location first.');
                return false;
            }

            const hasCoordinates = (() => {
                const lat = (targetLoc.GPS_LATITUDE || "").trim().toLowerCase();
                const lon = (targetLoc.GPS_LONGITUDE || "").trim().toLowerCase();
                const coordStr = (targetLoc.coordinates || "").trim().toLowerCase();

                // Check individual fields
                const validLatLon = lat && lon && lat !== "null" && lon !== "null";
                // Check combined string
                const validCoordStr = coordStr && coordStr !== "null,null" && coordStr.includes(",");

                return validLatLon || validCoordStr;
            })();

            // ---- Restrict entry if no coordinates ----
            if (!hasCoordinates) {
                const resultData = {
                    distance: null,
                    canAccess: false,
                    locationName: '',
                    coordinates: '',
                    address: '',
                    selectedProject: targetLoc,
                    status: 'failed'
                };

                setDistance(null);
                setCanAccess(false);
                setLocationCheckResult(resultData);
                setLocationCheckComplete(true);
                onAccessDenied?.(resultData);

                if (showAlerts) {
                    Alert.alert('Error', 'This location does not have valid coordinates. Contact admin.');
                }
                return false;
            }

            // ---- Skip geofencing only when radius = 0 AND coordinates exist ----
            const isExactZero =
                (targetLoc.checkinRadius === 0 || targetLoc.checkinRadius === "0");

            if (isExactZero) {
                const resultData = {
                    distance: 0,
                    canAccess: true,
                    locationName: '',
                    coordinates: targetLoc.coordinates || `${targetLoc.GPS_LATITUDE},${targetLoc.GPS_LONGITUDE}`,
                    address: '',
                    selectedProject: targetLoc,
                    status: 'success'
                };

                setDistance(0);
                setCanAccess(true);
                setLocationCheckResult(resultData);
                setLocationCheckComplete(true);
                onLocationCheck?.(resultData);
                onLocationUpdate?.({});
                onAccessGranted?.(resultData);
                return true;
            }

            // ---- Normal geofencing logic (unchanged) ----
            const locationData = await new Promise((resolve, reject) => {
                let locationInfo = { name: '', coordinates: '', address: '' };
                try {
                    LocationService(
                        (name) => { locationInfo.name = name; setLocationName(name); },
                        (coords) => { locationInfo.coordinates = coords; setCoordinates(coords); resolve(locationInfo); },
                        (addr) => { locationInfo.address = addr; setAddress(addr); }
                    );
                    setTimeout(() => reject(new Error('Timeout: No coordinates received')), 15000);
                } catch (error) { reject(error); }
            });

            const currentCoords = parseCoordinates(locationData.coordinates);
            const officeCoords = targetLoc.GPS_LATITUDE && targetLoc.GPS_LONGITUDE
                ? { latitude: parseFloat(targetLoc.GPS_LATITUDE), longitude: parseFloat(targetLoc.GPS_LONGITUDE) }
                : parseCoordinates(targetLoc.coordinates || targetLoc.GPS_LOCATION);

            const distanceFromOffice = calculateDistance(
                currentCoords.latitude, currentCoords.longitude,
                officeCoords.latitude, officeCoords.longitude
            );
            const roundedDistance = Math.round(distanceFromOffice);
            const isWithinRange = roundedDistance <= parseFloat(targetLoc.checkinRadius || 0);

            setDistance(roundedDistance);
            setCanAccess(isWithinRange);
            const resultData = {
                distance: roundedDistance,
                canAccess: isWithinRange,
                locationName: locationData.name,
                coordinates: locationData.coordinates,
                address: locationData.address,
                selectedProject: targetLoc,
                status: isWithinRange ? 'success' : 'failed'
            };
            setLocationCheckResult(resultData);
            setLocationCheckComplete(true);
            onLocationCheck?.(resultData);
            onLocationUpdate?.(locationData);
            if (isWithinRange) onAccessGranted?.(resultData);
            else {
                onAccessDenied?.(resultData);
                if (showAlerts) {
                    setSnackbarMsg('Take a Few Steps Away from the Location and try...');
                    setSnackbarVisible(true);
                }
            }
            return isWithinRange;
        } catch (err) {
            console.error('Location error:', err);
            if (showAlerts) Alert.alert('Error', err.message || 'Failed to get current location.');
            return false;
        } finally {
            setLocationLoading(false);
        }
    }, [selectedLocation, checkinRadius, showAlerts, autoRetry]);

    const retryLocationCheck = useCallback(() => checkLocationDistance(), [checkLocationDistance]);

    // Manual navigation function
    const handleProceed = () => {
        console.log(locationCheckResult);

        if (locationCheckResult && locationCheckResult.canAccess) {
            // navigation.navigate('SuccessAnimationScreen', {
            //     message: 'Location Verified',
            //     details: `You are within ${locationCheckResult.distance}m of the project location. You can now capture your attendance.`,
            //     returnTo: returnTo || 'Home',
            //     selectedLocation: locationCheckResult.selectedProject
            // });

            navigation.navigate(returnTo, {
                selectedLocation: locationCheckResult.selectedProject
            });
        }
    };

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        filterLocations(searchText);
    }, [searchText, filterLocations]);

    const changeLocation = () => {
        setSearchText('');
        setShowprojLocPopup(true);
    }

    // Show loading screen during location check
    if (locationLoading) {
        return (
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Location Radius Detector" />
                <View style={[globalStyles.flex_1, globalStyles.justalignCenter, globalStyles.p_20]}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={globalStyles.subtitle_1}>Checking your location...</Text>
                    {selectedLocation && (
                        <Text style={[globalStyles.subtitle, globalStyles.mt_10, { color: '#007AFF' }]}>
                            Selected Project: {selectedLocation.name} - {selectedLocation.siteLocation}
                        </Text>
                    )}
                    {distance !== null && (
                        <Text style={[globalStyles.content1, globalStyles.mt_10]}>
                            Current distance: {distance}m (Required: within {checkinRadius}m)
                        </Text>
                    )}
                    {checkinRadius === 0 && (
                        <Text style={[globalStyles.content1, globalStyles.mt_10]}>
                            No geofencing applied for this location.
                        </Text>
                    )}
                    <Button
                        mode="contained"
                        onPress={retryLocationCheck}
                        theme={{
                            colors: {
                                primary: colors.primary,
                                disabled: colors.lightGray, // <- set your desired disabled color
                            },
                        }}
                        style={globalStyles.mt_10}
                    >
                        Retry Location Check
                    </Button>
                </View>
            </View>
        );
    }

    // Main UI for project selection
    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <Header title="Location Radius Detector" />

            <TextInput
                mode='outlined'
                label="Search Project / Location"
                placeholder="Search Project / Location ..."
                style={{ marginVertical: 10 }}
                theme={theme}
                value={searchText}
                onChangeText={setSearchText}
                onPressIn={() => setShowprojLocPopup(true)}
                right={
                    searchText ?
                        <TextInput.Icon
                            icon="close"
                            onPress={() => setSearchText('')}
                        /> : null
                }
            />

            {showprojLocPopup && (
                <View style={[styles.dropdown, { backgroundColor: colors.card }]}>
                    <FlatList
                        data={filteredLocations}
                        keyExtractor={(item, index) =>
                            item.GPS_LATITUDE ? `${item.GPS_LATITUDE}-${index}` : `item-${index}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => handleItemSelect(item)}
                                style={styles.dropdownItem}
                            >
                                <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>
                                    {item.PROJECT_NAME
                                        ? `${item.PROJECT_NO} - ${item.PROJECT_NAME}`
                                        : item.PROJECT_NO}
                                </Text>
                                <View style={globalStyles.twoInputContainer}>
                                    <Text style={globalStyles.subtitle_2}>{item.SITE_LOCATION}</Text>
                                    <Text style={globalStyles.subtitle_2}>{item.DETAIL_DESCRIPTION}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {selectedLocation && !showprojLocPopup &&
                (
                    <View style={globalStyles.camButtonContainer}>
                        <Button
                            icon={"reload"}
                            mode="contained"
                            theme={{
                                colors: {
                                    primary: colors.primary,
                                    disabled: colors.lightGray, // <- set your desired disabled color
                                },
                            }}
                            onPress={() => checkLocationDistance()}
                        >
                            Recheck
                        </Button>
                    </View>
                )}

            <View style={globalStyles.flex_1}>
                {/* Location Check Results Display */}
                {locationCheckComplete && locationCheckResult && (
                    <View style={[
                        styles.resultContainer,
                        locationCheckResult.canAccess ? styles.successContainer : styles.failureContainer
                    ]}>
                        <Text style={[globalStyles.title1, globalStyles.txt_center, { color: darkMode ? colors.background : colors.text }]}>
                            {locationCheckResult.canAccess ? '✅ Location Verified' : '❌ Access Denied'}
                        </Text>

                        <View style={globalStyles.mb_10}>
                            <Text style={[globalStyles.subtitle_2, globalStyles.mb_10, globalStyles.mt_10, { color: darkMode ? colors.background : colors.text }]}>
                                Site: {selectedLocation.siteLocation}
                            </Text>
                            <Text style={[globalStyles.subtitle_2, globalStyles.mb_10, { color: darkMode ? colors.background : colors.text }]}>
                                Project: {selectedLocation.name}
                            </Text>
                            <Text style={[globalStyles.subtitle_2, globalStyles.mb_10, { color: darkMode ? colors.background : colors.text }]}>
                                {checkinRadius === 0
                                    ? 'No geofencing applied for this location'
                                    : `Required radius: Within ${checkinRadius}m`
                                }
                            </Text>
                            <Text style={[globalStyles.subtitle_2, globalStyles.mb_10, { color: darkMode ? colors.background : colors.text }]}>
                                Current Location: {locationName}
                            </Text>
                            <Text style={[globalStyles.subtitle_2, globalStyles.mb_10, { color: darkMode ? colors.background : colors.text }]}>
                                Coordinates: {locationCheckResult.coordinates}
                            </Text>
                            
                            <Text style={[globalStyles.subtitle_2, globalStyles.mb_10, { color: darkMode ? colors.background : colors.text }]}>
                                Radius:
                                {checkinRadius === 0 ? (
                                    <Text style={{ color: darkMode ? colors.background : colors.text }}>
                                        You're having access to Attendance without Geofencing
                                    </Text>
                                ) : locationCheckResult.distance > checkinRadius ? (
                                    <Text style={{ color: '#d42525' }}>
                                        ✕ You're now {locationCheckResult.distance}m Away. Move Closer and Try Again
                                    </Text>
                                ) : (
                                    <Text style={{ color: '#1a941f' }}>
                                        ✓ You're Within {locationCheckResult.distance}m Radius
                                    </Text>
                                )}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            <View>
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    action={{
                        label: 'OK',
                        onPress: () => setSnackbarVisible(false),
                    }}
                >
                    {snackbarMsg}
                </Snackbar>
            </View>

            {locationCheckComplete && locationCheckResult?.canAccess !== null && (
                locationCheckResult.canAccess ? (
                    <Button
                        mode="contained"
                        onPress={handleProceed}
                        style={[globalStyles.bottomButtonContainer, { backgroundColor: '#4caf50' }]}
                    >
                        Proceed to Attendance
                    </Button>
                ) : (
                    <View style={[globalStyles.twoInputContainer, globalStyles.mt_10, globalStyles.bottomButtonContainer, { columnGap: 10 }]}>
                        <Button
                            mode="contained"
                            onPress={() => checkLocationDistance()}
                            icon={"reload"}
                            theme={{ colors: { primary: '#007AFF' } }}
                        >
                            Try Again
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={changeLocation}
                            theme={{ colors: { primary: '#007AFF' } }}
                            style={globalStyles.flex_1}
                            icon={"map-marker"}
                        >
                            Change Location
                        </Button>
                    </View>
                )
            )}

            {children && typeof children === 'function'
                ? children({
                    locationLoading,
                    distance,
                    canAccess,
                    locationName,
                    coordinates,
                    address,
                    selectedLocation,
                    locationCheckResult,
                    locationCheckComplete,
                    checkLocationDistance,
                    retryLocationCheck,
                    handleProceed
                })
                : children}
        </View>
    );
};

const styles = StyleSheet.create({
    dropdown: {
        maxHeight: 430,
        borderColor: colors.gray,
        borderWidth: 1,
        borderRadius: 5,
    },
    dropdownItem: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    resultContainer: {
        marginVertical: 15,
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
    },
    successContainer: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4caf50',
    },
    failureContainer: {
        backgroundColor: '#ffeaea',
        borderColor: '#f44336',
    },
});

export default LocationRadiusDetector;