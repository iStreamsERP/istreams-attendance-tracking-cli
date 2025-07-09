import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get('window');

export const GlobalStyles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        paddingTop: 15,
        paddingHorizontal: 10,
    },
    locationContainer: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    twoInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    container1: {
        flex: 1,
        marginRight: 10,
    },
    container2: {
        flex: 1,
    },
    camButtonContainer: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    imageContainer: {
        flex: 1,
    },
    fullImage: {
        marginTop: 10,
        width: width * 0.95,
        height: width * 0.75,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    title: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#000',
    },
    title1: {
        fontSize: 19,
        fontFamily: 'Inter-Bold',
        color: '#000',
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        color: '#000',
    },
    subtitle_1: {
        fontSize: 17,
        fontFamily: 'Inter-Bold',
        color: '#000',
    },
    subtitle_2: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        color: '#000',
    },
    subtitle_3: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
        color: '#000',
    },
    subtitle_4: {
        fontSize: 12,
        fontFamily: 'Inter-Bold',
        color: '#000',
    },
    body: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: '#000',
    },
    content: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#000',
    },
    small_text: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#000',
    },
    txtEmpNo: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        color: '#000',
    },
    txtEmpName: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        color: '#000',
    },
    txtDesignation: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#000',
    },
    bottomButtonContainer: {
        marginVertical: 10,
    },
    shimmerInput: {
        height: height * 0.07,
        width: '100%',
        borderRadius: 8,
        marginBottom: 20,
    },
    shimmerText: {
        height: 20,
        width: '40%',
        borderRadius: 5,
    },
    shimmerButton: {
        height: 40,
        width: '100%',
        borderRadius: 8,
    },
    txt_center: {
        textAlign: 'center',
    },
    flex_1: {
        flex: 1,
    },
    mx_10: {
        marginHorizontal: 10,
    },
    mx_5: {
        marginHorizontal: 5,
    },
    my_10: {
        marginVertical: 10,
    },
    mb_10: {
        marginBottom: 10,
    },
    mt_10: {
        marginTop: 10,
    },
    pl_10: {
        paddingLeft: 10,
    },

    // Switch for Email/Phone
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 12,
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    activeToggle: {
        backgroundColor: '#3b82f6',
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        width: '100%',
        marginBottom: 16,
    },
    flagButton: {
        marginRight: 6,
    },
    code: {
        marginRight: 8,
        fontSize: 16,
    },
    input: {
        width: "100%",
        height: 50,
        marginBottom: 20,
    },
    continueButton: {
        width: '100%',
        paddingVertical: 3,
        borderRadius: 8,
        backgroundColor: '#3b82f6',
        marginBottom: 12,
    },
    empImageDisplay: {
        width: width * 0.25,
        height: width * 0.25,
        borderRadius: (width * 0.25) / 2,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    // Chip Button for Category
    chip: {
        backgroundColor: '#f5f9fc',
        paddingHorizontal: 10,
        paddingVertical: 10,
        height: 44,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipActive: {
        backgroundColor: '#0c1329',
        borderColor: '#0c1329',
    },
    chipTextActive: {
        color: '#fff',
    },
});