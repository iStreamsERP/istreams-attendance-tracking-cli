import { Modal, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlobalStyles } from '../Styles/styles';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { useAuth } from '../Context/AuthContext';

const SelfCheckinPopup = ({ visible, onClose, onSelectOption }) => {
    const { userData } = useAuth();
    const [siteLocations, setsiteLocations] = useState([]);
    const [ofcLocation, setOfcLocation] = useState(null);

    const getData = async () => {
        try {
            const PrjSiteLocations_SQLQueryParameter = {
                SQLQuery: 'SELECT * FROM project_site_locations'
            };

            const PrjSiteLocationsList = await callSoapService(userData.clientURL, 'DataModel_GetDataFrom_Query', PrjSiteLocations_SQLQueryParameter);

            if (PrjSiteLocationsList !== null) {
                setsiteLocations(PrjSiteLocationsList);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const handleItemSelect = async (item) => {
        const selectedLocation = {
            name: item.SITE_LOCATION,
            coordinates: item.GPS_LOCATION,
            range: item.CHECK_IN_RADIOUS,
            details: item.DETAIL_DESCRIPTION
        };

        setOfcLocation(selectedLocation);
        await AsyncStorage.setItem('CURRENT_OFC_LOCATION', JSON.stringify(selectedLocation));

        onSelectOption({ type: 'office', data: selectedLocation });
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.bottomModal}>
                    <View style={styles.modalOption}>
                        <Icon name="office-building" size={24} color="#002D72" />
                        <Text style={[GlobalStyles.subtitle_1, { marginLeft: 15 }]}>Office Check-in</Text>
                    </View>

                    <View style={styles.dropdown}>
                        <FlatList
                            data={siteLocations}
                            keyExtractor={(item, index) =>
                                item.GPS_LATITUDE ? `${item.GPS_LATITUDE}-${index}` : `item-${index}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleItemSelect(item)}
                                    style={styles.dropdownItem}
                                >
                                    <Text style={[GlobalStyles.subtitle_3, { color: '#0685de' }]}>{item.PROJECT_NO}</Text>
                                    <View style={GlobalStyles.twoInputContainer}>
                                        <Text style={GlobalStyles.subtitle_2}>{item.SITE_LOCATION}</Text>
                                        <Text style={GlobalStyles.subtitle_2}>{item.DETAIL_DESCRIPTION}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>


                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                            onSelectOption('project');
                            onClose();
                        }}                    >
                        <Icon name="file-document" size={24} color="#002D72" />
                        <Text style={[GlobalStyles.subtitle_1, { marginLeft: 15 }]}>Project Check-in</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

export default SelfCheckinPopup

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    bottomModal: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30,
        width: '100%',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        maxHeight: 190,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});