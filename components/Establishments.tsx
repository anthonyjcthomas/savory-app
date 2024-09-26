import { collection, getDocs } from "firebase/firestore"; // Firestore imports
import { db } from '../firebaseConfig.js'; // Firebase Firestore config
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, ListRenderItem, Dimensions, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { EstablishmentType } from '@/types/establishmentType';
import { Link } from "expo-router";
import { useBookmarks } from '@/components/BookmarksContext';
import { SharedElement } from 'react-navigation-shared-element';
import moment from 'moment'; 
import { requestTrackingPermission } from 'react-native-tracking-transparency';

type Props = {
  category: string;
  dotw: string;
  selectedHour: string; // Add selectedHour prop
  sortedByDistance: boolean;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const Establishments = ({ category, dotw, selectedHour, sortedByDistance }: Props) => {
  const [loading, setLoading] = useState(true);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [establishments, setEstablishments] = useState<EstablishmentType[]>([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<EstablishmentType[]>([]);

  // Fetch data from Firestore
  const fetchEstablishments = async () => {
    try {
      const establishmentsCollection = collection(db, "establishments");
      const establishmentsSnapshot = await getDocs(establishmentsCollection);
      const establishmentsList = establishmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as EstablishmentType[];
      return establishmentsList; // Ensure to return the list
    } catch (error) {
      console.error("Error fetching establishments: ", error);
      return [];
    }
  };

  // Request location permission and get user location
  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return null;
      }
  
      let location = await Location.getCurrentPositionAsync({});
      console.log("User location retrieved:", location); // Add logging here to verify location data
      setUserLocation(location);
      return location;
    } catch (error) {
      console.error("Error getting user location:", error); // Add error logging
      return null;
    }
  };

  // Calculate distances for all establishments
  const calculateDistances = (location: Location.LocationObject, establishments: EstablishmentType[]) => {
    return establishments.map(establishment => {
      const lat = typeof establishment.latitude === 'string' ? parseFloat(establishment.latitude) : establishment.latitude;
      const lon = typeof establishment.longitude === 'string' ? parseFloat(establishment.longitude) : establishment.longitude;

      if (isNaN(lat) || isNaN(lon)) {
        console.warn(`Invalid coordinates for establishment ${establishment.id}: lat=${establishment.latitude}, lon=${establishment.longitude}`);
        return { ...establishment, distance: null };
      }

      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        lat,
        lon
      );
      return { ...establishment, distance: parseFloat((distance * 0.621371).toFixed(2)) }; // distance in miles
    });
  };

  // Fetch data and user location on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Request tracking permission
        const trackingStatus = await requestTrackingPermission();
        if (trackingStatus === 'authorized') {
          console.log('Tracking permission granted.');
        } else {
          console.log('Tracking permission denied or restricted.');
        }
  
        setLoading(true); // Ensure loading starts before async calls
  
        // Fetch establishments
        const fetchedEstablishments = await fetchEstablishments();
  
        // Fetch location
        const location = await getUserLocation();
  
        if (location) {
          const establishmentsWithDistance = calculateDistances(location, fetchedEstablishments);
          setEstablishments(establishmentsWithDistance);
        } else {
          setEstablishments(fetchedEstablishments); // Use establishments without distance
        }
      } catch (error) {
        console.error("Initialization error:", error); // Log any unexpected errors
      } finally {
        setLoading(false); // Ensure loading is stopped in both success and failure cases
      }
    };
  
    initialize();
  }, []);


  // Normalize the time for comparison
  const normalizeTime = (time: string) => {
    return moment(time, ['h:mm A']).format('HH:mm');
  };

  useEffect(() => {
    let updatedEstablishments = [...establishments];
  
    // Normalize the time for comparison
    const normalizeTime = (time) => {
      if (time === "12:00 AM") return "00:00"; // Midnight case
      return moment(time, ['h:mm A']).format('HH:mm');
    };
  
    if (category !== "All") {
      updatedEstablishments = updatedEstablishments.filter(establishment =>
        Array.isArray(establishment.category) ? establishment.category.includes(category) : establishment.category === category
      );
    }
  
    if (dotw !== "Select Day" && selectedHour !== "Select Hour") {
      const selectedTime = normalizeTime(selectedHour);
      updatedEstablishments = updatedEstablishments.filter(establishment =>
        establishment.happy_hour_deals.some(deal => {
          const dayMatch = deal.deal_list.includes(dotw); // Check if the deal day matches
          if (!dayMatch) return false;
  
          const dealStartTime = normalizeTime(deal.start_time);
          const dealEndTime = normalizeTime(deal.end_time);
          const startTimeMoment = moment(dealStartTime, "HH:mm");
          let endTimeMoment = moment(dealEndTime, "HH:mm");
  
          // Handle deals that span over midnight
          if (endTimeMoment.isBefore(startTimeMoment)) {
            endTimeMoment.add(1, 'day'); // this handles overnight deals that end after midnight
          }
  
          const selectedTimeMoment = moment(selectedTime, "HH:mm");
          // Check if the selected time is within the deal's time range
          return selectedTimeMoment.isBetween(startTimeMoment, endTimeMoment, null, '[]'); // Inclusive of start and end times
        })
      );
    }
  
    if (sortedByDistance) {
      updatedEstablishments.sort((a, b) => a.distance != null && b.distance != null ? a.distance - b.distance : 0);
    }
  
    setFilteredEstablishments(updatedEstablishments);
  }, [category, dotw, selectedHour, establishments, sortedByDistance]);
  
  const handleBookmark = (establishment: EstablishmentType) => {
    if (isBookmarked(establishment.id)) {
      removeBookmark(establishment.id);
    } else {
      addBookmark(establishment);
    }
  };

  const renderItems: ListRenderItem<EstablishmentType> = ({ item }) => {
    const distanceText = item.distance != null ? `${item.distance} miles away` : 'Calculating Distance...';

    return (
      <Link href={`/Establishments/${item.id}`} asChild>
        <TouchableOpacity style={styles.itemWrapper}>
          <View style={styles.item}>
            <SharedElement id={`item.${item.id}.photo`}>
              <Image source={{ uri: item.image }} style={styles.image} />
            </SharedElement>
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
              ellipsizeMode="tail"
            >
              {item.name.toString()}
            </Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <FontAwesome5
                  name="map-marker-alt"
                  size={18}
                  color={'#264117'}
                />
                <Text style={styles.itemLocationText}> {distanceText} </Text>
              </View>
              <View style={styles.infoItem}>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#264117" />
        <Text style={styles.loadingText} >Loading establishments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={filteredEstablishments}
        renderItem={renderItems}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={filteredEstablishments.length === 0 && styles.emptyContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No establishments found.</Text>}
      />
    </View>
  );
};

export default Establishments;

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemWrapper: {
    flex: 1,
    margin: 5,
  },
  item: {
    marginLeft: 2.5,
    marginTop: 0,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 5,
    width: (Dimensions.get('window').width / 2) - 15,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  bookmark: {
    position: 'absolute',
    top: 140,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLocationText: {
    fontSize: 12,
    marginLeft: 5,
  },
  itemRatingText: {
    fontSize: 14,
    marginLeft: 5,
    color: '#264117',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
  },
});
