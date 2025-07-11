import './App.css';
import AuthWrapper from './components/Auth/AuthWrapper';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AuthWrapper />
      </div>
    </AuthProvider>
  );
}

export default App;