import './App.css';
import AuthWrapper from './components/Auth/AuthWrapper';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PaymentSuccess from './components/payment/PaymentSuccess';
import PaymentCancel from './components/payment/PaymentCancel';
import { useTheme } from './hooks/useTheme';

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
          {/* Main app route */}
          <Route path="/" element={<AuthWrapper />} />

          {/* Payment routes */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;