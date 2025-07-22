import { useAuth } from '../../../contexts/AuthContext';
import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';
import { apiBaseUrl } from '../../../config/api';

interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string | any;
    timestamp: string;
    sources?: string[];
    cached?: boolean;
    responseTime?: number;
}

interface ChatInterfaceProps {
    documentCount: number;
    selectedDocument: string | null;
    onUpgrade?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documentCount, selectedDocument, onUpgrade }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { user, updateUser } = useAuth();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);

    // Admin testing functions
    const setMessageCount = (count: number) => {
        updateUser({ messagesUsed: count });
    };

    const setPlan = (plan: 'free' | 'pro') => {
        const limit = plan === 'free' ? 10 : 20;
        updateUser({ plan, messagesTotalLimit: limit });
    };

    const resetAccount = () => {
        updateUser({
            messagesUsed: 0,
            plan: 'free',
            messagesTotalLimit: 10
        });
    };

    // ADD THIS NEW useEffect:
    useEffect(() => {
        const loadChatHistory = async () => {
            if (!selectedDocument) {
                console.log('❌ No selectedDocument, clearing messages');
                setMessages([]); // Clear messages when no document selected
                return;
            }

            try {
                console.log(`💬 Loading chat for document: ${selectedDocument}`);
                const token = localStorage.getItem('token');
                const response = await fetch(`${apiBaseUrl}/api/chat/${selectedDocument}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log(`💬 Chat API response:`, result);
                    setMessages(result.messages);
                    console.log(`💬 Loaded ${result.messages.length} messages for document`);
                } else {
                    console.error('❌ Chat API failed:', response.status); // ← ADD THIS
                }
            } catch (error) {
                console.error('❌ Error loading chat history:', error);
            }
        };

        loadChatHistory();
    }, [selectedDocument]);


    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (user && user.messagesUsed >= user.messagesTotalLimit) {
            setShowUpgradeModal(true);
        }
    }, [user]);



    useEffect(() => {
        if (documentCount === 0 && messages.length > 0) {
            setMessages([]);
        }
    }, [documentCount, messages.length]);

    // ADD THIS FUNCTION:
    const saveMessageToDB = async (message: ChatMessage) => {
        if (!selectedDocument) {
            console.log('❌ Cannot save: no selectedDocument');
            return; // ← MOVE return AFTER the log
        }

        try {
            console.log(`💾 Saving message to DB for document: ${selectedDocument}`);

            const token = localStorage.getItem('token');
            await fetch(`${apiBaseUrl}/api/save-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    documentId: selectedDocument,
                    message: message
                })
            }).then(res => {
                if (res.ok) {
                    console.log('💾 Message saved to database successfully');
                } else {
                    console.error('❌ Save failed:', res.status);
                }
            });
        } catch (error) {
            console.error('❌ Error saving message:', error);
        }
    };


    const sendQuestion = async () => {
        console.log('🔍 selectedDocument at send time:', selectedDocument);
        console.log('🔍 DEBUG - User plan:', user?.plan, 'Messages:', user?.messagesUsed, '/', user?.messagesTotalLimit);
        if (!inputValue.trim() || isLoading || documentCount === 0) return;
        const token = localStorage.getItem('token');
        console.log('🔍 Token from localStorage:', token);
        console.log('🔍 User from context:', user);

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        saveMessageToDB(userMessage);
        setInputValue('');
        setIsLoading(true);

        try {
            console.log('🔍 Sending request with token:', token);
            const response = await fetch(`${apiBaseUrl}/api/ask-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    question: userMessage.content,
                    documentId: selectedDocument,
                    conversationHistory: messages.slice(-6)
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const result = await response.json();
            console.log('🔍 Full API response:', result);

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: result.answer || 'I could not find an answer to your question.',
                timestamp: new Date().toISOString(),
                sources: result.sources,
                cached: result.cached,
                responseTime: result.response_time_ms
            };

            setMessages(prev => [...prev, assistantMessage]);
            saveMessageToDB(assistantMessage);

            // Update user's message count in frontend
            if (result.messagesUsed !== undefined && result.messagesTotalLimit !== undefined) {
                updateUser({
                    messagesUsed: result.messagesUsed,
                    messagesTotalLimit: result.messagesTotalLimit
                });
            }

        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: 'Sorry, I encountered an error while processing your question. Please try again.',
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, errorMessage]);
            console.error('Chat error:', error);
        } finally {
            setIsLoading(false);
        }

        if (user && user.messagesUsed >= user.messagesTotalLimit) {
            console.info('🔍 LIMIT REACHED - Plan:', user.plan, 'Should show:', user.plan === 'free' ? 'Upgrade' : 'Daily Limit');
            if (user.plan === 'free') {
                setShowUpgradeModal(true);
            } else if (user.plan === 'pro') {
                setShowDailyLimitModal(true);
            }
            setIsLoading(false);
            return;
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendQuestion();
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const autoResize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    };



    useEffect(() => {
        autoResize();
    }, [inputValue]);

    if (documentCount === 0) {
        return (
            <div className="chat-interface-container">
                <div className="chat-welcome-state">
                    <div className="welcome-content">
                        <div className="welcome-icon">🤖</div>
                        <div className="welcome-title">DocAgent.AI</div>
                        <div className="welcome-subtitle">Upload documents and ask questions about them</div>
                        <div className="welcome-features">
                            <div className="feature-item">📄 PDF & Image Support</div>
                            <div className="feature-item">🧠 AI-Powered Analysis</div>
                            <div className="feature-item">💬 Natural Conversations</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-interface-container">
            <div className="chat-messages-container">
                {messages.length === 0 ? (
                    <div className="empty-chat-state">
                        <div className="empty-chat-icon">💬</div>
                        <div className="empty-chat-title">Ask any question about your documents!</div>
                        <div className="empty-chat-examples">
                            Try: "What is this document about?" or "Summarize the key points"
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (

                        <div key={message.id} className={`message-wrapper ${message.type}`}>
                            <div className={`message-bubble ${message.type}`}>
                                <div>
                                    {typeof message.content === 'string'
                                        ? message.content
                                        : message.content?.answer || message.content?.result || 'No response available'
                                    }
                                </div>

                                <div className="message-metadata">
                                    <span className="message-time">{formatTime(message.timestamp)}</span>
                                    {message.cached && (
                                        <span className="message-cached">📦 Cached</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="typing-indicator-wrapper">
                        <div className="typing-indicator">
                            <div className="typing-dots">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                            <span className="typing-text">Thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-section">


                {/* Admin Testing Panel - Remove for production */}
                <div className="admin-panel">
                    <button
                        className="admin-toggle"
                        onClick={() => setShowAdminPanel(!showAdminPanel)}
                    >
                        🔧 Admin Controls
                    </button>

                    {showAdminPanel && (
                        <div className="admin-controls">
                            <h4>Testing Controls:</h4>
                            <div className="admin-buttons">
                                <button onClick={() => setMessageCount(9)}>Set 9/10 Messages</button>
                                <button onClick={() => setMessageCount(10)}>Set 10/10 (Limit)</button>
                                <button onClick={() => setPlan('pro')}>Make Pro User</button>
                                <button onClick={() => resetAccount()}>Reset to Free</button>
                            </div>
                        </div>
                    )}
                </div>



                <div className="chat-input-wrapper">

                    {/* Usage Display */}
                    {user && (
                        <div className="usage-display">
                            <span className="usage-text">
                                Messages: {user.messagesUsed}/{user.messagesTotalLimit} used
                            </span>
                            {user.messagesUsed >= user.messagesTotalLimit && (
                                <span className="usage-warning">
                                    ⚠️ Limit reached
                                </span>
                            )}
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        className="chat-input-field"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            (user && user.messagesUsed >= user.messagesTotalLimit)
                                ? "Message limit reached - Upgrade to continue..."
                                : "Ask a question about your documents..."}
                        disabled={isLoading}
                        rows={1}
                    />
                    <button
                        className="chat-send-button"
                        onClick={sendQuestion}
                        disabled={!inputValue.trim() || isLoading}
                    >
                        ➤
                    </button>
                </div>

                <div className="chat-input-hint">
                    Press Enter to send • Searching {documentCount} document{documentCount !== 1 ? 's' : ''}
                </div>
            </div>
            {/* ✅ ADD THIS MODAL */}
            {showUpgradeModal && (
                <div className="upgrade-modal-overlay">
                    <div className="upgrade-modal">
                        <div className="modal-header">
                            <h3>🚀 Upgrade to Continue</h3>
                            <button
                                className="modal-close-x"
                                onClick={() => setShowUpgradeModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <p>You've used all <strong>{user?.messagesTotalLimit}</strong> free messages!</p>
                            <p>Upgrade to Pro to get <strong>10 more messages</strong> and continue chatting with your documents.</p>
                        </div>
                        <div className="modal-buttons">
                            <button
                                onClick={() => {
                                    console.log('🔍 Modal upgrade button clicked');
                                    if (onUpgrade) {
                                        onUpgrade();
                                    } else {
                                        alert('Please use the header button to upgrade.');
                                    }
                                }}
                                className="upgrade-btn-modal"
                            >
                                Upgrade for $2 - Get 10 More Messages
                            </button>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="close-btn-modal"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* NEW MODAL */}
            {showDailyLimitModal && (
                <div className="upgrade-modal-overlay">
                    <div className="upgrade-modal">
                        <div className="modal-header">
                            <h3>📊 Daily Limit Reached</h3>
                            <button
                                className="modal-close-x"
                                onClick={() => setShowDailyLimitModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <p>You've used all <strong>20 Pro messages</strong> today!</p>
                            <p>Your messages will reset tomorrow.</p>
                        </div>
                        <div className="modal-buttons">
                            <button
                                onClick={() => setShowDailyLimitModal(false)}
                                className="upgrade-btn-modal"
                            >
                                Got it
                            </button>
                            <button
                                onClick={() => setShowDailyLimitModal(false)}
                                className="close-btn-modal"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ChatInterface;