import React, { useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import ChatPanel from './ChatPanel/ChatPanel';
import ThreeBackground from '../ThreeBackground/ThreeBackground';
import './Dashboard.css';


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

const Dashboard: React.FC = () => {
    const [documents, setDocuments] = useState<UploadedDocument[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

    const handleUploadComplete = (document: UploadedDocument) => {
        setDocuments(prev => [...prev, document]);
    };

    const handleDocumentDelete = async (documentId: string, filePath: string) => {
        try {
            const response = await fetch('http://localhost:5000/api/delete-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId: documentId,
                    filePath: filePath
                }),
            });

            if (response.ok) {
                // Remove from UI state
                setDocuments(prev => prev.filter(doc => doc.id !== documentId));
                // Clear selection if deleted document was selected
                if (selectedDocument === documentId) {
                    setSelectedDocument(null);
                }
                console.log('✅ Document deleted successfully');
            } else {
                console.error('❌ Failed to delete document');
                alert('Failed to delete document. Please try again.');
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            alert('Error deleting document. Please try again.');
        }
    };


    const handleDocumentSelect = (documentId: string) => {
        setSelectedDocument(documentId);
    };

    return (
        <div className="dashboard">
            <ThreeBackground />

            <div className="dashboard-container">
                <Sidebar
                    documents={documents}
                    selectedDocument={selectedDocument}
                    onDocumentSelect={handleDocumentSelect}
                    onDocumentDelete={handleDocumentDelete}
                    onUploadComplete={handleUploadComplete}
                />

                <ChatPanel
                    documents={documents}
                    selectedDocument={selectedDocument}
                />
            </div>

            {/* Floating particles */}
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
        </div>
    );
};

export default Dashboard;