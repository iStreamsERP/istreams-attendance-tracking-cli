import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get('window');

export const GlobalStyles = (colors = {}) => StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: colors.background,
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
    twoInputContainer1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 10,
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
        width: width * 0.94,
        height: width * 0.75,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    bigtitle: {
        fontSize: 25,
        fontFamily: 'Inter-Bold',
        color: colors.text,
    },
    title: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: colors.text,
    },
    title1: {
        fontSize: 19,
        fontFamily: 'Inter-Bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        color: colors.text,
    },
    subtitle_1: {
        fontSize: 17,
        fontFamily: 'Inter-Bold',
        color: colors.text,
    },
    subtitle_2: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        color: colors.text,
    },
    subtitle_3: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
        color: colors.text,
    },
    subtitle_4: {
        fontSize: 12,
        fontFamily: 'Inter-Bold',
        color: colors.text,
    },
    body: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: colors.text,
    },
    content: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: colors.text,
    },
    content1: {
        fontSize: 15,
        fontFamily: 'Inter-SemiBold',
        color: colors.text,
    },
    content2: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: colors.text,
    },
    small_text: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: colors.text,
    },
    txtEmpNo: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        color: colors.text,
    },
    txtEmpName: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        color: colors.text,
    },
    txtDesignation: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: colors.text,
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
    my_20: {
        marginVertical: 20,
    },
    my_5: {
        marginVertical: 5,
    },
    mb_10: {
        marginBottom: 10,
    },
    mb_5: {
        marginBottom: 5,
    },
    mb_20: {
        marginBottom: 20,
    },
    mt_10: {
        marginTop: 10,
    },
    pl_10: {
        paddingLeft: 10,
    },
    justifyContentCenter: {
        justifyContent: 'center',
    },
    alignItemsCenter: {
        alignItems: 'center',
    },
    justifySpaceBetween: {
        justifyContent: 'space-between',
    },
    mr_10: {
        marginRight: 10,
    },
    ml_10: {
        marginLeft: 10,
    },
    m_10: {
        margin: 10,
    },
    p_10: {
        padding: 10,
    },
    p_20: {
        padding: 20,
    },
    pt_10: {
        paddingTop: 10,
    },
    py_10: {
        paddingVertical: 10,
    },
    px_5: {
        paddingHorizontal: 5,
    },
    px_10: {
        paddingHorizontal: 10,
    },
    px_15: {
        paddingHorizontal: 15,
    },
    px_20: {
        paddingHorizontal: 20,
    },
    px_30: {
        paddingHorizontal: 30,
    },
    px_40: {
        paddingHorizontal: 40,
    },
    px_50: {
        paddingHorizontal: 50,
    },
    justalignCenter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    borderRadius_10: {
        borderRadius: 10,
    },
    borderRadius_15: {
        borderRadius: 15,
    },
    borderRadius_20: {
        borderRadius: 20,
    },
    borderRadius_30: {
        borderRadius: 30,
    },
    borderRadius_40: {
        borderRadius: 40,
    },
    borderRadius_50: {
        borderRadius: 50,
    },

    //Emp List
    empImageInList: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    headerImage: {
        width: 44,
        height: 44,
        borderRadius: 25,
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
    height_45: {
        height: 45,
    },
    mt_5: {
        marginTop: 5,
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

    // Round Uploaded Emp Image
    uploadedEmpImage: {
        width: width * 0.20,
        height: width * 0.20,
        borderRadius: (width * 0.20) / 2,
        borderWidth: 1,
        borderColor: colors.border,
    },
    projectContainer: {
        borderRadius: 15,
        padding: 10,
        marginVertical: 10,
        backgroundColor: colors.card,
    },

    // Center Round Img / Container
    centerRoundImg: {
        width: width * 0.30,
        height: width * 0.30,
        borderRadius: (width * 0.35) / 2,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    roundImg: {
        width: '100%',
        height: '100%',
        borderRadius: (width * 0.35) / 2,
    },

    // Switch Button 
    toggleContainer: {
        marginTop: 10,
        flexDirection: 'row',
        backgroundColor: '#fddde0',
        borderRadius: 25,
        padding: 3,
        alignSelf: 'center',
    },
    toggleButton: {
        paddingVertical: 10,
        paddingHorizontal: 25,
        flex: 1,
        alignItems: 'center',
        borderRadius: 25,
    },
    leftButton: {
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25,
    },
    rightButton: {
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,
    },
    activeButton: {
        backgroundColor: '#f44336',
    },
    inactiveButton: {
        backgroundColor: 'transparent',
    },
    activeText: {
        color: '#fff',
    },
    inactiveText: {
        color: '#999',
    },

    summaryCard: {
        marginVertical: 10,
        elevation: 2,
        width: '95%',
        alignSelf: 'center',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        backgroundColor: colors.card,
    },

    summaryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },

    summaryItem: {
        flex: 1,
        minWidth: '30%',
        marginVertical: 6,
    },

    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#777',
        marginBottom: 4,
        textAlign: 'left',
    },

    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#222',
        textAlign: 'left',
    },

    //Popup
    backdrop: {
        flex: 1,
        backgroundColor: '#00000066',
    },
    popup: {
        position: 'absolute',
        top: '33%',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        padding: 10,
        elevation: 10,
    },
    item: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 15,
        marginBottom: 5,
    },
});