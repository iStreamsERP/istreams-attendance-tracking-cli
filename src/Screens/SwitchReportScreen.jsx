import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AllEmpReportScreen from '../Components/AllEmpReportScreen';
import SelectEmpReportScreen from '../Components/SelectEmpReportScreen';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/SimpleLineIcons';

const SwitchReportScreen = () => {
    const insets = useSafeAreaInsets();
    const [selectedSection, setSelectedSection] = useState(null); // Changed to null for card view

    const handleCardPress = (section) => {
        setSelectedSection(section);
    };

    const handleBackToCards = () => {
        setSelectedSection(null);
    };

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            {selectedSection === null && <Header title="Reports" />}

            {/* Show cards when no section is selected */}
            {selectedSection === null && (
                <View style={styles.cardsContainer}>
                    {/* All Employees Card */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => handleCardPress('section1')}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={[GlobalStyles.subtitle_1, styles.cardTitle]}>
                                All Attendance Reports
                            </Text>
                        </View>
                        <Text style={styles.cardDescription}>
                            View attendance for all employees
                        </Text>
                        <View style={styles.cardFooter}>
                            <Icon name="arrow-right" size={15} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* Selected Employee Card */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => handleCardPress('section2')}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={[GlobalStyles.subtitle_1, styles.cardTitle]}>
                                Individual  Report
                            </Text>
                        </View>
                        <Text style={styles.cardDescription}>
                            View individual attendance
                        </Text>
                        <View style={styles.cardFooter}>
                            <Icon name="arrow-right" size={15} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Show selected section with back button */}
            {selectedSection !== null && (
                <View style={styles.sectionContainer}>
                    <Header
                        title={selectedSection === 'section1'
                            ? 'All Reports'
                            : 'Individual Reports'}
                    />

                    {/* Back Button */}
                    {/* <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackToCards}
                    >
                        <Text style={styles.backButtonText}>← Back to Reports</Text>
                    </TouchableOpacity> */}

                    {/* Section Content */}
                    {selectedSection === 'section1' && (
                        <AllEmpReportScreen />
                    )}

                    {selectedSection === 'section2' && (
                        <SelectEmpReportScreen />
                    )}
                </View>
            )}
        </View>
    );
};

export default SwitchReportScreen;

const styles = StyleSheet.create({
    cardsContainer: {
        flex: 1,
        padding: 20,
        gap: 15,
    },
    card: {
        backgroundColor: '#002D72',
        borderRadius: 12,
        padding: 20,
    },
    cardHeader: {
        marginBottom: 10,
    },
    cardTitle: {
        color: '#fff',
        fontWeight: 'bold',
    },
    cardDescription: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 15,
    },
    cardFooter: {
        alignItems: 'flex-end'
    },
    cardAction: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    sectionContainer: {
        flex: 1,
    },
    backButton: {
        backgroundColor: '#6200ea',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        margin: 15,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});