import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import React, { useRef, useState } from 'react';
import dotwData from "@/data/dotwData";

type Props = {
    onDotwChanged: (dotw: string) => void;
}

const DotwSelector = ({ onDotwChanged }: Props) => {
    const scrollRef = useRef<ScrollView>(null);
    const itemRef = useRef<TouchableOpacity[] | null[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleSelectDotw = (index: number) => {
        const selected = itemRef.current[index];
        
        setActiveIndex(index);

        selected?.measure((x) => {
            scrollRef.current?.scrollTo({x: x, y: 0, animated: true});
        });

        onDotwChanged(dotwData[index].title);
    };

    return (
        <View> 
            <Text style={styles.title}>Days of the Week</Text>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dotwContainer}
            > 
                {dotwData.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        ref={(element) => (itemRef.current[index] = element)}
                        onPress={() => handleSelectDotw(index)}
                        style={activeIndex === index ? styles.dotwBtnActive : styles.dotwBtn}
                    >
                        <Text style={activeIndex === index ? styles.dotwBtnTextActive : styles.dotwText}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

export default DotwSelector;

const styles = StyleSheet.create({
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#264117',
        marginLeft: 10,
        marginTop: 10,
    },
    dotwText: {
        fontSize: 20,
        color: '#264117',
        marginTop: 0,
    },
    scrollView: {
        marginVertical: 20,
    },
    dotwBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        shadowColor: "#264117",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginHorizontal: 4,
    },
    dotwBtnActive: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#264117',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        shadowColor: "#264117",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginHorizontal: 4,
    },
    dotwBtnTextActive: {
        fontSize: 20,
        color: '#ffffff',
        marginTop: 0,
    },
    dotwContainer: {
        marginTop: 10,
        paddingHorizontal: 5,
        marginLeft: 3,
        marginBottom: 10,
    },
});
