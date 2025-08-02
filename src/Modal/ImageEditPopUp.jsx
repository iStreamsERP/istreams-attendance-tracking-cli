import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const { width, height } = Dimensions.get('window');
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { GlobalStyles } from '../Styles/styles';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import ManualImageCaptureModal from './ManualImageCaptureModal';

const ImageEditPopUp = ({ setAvatar, empNo }) => {
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [cameraVisible, setCameraVisible] = useState(false);

    const handleCapture = async (uri) => {
        setCameraVisible(false);
        if (uri) {
            setAvatar(uri);
            await AsyncStorage.setItem('profilePicture', uri);
            uploadImage(uri);
        }
    };
    const handlePickImage = async (source) => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            quality: 0.3,
            maxWidth: 800,
            maxHeight: 800,
        };

        try {
            let result;
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

            const response = await axios.delete(
                `http://103.168.19.35:8070/api/EncodeImgToNpy/delete`,
                {
                    params: {
                        DomainName: userData.userDomain,
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
            <Text style={globalStyles.subtitle_1}>Capture / Upload Emp Image</Text>
            <View style={styles.iconOptions}>
                <TouchableOpacity style={styles.option} onPress={() => handlePickImage('camera')}>
                    <Feather name="camera" size={width * 0.07} color="#1c9aa5" />
                    <Text style={[globalStyles.subtitle_2, globalStyles.subtitle_2]}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => handlePickImage('gallery')}>
                    <MaterialIcons name="insert-photo" size={width * 0.07} color="#1c9aa5" />
                    <Text style={[globalStyles.subtitle_2, globalStyles.subtitle_2]}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={removeImage}>
                    <MaterialIcons name="delete" size={width * 0.07} color="#1c9aa5" />
                    <Text style={[globalStyles.subtitle_2, globalStyles.subtitle_2]}>Remove</Text>
                </TouchableOpacity>
            </View>

            <ManualImageCaptureModal
                visible={cameraVisible}
                onClose={() => setCameraVisible(false)}
                onCapture={handleCapture}
            />
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
});

export default ImageEditPopUp;