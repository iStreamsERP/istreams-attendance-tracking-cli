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

const LocationRadiusDetector = ({
    checkinRadius = 10,
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

    const { returnTo } = route.params || {};

    // State for location detection
    const [locationLoading, setLocationLoading] = useState(false);
    const [distance, setDistance] = useState(null);
    const [canAccess, setCanAccess] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [address, setAddress] = useState('');
    const [locationCheckComplete, setLocationCheckComplete] = useState(false);
    const [locationCheckResult, setLocationCheckResult] = useState(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');

    // State for project selection
    const [siteLocations, setSiteLocations] = useState([]);
    const [showprojLocPopup, setShowprojLocPopup] = useState(false);
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
        setSelectedLocation(item);
        setSearchText(`${item.PROJECT_NO} - ${item.PROJECT_NAME} (${item.SITE_LOCATION})`);
        setShowprojLocPopup(false);
        setLocationCheckComplete(false);
        setLocationCheckResult(null);

        // Save selected location to AsyncStorage
        const locationData = {
            coordinates: item.GPS_LOCATION || `${item.GPS_LATITUDE},${item.GPS_LONGITUDE}`,
            name: `${item.PROJECT_NO} - ${item.PROJECT_NAME}`,
            siteLocation: item.SITE_LOCATION,
            description: item.DETAIL_DESCRIPTION,
            GPS_LATITUDE: item.GPS_LATITUDE,
            GPS_LONGITUDE: item.GPS_LONGITUDE
        };

        AsyncStorage.setItem('CURRENT_OFC_LOCATION', JSON.stringify(locationData));

        // Automatically start location check after a brief delay
        setTimeout(() => {
            checkLocationDistance(locationData);
        }, 2000);
    };

    // Main location checking function
    const checkLocationDistance = useCallback(async (targetLocation = null) => {
        setLocationLoading(true);
        setLocationCheckComplete(false);
        setLocationCheckResult(null);

        try {
            const targetLoc = targetLocation || selectedLocation;
            if (!targetLoc) {
                if (showAlerts) {
                    Alert.alert('Error', 'Please select a project location first.');
                }
                return false;
            }

            const locationData = await new Promise((resolve, reject) => {
                let locationInfo = {
                    name: '',
                    coordinates: '',
                    address: ''
                };

                try {
                    LocationService(
                        (name) => {
                            locationInfo.name = name;
                            setLocationName(name);
                        },
                        (coords) => {
                            locationInfo.coordinates = coords;
                            setCoordinates(coords);
                            resolve(locationInfo); // Resolve only when coordinates are available
                        },
                        (addr) => {
                            locationInfo.address = addr;
                            setAddress(addr);
                        }
                    );

                    // Fallback timeout (15 seconds)
                    setTimeout(() => {
                        if (!locationInfo.coordinates) {
                            reject(new Error('Timeout: No coordinates received'));
                        }
                    }, 15000);

                } catch (error) {
                    reject(error);
                }
            });

            const currentCoords = parseCoordinates(locationData.coordinates);
            const officeCoords = targetLoc.GPS_LATITUDE && targetLoc.GPS_LONGITUDE
                ? {
                    latitude: parseFloat(targetLoc.GPS_LATITUDE),
                    longitude: parseFloat(targetLoc.GPS_LONGITUDE)
                }
                : parseCoordinates(targetLoc.coordinates || targetLoc.GPS_LOCATION);

            if (
                currentCoords.latitude && currentCoords.longitude &&
                officeCoords.latitude && officeCoords.longitude
            ) {
                const distanceFromOffice = calculateDistance(
                    currentCoords.latitude, currentCoords.longitude,
                    officeCoords.latitude, officeCoords.longitude
                );
                const roundedDistance = Math.round(distanceFromOffice);
                const isWithinRange = roundedDistance <= checkinRadius;

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
                if (isWithinRange) {
                    onAccessGranted?.(resultData);
                }
                else {
                    onAccessDenied?.(resultData);

                    if (showAlerts) {
                        setSnackbarMsg('Take a Few Steps Away from the Location and try...');
                        setSnackbarVisible(true);
                    }
                }

                return isWithinRange;
            } else {
                if (showAlerts) {
                    Alert.alert('Error', 'Invalid coordinates. Please check the selected location data.');
                }
                return false;
            }

        } catch (err) {
            console.error('Location error:', err);
            if (showAlerts) {
                Alert.alert('Error', err.message || 'Failed to get current location.');
            }
            return false;
        } finally {
            setLocationLoading(false);
        }
    }, [checkinRadius, selectedLocation, showAlerts, autoRetry]);


    const retryLocationCheck = useCallback(() => checkLocationDistance(), [checkLocationDistance]);

    // Manual navigation function
    const handleProceed = () => {
        console.log(locationCheckResult);

        if (locationCheckResult && locationCheckResult.canAccess) {
            navigation.navigate('SuccessAnimationScreen', {
                message: 'Location Verified',
                details: `You are within ${locationCheckResult.distance}m of the project location. You can now capture your attendance.`,
                returnTo: returnTo || 'Home',
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
            <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Location Radius Detector" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={GlobalStyles.subtitle_1}>Checking your location...</Text>
                    {selectedLocation && (
                        <Text style={[GlobalStyles.subtitle, GlobalStyles.mt_10, { color: '#007AFF' }]}>
                            Selected Project: {selectedLocation.PROJECT_NO} - {selectedLocation.SITE_LOCATION}
                        </Text>
                    )}
                    {distance !== null && (
                        <Text style={[GlobalStyles.content1, GlobalStyles.mt_10]}>
                            Current distance: {distance}m (Required: within {checkinRadius}m)
                        </Text>
                    )}
                    <Button
                        mode="contained"
                        onPress={retryLocationCheck}
                        style={GlobalStyles.mt_10}
                    >
                        Retry Location Check
                    </Button>
                </View>
            </View>
        );
    }

    // Main UI for project selection
    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <Header title="Location Radius Detector" />

            <TextInput
                mode='outlined'
                label="Search Project / Location"
                placeholder="Search Project / Location ..."
                style={{ marginVertical: 10 }}
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
                <View style={styles.dropdown}>
                    <FlatList
                        data={filteredLocations}
                        keyExtractor={(item, index) =>
                            item.GPS_LATITUDE ? `${item.GPS_LATITUDE}-${index}` : `item-${index}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => handleItemSelect(item)}
                                style={styles.dropdownItem}
                            >
                                <Text style={[GlobalStyles.subtitle_2, { color: '#0685de' }]}>
                                    {`${item.PROJECT_NO} - ${item.PROJECT_NAME}`}
                                </Text>
                                <View style={GlobalStyles.twoInputContainer}>
                                    <Text style={GlobalStyles.subtitle_2}>{item.SITE_LOCATION}</Text>
                                    <Text style={GlobalStyles.subtitle_2}>{item.DETAIL_DESCRIPTION}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {selectedLocation && !showprojLocPopup &&
                (
                    <View style={GlobalStyles.camButtonContainer}>
                        <Button
                            icon={"reload"}
                            mode="contained"
                            onPress={() => checkLocationDistance()}
                        >
                            Recheck
                        </Button>
                    </View>
                )}

            <View style={GlobalStyles.flex_1}>
                {/* Location Check Results Display */}
                {locationCheckComplete && locationCheckResult && (
                    <View style={[
                        styles.resultContainer,
                        locationCheckResult.canAccess ? styles.successContainer : styles.failureContainer
                    ]}>
                        <Text style={[GlobalStyles.title1, GlobalStyles.txt_center]}>
                            {locationCheckResult.canAccess ? '✅ Location Verified' : '❌ Access Denied'}
                        </Text>

                        <View style={GlobalStyles.mb_10}>
                            <Text style={[GlobalStyles.subtitle_2, GlobalStyles.mb_10, GlobalStyles.mt_10]}>
                                Site: {selectedLocation.SITE_LOCATION}
                            </Text>
                            <Text style={[GlobalStyles.subtitle_2, GlobalStyles.mb_10]}>
                                Project: {selectedLocation.PROJECT_NO} - {selectedLocation.PROJECT_NAME}
                            </Text>
                            <Text style={[GlobalStyles.subtitle_2, GlobalStyles.mb_10]}>
                                Required radius: Within {checkinRadius}m
                            </Text>
                            <Text style={[GlobalStyles.subtitle_2, GlobalStyles.mb_10]}>
                                Current Location: {locationName}
                            </Text>
                            <Text style={[GlobalStyles.subtitle_2, GlobalStyles.mb_10]}>
                                Coordinates: {locationCheckResult.coordinates}
                            </Text>
                            <Text style={[GlobalStyles.subtitle_2, GlobalStyles.mb_10]}>
                                Radius:
                                {locationCheckResult.distance > checkinRadius ? (
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
                        style={[GlobalStyles.bottomButtonContainer, { backgroundColor: '#4caf50' }]}
                    >
                        Proceed to Attendance
                    </Button>
                ) : (
                    <View style={[styles.actionButtons, GlobalStyles.bottomButtonContainer, { columnGap: 10 }]}>
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
                            style={GlobalStyles.flex_1}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dropdown: {
        maxHeight: 220,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#fff',
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
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    }
});

export default LocationRadiusDetector;