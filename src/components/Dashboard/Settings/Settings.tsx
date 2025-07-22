import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import './Settings.css';
import { apiBaseUrl } from '../../../config/api';

const Settings: React.FC = () => {
    const { user, logout, updateUser, updatePreferences } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'preferences' | 'security'>('profile');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        username: user?.username || '',
        email: user?.email || ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
    const [profileErrors, setProfileErrors] = useState<{ [key: string]: string }>({});


    // Add these after your existing password state variables:
    const [preferences, setPreferences] = useState({
        darkMode: true,
        autoSave: true,
        notifications: false
    });
    const [preferencesLoading, setPreferencesLoading] = useState(false);

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${apiBaseUrl}/api/user/preferences`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setPreferences(result.preferences);
                    }
                }
            } catch (error) {
                console.error('❌ Error loading preferences:', error);
            }
        };

        loadPreferences();
    }, []);


    const handleLogout = () => {
        logout();
    };

    const usagePercentage = user ? Math.round((user.messagesUsed / user.messagesTotalLimit) * 100) : 0;


    const handleEditProfile = () => {
        setIsEditingProfile(true);
        setProfileForm({
            username: user?.username || '',
            email: user?.email || ''
        });
        setProfileErrors({});
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        setProfileForm({
            username: user?.username || '',
            email: user?.email || ''
        });
        setProfileErrors({});
    };

    const handleProfileInputChange = (field: string, value: string) => {
        setProfileForm(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (profileErrors[field]) {
            setProfileErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSaveProfile = async () => {
        // Reset errors
        setProfileErrors({});

        // Validation
        const errors: { [key: string]: string } = {};

        if (!profileForm.username.trim()) {
            errors.username = 'Username is required';
        } else if (profileForm.username.length < 2) {
            errors.username = 'Username must be at least 2 characters';
        }

        if (!profileForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (Object.keys(errors).length > 0) {
            setProfileErrors(errors);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiBaseUrl}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: profileForm.username.trim(),
                    email: profileForm.email.trim()
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('✅ Profile updated successfully:', result.user);

                updateUser({
                    username: result.user.username,
                    email: result.user.email
                });

                setIsEditingProfile(false);

                alert('✅ Profile updated successfully!');


            } else {
                if (result.message.includes('email')) {
                    setProfileErrors({ email: result.message });
                } else {
                    alert('❌ Failed to update profile: ' + result.message);
                }
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            alert('❌ Network error. Please check your connection and try again.');
        }
    };

    const handleChangePassword = () => {
        setIsChangingPassword(true);
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordErrors({});
    };

    const handleCancelPasswordChange = () => {
        setIsChangingPassword(false);
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordErrors({});
    };

    const handlePasswordInputChange = (field: string, value: string) => {
        setPasswordForm(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (passwordErrors[field]) {
            setPasswordErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSavePassword = async () => {
        // Reset errors
        setPasswordErrors({});

        // Validation
        const errors: { [key: string]: string } = {};

        if (!passwordForm.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        if (!passwordForm.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }

        if (!passwordForm.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (passwordForm.currentPassword === passwordForm.newPassword) {
            errors.newPassword = 'New password must be different from current password';
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        // API call to change password
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiBaseUrl}/api/user/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('✅ Password changed successfully');
                setIsChangingPassword(false);
                alert('✅ Password changed successfully!');
            } else {
                if (result.message.includes('current password')) {
                    setPasswordErrors({ currentPassword: result.message });
                } else {
                    alert('❌ Failed to change password: ' + result.message);
                }
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            alert('❌ Network error. Please try again.');
        }
    };

    const handlePreferenceToggle = async (preference: string) => {
        const newValue = !preferences[preference as keyof typeof preferences];

        // Update local state immediately for responsive UI
        setPreferences(prev => ({
            ...prev,
            [preference]: newValue
        }));

        // Update user context immediately
        updatePreferences({
            [preference]: newValue
        });

        // Save to backend
        try {
            setPreferencesLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiBaseUrl}/api/user/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    [preference]: newValue
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                // Revert on error
                setPreferences(prev => ({
                    ...prev,
                    [preference]: !newValue
                }));
                updatePreferences({
                    [preference]: !newValue
                });
                alert('❌ Failed to save preference: ' + result.message);
            }
        } catch (error) {
            // Revert on error
            setPreferences(prev => ({
                ...prev,
                [preference]: !newValue
            }));
            updatePreferences({
                [preference]: !newValue
            });
            console.error('❌ Error saving preference:', error);
            alert('❌ Network error. Please try again.');
        } finally {
            setPreferencesLoading(false);
        }
    };
    return (
        <div className="settings-container">
            {/* Header Section */}
            <div className="settings-header">
                <div className="header-content">
                    <h1>⚙️ Account Settings</h1>
                    <p>Manage your profile, preferences, and account security</p>
                </div>
                <div className="header-stats">
                    <div className="stat-card">
                        <div className="stat-icon">💬</div>
                        <div className="stat-info">
                            <div className="stat-number">{user?.messagesUsed || 0}</div>
                            <div className="stat-label">Messages Used</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <div className="stat-number">{usagePercentage}%</div>
                            <div className="stat-label">Usage</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Tab Navigation */}
            <div className="modern-tabs">
                {[
                    { id: 'profile', icon: '👤', label: 'Profile' },
                    { id: 'billing', icon: '💎', label: 'Billing' },
                    { id: 'preferences', icon: '🎨', label: 'Preferences' },
                    { id: 'security', icon: '🔐', label: 'Security' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`modern-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id as any)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Enhanced Content Sections */}
            <div className="settings-content">
                {activeTab === 'profile' && (
                    <div className="content-grid">
                        {/* Profile Card */}
                        <div className="enhanced-settings-card profile-overview">
                            <div className="card-header">
                                <h2>👤 Profile Overview</h2>
                            </div>
                            <div className="profile-display">
                                <div className="profile-avatar-large">
                                    <div className="avatar-ring">
                                        <div className="avatar-inner">
                                            {(profileForm.username || user?.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="plan-indicator">
                                        {user?.plan === 'pro' ? '💎' : '🆓'}
                                    </div>
                                </div>
                                <div className="profile-details">
                                    {!isEditingProfile ? (
                                        // VIEW MODE
                                        <>
                                            <h3>{user?.username || 'Unknown User'}</h3>
                                            <p>{user?.email || 'No email provided'}</p>
                                            <div className={`plan-badge-modern ${user?.plan || 'free'}`}>
                                                {user?.plan === 'pro' ? '🔥 Pro Member' : '🆓 Free Member'}
                                            </div>
                                            <button className="action-btn secondary" onClick={handleEditProfile}>
                                                ✏️ Edit Profile
                                            </button>
                                        </>
                                    ) : (
                                        // EDIT MODE
                                        <>
                                            <div className="edit-form">
                                                <div className="form-group">
                                                    <label>Username</label>
                                                    <input
                                                        type="text"
                                                        value={profileForm.username}
                                                        onChange={(e) => handleProfileInputChange('username', e.target.value)}
                                                        className={`form-input ${profileErrors.username ? 'error' : ''}`}
                                                    />
                                                    {profileErrors.username && <span className="error-text">{profileErrors.username}</span>}
                                                </div>
                                                <div className="form-group">
                                                    <label>Email</label>
                                                    <input
                                                        type="email"
                                                        value={profileForm.email}
                                                        onChange={(e) => handleProfileInputChange('email', e.target.value)}
                                                        className={`form-input ${profileErrors.email ? 'error' : ''}`}
                                                    />
                                                    {profileErrors.email && <span className="error-text">{profileErrors.email}</span>}
                                                </div>
                                                <div className="form-actions">
                                                    <button className="action-btn secondary" onClick={handleCancelEdit}>
                                                        Cancel
                                                    </button>
                                                    <button className="action-btn primary" onClick={handleSaveProfile}>
                                                        💾 Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="enhanced-settings-card account-details">
                            <div className="card-header">
                                <h2>📋 Account Details</h2>
                            </div>
                            <div className="detail-rows">
                                <div className="detail-row">
                                    <div className="detail-label">
                                        <span className="detail-icon">👤</span>
                                        Username
                                    </div>
                                    <div className="detail-value">{user?.username || 'Not set'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">
                                        <span className="detail-icon">📧</span>
                                        Email
                                    </div>
                                    <div className="detail-value">{user?.email || 'Not set'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">
                                        <span className="detail-icon">📅</span>
                                        Member Since
                                    </div>
                                    <div className="detail-value">{new Date().toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Usage Stats */}
                        <div className="enhanced-settings-card usage-stats">
                            <div className="card-header">
                                <h2>📊 Usage Statistics</h2>
                            </div>
                            <div className="usage-visual">
                                <div className="usage-circle">
                                    <div className="usage-percentage">{usagePercentage}%</div>
                                    <div className="usage-label">Used</div>
                                </div>
                                <div className="usage-details">
                                    <div className="usage-item">
                                        <span className="usage-number">{user?.messagesUsed || 0}</span>
                                        <span className="usage-text">Messages Used</span>
                                    </div>
                                    <div className="usage-item">
                                        <span className="usage-number">{(user?.messagesTotalLimit || 10) - (user?.messagesUsed || 0)}</span>
                                        <span className="usage-text">Remaining</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="content-grid">
                        {/* Current Plan */}
                        <div className="enhanced-settings-card plan-overview">
                            <div className="card-header">
                                <h2>💎 Current Plan</h2>
                            </div>
                            <div className="plan-display">
                                <div className="plan-visual">
                                    <div className={`plan-icon ${user?.plan || 'free'}`}>
                                        {user?.plan === 'pro' ? '💎' : '🆓'}
                                    </div>
                                    <div className="plan-info">
                                        <h3>{user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</h3>
                                        <p>{user?.plan === 'pro' ? '$2/month • Premium features' : 'Limited features'}</p>
                                    </div>
                                </div>
                                <div className="plan-features">
                                    <div className="feature-item">
                                        <span className="feature-icon">💬</span>
                                        <span>{user?.messagesTotalLimit || 10} Messages per month</span>
                                    </div>
                                    <div className="feature-item">
                                        <span className="feature-icon">📁</span>
                                        <span>Unlimited Documents</span>
                                    </div>
                                    <div className="feature-item">
                                        <span className="feature-icon">☁️</span>
                                        <span>100MB file limit</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Usage Chart */}
                        <div className="enhanced-settings-card usage-chart">
                            <div className="card-header">
                                <h2>📈 Total Usage</h2>
                            </div>
                            <div className="chart-container">
                                <div className="usage-bar">
                                    <div
                                        className="usage-fill"
                                        style={{ width: `${usagePercentage}%` }}
                                    ></div>
                                </div>
                                <div className="chart-stats">
                                    <div className="chart-stat">
                                        <span className="stat-value">{user?.messagesUsed || 0}</span>
                                        <span className="stat-name">Used</span>
                                    </div>
                                    <div className="chart-stat">
                                        <span className="stat-value">{(user?.messagesTotalLimit || 10) - (user?.messagesUsed || 0)}</span>
                                        <span className="stat-name">Left</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upgrade Section */}
                        {user?.plan === 'free' && (
                            <div className="enhanced-settings-card upgrade-card">
                                <div className="card-header">
                                    <h2>🚀 Upgrade to Pro</h2>
                                </div>
                                <div className="upgrade-content">
                                    <div className="upgrade-benefits">
                                        <div className="benefit-item">
                                            <span className="benefit-icon">⚡</span>
                                            <span>20 Messages per month</span>
                                        </div>
                                        <div className="benefit-item">
                                            <span className="benefit-icon">🔥</span>
                                            <span>Priority support</span>
                                        </div>
                                        <div className="benefit-item">
                                            <span className="benefit-icon">✨</span>
                                            <span>Advanced features</span>
                                        </div>
                                    </div>
                                    <button className="upgrade-btn">
                                        Upgrade Now - $2/month
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="content-grid">
                        {/* Theme Settings */}
                        <div className="enhanced-settings-card theme-settings">
                            <div className="card-header">
                                <h2>🎨 Appearance</h2>
                            </div>
                            <div className="preference-items">
                                <div className="pref-item">
                                    <div className="pref-info">
                                        <span className="pref-icon">🌙</span>
                                        <div>
                                            <h4>Dark Mode</h4>
                                            <p>Use dark theme {preferences.darkMode ? '(currently active)' : '(currently disabled)'}</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`toggle-switch ${preferences.darkMode ? 'active' : ''} ${preferencesLoading ? 'loading' : ''}`}
                                        onClick={() => !preferencesLoading && handlePreferenceToggle('darkMode')}
                                    >
                                        <div className="toggle-slider"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Settings */}
                        <div className="enhanced-settings-card chat-settings">
                            <div className="card-header">
                                <h2>💬 Chat Preferences</h2>
                            </div>
                            <div className="preference-items">
                                <div className="pref-item">
                                    <div className="pref-info">
                                        <span className="pref-icon">💾</span>
                                        <div>
                                            <h4>Auto-save Chat History</h4>
                                            <p>Automatically save your conversations</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`toggle-switch ${preferences.autoSave ? 'active' : ''} ${preferencesLoading ? 'loading' : ''}`}
                                        onClick={() => !preferencesLoading && handlePreferenceToggle('autoSave')}
                                    >
                                        <div className="toggle-slider"></div>
                                    </div>
                                </div>
                                <div className="pref-item">
                                    <div className="pref-info">
                                        <span className="pref-icon">🔔</span>
                                        <div>
                                            <h4>Response Notifications</h4>
                                            <p>Get notified when AI responds</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`toggle-switch ${preferences.notifications ? 'active' : ''} ${preferencesLoading ? 'loading' : ''}`}
                                        onClick={() => !preferencesLoading && handlePreferenceToggle('notifications')}
                                    >
                                        <div className="toggle-slider"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="content-grid">
                        {/* Security Options */}
                        <div className="enhanced-settings-card security-options">
                            <div className="card-header">
                                <h2>🔐 Security</h2>
                            </div>
                            <div className="security-items">
                                <div className="security-item">
                                    <div className="security-info">
                                        <span className="security-icon">🔑</span>
                                        <div>
                                            <h4>Password</h4>
                                            <p>Last changed: Never</p>
                                        </div>
                                    </div>
                                    {!isChangingPassword ? (
                                        <button className="action-btn secondary" onClick={handleChangePassword}>
                                            Change Password
                                        </button>
                                    ) : (
                                        <button className="action-btn secondary" onClick={handleCancelPasswordChange}>
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                {/* Password Change Form */}
                                {isChangingPassword && (
                                    <div className="password-change-form">
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                                                className={`form-input ${passwordErrors.currentPassword ? 'error' : ''}`}
                                                placeholder="Enter your current password"
                                            />
                                            {passwordErrors.currentPassword && <span className="error-text">{passwordErrors.currentPassword}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                                                className={`form-input ${passwordErrors.newPassword ? 'error' : ''}`}
                                                placeholder="Enter new password (min 6 characters)"
                                            />
                                            {passwordErrors.newPassword && <span className="error-text">{passwordErrors.newPassword}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                                                className={`form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                                                placeholder="Confirm your new password"
                                            />
                                            {passwordErrors.confirmPassword && <span className="error-text">{passwordErrors.confirmPassword}</span>}
                                        </div>

                                        <div className="form-actions">
                                            <button className="action-btn secondary" onClick={handleCancelPasswordChange}>
                                                Cancel
                                            </button>
                                            <button className="action-btn primary" onClick={handleSavePassword}>
                                                🔐 Change Password
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="security-item">
                                    <div className="security-info">
                                        <span className="security-icon">📱</span>
                                        <div>
                                            <h4>Active Sessions</h4>
                                            <p>Signed in on this device</p>
                                        </div>
                                    </div>
                                    <button className="action-btn secondary" onClick={handleLogout}>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="enhanced-settings-card danger-zone">
                            <div className="card-header danger">
                                <h2>⚠️ Delete Account</h2>
                            </div>
                            <div className="danger-content">
                                <div className="danger-info">
                                    <h4>Warning</h4>
                                    <p>Permanently delete your account and all data.</p>
                                </div>
                                <button className="action-btn danger" onClick={() => setShowDeleteConfirm(true)}>
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="modal-overlay">
                        <div className="confirmation-modal">
                            <div className="modal-header">
                                <h3>⚠️ Delete Account</h3>
                            </div>
                            <div className="modal-content">
                                <p>Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.</p>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="action-btn secondary"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button className="action-btn danger">
                                    Yes, Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;