import React, { useEffect, useRef, useState } from 'react';
import './ChatPanel.css';
import ChatInterface from '../ChatInterface/ChatInterface';
import { useAuth } from '../../../contexts/AuthContext';

interface UploadedDocument {
    id: string;
    name: string;
    size: number;
    extractedText: string;
    textLength: number;
    chunksStored: number;
    processingTime: number;
    uploadedAt: string;
    filePath?: string;
}

interface ChatPanelProps {
    documents: UploadedDocument[];
    selectedDocument: string | null;
    onUpgrade?: () => void; // ← ADD THIS PROP
}

const ChatPanel: React.FC<ChatPanelProps> = ({
    documents,
    selectedDocument,
    onUpgrade // ← ADD THIS PROP
}) => {

    const [showDropdown, setShowDropdown] = useState(false);
    const { user, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Function to get user initials from username
    const getUserInitials = (username: string): string => {
        if (!username) return 'ME';

        const words = username.trim().split(' ');
        if (words.length === 1) {
            // For single name like "Naman" -> "NA" (first 2 letters)
            return words[0].substring(0, 2).toUpperCase();
        } else {
            // For multiple names like "Aman Gupt" -> "AG" (first letter of first and last word)
            return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
        }
    };

    // Handle click outside dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        // Add event listener when dropdown is open
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    // Handle logout with error handling
    const handleLogout = async () => {
        try {
            logout();
            setShowDropdown(false); // Close dropdown after logout
        } catch (error) {
            console.error('Logout error:', error);
            // You can add error handling here if needed
        }
    };

    return (
        <div className="chat-panel">
            <div className="chat-header">
                <div>
                    <div className="chat-title">AI Assistant</div>
                    <div className="chat-status">
                        <div className="status-dot"></div>
                        Online
                    </div>
                </div>

                {/* ✅ ADD HEADER RIGHT SECTION WITH UPGRADE BUTTON */}
                <div className="header-right">
                    {/* Upgrade button - LEFT of RA avatar */}
                    {user && user.messagesUsed >= user.messagesTotalLimit && user.plan === 'free' && (
                        <button
                            className="header-upgrade-btn"
                            onClick={onUpgrade}
                        >
                            Upgrade $2
                        </button>
                    )}

                    {/* User avatar - RIGHT side */}
                    <div className="user-avatar-container" ref={dropdownRef}>
                        <div
                            className="user-avatar"
                            onClick={toggleDropdown}
                            title={user?.username || 'User'}
                        >
                            {getUserInitials(user?.username || 'User')}
                        </div>

                        {showDropdown && (
                            <div className="user-dropdown">
                                <div className="user-info">
                                    <div className="user-name">{user?.username || 'User'}</div>
                                    <div className="user-email">{user?.email || ''}</div>
                                </div>
                                <hr className="dropdown-divider" />
                                <button
                                    className="logout-btn"
                                    onClick={handleLogout}
                                >
                                    <span className="logout-icon">
                                        <img
                                            src="/assets/icons/logout.png"
                                            alt="Logout"
                                            width="16"
                                            height="16"
                                        />
                                    </span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="chat-content">
                <ChatInterface documentCount={documents.length} selectedDocument={selectedDocument} onUpgrade={onUpgrade} />
            </div>
        </div>
    );
};

export default ChatPanel;