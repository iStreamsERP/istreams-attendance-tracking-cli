import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import Header from '../Components/Header';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Searchbar } from 'react-native-paper';
import { useAuth } from '../Context/AuthContext';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { useNavigation } from '@react-navigation/native';

const AddUserScreen = () => {
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageCache, setImageCache] = useState(new Map());
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        if (loading) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await callSoapService(
                userData.clientURL,
                'IM_Get_All_Users',
                ''
            );

            if (!Array.isArray(response)) {
                throw new Error('Invalid response format');
            }

            // Filter out current user and process in batches
            const filteredUsers = response.filter(user => 
                user.user_name && user.user_name.toLowerCase() !== userData.userName?.toLowerCase()
            );

            const batchSize = 5;
            const processedUsers = [];

            for (let i = 0; i < filteredUsers.length; i += batchSize) {
                const batch = filteredUsers.slice(i, i + batchSize);

                const batchProcessed = await Promise.all(
                    batch.map(async (user, batchIndex) => {
                        let avatarData = null;
                        
                        // Create unique cache key using both user_name and emp_no for better accuracy
                        const cacheKey = `${user.user_name}_${user.emp_no || 'no_emp'}`;
                        
                        // Check cache first
                        if (imageCache.has(cacheKey)) {
                            avatarData = imageCache.get(cacheKey);
                        } else if (user.emp_no && user.emp_no.toString().trim() !== '') {
                            try {
                                console.log(`Fetching image for user: ${user.user_name}, emp_no: ${user.emp_no}`);
                                
                                const img = await callSoapService(
                                    userData.clientURL,
                                    'getpic_bytearray',
                                    { EmpNo: user.emp_no.toString() } // Ensure emp_no is string
                                );
                                
                                // Validate image data before caching
                                if (img && typeof img === 'string' && img.length > 0) {
                                    avatarData = img;
                                    
                                    // Update cache with unique key
                                    setImageCache(prev => new Map(prev.set(cacheKey, img)));
                                } else {
                                    console.warn(`Invalid image data for ${user.user_name}`);
                                }
                            } catch (e) {
                                console.warn(`Image fetch failed for ${user.user_name} (emp_no: ${user.emp_no}):`, e);
                            }
                        } else {
                            console.log(`No emp_no for user: ${user.user_name}`);
                        }
                        
                        return { 
                            ...user, 
                            avatar: avatarData,
                            id: `${user.user_name}_${user.emp_no || i + batchIndex}`, // More unique ID
                            cacheKey: cacheKey // Store cache key for debugging
                        };
                    })
                );

                processedUsers.push(...batchProcessed);
                
                // Small delay to keep UI responsive
                if (i + batchSize < filteredUsers.length) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }

            setUsers(processedUsers);
        } catch (e) {
            console.error('Failed to retrieve users:', e);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const processImageData = useCallback((avatarData) => {
        if (!avatarData || typeof avatarData !== 'string') return null;
        
        // If already a data URL, return as is
        if (avatarData.startsWith('data:image')) return avatarData;
        
        try {
            // Clean the base64 data
            const cleanedData = avatarData.replace(/(\r\n|\n|\r|\s)/gm, "");
            
            // Validate base64 format
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanedData)) {
                console.warn('Invalid base64 format');
                return null;
            }
            
            // Try different image formats (bmp is common but jpg/png might work better)
            return `data:image/jpeg;base64,${cleanedData}`;
        } catch (e) {
            console.warn('Image processing failed:', e);
            return null;
        }
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        
        const query = searchQuery.toLowerCase();
        return users.filter(user =>
            (user.user_name || '').toLowerCase().includes(query) ||
            (user.emp_name || '').toLowerCase().includes(query)
        );
    }, [searchQuery, users]);

    const handleUserPress = useCallback((user) => {
        if (!user.user_name) {
            Alert.alert('Error', 'Invalid user data');
            return;
        }
        
        navigation.navigate('ChatDetail', { 
            chat: {
                name: user.user_name,
                avatar: user.avatar,
                online: user.online || false,
                empNo: user.emp_no
            }
        });
    }, [navigation]);

    const handleRefresh = useCallback(() => {
        // Clear image cache on refresh to force re-fetch
        setImageCache(new Map());
        getData();
    }, []);

    // Avatar component with improved error handling
    const AvatarComponent = React.memo(({ user, style }) => {
        const [imageError, setImageError] = useState(false);
        const [imageLoading, setImageLoading] = useState(true);

        const processedUri = useMemo(() => {
            if (!user.avatar) return null;
            const processed = processImageData(user.avatar);
            if (!processed) {
                console.warn(`Failed to process image for ${user.user_name}`);
            }
            return processed;
        }, [user.avatar, user.user_name, processImageData]);

        // Reset error state when avatar data changes
        useEffect(() => {
            setImageError(false);
            setImageLoading(true);
        }, [user.avatar]);

        if (processedUri && !imageError) {
            return (
                <View style={style}>
                    {imageLoading && (
                        <View style={[style, styles.loadingOverlay]}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    )}
                    <Image
                        source={{ uri: processedUri }}
                        style={style}
                        onLoad={() => {
                            setImageLoading(false);
                            console.log(`Image loaded successfully for ${user.user_name}`);
                        }}
                        onError={(error) => {
                            console.warn(`Image load error for ${user.user_name}:`, error.nativeEvent);
                            setImageError(true);
                            setImageLoading(false);
                        }}
                        resizeMode="cover"
                    />
                </View>
            );
        }

        // Fallback avatar with better initials logic
        const getInitials = (name) => {
            if (!name) return '?';
            
            const words = name.trim().split(/\s+/);
            if (words.length === 1) {
                return words[0].substring(0, 2).toUpperCase();
            }
            return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
        };

        const initials = getInitials(user.user_name || user.emp_name);

        return (
            <View style={[style, styles.avatarFallback]}>
                <Text style={[globalStyles.subtitle_1, styles.avatarText]}>{initials}</Text>
            </View>
        );
    });

    // User item component with debug info
    const UserItem = React.memo(({ item, onPress }) => (
        <TouchableOpacity
            style={[
                globalStyles.twoInputContainer, 
                styles.itemContainer,
                globalStyles.alignItemsCenter
            ]}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <AvatarComponent user={item} style={styles.avatar} />
            <View style={globalStyles.flex_1}>
                <Text style={[globalStyles.subtitle]} numberOfLines={1}>
                    {item.user_name}
                </Text>
                {item.emp_name && (
                    <Text style={[globalStyles.content]} numberOfLines={1}>
                        {item.emp_name}
                    </Text>
                )}
                {__DEV__ && (
                    <Text style={[globalStyles.content, { fontSize: 10, color: '#999' }]} numberOfLines={1}>
                        email: {item.email_address || 'N/A'} 
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    ));

    const renderItem = useCallback(({ item }) => (
        <UserItem item={item} onPress={handleUserPress} />
    ), [handleUserPress]);

    const keyExtractor = useCallback((item) => item.id, []);

    const getItemLayout = useCallback((data, index) => ({
        length: __DEV__ ? 80 : 70, // Slightly taller in dev mode for debug info
        offset: (__DEV__ ? 80 : 70) * index,
        index,
    }), []);

    if (error) {
        return (
            <SafeAreaView style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Add Chats" />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={[styles.retryButton, { backgroundColor: colors.primary }]}
                        onPress={handleRefresh}
                    >
                        <Text style={[globalStyles.subtitle, { color: colors.white }]}>
                            Retry
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Add Chats" />

            <Searchbar
                placeholder="Search Users"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={globalStyles.my_10}
                theme={theme}
            />

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[globalStyles.content, styles.loadingText]}>
                        Loading users...
                    </Text>
                </View>
            ) : filteredUsers.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[globalStyles.subtitle, styles.emptyText]}>
                        {searchQuery ? 'No users found' : 'No users available'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    getItemLayout={getItemLayout}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews
                    initialNumToRender={15}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    refreshing={loading}
                    onRefresh={handleRefresh}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    avatarFallback: {
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#475569',
        fontSize: 14,
        fontWeight: '600',
    },
    itemContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e5e7eb',
        justifyContent: 'flex-start',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#64748b',
    },
    loadingOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#64748b',
    },
});

export default AddUserScreen;