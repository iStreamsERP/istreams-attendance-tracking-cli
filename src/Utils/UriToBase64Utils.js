import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

export const convertUriToBase64 = async (uri) => {
    try {
        // Remove 'file://' prefix if present
        const filePath = uri.replace('file://', '');

        // Read file as base64
        const base64String = await RNFS.readFile(filePath, 'base64');

        return base64String;
    } catch (error) {
        console.error('Error converting URI to Base64:', error);
        throw error;
    }
};

export const compressImage = async (uri, rotationAngle) => {
    try {
        console.log('Starting image compression...');

        const resizedImage = await ImageResizer.createResizedImage(
            uri,
            900, // maxWidth
            700, // maxHeight
            'JPEG', // format
            100, // quality (0-100)
            rotationAngle, // rotation
            null, // outputPath
            false, // keepMeta
            {
                mode: 'contain', // maintains aspect ratio
                onlyScaleDown: true, // don't upscale smaller images
            }
        );

        console.log('Image compressed successfully:', resizedImage.uri);
        return resizedImage.uri;
    } catch (error) {
        console.error('Image compression failed:', error);
        // Return original URI if compression fails
        return uri;
    }
};

export const escapeXml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};