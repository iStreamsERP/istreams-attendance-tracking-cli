import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Searchbar } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { useAuth } from '../Context/AuthContext';

const LoanTypeListPopUp = ({ visible, onClose, onSelect }) => {
    const { userData } = useAuth();
    const [loanType, setLoanType] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const getData = async () => {
        try {
            const loanType_Params = {
                CompanyCode: userData.companyCode,
                BranchCode: userData.branchCode
            };
            const response = await callSoapService(userData.clientURL, "HR_Get_LoanTypes_List", loanType_Params)
            
            if (response !== null) {
                setLoanType(response);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const filteredProjects = loanType.filter(pro => {
        const loanType = pro.LOAN_TYPE || '';
        return (
            loanType.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={globalStyles.backdrop} onPress={onClose} />
            <View style={[globalStyles.popup, { backgroundColor: colors.background }]}>
                {/* Search Input */}
                <Searchbar
                    style={globalStyles.my_10}
                    placeholder="Search Loan Type"
                    value={searchQuery}
                    theme={theme}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredProjects}
                    keyExtractor={(item) => item.LOAN_TYPE}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[globalStyles.item, { backgroundColor: colors.card }]}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={globalStyles.subtitle_2}>{item.LOAN_TYPE}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
};

export default LoanTypeListPopUp;