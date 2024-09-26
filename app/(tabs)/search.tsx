import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, Linking, ActivityIndicator} from "react-native";
import MapView, { Marker } from 'react-native-maps';
import MapViewCluster from 'react-native-map-clustering';
import { Stack, useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { query, collection, getDocs } from "firebase/firestore"; // Firestore imports
import { db } from '../../firebaseConfig.js'; // Firebase Firestore config
import { requestTrackingPermission } from 'react-native-tracking-transparency'; // Import the tracking transparency API

const SearchPage = () => {
    const headerHeight = useHeaderHeight();
    const router = useRouter();
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [selectedEstablishment, setSelectedEstablishment] = useState<string | null>(null);
    const [establishments, setEstablishments] = useState([]); // Store fetched establishments
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        // Request tracking permission on app load
        const askForTrackingPermission = async () => {
            const trackingStatus = await requestTrackingPermission();
            if (trackingStatus === 'authorized') {
                console.log("Tracking permission granted.");
            } else {
                console.log("Tracking permission denied or restricted.");
            }
        };

        askForTrackingPermission(); // Call the permission request function

        // Request location permission and get current position
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation(location.coords);
        })();

        // Fetch establishment data from Firestore
        const fetchEstablishments = async () => {
            try {
                const establishmentsRef = collection(db, "establishments");
                const q = query(establishmentsRef);
                const querySnapshot = await getDocs(q);
                const establishmentsArray = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    coordinates: {
                        latitude: parseFloat(doc.data().latitude),
                        longitude: parseFloat(doc.data().longitude)
                    }
                }));
                setEstablishments(establishmentsArray);
            } catch (error) {
                console.error("Error fetching establishments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEstablishments();
    }, []);
    const handleMarkerPress = (id: string) => {
        setSelectedEstablishment(prev => (prev === id ? null : id));
    };
    const handleImagePress = (id) => {
        // Navigate to the details page with the establishment ID
        router.push(`/Establishments/${id}`);
    };

    const openMaps = (location: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        Linking.openURL(url);
    };

    const renderExpandedView = (establishment) => (
        <TouchableOpacity onPress={() => handleImagePress(establishment.id)} style={styles.expandedView}>
            <Image
                source={{ uri: establishment.image }}
                style={styles.expandedImage}
            />
            <View style={styles.contentWrapper}>
                <Text style={styles.establishmentName}>{establishment.name}</Text>
                <View style={styles.highlightRow}>
                    <View style={styles.highlightWrapper}>
                        <View style={styles.highlightIcon}>
                            <Ionicons name="restaurant" size={18} color='#264117' />
                        </View>
                        <View>
                            <Text style={styles.HighlightText}>{establishment.cuisine}</Text>
                            <Text style={styles.HighlightTextVal}>Cuisine</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => openMaps(establishment.location)} style={styles.directionsWrapper}>
                        <View style={styles.highlightIcon}>
                            <Ionicons name="navigate" size={18} color='#264117' />
                        </View>
                        <View>
                            <Text style={styles.HighlightText}>Directions</Text>
                            <Text style={styles.HighlightTextVal}>Tap for directions</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
    

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#264117" />
            <Text style={styles.loadingText}>Loading map and establishments...</Text>
        </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerTransparent: true,
                    headerTitle: () => (
                        <View style={styles.headerContainer}>
                            <Image
                                source={require('../../assets/images/Savor-Logo.webp')}
                                style={styles.image}
                            />
                        </View>
                    ),
                    headerStyle: {
                        backgroundColor: '#ffffff',
                    },
                }}
            />
            <View style={[styles.container, { paddingTop: headerHeight }]}>
            <Image
                                source={require('../../assets/images/Savor-Logo.webp')}
                                style={styles.image}
                            />
                <Text style={styles.headingTxt}>Find Food</Text>
                
                <MapViewCluster
                    style={styles.map}
                    initialRegion={{
                        latitude: currentLocation ? currentLocation.latitude : 43.0753,
                        longitude: currentLocation ? currentLocation.longitude : -89.3962,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    {currentLocation && (
                        <Marker
                            coordinate={{
                                latitude: currentLocation.latitude,
                                longitude: currentLocation.longitude,
                            }}
                        >
                            <View style={styles.currentLocationMarker}>
                                <View style={styles.outerCircle}>
                                    <View style={styles.innerCircle} />
                                </View>
                            </View>
                        </Marker>
                    )}
                    
                    {establishments.map((establishment) => (
    <Marker
        key={establishment.id}
        coordinate={establishment.coordinates}
        onPress={() => handleMarkerPress(establishment.id)}
    >
        <View>
            {selectedEstablishment === establishment.id ? (
                renderExpandedView(establishment)
            ) : (
                <View style={styles.marker}>
                    <Image
                        source={{ uri: establishment.image }}
                        style={styles.markerImage}
                    />
                    <Text style={styles.markerText}>{establishment.name}</Text>
                </View>
            )}
        </View>
    </Marker>
))}

                </MapViewCluster>
            </View>
        </>
    );
};

export default SearchPage;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    currentLocationMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    outerCircle: {
        width: 70,  // Outer blue glow size
        height: 70,
        borderRadius: 40, // Fully rounded
        backgroundColor: 'rgba(0,122,255,0.3)', // Light blue transparent color for outer glow
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerCircle: {
        width: 30,  // Inner solid blue circle size
        height: 30,
        borderRadius: 15, // Fully rounded
        backgroundColor: '#007AFF', // Solid blue color for inner dot
    },
    map: {
        width: Dimensions.get('window').width - 20,
        height: Dimensions.get('window').height - 250,
        margin: 10,
        marginBottom: 10,
        borderColor: '#264117',
        borderWidth: 5,
        borderRadius: 10,
    },
    headerContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    headingTxt: {
        marginTop: 110,
        fontSize: 28,
        fontWeight: '800',
        backgroundColor: '#fffffff',
        color: '#264117',
        textAlign: 'center',
        marginBottom: 10,
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 30,
        borderColor: '#264117',
        borderWidth: 0,
        shadowColor: '#264117',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 2,
        shadowRadius: 10,
        position: 'absolute',
        left: '50%',
        transform: [{ translateX: -20 }],
        marginTop: 57,
    },
    marker: {
        alignItems: 'center',
    },
    markerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    markerText: {
        marginTop: 5,
        fontSize: 8,
        textAlign: 'center',
        backgroundColor: '#264117',
        color: 'white',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    currentLocationMarker: {
        width: 80,
        height: 80,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    expandedView: {
        width: 190, // Ensure square size
        height: 175, // Ensure square size
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
    },
    expandedImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    contentWrapper: {
        alignItems: 'center',
    },
    establishmentName: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#264117',
        textAlign: 'center',
    },
    highlightRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    highlightWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 2,
    },
    directionsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 7, // Add padding to make the hitbox larger
        borderRadius: 5, // Add border radius for aesthetics
        backgroundColor: '#ffffff', // Add background color to make the hitbox visible
    },
    highlightIcon: {
        marginRight: 5,
    },
    HighlightText: {
        fontSize: 10,
        color: '#264117',
    },
    HighlightTextVal: {
        fontSize: 8,
        color: '#7a7a7a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#264117'
    },
});
