import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: string;
    sources?: string[];
    cached?: boolean;
    responseTime?: number;
}

interface ChatInterfaceProps {
    documentCount: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documentCount }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    useEffect(() => {
        if (documentCount === 0 && messages.length > 0) {
            setMessages([]);
        }
    }, [documentCount, messages.length]);
    const sendQuestion = async () => {
        if (!inputValue.trim() || isLoading || documentCount === 0) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/ask-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userMessage.content,
                    documentId: null, // Search all documents
                    conversationHistory: messages.slice(-6)
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const result = await response.json();

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
                <div className="empty-chat-state">
                    <div className="empty-chat-icon">💬</div>
                    <div className="empty-chat-title">Upload a document first</div>
                    <div className="empty-chat-subtitle">I'll be ready to answer questions once you upload a document!</div>
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
                                <div>{message.content}</div>

                                <div className="message-metadata">
                                    <span className="message-time">{formatTime(message.timestamp)}</span>
                                    {message.cached && (
                                        <span className="message-cached">📦 Cached</span>
                                    )}
                                    {message.responseTime && (
                                        <span className="message-timing">{message.responseTime}ms</span>
                                    )}
                                </div>

                                {message.sources && message.sources.length > 0 && (
                                    <div className="message-sources">
                                        📄 Found in {message.sources.length} text chunk{message.sources.length > 1 ? 's' : ''}
                                    </div>
                                )}
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
                <div className="chat-input-wrapper">
                    <textarea
                        ref={textareaRef}
                        className="chat-input-field"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question about your documents..."
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
        </div>
    );
};

export default ChatInterface;