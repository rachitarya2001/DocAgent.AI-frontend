import React from 'react';
import './Sidebar.css';

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

interface SidebarProps {
    documents: UploadedDocument[];
    selectedDocument: string | null;
    onDocumentSelect: (documentId: string) => void;
    onDocumentDelete: (documentId: string, filePath: string) => void; // ADD THIS
}

const Sidebar: React.FC<SidebarProps> = ({
    documents,
    selectedDocument,
    onDocumentSelect,
    onDocumentDelete // ADD THIS
}) => {
    const formatFileSize = (bytes: number): string => {
        return (bytes / 1024 / 1024).toFixed(2);
    };

    const getFileIcon = (fileName: string): string => {
        const extension = fileName.toLowerCase().split('.').pop();
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return '🖼️';
            case 'doc':
            case 'docx':
                return '📝';
            default:
                return '📁';
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, doc: UploadedDocument) => {
        e.stopPropagation(); // Prevent document selection when clicking delete
        if (window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
            onDocumentDelete(doc.id, doc.filePath || '');
        }
    };

    return (
        <div className="sidebar">
            <div className="logo">
                <div className="logo-icon">DP</div>
                <div>
                    <div className="logo-text">DocAgent.AI</div>
                    <div className="logo-subtitle">Intelligence Platform</div>
                </div>
            </div>

            <div className="nav-section">
                <div className="nav-item active">
                    <div className="nav-icon">📁</div>
                    Documents
                </div>
                <div className="nav-item">
                    <div className="nav-icon">📊</div>
                    Analytics
                </div>
                <div className="nav-item">
                    <div className="nav-icon">⚙️</div>
                    Settings
                </div>
            </div>

            <div className="documents-list">
                <div className="documents-header">
                    Recent Documents ({documents.length})
                </div>

                {documents.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <p>No documents uploaded yet</p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <div
                            key={doc.id}
                            className={`document-item ${selectedDocument === doc.id ? 'selected' : ''}`}
                            onClick={() => onDocumentSelect(doc.id)}
                        >
                            <div className="document-icon">
                                {getFileIcon(doc.name)}
                            </div>
                            <div className="document-info">
                                <h4>{doc.name}</h4>
                                <div className="document-meta">
                                    {formatFileSize(doc.size)} MB • {doc.chunksStored} chunks
                                </div>
                            </div>
                            {/* ADD DELETE BUTTON */}
                            <button
                                className="document-delete-btn"
                                onClick={(e) => handleDeleteClick(e, doc)}
                                title="Delete document"
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sidebar;