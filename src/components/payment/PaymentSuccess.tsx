import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PaymentSuccess.css';
import { apiBaseUrl } from '../../config/api';

const PaymentSuccess: React.FC = () => {
    const { updateUser } = useAuth();
    const [isProcessing, setIsProcessing] = useState(true);
    const [message, setMessage] = useState('Processing your payment...');

    useEffect(() => {
        const processPayment = async () => {
            try {
                // Get session ID from URL
                const urlParams = new URLSearchParams(window.location.search);
                const sessionId = urlParams.get('session_id');

                if (sessionId) {
                    // Call backend to verify payment and upgrade user
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${apiBaseUrl}/api/verify-payment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ sessionId })
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Update user in frontend
                        updateUser({
                            plan: 'pro',
                            messagesTotalLimit: 20
                        });
                        setMessage('🎉 Payment successful! Your account has been upgraded to Pro!');
                    } else {
                        setMessage('❌ Payment verification failed. Please contact support.');
                    }
                } else {
                    setMessage('❌ No payment session found.');
                }
            } catch (error) {
                setMessage('❌ Error processing payment. Please contact support.');
            } finally {
                setIsProcessing(false);
            }
        };

        processPayment();
    }, [updateUser]);

    return (
        <div className="payment-success-container">
            <div className="payment-success-card">
                <h1 className="payment-title">Payment Status</h1>

                {isProcessing ? (
                    <div className="processing-section">
                        <div className="processing-spinner">⏳</div>
                        <div className="processing-message">{message}</div>
                        <div className="processing-wait">Please wait...</div>
                    </div>
                ) : (
                    <div className="result-section">
                        <div className="result-message">{message}</div>
                        <button
                            className="return-button"
                            onClick={() => window.location.href = '/'}
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;