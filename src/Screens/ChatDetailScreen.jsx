import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from '../Context/AuthContext';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { formatSoapTimeOnly, formatSoapDateonly } from '../Utils/dataTimeUtils';

const ChatDetailScreen = ({ route, navigation }) => {
    const { chat } = route.params;
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        GetAllSpecificUserMsg();
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            const userSendMsgParams = {
                UserName: userData.userName,
                ToUserName: chat.name,
                Message: newMessage,
                MessageInfo: newMessage,
            };
            console.log(userSendMsgParams);

            const userSendMsgResult = await callSoapService(userData.clientURL, 'IM_Send_Message_To', userSendMsgParams);

            if (userSendMsgResult === "SENT") {
                GetAllSpecificUserMsg();
                setNewMessage('');
            }

        }
        catch (e) {
            console.log(e);
        }
    };

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

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

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
                <Text style={[globalStyles.subtitle_2, { color: '#475569' }]}>{initials}</Text>
            </View>
        );
    });

    // Memoized date separator
    const DateSeparator = React.memo(({ date }) => (
        <View style={[globalStyles.twoInputContainer1, globalStyles.my_10]}>
            <View style={styles.dateLine} />
            <Text style={[globalStyles.subtitle_3, { color: colors.gray }]}>{date}</Text>
            <View style={styles.dateLine} />
        </View>
    ));

    // Memoized file message component
    const FileMessage = React.memo(({ message }) => (
        <TouchableOpacity
            style={[
                styles.fileMessageContainer,
                message.sent ? styles.sentFileContainer : styles.receivedFileContainer,
            ]}
        >
            <Ionicons
                name="document-attach"
                size={28}
                color={message.sent ? "#fff" : "#2563eb"}
            />
            <View style={{ marginLeft: 10 }}>
                <Text
                    style={{
                        fontWeight: '600',
                        color: message.sent ? "#fff" : "#1e293b",
                    }}
                >
                    {message.fileName}
                </Text>
                <Text style={{ fontSize: 12, color: message.sent ? "#e2e8f0" : "#64748b" }}>
                    {message.fileSize}
                </Text>
            </View>
            <Ionicons
                name="download"
                size={20}
                style={globalStyles.mx_5}
                color={message.sent ? "#fff" : "#2563eb"}
            />
        </TouchableOpacity>
    ));

    // Memoized message component
    const MessageComponent = React.memo(({ message, index, messages }) => {
        const showDate = index === 0 || messages[index - 1].date !== message.date;
        const showAvatar = !message.sent && (index === messages.length - 1 ||
            messages[index + 1].sent || messages[index + 1].senderAvatar !== message.senderAvatar);

        return (
            <View key={message.id}>
                {showDate && <DateSeparator date={message.date} />}

                <View style={[
                    [globalStyles.twoInputContainer, { alignItems: 'flex-end' }],
                    message.sent ? [styles.sentMessageRow, globalStyles.mt_5] : [styles.receivedMessageRow, globalStyles.mt_5],
                ]}>
                    {!message.sent && (
                        <View style={styles.senderAvatarContainer}>
                            {showAvatar ? (
                                <View style={styles.senderAvatar}>
                                    <AvatarComponent emp={chat} style={styles.smallAvatarImage} />
                                </View>
                            ) : (
                                <View style={styles.avatarSpacer} />
                            )}
                        </View>
                    )}

                    <View
                        style={[
                            styles.messageContainer,
                            message.sent
                                ? [styles.sentMessage, { backgroundColor: colors.primary }]
                                : [styles.receivedMessage, { backgroundColor: colors.lightGray }],
                        ]}
                    >
                        {message.type === "file" ? (
                            <FileMessage message={message} />
                        ) : (
                            <View style={{ flexDirection: "row", alignItems: "flex-end", }}>
                                <Text
                                    style={[
                                        globalStyles.body,
                                        message.sent ? [globalStyles.body, { color: colors.white }] : globalStyles.body,
                                        { flexShrink: 1 }, // wrap if too long
                                    ]}
                                >
                                    {message.text}
                                </Text>
                                <Text
                                    style={[
                                        globalStyles.subtitle_4,
                                        message.sent ? styles.sentMessageTime : styles.receivedMessageTime,
                                        { marginLeft: 5, alignSelf: "flex-end", marginBottom: -5 },
                                    ]}
                                >
                                    {message.timestamp}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    });

    const GetAllSpecificUserMsg = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const specUserMsgParam = {
                FromUserName: userData.userName,
                SentToUserName: chat.name
            };

            const response = await callSoapService(
                userData.clientURL,
                "IM_Get_Specific_User_Messages",
                specUserMsgParam
            );

            // Map to message format
            const mapped = response.map((msg) => {
                const createdUser = msg.CREATED_USER?.trim() || "";
                const currentUser = userData.userName?.trim() || "";

                // Extract timestamp (keep raw for sorting)
                const rawTimestamp = parseInt(msg.CREATED_ON.match(/\d+/)[0]);
                const dateObj = new Date(rawTimestamp);

                return {
                    id: msg.TASK_ID.toString(),
                    text: msg.TASK_INFO,
                    timestamp: formatSoapTimeOnly(msg.CREATED_ON),
                    date: formatSoapDateonly(msg.CREATED_ON), // "Today", "Yesterday" or date
                    rawTimestamp, // keep original timestamp for sorting
                    sent: createdUser.toUpperCase() === currentUser.toUpperCase(),
                    senderAvatar: createdUser ? createdUser.charAt(0).toUpperCase() : "?",
                    type: "text"
                };
            });

            // Sort by raw timestamp ascending
            mapped.sort((a, b) => a.rawTimestamp - b.rawTimestamp);

            // No reverse, because FlatList inverted will handle bottom alignment
            setMessages(mapped);
        } catch (error) {
            console.log("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const flatListRef = useRef(null);

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const getItemLayout = useCallback((data, index) => ({
        length: 80, // Approximate height of each item
        offset: 80 * index,
        index,
    }), []);

    return (
        <SafeAreaView style={globalStyles.pageContainer}>
            {/* Chat Detail Header */}
            <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
                <TouchableOpacity
                    onPress={handleBackPress}
                    style={styles.touchableArea}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" color={colors.text} size={24} />
                </TouchableOpacity>

                <View style={globalStyles.twoInputContainer}>
                    <View style={[styles.smallAvatar, chat?.online && styles.avatarOnline]}>
                        <AvatarComponent emp={chat} style={styles.smallAvatarImage} />
                    </View>
                    <View style={globalStyles.flex_1}>
                        <Text style={globalStyles.subtitle_2} numberOfLines={1}>
                            {chat?.name}
                        </Text>
                        <Text style={globalStyles.content}>
                            {chat?.online ? 'Online' : 'Last seen 1h ago'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item, index }) => (
                        <MessageComponent message={item} index={index} messages={messages} />
                    )}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    initialNumToRender={20}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
                    keyboardShouldPersistTaps="handled"
                />

                {/* Sticky Input Bar */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message..."
                        placeholderTextColor="#9ca3af"
                        value={newMessage}
                        keyboardType="twitter"
                        onChangeText={setNewMessage}
                        multiline
                    />
                    {newMessage.trim().length > 0 && (
                        <TouchableOpacity onPress={handleSendMessage} style={[styles.sendButton, { backgroundColor: colors.blue }]}>
                            <Feather name="send" size={24} color={colors.text} />
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    smallAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sendButton: {
        alignItems: 'center',
        marginLeft: 4,
        width: 45,
        height: 45,
        borderRadius: 15,
        padding: 8,
    },
    avatarOnline: {
        borderWidth: 3,
        borderColor: '#10b981',
    },
    dateLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    sentMessageRow: {
        justifyContent: 'flex-end',
    },
    receivedMessageRow: {
        justifyContent: 'flex-start',
    },
    senderAvatarContainer: {
        marginRight: 8,
    },
    senderAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarSpacer: {
        width: 32,
        height: 32,
    },
    messageContainer: {
        maxWidth: '85%',
    },
    sentMessage: {
        alignSelf: 'flex-end',
        borderRadius: 18,
        padding: 10
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        borderRadius: 18,
        padding: 10
    },
    sentMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'right',
    },
    receivedMessageTime: {
        color: '#64748b',
    },
    sentFileContainer: {
        backgroundColor: '#2563eb',
    },
    receivedFileContainer: {
        backgroundColor: '#f1f5f9',
    },
    inputContainer: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 9,
        fontSize: 16,
        color: '#1e293b',
        maxHeight: 100,
    },
    fileMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginVertical: 4,
    },
    smallAvatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarFallback: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    touchableArea: {
        padding: 3
    },
});

export default ChatDetailScreen;