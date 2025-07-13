import React from 'react';
import './PaymentCancel.css';

const PaymentCancel: React.FC = () => {
    return (
        <div className="payment-cancel-container">
            <div className="payment-cancel-card">
                <h1 className="payment-title">Payment Cancelled</h1>

                <div className="cancel-section">
                    <div className="cancel-icon">❌</div>
                    <div className="cancel-message">
                        Your payment was cancelled. No charges were made to your account.
                    </div>
                    <div className="cancel-subtitle">
                        You can try again anytime to upgrade your account.
                    </div>

                    <div className="cancel-actions">
                        <button
                            className="return-button primary"
                            onClick={() => window.location.href = '/'}
                        >
                            Return to Dashboard
                        </button>
                        <button
                            className="return-button secondary"
                            onClick={() => window.history.back()}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;