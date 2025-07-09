import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { GlobalStyles } from "../Styles/styles";
import { useAuth } from "../Context/AuthContext";

const Header = ({ title = "Header", style }) => {
    const navigation = useNavigation();
    const { userData } = useAuth();

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.touchableArea}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="arrow-back" color={"black"} size={24} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
                <Text style={[GlobalStyles.title,{textAlign: 'center'}]} numberOfLines={2}>
                    {title}
                </Text>
            </View>

            <Image
                source={{ uri: `data:image/jpeg;base64,${userData.userAvatar}` }}
                style={styles.dp}
            />
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    touchableArea: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dp: {
        height: 44,
        width: 44,
        borderRadius: 22,
    },
});
