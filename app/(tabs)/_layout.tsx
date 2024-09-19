import React from 'react';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

// Layout component that defines the structure and behavior of the tab navigation
export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        // Set the background color of the tab bar to always be #f5f5f5
        tabBarStyle: {
          backgroundColor: '#f5f5f5', // Always use this color regardless of the system mode
        },
        tabBarActiveTintColor: '#264117', // Color of the active tab icon and label
        tabBarInactiveTintColor: '#000000', // Color of the inactive tab icon and label
      }}
    >
      {/* Define the first tab screen (Home) */}
      <Tabs.Screen
        name="index" // The route name for this tab
        options={{
          // Define the icon for this tab using Ionicons
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass" size={28} color={color} />
          ),
          tabBarLabel: 'Home', // Label text for this tab
        }}
      />
       <Tabs.Screen
        name="live" // The route name for this tab
        options={{
          // Define the icon for this tab using FontAwesome
          tabBarIcon: ({ color }) => (
            <FontAwesome name="clock-o" size={28} color={color} />
          ),
          tabBarLabel: 'Live Deals', // Label text for this tab
        }}
      />
      {/* Define the second tab screen (Map) */}
      <Tabs.Screen
        name="search" // The route name for this tab
        options={{
          // Define the icon for this tab using Ionicons
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={28} color={color} />
          ),
          tabBarLabel: 'Map', // Label text for this tab
        }}
      />
      {/* Define the third tab screen (Bookmarks) */}
      <Tabs.Screen
        name="bookmarks" // The route name for this tab
        options={{
          // Define the icon for this tab using Ionicons
          tabBarIcon: ({ color }) => (
            <Ionicons name="bookmark" size={28} color={color} />
          ),
          tabBarLabel: 'Bookmarks', // Label text for this tab
        }}
      />
      {/* Define the fourth tab screen (Profile) */}
     
    </Tabs>
  );
}
