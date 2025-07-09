import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const { width, height } = Dimensions.get('window');
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { GlobalStyles } from '../Styles/styles';
import { useAuth } from '../Context/AuthContext';

const ImageEditPopUp = ({ setAvatar, empNo }) => {
    const { userData } = useAuth();
    const handlePickImage = async (source) => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            quality: 0.3,
            maxWidth: 800,
            maxHeight: 800,
        };

        let result;
        try {
            if (source === 'camera') {
                result = await launchCamera(options);
            } else {
                result = await launchImageLibrary(options);
            }

            if (result.didCancel) return;
            if (result.errorCode) {
                Alert.alert('Error', result.errorMessage || 'Image selection failed');
                return;
            }

            const imageUri = result.assets?.[0]?.uri;
            if (imageUri) {
                setAvatar(imageUri);
                await AsyncStorage.setItem('profilePicture', imageUri);
                uploadImage(imageUri);
            }
        } catch (err) {
            console.error('Image pick error:', err);
        }
    };

    const removeImage = async () => {
        try {
            setAvatar(null);
            await AsyncStorage.removeItem('profilePicture');

            const Username = userData.userEmail;
            const domainPart = Username.split('@')[1].split('.')[0];

            const response = await axios.delete(
                `http://23.105.135.231:8082/api/EncodeImgToNpy/delete`,
                {
                    params: {
                        DomainName: domainPart,
                        EmpNo: empNo,
                    },
                    headers: {
                        'accept': '*/*',
                    },
                }
            );

            Alert.alert('Success', response.data.message);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to remove image');
        }
    };

    const uploadImage = async (imageUri) => {
        try {
            // You can implement the upload logic here if needed
            console.log('Uploading:', imageUri);
        } catch (error) {
            console.error('Upload Error:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to upload profile picture');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={GlobalStyles.subtitle_1}>Profile Image Actions</Text>
            <View style={styles.iconOptions}>
                <TouchableOpacity style={styles.option} onPress={() => handlePickImage('camera')}>
                    <Feather name="camera" size={width * 0.07} color="#1c9aa5" />
                    <Text style={[GlobalStyles.subtitle_2, styles.optionText]}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => handlePickImage('gallery')}>
                    <MaterialIcons name="insert-photo" size={width * 0.07} color="#1c9aa5" />
                    <Text style={[GlobalStyles.subtitle_2, styles.optionText]}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={removeImage}>
                    <MaterialIcons name="delete" size={width * 0.07} color="#1c9aa5" />
                    <Text style={[GlobalStyles.subtitle_2, styles.optionText]}>Remove</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    iconOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    option: {
        alignItems: 'center',
        padding: 10,
    },
    optionText: {
        marginTop: 5,
        color: '#333',
    },
});

export default ImageEditPopUp;