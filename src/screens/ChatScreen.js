import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import io from 'socket.io-client';

const { width } = Dimensions.get('window');
const SOCKET_URL = 'https://your-socket-server.com'; // Replace with your socket server URL

export default class ChatScreen extends Component {
    constructor(props) {
        super(props);

        // Get astrologer data from navigation params
        const { astrologerData } = props.route?.params || {};
        const userId = ''
        this.state = {
            messages: [],
            inputText: '',
            isTyping: false,
            astrologerTyping: false,
            isConnected: false,
            astrologerData: astrologerData || {
                id: 'astrologer_123',
                name: 'Pt. Rajesh Sharma',
                image: null,
                status: 'online',
            },
            userId: userId || 'user_456',
        };

        this.socket = null;
        this.flatListRef = null;
        this.typingTimeout = null;
    }

    componentDidMount() {
        this.initializeSocket();
        this.loadChatHistory();
    }

    componentWillUnmount() {
        if (this.socket) {
            this.socket.disconnect();
        }
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
    }

    initializeSocket = () => {
        try {
            // Initialize socket connection
            //   this.socket = io(SOCKET_URL, {
            //     transports: ['websocket'],
            //     reconnection: true,
            //     reconnectionAttempts: 5,
            //     reconnectionDelay: 1000,
            //   });

            // Connection events
            this.socket.on('connect', () => {
                console.log('Socket connected');
                this.setState({ isConnected: true });

                // Join chat room
                this.socket.emit('join_room', {
                    userId: this.state.userId,
                    astrologerId: this.state.astrologerData.id,
                });
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
                this.setState({ isConnected: false });
            });

            // Message events
            this.socket.on('receive_message', (message) => {
                this.handleReceiveMessage(message);
            });

            this.socket.on('user_typing', (data) => {
                if (data.userId === this.state.astrologerData.id) {
                    this.setState({ astrologerTyping: true });
                }
            });

            this.socket.on('user_stopped_typing', (data) => {
                if (data.userId === this.state.astrologerData.id) {
                    this.setState({ astrologerTyping: false });
                }
            });

            this.socket.on('message_delivered', (data) => {
                this.updateMessageStatus(data.messageId, 'delivered');
            });

            this.socket.on('message_read', (data) => {
                this.updateMessageStatus(data.messageId, 'read');
            });

            this.socket.on('error', (error) => {
                console.error('Socket error:', error);
                Alert.alert('Connection Error', 'Unable to connect to chat server');
            });

        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    };

    loadChatHistory = () => {
        // Mock chat history - Replace with actual API call
        const mockMessages = [
            {
                id: '1',
                text: 'Namaste! Welcome to our consultation. How may I guide you today?',
                senderId: this.state.astrologerData.id,
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                status: 'read',
                type: 'text',
            },
            {
                id: '2',
                text: 'Hello! I wanted to ask about my career prospects.',
                senderId: this.state.userId,
                timestamp: new Date(Date.now() - 3000000).toISOString(),
                status: 'read',
                type: 'text',
            },
        ];

        this.setState({ messages: mockMessages });
    };

    handleReceiveMessage = (message) => {
        this.setState((prevState) => ({
            messages: [...prevState.messages, message],
            astrologerTyping: false,
        }), () => {
            this.scrollToBottom();

            // Send read receipt
            if (this.socket && message.senderId !== this.state.userId) {
                this.socket.emit('message_read', {
                    messageId: message.id,
                    userId: this.state.userId,
                });
            }
        });
    };

    updateMessageStatus = (messageId, status) => {
        this.setState((prevState) => ({
            messages: prevState.messages.map((msg) =>
                msg.id === messageId ? { ...msg, status } : msg
            ),
        }));
    };

    handleSendMessage = () => {
        const { inputText, userId, astrologerData } = this.state;

        if (inputText.trim() === '') return;

        const newMessage = {
            id: `msg_${Date.now()}`,
            text: inputText.trim(),
            senderId: userId,
            receiverId: astrologerData.id,
            timestamp: new Date().toISOString(),
            status: 'sent',
            type: 'text',
        };

        // Add message to state
        this.setState((prevState) => ({
            messages: [...prevState.messages, newMessage],
            inputText: '',
            isTyping: false,
        }), () => {
            this.scrollToBottom();
        });

        // Send via socket
        if (this.socket && this.socket.connected) {
            this.socket.emit('send_message', newMessage);

            // Stop typing indicator
            this.socket.emit('stopped_typing', {
                userId: userId,
                receiverId: astrologerData.id,
            });
        }
    };

    handleTyping = (text) => {
        this.setState({ inputText: text });

        // Emit typing event
        if (this.socket && this.socket.connected && !this.state.isTyping) {
            this.setState({ isTyping: true });
            this.socket.emit('typing', {
                userId: this.state.userId,
                receiverId: this.state.astrologerData.id,
            });
        }

        // Clear previous timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Set timeout to stop typing
        this.typingTimeout = setTimeout(() => {
            if (this.socket && this.socket.connected) {
                this.socket.emit('stopped_typing', {
                    userId: this.state.userId,
                    receiverId: this.state.astrologerData.id,
                });
                this.setState({ isTyping: false });
            }
        }, 2000);
    };

    scrollToBottom = () => {
        if (this.flatListRef) {
            setTimeout(() => {
                this.flatListRef.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    renderMessageStatus = (status) => {
        switch (status) {
            case 'sent':
                return <Icon name="check" size={14} color="#8B7355" />;
            case 'delivered':
                return <Icon name="check-all" size={14} color="#8B7355" />;
            case 'read':
                return <Icon name="check-all" size={14} color="#C9A961" />;
            default:
                return <Icon name="clock-outline" size={14} color="#8B7355" />;
        }
    };

    renderMessage = ({ item, index }) => {
        const isMyMessage = item.senderId === this.state.userId;
        const prevMessage = index > 0 ? this.state.messages[index - 1] : null;
        const showAvatar = !prevMessage || prevMessage.senderId !== item.senderId;

        return (
            <View
                style={[
                    styles.messageContainer,
                    isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
                ]}
            >
                {!isMyMessage && showAvatar && (
                    <View style={styles.avatarContainer}>
                        {this.state.astrologerData.image ? (
                            <Image
                                source={{ uri: this.state.astrologerData.image }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {/* {this.state.astrologerData.name.charAt(0)} */}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {!isMyMessage && !showAvatar && <View style={styles.avatarSpacer} />}

                <View style={[
                    styles.messageBubble,
                    isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMyMessage ? styles.myMessageText : styles.theirMessageText,
                    ]}>
                        {item.text}
                    </Text>
                    <View style={styles.messageFooter}>
                        <Text style={[
                            styles.messageTime,
                            isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
                        ]}>
                            {this.formatTime(item.timestamp)}
                        </Text>
                        {isMyMessage && (
                            <View style={styles.messageStatus}>
                                {this.renderMessageStatus(item.status)}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    renderTypingIndicator = () => {
        if (!this.state.astrologerTyping) return null;

        return (
            <View style={styles.typingContainer}>
                <View style={styles.avatarContainer}>
                    {this.state.astrologerData.image ? (
                        <Image
                            source={{ uri: this.state.astrologerData.image }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {/* {this.state.astrologerData.name.charAt(0)} */}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.typingBubble}>
                    <View style={styles.typingDots}>
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                    </View>
                </View>
            </View>
        );
    };

    render() {
        const { astrologerData, isConnected } = this.state;

        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Icon name="arrow-left" size={24} color="#2C1810" />
                        </TouchableOpacity>

                        <View style={styles.headerInfo}>
                            <View style={styles.headerAvatarContainer}>
                                {this.state.astrologerData.image ? (
                                    <Image
                                        source={{ uri: this.state.astrologerData.image }}
                                        style={styles.headerAvatar}
                                    />
                                ) : (
                                    <View style={styles.headerAvatarPlaceholder}>
                                        <Text style={styles.headerAvatarText}>Astrologer Name</Text>
                                    </View>
                                )}
                                {this.state.astrologerData.status === 'online' && (
                                    <View style={styles.onlineIndicator} />
                                )}
                            </View>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.headerName}>{this.state.astrologerData.name}</Text>
                                <Text style={styles.headerStatus}>
                                    {this.state.isConnected
                                        ? this.state.astrologerData.status === 'online'
                                            ? 'Online'
                                            : 'Offline'
                                        : 'Connecting...'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.headerActions}>
                            {/* <TouchableOpacity style={styles.headerActionButton}>
                                <Icon name="phone" size={22} color="#C9A961" />
                            </TouchableOpacity> */}
                            <TouchableOpacity style={styles.headerActionButton}>
                                <Icon name="dots-vertical" size={22} color="#C9A961" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Connection Banner */}
                    {!this.state.isConnected && (
                        <View style={styles.connectionBanner}>
                            <ActivityIndicator size="small" color="#C9A961" />
                            <Text style={styles.connectionText}>Connecting to server...</Text>
                        </View>
                    )}

                    {/* Messages */}
                    <FlatList
                        ref={(ref) => (this.flatListRef = ref)}
                        data={this.state.messages}
                        renderItem={this.renderMessage}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messagesList}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={this.scrollToBottom}
                        ListFooterComponent={this.renderTypingIndicator}
                    />

                    {/* Input Section */}
                    <View style={styles.inputContainer}>
                        {/* <TouchableOpacity style={styles.attachButton}>
                            <Icon name="plus-circle" size={28} color="#C9A961" />
                        </TouchableOpacity> */}

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Type your message..."
                                placeholderTextColor="#8B7355"
                                value={this.state.inputText}
                                onChangeText={this.handleTyping}
                                multiline
                                maxLength={1000}
                            />
                            {/* <TouchableOpacity style={styles.emojiButton}>
                                <Icon name="emoticon-happy-outline" size={24} color="#8B7355" />
                            </TouchableOpacity> */}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                this.state.inputText.trim() === '' && styles.sendButtonDisabled,
                            ]}
                            onPress={this.handleSendMessage}
                            disabled={this.state.inputText.trim() === ''}
                        >
                            <Icon
                                name="send"
                                size={22}
                                color={this.state.inputText.trim() === '' ? '#8B7355' : '#FFFFFF'}
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF8F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E4DC',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    headerAvatarContainer: {
        position: 'relative',
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#C9A961',
    },
    headerAvatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#C9A961',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#C9A961',
    },
    headerAvatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    headerTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C1810',
    },
    headerStatus: {
        fontSize: 12,
        color: '#8B7355',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerActionButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    connectionText: {
        fontSize: 12,
        color: '#8B7355',
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 4,
        maxWidth: width * 0.75,
    },
    myMessageContainer: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    theirMessageContainer: {
        alignSelf: 'flex-start',
    },
    avatarContainer: {
        marginRight: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8E4DC',
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#C9A961',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    avatarSpacer: {
        width: 40,
    },
    messageBubble: {
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: '100%',
    },
    myMessageBubble: {
        backgroundColor: '#C9A961',
        borderBottomRightRadius: 4,
    },
    theirMessageBubble: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E4DC',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#FFFFFF',
    },
    theirMessageText: {
        color: '#2C1810',
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    messageTime: {
        fontSize: 10,
        letterSpacing: 0.3,
    },
    myMessageTime: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    theirMessageTime: {
        color: '#8B7355',
    },
    messageStatus: {
        marginLeft: 2,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    typingBubble: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E4DC',
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginLeft: 8,
    },
    typingDots: {
        flexDirection: 'row',
        gap: 4,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#C9A961',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#E8E4DC',
        gap: 8,
    },
    attachButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#FAF8F5',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8E4DC',
        paddingHorizontal: 14,
        paddingVertical: 8,
        maxHeight: 100,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#2C1810',
        maxHeight: 80,
        paddingTop: 8,
        paddingBottom: 8,
    },
    emojiButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#C9A961',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    sendButtonDisabled: {
        backgroundColor: '#F0EDE8',
    },
});