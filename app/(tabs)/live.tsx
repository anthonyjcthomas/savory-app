import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import establishmentsData from '@/data/establishmentsData.json';
import moment from 'moment-timezone';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { EstablishmentType, HappyHourDeal } from '@/types/establishmentType';
import Categories from "@/components/Categories";
import * as Location from 'expo-location';

const Live = () => {
    const headerHeight = useHeaderHeight();
    const [liveEstablishments, setLiveEstablishments] = useState<EstablishmentType[]>([]);
    const [category, setCategory] = useState<string>('All');
    const [loading, setLoading] = useState<boolean>(false); // Loading state for distance calculation

    useEffect(() => {
        const now = moment.tz('America/Chicago');
        const currentDay = now.format('dddd');
        const currentTime = now.format('HH:mm');

        const activeDeals = establishmentsData.filter((establishment: EstablishmentType) => {
            const categoryMatch = category === 'All' ||
                (Array.isArray(establishment.category) && establishment.category.includes(category));
            return (
                categoryMatch &&
                establishment.happy_hour_deals.some((deal: HappyHourDeal) => {
                    if (deal.deal_list.includes(currentDay)) {
                        const startTime = moment.tz(deal.start_time, 'HH:mm', 'America/Chicago');
                        const endTime = moment.tz(deal.end_time, 'HH:mm', 'America/Chicago');
                        const current = moment.tz(currentTime, 'HH:mm', 'America/Chicago');

                        if (endTime.isBefore(startTime)) {
                            endTime.add(1, 'day');
                        }

                        return current.isBetween(startTime, endTime);
                    }
                    return false;
                })
            );
        });

        setLiveEstablishments(activeDeals);
    }, [category]); // Re-run when category changes

    const openMaps = (location: string, name: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ', ' + location)}`;
        Linking.openURL(url);
    };

    const handleSortByDistance = async () => {
        setLoading(true); // Show loading indicator
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Location Permission Denied", "Please allow location access to sort establishments by proximity.");
            setLoading(false);
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const userLatitude = location.coords.latitude;
        const userLongitude = location.coords.longitude;

        const sortedEstablishments = liveEstablishments
            .map(establishment => {
                const distance = calculateDistance(
                    userLatitude,
                    userLongitude,
                    parseFloat(establishment.latitude),
                    parseFloat(establishment.longitude)
                );
                return { ...establishment, distance };
            })
            .sort((a, b) => a.distance - b.distance);

        setLiveEstablishments(sortedEstablishments); // Update state with sorted establishments
        setLoading(false); // Hide loading indicator
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon1 - lon2);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        return distance;
    };

    const renderEstablishment = ({ item }: { item: EstablishmentType }) => {
        const now = moment.tz('America/Chicago'); 
        const currentDay = now.format('dddd'); // Get the current day
        const currentTime = now.format('HH:mm'); // Get the current time in 24-hour format
        
        // Get the deals for the current day that are ongoing at the current time
        const currentDeals = item.happy_hour_deals.filter(deal => {
            if (deal.deal_list.includes(currentDay)) {
                const dealStartTime = moment.tz(deal.start_time, 'HH:mm', 'America/Chicago');
                const dealEndTime = moment.tz(deal.end_time, 'HH:mm', 'America/Chicago');
    
                // Adjust end time if it's the next day
                if (dealEndTime.isBefore(dealStartTime)) {
                    dealEndTime.add(1, 'day');
                }
    
                const currentMoment = moment.tz(currentTime, 'HH:mm', 'America/Chicago');
                return currentMoment.isBetween(dealStartTime, dealEndTime);
            }
            return false;
        });
    
        if (currentDeals.length === 0) {
            return null; // Don't display anything if there are no deals going on
        }
    
        return (
            <View style={styles.establishmentContainer}>
                <Image source={{ uri: item.image }} style={styles.establishmentImage} />
                <Text style={styles.establishmentName}>{item.name}</Text>
    
                {/* Display only the deal that is active at the current time */}
                {currentDeals.map((deal, index) => (
                    <Text key={index} style={styles.happyHourDetails}>{deal.details}</Text>
                ))}
    
                <Text style={styles.establishmentCuisine}>{item.cuisine} Cuisine</Text>
                <View style={styles.locationRow}>
                    <TouchableOpacity onPress={() => openMaps(item.location, item.name)} style={styles.locationButton}>
                        <FontAwesome5 name="map-marker-alt" size={18} color='#ffffff' />
                        <Text style={styles.locationText}>Directions</Text>
                    </TouchableOpacity>
                    <View style={styles.ratingWrapper}>
                        <Ionicons name="star" size={18} color='#ffffff' />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                </View>
            </View>
        );
    };

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
                <Text style={styles.headingTxt}>Live Deals</Text>

                {/* Categories Component */}
                <Categories onCategoryChanged={setCategory} onSortByDistance={handleSortByDistance} />

                {/* Loading Indicator */}
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={styles.loadingText}>Finding happy hours near you!</Text>
                    </View>
                )}

                {liveEstablishments.length > 0 && !loading ? (
                    <FlatList
                        data={liveEstablishments}
                        keyExtractor={item => item.id}
                        renderItem={renderEstablishment}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    !loading && <Text style={styles.noDealsText}>No Happy Hour Deals at the moment.</Text>
                )}
            </View>
        </>
    );
};

export default Live;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
    },
    headerContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        paddingBottom: 30,
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginTop: 30,
    },
    headingTxt: {
        marginTop: 10,
        fontSize: 28,
        fontWeight: '800',
        color: '#264117',
        textAlign: 'center',
    },
    list: {
        marginTop: 0,
    },
    establishmentContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        width: '94.5%', // Shrink the width to 90% of the screen width
        alignSelf: 'center' // Center the container
    },
    establishmentImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginBottom: 10,
    },
    establishmentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#264117',
        marginBottom: 5,
    },
    happyHourDetails: {
        fontSize: 16,
        color: '#264117',
        marginBottom: 10,
    },
    establishmentCuisine: {
        fontSize: 14,
        color: '#7a7a7a',
        marginBottom: 10,
    },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#264117',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
    },
    locationText: {
        color: '#ffffff',
        marginLeft: 8,
    },
    ratingWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#264117',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
    },
    ratingText: {
        color: '#ffffff',
        marginLeft: 8,
    },
    noDealsText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 350,
        color: '#555',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
});
