import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { db } from '../../firebaseConfig'; // Ensure this path is correct
import {  collection, addDoc, query, where, onSnapshot, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import auth

const CommentsSection = ({ establishmentId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [username, setUsername] = useState(""); // State to store the username

    // Fetch user and their username
    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            getDoc(userRef).then((docSnap) => {
                if (docSnap.exists()) {
                    setUsername(docSnap.data().username);
                } else {
                    console.log("No such user!");
                }
            }).catch(error => console.error("Error fetching user: ", error));
        }
    }, []);

    useEffect(() => {
        const commentsQuery = query(
            collection(db, 'comments'),
            where('establishmentId', '==', establishmentId),
        );
        const unsubscribe = onSnapshot(commentsQuery, (querySnapshot) => {
            const commentsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
        });

        return () => unsubscribe();
    }, [establishmentId]);

    const handleAddComment = async () => {
        if (newComment.trim()) {
            try {
                await addDoc(collection(db, 'comments'), {
                    establishmentId: establishmentId,
                    comment: newComment,
                    username: username, // Use username for the comment
                    timestamp: serverTimestamp() // Use server timestamp for consistency
                });
                setNewComment(''); // Clear input after submission
            } catch (error) {
                console.error("Error adding comment: ", error);
            }
        }
    };

    // Helper function to format the timestamp
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString(); // Customize the format as needed
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Comments</Text>
            <FlatList
                data={comments}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.commentContainer}>
                        <View style={styles.commentContent}>
                            <Text style={styles.username}>{item.username}</Text>
                            <Text style={styles.commentText}>{item.comment}</Text>
                        </View>
                        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Add a comment..."
                    placeholderTextColor="#888"
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleAddComment}
                >
                    <Text style={styles.buttonText}>Post</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        margin: 10,
        width: '100%',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    commentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f0f4f8',
        padding: 12,
        borderRadius: 10,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    commentContent: {
        flex: 1,
        marginRight: 10,
    },
    username: {
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 4,
    },
    commentText: {
        color: '#555',
        fontSize: 14,
        lineHeight: 18,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
        alignSelf: 'flex-start',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#f9f9f9',
        marginRight: 10,
    },
    button: {
        backgroundColor: '#264117',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noComments: {
        textAlign: 'center',
        color: '#777',
        marginTop: 10,
    },
});

export default CommentsSection;
