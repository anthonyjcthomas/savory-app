import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Modal, Alert, ActivityIndicator, TouchableOpacity, FlatList } from "react-native";
import { Stack, router } from 'expo-router';
import ModalDropdown from 'react-native-modal-dropdown';
import Categories from "@/components/Categories";
import Establishments from '@/components/Establishments';
import { useHeaderHeight } from '@react-navigation/elements';
import { getAuth, signOut } from "firebase/auth";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { db } from '../../firebaseConfig.js'; // Adjust the path as necessary
import { collection, getDocs } from 'firebase/firestore';
import { amplitude } from '../../firebaseConfig.js';

const availableHours = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
  "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM"
];

const AllDealsPage = () => {
  const [dayOfWeek, setDayOfWeek] = useState("Select Day");
  const [selectedHour, setSelectedHour] = useState("Select Hour");
  const [category, setCategory] = useState("All");
  const [filterModalVisible, setFilterModalVisible] = useState(false); // For modal visibility
  const [loading, setLoading] = useState(false); // For showing the loading popup
  const [establishments, setEstablishments] = useState([]);
  const [sortedByDistance, setSortedByDistance] = useState(false);
  const headerHeight = useHeaderHeight();
  const auth = getAuth();
  const user = auth.currentUser;

  const availableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const fetchAndSortEstablishmentsByDistance = async () => {
      setLoading(true);
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Location Permission Denied", "Please allow location access to sort establishments by proximity.");
          setLoading(false);
          return;
        }

        // Get user's current location
        const location = await Location.getCurrentPositionAsync({});
        const userLatitude = location.coords.latitude;
        const userLongitude = location.coords.longitude;

        // Fetch establishments from Firestore
        const establishmentsCollection = collection(db, 'establishments');
        const establishmentsSnapshot = await getDocs(establishmentsCollection);
        const establishmentsList = establishmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate and sort by distance
        const sortedEstablishments = establishmentsList.map(establishment => {
          const latitude = typeof establishment.latitude === 'string' ? parseFloat(establishment.latitude) : establishment.latitude;
          const longitude = typeof establishment.longitude === 'string' ? parseFloat(establishment.longitude) : establishment.longitude;

          if (isNaN(latitude) || isNaN(longitude)) {
            console.warn(`Invalid coordinates for establishment ${establishment.id}: lat=${latitude}, lon=${longitude}`);
            return { ...establishment, distance: Infinity };
          }

          const distance = calculateDistance(userLatitude, userLongitude, latitude, longitude);
          return { ...establishment, distance };
        }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

        // Set the sorted establishments
        setEstablishments(sortedEstablishments);
      } catch (error) {
        console.error("Error sorting by distance:", error);
        Alert.alert("Error", "Failed to sort establishments by distance.");
      } finally {
        setLoading(false);
      }
    };

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const toRad = (value) => (value * Math.PI) / 180;
      const R = 6371; // Radius of the Earth in kilometers
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in kilometers
      return distance;
    };

    fetchAndSortEstablishmentsByDistance();
  }, [category]);

  // Sign out function
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out successfully');
        router.replace("/landing");
      })
      .catch(error => {
        console.error('Error signing out: ', error);
      });
  };

  // Function to handle category change
  const handleCategoryChange = (selectedCategory) => {
    console.log("Category changed to:", selectedCategory);
    setCategory(selectedCategory);
    setSortedByDistance(false); // Reset sort when category changes
  };

  // Function to render establishment
  const renderEstablishment = ({ item }) => {
    const distanceText = item.distance !== undefined && item.distance !== null && isFinite(item.distance)
      ? `${(item.distance * 0.621371).toFixed(2)} miles away` // Convert km to miles
      : '';

    return (
      <View style={styles.establishmentContainer}>
        <Image source={{ uri: item.image }} style={styles.establishmentImage} />
        <Text style={styles.establishmentName}>{item.name}</Text>
        <Text>{distanceText}</Text>
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
              <TouchableOpacity style={styles.reportButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ),
          headerStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      />

      <View style={[styles.container, { paddingTop: headerHeight }]}>
        <Text style={styles.headingTxt}>All Deals</Text>

        {/* Categories Component */}
        <Categories onCategoryChanged={handleCategoryChange} />

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading establishments...</Text>
          </View>
        ) : (
          <FlatList
            data={establishments}
            keyExtractor={item => item.id}
            renderItem={renderEstablishment}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
};

export default AllDealsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Spaces the buttons to the sides
    width: '100%',
    paddingHorizontal: 20,
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headingTxt: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '800',
    color: '#264117',
    textAlign: 'center',
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
    width: '94.5%', // Shrink the width to 94.5% for better spacing
    alignSelf: 'center', // Center the container
  },
  establishmentImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
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
