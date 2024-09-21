import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, ListRenderItem, Dimensions } from "react-native";
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { EstablishmentType } from '@/types/establishmentType';
import { Link } from "expo-router";
import { useBookmarks } from '@/components/BookmarksContext';

type Props = {
    establishments: EstablishmentType[];
    category: string;
    dotw: string;
}

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

const Establishments = ({ establishments, category, dotw }: Props) => {
    const [loading, setLoading] = useState(false);
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [establishmentsWithDistance, setEstablishmentsWithDistance] = useState<EstablishmentType[]>([]);

    useEffect(() => {
        // Show the establishments immediately
        setEstablishmentsWithDistance(establishments);

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location);

            // Calculate distances in the background
            establishments.forEach((establishment) => {
                if (location) {
                    const distance = calculateDistance(
                        location.coords.latitude,
                        location.coords.longitude,
                        parseFloat(establishment.latitude),
                        parseFloat(establishment.longitude)
                    );
                    setEstablishmentsWithDistance((prev) => 
                        prev.map((est) =>
                            est.id === establishment.id ? { ...est, distance: (distance * 0.621371).toFixed(2) } : est
                        )
                    );
                }
            });
        })();
    }, [category, dotw, establishments]);

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const splitDayRange = (dayRange: string) => {
        const [startDay, endDay] = dayRange.split(" & ");
        const startIndex = daysOfWeek.indexOf(startDay);
        const endIndex = daysOfWeek.indexOf(endDay);
        
        if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
            return [];
        }

        return daysOfWeek.slice(startIndex, endIndex + 1);
    };

    const checkDayInDeals = (dealDays: string[], selectedDay: string) => {
        return dealDays.some(dealDay => {
            if (dealDay.includes("&")) {
                const expandedDays = splitDayRange(dealDay);
                return expandedDays.includes(selectedDay);
            }
            return dealDay.includes(selectedDay);
        });
    };

    const filteredEstablishments = establishmentsWithDistance.filter((establishment) =>
        (category === "All" || establishment.category.includes(category)) &&
        (dotw === "Select Day" || checkDayInDeals(establishment.dotw, dotw))
    );

    const handleBookmark = (establishment: EstablishmentType) => {
        if (isBookmarked(establishment.id)) {
            removeBookmark(establishment.id);
        } else {
            addBookmark(establishment);
        }
    };

    const renderItems: ListRenderItem<EstablishmentType> = ({ item }) => {
        const distanceText = item.distance ? `${item.distance} miles away` : 'Calculating Distance...';

        return (
            <Link href={`/Establishments/${item.id}`} asChild>
                <TouchableOpacity style={styles.itemWrapper}>
                    <View style={styles.item}>
                        <Image
                            source={{ uri: item.image }}
                            style={styles.image}
                        />
                        <TouchableOpacity
                            onPress={() => handleBookmark(item)}
                            style={styles.bookmark}
                        >
                            <Ionicons
                                name={isBookmarked(item.id) ? "bookmark" : "bookmark-outline"}
                                size={20}
                                color='#ffffff'
                            />
                        </TouchableOpacity>
                        <Text
                            style={styles.ItemText}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {item.name.toString()}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesome5
                                    name="map-marker-alt"
                                    size={18}
                                    color={'#264117'}
                                />
                                <Text style={styles.itemLocationText}> {distanceText} </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesome5
                                    name="star"
                                    size={18}
                                    color={'#264117'}
                                />
                                <Text style={styles.itemRatingText}> {item.rating.toString()} </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Link>
        );
    };

    return (
        <View style={styles.listContainer}>
            <FlatList
                data={filteredEstablishments}
                renderItem={renderItems}
                showsVerticalScrollIndicator={false}
                numColumns={2} 
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

export default Establishments;

const styles = StyleSheet.create({
    listContainer: {
        flex: 1,
    },
    itemWrapper: {
        flex: 1,
        margin: 5, // Adjust to ensure spacing between the two items in a row
    },
    item: {
        marginLeft: 2.5,
        marginTop: 0,
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 5,
        width: (Dimensions.get('window').width / 2) - 15, // Ensure two items per row with proper spacing
    },
    image: {
        width: '100%',
        height: 150, // Adjusted height for better layout
        borderRadius: 10,
        marginBottom: 10,
    },
    bookmark: {
        position: 'absolute',
        top: 140, // Adjusted based on image height
        right: 30,
        backgroundColor: '#264117',
        padding: 7,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    ItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#264117',
        marginBottom: 10,
    },
    itemLocationText: {
        fontSize: 12,
        marginLeft: 5,
    },
    itemRatingText: {
        fontSize: 14,
        marginLeft: 5,
        color: '#264117'
    },
});
