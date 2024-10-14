import { StyleSheet, Text, TouchableOpacity, View, Image, Modal, Alert, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import ModalDropdown from 'react-native-modal-dropdown';
import Categories from "@/components/Categories";
import Establishments from '@/components/Establishments';
import { useHeaderHeight } from '@react-navigation/elements';
import { getAuth, signOut } from "firebase/auth";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Location from 'expo-location'; // Import location permissions and fetching

const availableHours = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
  "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM"
];

const Page = () => {
  const [dayOfWeek, setDayOfWeek] = useState("Select Day");
  const [selectedHour, setSelectedHour] = useState("Select Hour");
  const [category, setCategory] = useState("All");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortedByDistance, setSortedByDistance] = useState(true); // Set initial state to true to sort automatically by distance
  const [userLocation, setUserLocation] = useState(null); // Store user location
  const headerHeight = useHeaderHeight();
  const auth = getAuth();
  const user = auth.currentUser;

  const availableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

  // Get user location on mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Location Permission Denied", "Please allow location access to sort establishments by proximity.");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords); // Store user location (latitude and longitude)
      } catch (error) {
        console.error("Error fetching location:", error);
        Alert.alert("Error", "Failed to fetch location.");
      }
    };

    getLocation();
  }, []);

  // Reset filters
  const resetFilters = () => {
    setDayOfWeek("Select Day");
    setSelectedHour("Select Hour");
  };

  // Function to handle category change
  const handleCategoryChange = (selectedCategory: string) => {
    console.log("Category changed to:", selectedCategory);
    setCategory(selectedCategory);
    setSortedByDistance(true); // Ensure it sorts by distance on category change
  };

  // Function to handle sending an email report
  const handleReport = () => {
    if (user && user.email) {
      const email = `mailto:saveoryapp@gmail.com?subject=User%20Report&body=Dear%20Support,%0D%0A%0D%0AI'm%20experiencing%20an%20issue%20with%20Saveory.%20Please%20assist%20me.%0D%0A%0D%0ARegards,%0D%0A${user.email}`;
      Linking.openURL(email).catch(err => console.error('Error sending email:', err));
    } else {
      Alert.alert('Error', 'No logged-in user found.');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
                <Text style={styles.reportText}>Report</Text>
              </TouchableOpacity>
              <Image
                source={require('../../assets/images/Savor-Logo.webp')}
                style={styles.image}
              />
              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
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
        <Text style={styles.headingTxt}>Food. Easier. Near You.</Text>

        {/* Filter Button Section */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={styles.indexfilterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Day, Hour, and Reset */}
        <Modal
          transparent={true}
          animationType="slide"
          visible={filterModalVisible}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeading}>Select Filters</Text>

              {/* Day Selector */}
              <ModalDropdown
                key={`day-dropdown-${dayOfWeek}`}
                options={availableDays}
                defaultValue={dayOfWeek}
                onSelect={(index, value) => setDayOfWeek(value)}
                textStyle={styles.dropdownText}
                dropdownStyle={styles.dropdown}
                dropdownTextStyle={styles.dropdownItemText}
              />

              {/* Hour Selector */}
              <ModalDropdown
                key={`hour-dropdown-${selectedHour}`}
                options={availableHours}
                defaultValue={selectedHour}
                onSelect={(index, value) => setSelectedHour(value)}
                textStyle={styles.dropdownText}
                dropdownStyle={styles.dropdown}
                dropdownTextStyle={styles.dropdownItemText}
              />

              {/* Reset Button */}
              <TouchableOpacity onPress={resetFilters} style={[styles.filterButton, styles.buttonSpacing]}>
                <Text style={styles.filterButtonText}>Reset</Text>
              </TouchableOpacity>

              {/* Apply Filters Button */}
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)} // Close modal after applying filters
                style={[styles.filterButton, styles.buttonSpacing]}
              >
                <Text style={styles.filterButtonText}>Apply Filters</Text>
              </TouchableOpacity>

              {/* Close Modal Button */}
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={[styles.filterButton, styles.buttonSpacing]}
              >
                <Text style={styles.filterButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Categories Component */}
        <Categories onCategoryChanged={handleCategoryChange} />

        {/* Establishments filtered by day, hour, and category */}
        <Establishments
          selectedHour={selectedHour}
          category={category}
          dotw={dayOfWeek}
          sortedByDistance={sortedByDistance}
          userLocation={userLocation} // Pass user location to Establishments component
        />
      </View>

      {/* Loading Popup */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Finding happy hours near you!</Text>
        </View>
      )}
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  indexfilterButton: {
    backgroundColor: '#264117',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 10,
    width: 90, // Ensure buttons are uniform in size
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  headingTxt: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '800',
    color: '#264117',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#264117',
    borderRadius: 20,
    backgroundColor: '#264117',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  dropdown: {
    width: '100%',
    borderColor: '#264117',
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#264117',
    marginTop: 2,
  },
  dropdownItemText: {
    fontSize: 16,
    padding: 10,
    color: '#ffffff',
    backgroundColor: '#264117',
  },
  filterButton: {
    backgroundColor: '#264117',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: '70%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonSpacing: {
    marginTop: 8,
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Spaces the buttons to the sides
    width: '100%',
    paddingHorizontal: 20,
  },
  image: {
    marginLeft: 11,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reportButton: {
    backgroundColor: '#264117',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  reportText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#264117',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
