import './App.css';
import AuthWrapper from './components/Auth/AuthWrapper';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PaymentSuccess from './components/payment/PaymentSuccess';
import PaymentCancel from './components/payment/PaymentCancel';

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;