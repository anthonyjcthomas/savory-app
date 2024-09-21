import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, Linking } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import MapViewCluster from 'react-native-map-clustering';
import { Stack, useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import * as Location from 'expo-location';
import { FontAwesome5, Ionicons } from '@expo/vector-icons'; // Import the icon
import establishmentsData from '@/data/establishmentsData.json';
import getCoordinatesFromAddress from '@/components/GeocodingUtility'; // Adjust the import path as needed

const SearchPage = () => {
    const headerHeight = useHeaderHeight();
    const router = useRouter(); // Initialize router for navigation
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [selectedEstablishment, setSelectedEstablishment] = useState<string | null>(null);
    const [establishmentCoords, setEstablishmentCoords] = useState({});

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation(location.coords);
        })();

        // Fetch coordinates for each establishment
        const fetchCoordinates = async () => {
            const coords = {};
            for (const establishment of establishmentsData) {
                const location = await getCoordinatesFromAddress(establishment.location);
                if (location) {
                    coords[establishment.id] = location;
                }
            }
            setEstablishmentCoords(coords);
        };

        fetchCoordinates();
    }, []);

    // Navigate to the establishment details page when the image is clicked
    const handleMarkerPress = (id: string) => {
        setSelectedEstablishment(prev => (prev === id ? null : id));
    };

    const handleImagePress = (id: string) => {
        // Navigate to the details page with the establishment ID
        router.push(`/Establishments/${id}`);
    };

    const openMaps = (location: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        Linking.openURL(url);
    };

    const renderExpandedView = (establishment: any) => (
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
                <Text style={styles.headingTxt}>Find Food</Text>
                <MapViewCluster
                    style={styles.map}
                    initialRegion={{
                        latitude: 43.0753,
                        longitude: -89.3962,
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
                                <Ionicons name="location" size={40} color='#264117' />
                            </View>
                        </Marker>
                    )}
                    {Object.entries(establishmentCoords).map(([id, coords]) => {
                        const establishment = establishmentsData.find(est => est.id === id);
                        if (!establishment) return null;
                        return (
                            <Marker
                                key={id}
                                coordinate={coords}
                                onPress={() => handleMarkerPress(id)}
                            >
                                <View>
                                    {selectedEstablishment === id ? (
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
                        );
                    })}
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
    },
    headingTxt: {
        marginTop: 10,
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
        width: 40,
        height: 40,
        borderRadius: 20,
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
        padding: 6, // Add padding to make the hitbox larger
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
});
