import { Platform, Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { launchCamera } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

export const handlePickImageOptimized = async (setCapturedImage) => {
    // Check available memory before proceeding (Android)
    if (Platform.OS === 'android') {
        try {
            const memoryInfo = await DeviceInfo.getUsedMemory();
            const totalMemory = await DeviceInfo.getTotalMemory();
            const memoryUsage = memoryInfo / totalMemory;

            if (memoryUsage > 0.8) { // If using more than 80% memory
                Alert.alert(
                    'Low Memory',
                    'Please close some apps and try again.',
                    [{ text: 'OK' }]
                );
                return;
            }
        } catch (error) {
            console.log('Memory check failed:', error);
        }
    }

    const options = {
        mediaType: 'photo',
        includeBase64: false,
        includeExtra: true,
        quality: 1.0,
        maxWidth: 600,
        maxHeight: 600,
        saveToPhotos: false, // Don't save to photo library
        storageOptions: {
            skipBackup: true,
            path: 'images',
            cameraRoll: false,
        },
    };

    try {
        // Clear previous image
        setCapturedImage(null);

        // Add small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 100));

        const result = await launchCamera(options);

        if (result.didCancel || result.errorCode) {
            if (result.errorCode) {
                console.error('Camera error:', result.errorMessage);
                Alert.alert('Camera Error', 'Unable to access camera. Please check permissions.');
            }
            return;
        }

        const asset = result.assets?.[0];
        if (asset?.uri) {
            const rotated = await ImageResizer.createResizedImage(
                asset.uri,
                600,
                600,
                'JPEG',
                100,
                0,   // auto rotates based on EXIF
            );
            setCapturedImage(rotated.uri);
            //setCapturedImage(asset.uri);
        }
    } catch (error) {
        console.error('Camera launch error:', error);
        Alert.alert('Error', 'Camera failed to launch. Please restart the app.');
    }
};
