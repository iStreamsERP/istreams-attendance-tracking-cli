// Updated CategoryListPopUp.js
import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Chip } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';

const CategoryListPopUp = ({ onSelect, selectedCategory, leaveType }) => {
    const [category, setCategory] = useState([]);
    const [selectedValue, setSelectedValue] = useState(selectedCategory || '');

    const getData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('CategoryList');
            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setCategory(parsedData);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        setSelectedValue(selectedCategory || '');
    }, [selectedCategory]);

    const handleChipPress = (item) => {
        setSelectedValue(item.LEAVE_CATEGORY);
        if (onSelect) {
            onSelect(item);
        }
    };

    // Filter categories based on leave type
    const filteredCategories = category.filter(item => {
        if (!leaveType) return false;

        if (leaveType.toLowerCase().includes('annual')) {
            return ['Vacation', 'Adjustment', 'Encashment'].includes(item.LEAVE_CATEGORY);
        } else if (leaveType.toLowerCase().includes('sick')) {
            return ['Medical', 'Non-Medical'].includes(item.LEAVE_CATEGORY);
        }
        return false;
    });

    return (
        <View>
            <ScrollView>
                <View style={styles.chipContainer}>
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((item) => (
                            <Chip
                                key={item.LEAVE_CATEGORY}
                                mode={selectedValue === item.LEAVE_CATEGORY ? 'flat' : 'outlined'}
                                selected={selectedValue === item.LEAVE_CATEGORY}
                                onPress={() => handleChipPress(item)}
                                style={[
                                    selectedValue === item.LEAVE_CATEGORY
                                        ? { backgroundColor: '#7c57ad' }
                                        : { backgroundColor: 'white' }
                                ]}
                                textStyle={[
                                    GlobalStyles.subtitle_3,
                                    selectedValue === item.LEAVE_CATEGORY
                                        ? { color: 'white' }
                                        : { color: '#7c57ad' }
                                ]}
                                selectedColor='white'
                            >
                                {item.LEAVE_CATEGORY}
                            </Chip>
                        ))
                    ) : (
                        <View>
                            <Text style={styles.noDataText}>
                                {leaveType ? 'No categories available for this leave type' : 'Please select a leave type first'}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: 10,
        gap: 8,
    },
    noDataText: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
    },
});

export default CategoryListPopUp;