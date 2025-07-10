import React from 'react';
import FileUpload from '../../FileUpload'; // This uses your existing FileUpload component
import './MainContent.css';

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

interface MainContentProps {
    onUploadComplete: (document: UploadedDocument) => void;
    documentsCount: number;
}

const MainContent: React.FC<MainContentProps> = ({
    onUploadComplete,
    documentsCount
}) => {
    return (
        <div className="main-content">
            <div className="upload-area-container">
                <div className="upload-icon">↑</div>
                <div className="upload-title">Drop documents here</div>
                <div className="upload-subtitle">
                    or click to browse files
                </div>

                <FileUpload onUploadComplete={onUploadComplete} />

                {documentsCount > 0 && (
                    <div className="upload-stats">
                        <div className="stat-item">
                            <span className="stat-number">{documentsCount}</span>
                            <span className="stat-label">Documents</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">Ready</span>
                            <span className="stat-label">For AI</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainContent;