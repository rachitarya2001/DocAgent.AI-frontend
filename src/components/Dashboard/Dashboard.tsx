import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar/Sidebar';
import ChatPanel from './ChatPanel/ChatPanel';
import ThreeBackground from '../ThreeBackground/ThreeBackground';
import './Dashboard.css';
import Analytics from './Analytics/Analytics';
import Settings from './Settings/Settings';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../../config/api';
import toast from 'react-hot-toast';

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
    const location = useLocation();
    const navigate = useNavigate();

    const activeView = location.pathname === '/analytics' ? 'analytics'
        : location.pathname === '/settings' ? 'settings'
            : 'documents';

    useEffect(() => {
        const loadDocumentsFromAPI = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                console.log('Loading documents from API...');
                const response = await fetch(`${apiBaseUrl}/api/my-documents`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    setDocuments(result.documents);

                    // ✅ ADD THIS: Auto-select first document if none selected
                    if (result.documents.length > 0 && !selectedDocument) {
                        setSelectedDocument(result.documents[0].id);
                        console.log(`Auto-selected first document: ${result.documents[0].id}`);
                    }

                    console.log(`Loaded ${result.documents.length} documents from API`);
                } else {
                    console.error('Failed to load documents');
                }
            } catch (error) {
                console.error('Error loading documents:', error);
            }
        };

        loadDocumentsFromAPI();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUploadComplete = (document: UploadedDocument) => {
        setDocuments(prev => [...prev, document]);

        setSelectedDocument(document.id);
        console.log(`Auto-selected newly uploaded document: ${document.id}`);
    };

    const handleDocumentDelete = async (documentId: string, filePath: string) => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/delete-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
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
                toast.success('🗑️ Document deleted successfully');
                console.log('Document deleted successfully');
            } else {
                console.error('Failed to delete document');
                toast.error('Failed to delete document. Please try again.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Error deleting document. Please try again.');
        }
    };

    const handleUpgrade = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiBaseUrl}/api/create-payment-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (result.success) {
                window.location.href = result.checkoutUrl;
            } else {
                alert('Error creating checkout session: ' + result.error);
            }
        } catch (error) {
            console.error('Upgrade error:', error);
            toast.error('Error starting upgrade process');
        }
    };


    const handleDocumentSelect = (documentId: string) => {
        setSelectedDocument(documentId);
    };

    const handleViewChange = (view: string) => {
        if (view === 'documents') {
            navigate('/');
        } else {
            navigate(`/${view}`);
        }
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
                    activeView={activeView}
                    onViewChange={handleViewChange}
                />

                {activeView === 'documents' ? (
                    <ChatPanel
                        documents={documents}
                        selectedDocument={selectedDocument}
                        onUpgrade={handleUpgrade}
                    />
                ) : activeView === 'analytics' ? (
                    <Analytics />
                ) : activeView === 'settings' ? (
                    <Settings />

                ) : (
                    <div style={{ padding: '24px', color: 'white' }}>
                        Settings coming soon...
                    </div>
                )}
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