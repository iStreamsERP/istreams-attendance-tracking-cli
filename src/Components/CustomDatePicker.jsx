import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Platform,
    TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from 'react-native-paper';
import { formatDate } from '../Utils/dataTimeUtils';

const CustomDatePicker = ({ visible, onClose, onDateSelected }) => {
    const [tempDate, setTempDate] = useState(new Date());

    const handleChange = (event, selectedDate) => {
        const currentDate = selectedDate || tempDate;

        if (Platform.OS === 'android') {
            onDateSelected(formatDate(currentDate));
            onClose();
        } else {
            setTempDate(currentDate); // keep as Date object on iOS
        }
    };

    const handleConfirmIOS = () => {
        onDateSelected(formatDate(tempDate)); // Format here when confirming
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleChange}
                style={styles.datePicker}
            />

            {Platform.OS === 'ios' && (
                <View style={styles.buttonRow}>
                    <Button onPress={onClose}>Cancel</Button>
                    <Button mode="contained" onPress={handleConfirmIOS}>
                        Confirm
                    </Button>
                </View>
            )}
        </Modal>
    );
};

export default CustomDatePicker;

const styles = StyleSheet.create({
    datePicker: {
        marginVertical: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
});