import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, Linking, Dimensions } from 'react-native';
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from 'react-native-reanimated';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import establishmentData from "@/data/establishmentsData.json";
import { EstablishmentType } from "@/types/establishmentType";

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;

const EstablishmentDetails: React.FC = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const establishment: EstablishmentType | undefined = establishmentData.find(
        (item) => item.id === id
    );

    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffset = useScrollViewOffset(scrollRef);

    // Updated animated style with limited stretch and added scale
    const imageAnimatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [1.5, 1, 1] // Scale effect: zoom in slightly when pulling down
        );

        const translateY = interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [-IMG_HEIGHT / 4, 0, IMG_HEIGHT / 8] // Less extreme vertical movement
        );

        return {
            transform: [
                { scale },
                { translateY },
            ],
        };
    });

    if (!establishment) {
        return (
            <View style={styles.container}>
                <Text>Establishment not found</Text>
            </View>
        );
    }

    const openMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(establishment.name + ', ' + establishment.location)}`;
        Linking.openURL(url);
    };

    return (
        <>
            <Stack.Screen options={{
                headerTransparent: true,
                headerTitle: "",
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <View style={styles.iconWrapper}>
                            <Feather name='arrow-left' size={20} />
                        </View>
                    </TouchableOpacity>
                )
            }} />
            <View style={styles.container2}>
                <Animated.Image source={{ uri: establishment.image }} style={[styles.image, imageAnimatedStyle]} />
                <Animated.ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        <Text style={styles.establishmentName}>{establishment.name}</Text>
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

                    <View style={styles.footer}>
                        <Text style={styles.footerTitle}>Happy Hours</Text>
                        {establishment.happy_hour_deals.map((deal, index) => (
                            <View key={index} style={styles.happyHourDeal}>
                                <Text style={styles.happyHourDay}>{deal.day}:</Text>
                                <Text style={styles.happyHourText}>{deal.details}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.ScrollView>
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
        backgroundColor: '#ffffff', // Ensure the top part of the content has a white background
    },
    container2: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    establishmentName: {
        fontSize: 24,
        fontWeight: '500',
        color: '#264117',  // Change to primary color green
        letterSpacing: 0.5,
    },
    establishmentLocationWrapper: {
        flexDirection: 'row',
        marginTop: 5,
        marginBottom: 10,
        alignItems: 'center',  
    },
    establishmentLocationText: {
        fontSize: 14,
        marginLeft: 5,
        color: '#264117',  // Change to primary color green
    },
    headerButton: {
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 4,
    },
    iconWrapper: {
        backgroundColor: '#ffffff',
        padding: 6,
        borderRadius: 10,  
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
    establishmentDetails: {
        fontSize: 16,
        color: "#264117",
        lineHeight: 25,
        letterSpacing: 0.5,
    },
    footer: {
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#dcdcdc',
        alignItems: 'center',
        width: '100%',
    },
    footerTitle: {
        fontSize: 28, // Larger font for Happy Hours title
        fontWeight: '600',
        color: '#264117',
        marginBottom: 10,
    },
    happyHourDeal: {
        marginBottom: 10,
        alignItems: 'flex-start', // Align text to the start of the line
        flexDirection: 'row',
        flexWrap: 'wrap' // Wrap text within the screen width
    },
    happyHourDay: {
        fontSize: 20, // Larger font for day of the week
        fontWeight: '600',
        color: '#264117',
        marginRight: 5,
    },
    happyHourText: {
        fontSize: 16,
        color: '#264117',
    },
});
