import React, { useState } from 'react';
import { Modal, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from 'react-native-paper';
import { formatDate } from '../Utils/dataTimeUtils';

const CustomDatePicker = ({ visible, onClose, onDateSelected }) => {
    const [tempDate, setTempDate] = useState(new Date());

    const handleChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            if (event.type === 'set') {
                onDateSelected(formatDate(selectedDate));
            }
            onClose(); // Always close the modal after interaction
        } else {
            setTempDate(selectedDate || tempDate);
        }
    };

    const handleConfirmIOS = () => {
        onDateSelected(formatDate(tempDate)); // Format here when confirming
        onClose();
    };

    if (Platform.OS === 'android') {
        return visible ? (
            <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={handleChange}
            />
        ) : null;
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={{ marginTop: 'auto', backgroundColor: '#fff', padding: 16 }}>
                <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={handleChange}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button onPress={onClose}>Cancel</Button>
                    <Button mode="contained" onPress={handleConfirmIOS}>
                        Confirm
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

export default CustomDatePicker;