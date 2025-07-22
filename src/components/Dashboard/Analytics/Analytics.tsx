import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import './Analytics.css';
import { apiBaseUrl } from '../../../config/api';

interface AnalyticsData {
    totalDocuments: number;
    totalMessages: number;
    totalChats: number;
    documentsWithChats: number;
    lastDocumentUploaded: string | null;
    lastUploadDate: string | null;
    largestDocument: { name: string; size: number } | null;
    mostAccessedDocument: { name: string; messageCount: number; documentId: string } | null;
    documentMessagesData: { name: string; messages: number; documentId: string }[];
    messagesUsed: number;
    messagesTotalLimit: number;
    plan: string;
    averageMessagesPerDocument: number;
}

const Analytics: React.FC = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${apiBaseUrl}/api/analytics`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAnalytics(data);
                } else {
                    console.error('Failed to load analytics');
                }
            } catch (error) {
                console.error('Error loading analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="analytics-container">
                <div className="analytics-loading">Loading analytics...</div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="analytics-container">
                <div className="analytics-error">Failed to load analytics</div>
            </div>
        );
    }

    const formatFileSize = (bytes: number): string => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString();
    };
    const formatFileName = (filePath: string): string => {
        // Remove "uploads\" prefix and timestamp
        const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || filePath;
        // Remove timestamp prefix (numbers and hyphens at start)
        return fileName.replace(/^\d+-/, '');
    };

    const prepareChartData = () => {
        if (!analytics) return null;
        // Usage chart data
        const usageData = [
            { name: 'Used', value: analytics.messagesUsed, color: '#6366f1' },
            { name: 'Remaining', value: analytics.messagesTotalLimit - analytics.messagesUsed, color: '#374151' }
        ];

        // Mock document messages data (we'll make this real later)
        const documentData = analytics.documentMessagesData.map(doc => ({
            name: formatFileName(doc.name),
            messages: doc.messages,
            documentId: doc.documentId
        }));

        return { usageData, documentData };
    };

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h1>📊 Analytics Dashboard</h1>
                <p>Your DocuPrompt usage insights</p>
            </div>

            {/* Overview Cards */}
            <div className="analytics-cards">
                <div className="analytics-card">
                    <div className="card-icon">📁</div>
                    <div className="card-content">
                        <div className="card-number">{analytics.totalDocuments}</div>
                        <div className="card-label">Documents Uploaded</div>
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="card-icon">💬</div>
                    <div className="card-content">
                        <div className="card-number">{analytics.totalMessages}</div>
                        <div className="card-label">Total Messages</div>
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="card-icon">🔥</div>
                    <div className="card-content">
                        <div className="card-number">{analytics.documentsWithChats}</div>
                        <div className="card-label">Active Documents</div>
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="card-icon">💸</div>
                    <div className="card-content">
                        <div className="card-number">{analytics.plan}</div>
                        <div className="card-label">Current Plan</div>
                    </div>
                </div>
            </div>

            {/* Usage Status */}
            {/* Usage Status with Chart */}
            <div className="usage-section">
                <h2>💬 Message Usage</h2>
                <div className="usage-chart-container">
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={prepareChartData()?.usageData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {prepareChartData()?.usageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-center-text">
                            <div className="usage-percentage">
                                {Math.round((analytics.messagesUsed / analytics.messagesTotalLimit) * 100)}%
                            </div>
                            <div className="usage-label">Used</div>
                        </div>
                    </div>
                    <div className="usage-stats">
                        <div className="stat-item">
                            <span className="stat-number">{analytics.messagesUsed}</span>
                            <span className="stat-label">Messages Used</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{analytics.messagesTotalLimit - analytics.messagesUsed}</span>
                            <span className="stat-label">Remaining</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Details with Chart */}
            <div className="details-section">
                <h2>📁 Document Analytics</h2>

                {/* Bar Chart */}
                <div className="chart-section">
                    <h3>Messages per Document</h3>
                    <div className="bar-chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={prepareChartData()?.documentData}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    axisLine={{ stroke: '#374151' }}
                                />
                                <YAxis
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    axisLine={{ stroke: '#374151' }}
                                />
                                <Bar
                                    dataKey="messages"
                                    fill="#6366f1"
                                    radius={[4, 4, 0, 0]}
                                >
                                    <LabelList
                                        dataKey="messages"
                                        position="top"
                                        fill="#ffffff"
                                        fontSize={14}
                                        fontWeight={600}
                                    />
                                </Bar>

                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Document Stats Grid */}
                <div className="details-grid">
                    <div className="enhanced-card upload-card">
                        <div className="card-header">
                            <div className="card-icon">📤</div>
                            <div className="card-title">Last Upload</div>
                        </div>
                        <div className="card-content">
                            {analytics.lastDocumentUploaded ? (
                                <>
                                    <div className="card-main-text">{formatFileName(analytics.lastDocumentUploaded)}</div>
                                    <div className="card-sub-text">{analytics.lastUploadDate ? formatDate(analytics.lastUploadDate) : 'Unknown'}</div>
                                </>
                            ) : (
                                <div className="card-main-text">No documents yet</div>
                            )}
                        </div>
                    </div>

                    <div className="enhanced-card size-card">
                        <div className="card-header">
                            <div className="card-icon">📏</div>
                            <div className="card-title">Largest Document</div>
                        </div>
                        <div className="card-content">
                            {analytics.largestDocument ? (
                                <>
                                    <div className="card-main-text">{formatFileName(analytics.largestDocument.name)}</div>
                                    <div className="card-sub-text">{formatFileSize(analytics.largestDocument.size)}</div>
                                </>
                            ) : (
                                <div className="card-main-text">No documents yet</div>
                            )}
                        </div>
                    </div>

                    <div className="enhanced-card average-card">
                        <div className="card-header">
                            <div className="card-icon">📊</div>
                            <div className="card-title">Avg Messages/Document</div>
                        </div>
                        <div className="card-content">
                            <div className="card-number">{analytics.averageMessagesPerDocument.toFixed(1)}</div>
                            <div className="card-sub-text">messages per doc</div>
                        </div>
                    </div>

                    <div className="enhanced-card popular-card">
                        <div className="card-header">
                            <div className="card-icon">🔥</div>
                            <div className="card-title">Most Popular</div>
                        </div>
                        <div className="card-content">
                            {analytics.mostAccessedDocument ? (
                                <>
                                    <div className="card-main-text">{formatFileName(analytics.mostAccessedDocument.name)}</div>
                                    <div className="card-sub-text">{analytics.mostAccessedDocument.messageCount} messages</div>
                                </>
                            ) : (
                                <div className="card-main-text">No chat history yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;