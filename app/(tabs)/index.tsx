import { StyleSheet, Text, TouchableOpacity, View, Image, Modal, Alert, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import ModalDropdown from 'react-native-modal-dropdown';
import Categories from "@/components/Categories";
import Establishments from '@/components/Establishments';
import establishmentsData from '@/data/establishmentsData.json';
import { useHeaderHeight } from '@react-navigation/elements';
import { getAuth, signOut } from "firebase/auth";
import moment from 'moment';
import { FontAwesome5 } from "@expo/vector-icons";
import * as Location from 'expo-location';

// Predefined time slots from 9:00 AM to 12:00 AM (midnight)
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
    const [filterModalVisible, setFilterModalVisible] = useState(false); // For modal visibility
    const [loading, setLoading] = useState(false); // For showing the loading popup
    const [establishments, setEstablishments] = useState(establishmentsData); // Initial establishment data
    const headerHeight = useHeaderHeight();
    const auth = getAuth();

    // Normalize the time for comparison
    const normalizeTime = (time) => {
        return moment(time, ['h:mm A']).format('HH:mm');
    };

    // Predefined days of the week in correct order
    const availableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Filter the establishments based on selected day, hour, and category
    const filteredEstablishments = establishments.filter(establishment =>
        (dayOfWeek === "Select Day" && selectedHour === "Select Hour") ? true :
        establishment.happy_hour_deals.some(deal => {
            const dayMatch = dayOfWeek === "Select Day" || deal.deal_list.includes(dayOfWeek);
            if (!dayMatch) return false;

            if (selectedHour !== "Select Hour") {
                const dealStartTime = normalizeTime(deal.start_time);
                const dealEndTime = normalizeTime(deal.end_time);
                const selectedTime = normalizeTime(selectedHour);

                const startTimeMoment = moment(dealStartTime, "HH:mm");
                let endTimeMoment = moment(dealEndTime, "HH:mm");

                if (endTimeMoment.isBefore(startTimeMoment)) {
                    endTimeMoment.add(1, 'day');
                }

                const selectedTimeMoment = moment(selectedTime, "HH:mm");
                return selectedTimeMoment.isBetween(startTimeMoment, endTimeMoment, null, '[)');
            }
            return true;
        })
    );

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

    // Reset filters
    const resetFilters = () => {
        setDayOfWeek("Select Day");
        setSelectedHour("Select Hour");
    };

    // Function to calculate distance between two geographical points
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => (value * Math.PI) / 180;
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

    // Function to sort establishments by proximity to the user's location
    const handleSortByDistance = async () => {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Location Permission Denied", "Please allow location access to sort establishments by proximity.");
            setLoading(false);
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const userLatitude = location.coords.latitude;
        const userLongitude = location.coords.longitude;

        const sortedEstablishments = establishments
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

        setEstablishments(sortedEstablishments); // Update the state with sorted establishments
        setLoading(false); // Hide the loading popup
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

            {/* Near Me Button */}
            

            {/* Reset Button */}
            <TouchableOpacity onPress={resetFilters} style={[styles.filterButton, styles.buttonSpacing]}>
                <Text style={styles.filterButtonText}>Reset</Text>
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


                {/* Category filter */}
                <Categories onCategoryChanged={setCategory} onSortByDistance={handleSortByDistance} />


                {/* Establishments filtered by day, hour, and category */}
                <Establishments 
                    dotw={dayOfWeek}
                    establishments={filteredEstablishments} 
                    category={category} 
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
        color: '#ffffff',
    },
    nearMeButton: {
        backgroundColor: '#264117',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 10,
        alignItems: 'center',
    },
    nearMeButtonText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '600',
    },
    resetButton: {
        backgroundColor: '#264117',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    resetButtonText: {
        fontSize: 16,
        color: '#ffffff',
    },
    closeModalButton: {
        backgroundColor: '#264117',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    closeModalText: {
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
    headerContainer: {
        position: 'relative',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderColor: '#264117',
        borderWidth: 0,
        marginLeft: 159,
    },
    signOutButton: {
        marginLeft: 10,
        top: 2.5,
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
    closeButtonSpacing: {
        marginTop: 12, // Add more space above the close button
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '60%', // Adjust width according to your design needs
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
        paddingVertical: 12, // More vertical padding for a taller dropdown
        paddingHorizontal: 20, // Horizontal padding to match the button padding
        borderWidth: 1,
        borderColor: '#264117', // Matching the button border color
        borderRadius: 20, // Significantly rounded corners
        backgroundColor: '#264117', // Dark green background
        color: '#ffffff', // White text for high contrast
        marginBottom: 10, // Spacing between dropdowns and other elements
        textAlign: 'center', // Center the text within the dropdown
    },
    dropdown: {
        width: '100%',
        borderColor: '#264117',
        borderWidth: 1,
        borderRadius: 20, // Apply rounding here as well to ensure the list matches
        backgroundColor: '#264117', // Background color for the dropdown list
        marginTop: 2, // Ensure a small gap from the dropdown field to the list
    },
    dropdownItemText: {
        fontSize: 16,
        padding: 10,
        color: '#ffffff', // White text for items
        backgroundColor: '#264117', // Ensure items match the dropdown field
    },
    filterButton: {
        backgroundColor: '#264117',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20, // Increased to make corners more rounded
        width: '70%',
        alignItems: 'center',
        marginTop: 10,
    },
    filterButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonSpacing: {
        marginTop: 8, // Adds space between buttons
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
