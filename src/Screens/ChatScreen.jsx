import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Image
} from 'react-native';
import Header from '../Components/Header';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Searchbar } from 'react-native-paper';
import { useAuth } from '../Context/AuthContext';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { formatSoapDate } from '../Utils/dataTimeUtils';

const ChatListScreen = ({ navigation }) => {
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const insets = useSafeAreaInsets();

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageCache, setImageCache] = useState(new Map());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        GetListUserMessage();
    }, []);

    // Memoize the image processing to avoid repeated work
    const processImageData = useCallback((avatarData) => {
        if (!avatarData) return null;

        if (avatarData.startsWith('data:image')) {
            return avatarData;
        }

        // Clean and format base64 data
        const cleanedData = avatarData.replace(/(\r\n|\n|\r)/gm, "");
        return `data:image/bmp;base64,${cleanedData}`;
    }, []);

    const parseTimestamp = (timestamp) => {
        if (!timestamp) return new Date(0);
        const [datePart, timePart] = timestamp.split(', ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute, second);
    };


    const GetListUserMessage = async () => {
        if (loading) return; // Prevent multiple calls

        setLoading(true);
        try {
            const listUserMsgParam = {
                ForTheUserName: userData.userName
            };

            const response = await callSoapService(
                userData.clientURL,
                'IM_Get_ListOfUsers_Messages',
                listUserMsgParam
            );

            const batchSize = 5;
            const formatted = [];

            for (let i = 0; i < response.length; i += batchSize) {
                const batch = response.slice(i, i + batchSize);

                const batchProcessed = await Promise.all(
                    batch
                        .filter(emp => emp.CREATED_USER !== userData.userName) // <-- Skip current user
                        .map(async (emp) => {
                            let avatarData = null;

                            // Check cache first
                            if (imageCache.has(emp.EMP_NO)) {
                                avatarData = imageCache.get(emp.EMP_NO);
                            } else {
                                try {
                                    const res = await callSoapService(
                                        userData.clientURL,
                                        'getpic_bytearray',
                                        { EmpNo: emp.EMP_NO }
                                    );
                                    avatarData = res;
                                    // Cache the result
                                    setImageCache(prev => new Map(prev.set(emp.EMP_NO, res)));
                                } catch (error) {
                                    console.warn(`Failed to fetch image for ${emp.EMP_NO}`, error);
                                }
                            }

                            return {
                                id: emp.TASK_ID.toString(),
                                name: emp.CREATED_USER,
                                lastMessage: emp.TASK_INFO,
                                timestamp: formatSoapDate(emp.CREATED_ON),
                                unreadCount: emp.VIEW_STATUS === 'F' ? 1 : 0,
                                avatar: avatarData,
                                online: !!emp.EMP_NO,
                                empNo: emp.EMP_NO // Keep for reference
                            };
                        })
                );

                console.log(batchProcessed);

                formatted.push(...batchProcessed);

                // Add a small delay between batches to keep UI responsive
                if (i + batchSize < response.length) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }

            formatted.sort((a, b) => parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp));

            setChats(formatted);
        } catch (error) {
            console.log('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChatPress = useCallback((chat) => {
        navigation.navigate('ChatDetail', { chat });
    }, [navigation]);

    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chats;
        const lower = searchQuery.toLowerCase();
        return chats.filter(
            (c) =>
                c.name.toLowerCase().includes(lower) ||
                c.lastMessage.toLowerCase().includes(lower)
        );
    }, [searchQuery, chats]);

    // Memoized avatar component to prevent unnecessary re-renders
    const AvatarComponent = React.memo(({ emp, style }) => {
        const [imageError, setImageError] = useState(false);
        const [imageLoading, setImageLoading] = useState(true);

        const processedUri = useMemo(() => {
            return emp.avatar ? processImageData(emp.avatar) : null;
        }, [emp.avatar, processImageData]);

        if (processedUri && !imageError) {
            return (
                <View style={style}>
                    {imageLoading && (
                        <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    )}
                    <Image
                        source={{ uri: processedUri }}
                        style={style}
                        onLoad={() => setImageLoading(false)}
                        onError={() => {
                            setImageError(true);
                            setImageLoading(false);
                        }}
                    />
                </View>
            );
        }

        // Fallback to initials
        const initials = emp.name
            ? emp.name.split(' ').map((w) => w[0]).join('').toUpperCase()
            : '?';

        return (
            <View style={[style, styles.avatarFallback]}>
                <Text style={styles.avatarText}>{initials}</Text>
            </View>
        );
    });

    // Memoized chat item to prevent unnecessary re-renders
    const ChatItem = React.memo(({ item, onPress }) => (
        <TouchableOpacity
            style={[globalStyles.twoInputContainer, globalStyles.py_10, globalStyles.px_5, globalStyles.alignItemsCenter]}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                <AvatarComponent emp={item} style={styles.avatarImage} />
                {item.online && <View style={styles.onlineIndicator} />}
            </View>

            <View style={[globalStyles.flex_1, globalStyles.justifyContentCenter]}>
                <View style={globalStyles.twoInputContainer}>
                    <Text style={globalStyles.subtitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={globalStyles.subtitle_3}>{item.timestamp}</Text>
                </View>
                <View style={[globalStyles.twoInputContainer, globalStyles.alignItemsCenter]}>
                    <Text style={globalStyles.content} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                    {item.unreadCount > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                            <Text style={[globalStyles.subtitle_4, { color: colors.background }]}>
                                {item.unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    ));

    const renderChatItem = useCallback(({ item }) => (
        <ChatItem item={item} onPress={handleChatPress} />
    ), [handleChatPress]);

    const keyExtractor = useCallback((item) => item.id, []);

    const getItemLayout = useCallback((data, index) => ({
        length: 80, // Approximate height of each item
        offset: 80 * index,
        index,
    }), []);

    return (
        <SafeAreaView style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            {/* Header */}
            <Header title="Message" />

            <Searchbar
                placeholder="Search"
                theme={theme}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
                style={globalStyles.my_10}
            />

            {/* Chat List */}
            <FlatList
                data={filteredChats}
                renderItem={renderChatItem}
                keyExtractor={keyExtractor}
                style={globalStyles.flex_1}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={15}
                getItemLayout={getItemLayout}
                refreshing={loading}
                onRefresh={GetListUserMessage}
            />

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => {
                    navigation.navigate('AddUserScreen');
                }}
            >
                <Text style={styles.floatingButtonText}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    unreadBadge: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    avatarImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarFallback: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#475569',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#007BFF',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    floatingButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default ChatListScreen;