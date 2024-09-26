import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, Linking, Dimensions, Alert, ScrollView, ActivityIndicator, Share } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from '../../firebaseConfig.js';
import CommentsSection from './CommentsSection.tsx';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;

const EstablishmentDetails: React.FC = () => {
    const { id } = useLocalSearchParams<{ id: string }>();  // Get the document ID from the URL params
    const router = useRouter();
    const [establishment, setEstablishment] = useState<EstablishmentType | null>(null);
    const [loading, setLoading] = useState(true); // Track loading state
    const auth = getAuth();
    const user = auth.currentUser;

    // Function to fetch establishment based on Firestore document ID
    const fetchEstablishment = async () => {
        if (!id) {
            Alert.alert("Error", "No establishment ID provided.");
            router.back();
            return;
        }

        try {
            const establishmentsRef = collection(db, "establishments");
            const q = query(establishmentsRef, where("id", "==", id)); // Use the internal 'id' field
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const establishmentData = querySnapshot.docs[0].data(); // Assuming only one document will match
                setEstablishment({ ...establishmentData, id: querySnapshot.docs[0].id } as EstablishmentType);
            } else {
                Alert.alert("Error", "Establishment not found.");
                setEstablishment(null);
                router.back();
            }
        } catch (error) {
            Alert.alert("Error", "Failed to fetch establishment details.");
            setEstablishment(null);
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // Fetch the establishment when component mounts or ID changes
    useEffect(() => {
        fetchEstablishment();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#264117" />
                <Text>Loading establishment details...</Text>
            </View>
        );
    }

    if (!establishment) {
        return (
            <View style={styles.container}>
                <Text>Establishment not found.</Text>
            </View>
        );
    }

    // Handle sharing the happy hour details
    const handleShare = async () => {
        try {
            const message = `Check out the happy hour at ${establishment.name} located at ${establishment.location}.\n\nHappy Hour Details:\n${establishment.happy_hour_deals.map(deal => `${deal.day}: ${deal.details}`).join('\n\n')}`;
            
            await Share.share({
                message,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share the happy hour details.');
            console.error("Error sharing happy hour details: ", error);
        }
    };

    const openMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(establishment.name + ', ' + establishment.location)}`;
        Linking.openURL(url).catch(err => {
            console.error("Error opening maps:", err);
            Alert.alert("Error", "Failed to open maps.");
        });
    };

    const handleReportOutdatedHappyHour = () => {
        if (user && user.email) {
            const subject = encodeURIComponent(`Incorrect happy hour for ${establishment.name}`);
            const body = encodeURIComponent(`Dear Support,\n\nI noticed that the happy hour details for ${establishment.name} seem to be incorrect. Please review and update them if necessary.\n\nThank you,\n${user.email}`);
            const emailUrl = `mailto:saveoryapp@gmail.com?subject=${subject}&body=${body}`;
            Linking.openURL(emailUrl).catch(err => {
                Alert.alert("Error", "Failed to open email client.");
                console.error("Error sending email: ", err);
            });
        } else {
            Alert.alert("Error", "You need to be logged in to report.");
        }
    };

    return (
        <>
            <Stack.Screen options={{
                headerTransparent: true,
                headerTitle: "",
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <View style={styles.iconWrapper}>
                            <Feather name='arrow-left' size={20} color="#264117" />
                        </View>
                    </TouchableOpacity>
                )
            }} />
            <View style={styles.container2}>
                <TouchableOpacity onPress={() => router.back()} style={styles.customBackButton}>
                    <Feather name='arrow-left' size={20} color="#fff" />
                    <Text style={styles.customBackButtonText}>Back</Text>
                </TouchableOpacity>

                <Image source={{ uri: establishment.image }} style={styles.image} />
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        <View style={styles.titleRow}>
                            <Text style={styles.establishmentName}>{establishment.name}</Text>
                            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                                <Feather name="share-2" size={24} color="#264117" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.establishmentLocationWrapper}>
                            <FontAwesome5 name="map-marker-alt" size={18} color='#264117' />
                            <Text style={styles.establishmentLocationText}> {establishment.location}</Text>
                        </View>

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
                            <TouchableOpacity onPress={openMaps} style={styles.highlightWrapper}>
                                <View style={styles.highlightIcon}>
                                    <Ionicons name="navigate" size={18} color='#264117' />
                                </View>
                                <View>
                                    <Text style={styles.HighlightText}>Directions</Text>
                                    <Text style={styles.HighlightTextVal}>Tap for directions</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.highlightWrapper}>
                                <View style={styles.highlightIcon}>
                                    <Ionicons name="star" size={18} color='#264117' />
                                </View>
                                <View>
                                    <Text style={styles.HighlightText}>Rating</Text>
                                    <Text style={styles.HighlightTextVal}>{establishment.rating}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.establishmentDetails}>{establishment.description}</Text>
                    </View>

                    {/* Outdated Button and Happy Hour Details */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.outdatedButton} onPress={handleReportOutdatedHappyHour}>
                            <Text style={styles.outdatedButtonText}>Outdated?</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerTitle}>Happy Hours</Text>
                        {establishment.happy_hour_deals.map((deal, index) => (
                            <View key={index} style={styles.happyHourDeal}>
                                <Text style={styles.happyHourDay}>{deal.day}:</Text>
                                <Text style={styles.happyHourText}>{deal.details}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Comments Section */}
                    <CommentsSection establishmentId={id} />
                </ScrollView>
            </View>
        </>
    );
};

export default EstablishmentDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: IMG_HEIGHT,
    },
    scrollViewContent: {
        backgroundColor: '#f5f5f5',
        paddingBottom: 150,
        alignItems: 'center',
    },
    contentWrapper: {
        padding: 20,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    container2: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    shareButton: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
    },
    establishmentName: {
        fontSize: 24,
        fontWeight: '500',
        color: '#264117',
        letterSpacing: 0.5,
    },
    establishmentLocationWrapper: {
        flexDirection: 'row',
        marginTop: 5,
        marginBottom: 0,
        alignItems: 'center',
    },
    establishmentLocationText: {
        fontSize: 14,
        marginLeft: 5,
        color: '#264117',
    },
    highlightRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
    },
    highlightWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    highlightIcon: {
        marginRight: 10,
    },
    HighlightText: {
        fontSize: 16,
        color: '#264117',
    },
    HighlightTextVal: {
        fontSize: 14,
        color: '#7a7a7a',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#dcdcdc',
        alignItems: 'center',
        width: '100%',
    },
    footerTitle: {
        fontSize: 28,
        fontWeight: '600',
        color: '#264117',
        marginBottom: 10,
    },
    happyHourDeal: {
        marginBottom: 10,
        alignItems: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    happyHourDay: {
        fontSize: 20,
        fontWeight: '600',
        color: '#264117',
        marginRight: 5,
    },
    happyHourText: {
        fontSize: 16,
        color: '#264117',
    },
    outdatedButton: {
        backgroundColor: '#264117',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        width: '40%',
        alignItems: 'center',
        marginBottom: 12,
    },
    outdatedButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    customBackButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: '#264117',
        padding: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    customBackButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
    },
});
