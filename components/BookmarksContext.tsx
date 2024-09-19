import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EstablishmentType } from '@/types/establishmentType';

type BookmarksContextType = {
    bookmarks: EstablishmentType[];
    addBookmark: (establishment: EstablishmentType) => void;
    removeBookmark: (id: string) => void;
    isBookmarked: (id: string) => boolean;
};

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export const BookmarksProvider = ({ children }: { children: ReactNode }) => {
    const [bookmarks, setBookmarks] = useState<EstablishmentType[]>([]);

    // Load bookmarks from AsyncStorage on initial render
    useEffect(() => {
        const loadBookmarks = async () => {
            try {
                const savedBookmarks = await AsyncStorage.getItem('bookmarks');
                if (savedBookmarks) {
                    setBookmarks(JSON.parse(savedBookmarks));
                }
            } catch (error) {
                console.error('Failed to load bookmarks from AsyncStorage', error);
            }
        };
        loadBookmarks();
    }, []);

    // Save bookmarks to AsyncStorage whenever they change
    useEffect(() => {
        const saveBookmarks = async () => {
            try {
                await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            } catch (error) {
                console.error('Failed to save bookmarks to AsyncStorage', error);
            }
        };
        saveBookmarks();
    }, [bookmarks]);

    const addBookmark = (establishment: EstablishmentType) => {
        // Prevent duplicate bookmarks
        if (!isBookmarked(establishment.id)) {
            setBookmarks(prevBookmarks => [...prevBookmarks, establishment]);
        }
    };

    const removeBookmark = (id: string) => {
        setBookmarks(prevBookmarks => prevBookmarks.filter(item => item.id !== id));
    };

    const isBookmarked = (id: string) => {
        return bookmarks.some(item => item.id === id);
    };

    return (
        <BookmarksContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
            {children}
        </BookmarksContext.Provider>
    );
};

export const useBookmarks = () => {
    const context = useContext(BookmarksContext);
    if (!context) {
        throw new Error('useBookmarks must be used within a BookmarksProvider');
    }
    return context;
};