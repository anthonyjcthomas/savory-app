import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React, { useState } from 'react';
import { Stack, router } from 'expo-router';
import ModalDropdown from 'react-native-modal-dropdown';
import Categories from "@/components/Categories";
import Establishments from '@/components/Establishments';
import establishmentsData from '@/data/establishmentsData.json';
import { useHeaderHeight } from '@react-navigation/elements';
import { getAuth, signOut } from "firebase/auth";
import moment from 'moment';

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
    const headerHeight = useHeaderHeight();
    const auth = getAuth();

    // Normalize the time for comparison
    const normalizeTime = (time) => {
        return moment(time, ['h:mm A']).format('HH:mm');
    };


    // Predefined days of the week in correct order
    const availableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    
        const filteredEstablishments = establishmentsData.filter(establishment =>
            (dayOfWeek === "Select Day" && selectedHour === "Select Hour") ? true :
            establishment.happy_hour_deals.some(deal => {
                const dayMatch = dayOfWeek === "Select Day" || deal.deal_list.includes(dayOfWeek);
                if (!dayMatch) return false;
    
                if (selectedHour !== "Select Hour") {
                    const dealStartTime = normalizeTime(deal.start_time);
                    const dealEndTime = normalizeTime(deal.end_time);
                    const selectedTime = normalizeTime(selectedHour);
    
                    // Check if the selected hour is within the deal time range
                    const startTimeMoment = moment(dealStartTime, "HH:mm");
                    let endTimeMoment = moment(dealEndTime, "HH:mm");
    
                    // If the end time is less than the start time, it means the deal spans to the next day
                    if (endTimeMoment.isBefore(startTimeMoment)) {
                        endTimeMoment.add(1, 'day');
                    }
    
                    const selectedTimeMoment = moment(selectedTime, "HH:mm");
                    return selectedTimeMoment.isBetween(startTimeMoment, endTimeMoment, null, '[)');
                }
    
                return true;
            })
        );

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

    const onCatChanged = (category: string) => {
        setCategory(category);
    };

    const resetFilters = () => {
        setDayOfWeek("Select Day");
        setSelectedHour("Select Hour");
    };
    
    // Attach this reset function to your Reset button
    <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Reset</Text>
    </TouchableOpacity>
    

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
                <View style={styles.dayHourSelectorSection}>
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
            dropdownStyle={styles.dropdown}ç
            dropdownTextStyle={styles.dropdownItemText}
        />

            {/* Reset Button */}
            <TouchableOpacity onPress={() => {
                setDayOfWeek("Select Day");
                setSelectedHour("Select Hour");
            }} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
        </View>

        {/* Category filter */}
        <Categories onCategoryChanged={setCategory} />

        {/* Establishments filtered by day, hour, and category */}
        <Establishments 
            dotw={dayOfWeek}
            establishments={filteredEstablishments} 
            category={category} 
        />
    </View>
        </>
    );
};

export default Page;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    dayHourSelectorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    dropdownText: {
        fontSize: 16,
        color: '#264117',
        marginLeft: 5,
    },
    dropdown: {
        width: 150,
        height: 120,
        borderColor: '#264117',
        borderWidth: 1,
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#264117',
        padding: 10,
    },
    resetButton: {
        backgroundColor: '#264117',
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    resetButtonText: {
        fontSize: 16,
        color: '#ffffff',
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
});
