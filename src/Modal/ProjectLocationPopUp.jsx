import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, PanResponder, Alert } from 'react-native';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { useAuth } from '../Context/AuthContext';
import { useState, useEffect } from 'react';
import { IconButton, Searchbar } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const ProjectLocationPopUp = ({ visible, onClose, onSelect }) => {
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [siteLocations, setSiteLocations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const getData = async () => {
        try {
            const PrjSiteLocations_SQLQueryParameter = {
                SQLQuery: 'SELECT * FROM project_site_locations_view'
            };

            const PrjSiteLocationsList = await callSoapService(userData.clientURL, 'DataModel_GetDataFrom_Query', PrjSiteLocations_SQLQueryParameter);

            console.log(PrjSiteLocationsList);

            if (PrjSiteLocationsList !== null) {
                setSiteLocations(PrjSiteLocationsList);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    useEffect(() => {
        if (visible) {
            getData();
        }
    }, [visible]);

    const filteredProjectsLocations = siteLocations.filter(pro => {
        const proName = pro.PROJECT_NAME || '';
        const proNo = pro.PROJECT_NO ? pro.PROJECT_NO.toString() : '';
        const siteLoc = pro.SITE_LOCATION || '';
        const detail = pro.DETAIL_DESCRIPTION || '';

        return (
            proName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            siteLoc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            detail.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const handleDelete = async (item) => {
        Alert.alert(
            'Delete Location',
            'Are you sure you want to delete this location?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        // Handle delete action
                        const DelPrjSiteLoc_SQlParameter = {
                            UserName: userData.userName,
                            DataModelName: 'project_site_locations',
                            WhereCondition: `PROJECT_NO = '${item.PROJECT_NO}' AND SITE_LOCATION = '${item.SITE_LOCATION}'`
                        };

                        const DeletePrjSiteLocations = await callSoapService(userData.clientURL, 'DataModel_DeleteData', DelPrjSiteLoc_SQlParameter);

                        Alert.alert(DeletePrjSiteLocations);

                        onClose();
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={globalStyles.backdrop} onPress={onClose} />
            <View style={[globalStyles.popup, { backgroundColor: colors.background }]}>
                {/* Search Input */}
                <Searchbar
                    style={globalStyles.my_10}
                    theme={theme}
                    placeholder="Search Projects"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredProjectsLocations}
                    keyExtractor={(item) =>
                        item.PROJECT_NO + item.SITE_LOCATION}
                    renderItem={({ item }) => (
                        <View style={[styles.itemRow, { backgroundColor: colors.card }]}>
                            <TouchableOpacity
                                style={styles.itemContent}
                                onPress={() => onSelect(item)}
                            >
                                <View style={styles.titleRow}>
                                    <Text style={[globalStyles.subtitle_3, { color: '#0685de' }]}>
                                        {item.PROJECT_NO}
                                    </Text>
                                    <Text
                                        style={[globalStyles.subtitle_3, { color: '#0685de' }]}
                                        numberOfLines={2}
                                    >
                                        {' - '}{item.PROJECT_NAME}
                                    </Text>
                                </View>

                                <View style={styles.detailsRow}>
                                    <Text style={[globalStyles.subtitle_2, { flexShrink: 1 }]}>
                                        {item.SITE_LOCATION}
                                    </Text>
                                    <Text style={[globalStyles.subtitle_2, { flexShrink: 1 }]}>
                                        {item.DETAIL_DESCRIPTION}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.delButton}>
                                <IconButton icon="delete" iconColor="red" size={20} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    delButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 15,
        marginBottom: 5,
        paddingLeft: 10,
        paddingVertical: 12,
        width: '100%',
    },
    itemContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
});

export default ProjectLocationPopUp;
