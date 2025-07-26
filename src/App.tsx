import './App.css';
import AuthWrapper from './components/Auth/AuthWrapper';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PaymentSuccess from './components/payment/PaymentSuccess';
import PaymentCancel from './components/payment/PaymentCancel';
import { useTheme } from './hooks/useTheme';
import toast, { Toaster } from 'react-hot-toast';
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  useTheme();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main app routes - all go to AuthWrapper */}
          <Route path="/" element={<AuthWrapper />} />
          <Route path="/documents" element={<AuthWrapper />} />
          <Route path="/analytics" element={<AuthWrapper />} />
          <Route path="/settings" element={<AuthWrapper />} />

          {/* Payment routes */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancel />} />
        </Routes>

        <Toaster
          position="top-right"
          gutter={8}
          containerStyle={{
            top: 20,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(8px)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#f9fafb',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f9fafb',
              },
            },
            loading: {
              iconTheme: {
                primary: '#6366f1',
                secondary: '#f9fafb',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;