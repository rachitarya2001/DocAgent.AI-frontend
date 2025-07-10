import React from 'react';
import './ChatPanel.css';
import ChatInterface from '../ChatInterface';

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
}

const ChatPanel: React.FC<ChatPanelProps> = ({ documents, selectedDocument }) => {
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
                <div className="chat-header-icon">💬</div>
            </div>

            <div className="chat-content">
                <ChatInterface documentCount={documents.length} />
            </div>
        </div>
    );
};

export default ChatPanel;