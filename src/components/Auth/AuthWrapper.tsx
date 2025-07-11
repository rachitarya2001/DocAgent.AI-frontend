import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from './Login';
import Signup from './Signup';
import Dashboard from '../Dashboard/Dashboard';

const AuthWrapper: React.FC = () => {
    const { user, isLoading } = useAuth();
    const [currentPage, setCurrentPage] = useState<'login' | 'signup'>('login');

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1); // Remove the #
            if (hash === 'signup') {
                setCurrentPage('signup');
            } else {
                setCurrentPage('login');
            }
        };

        // Set initial page based on hash
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'white'
            }}>
                Loading...
            </div>
        );
    }

    // If user is logged in, show Dashboard
    if (user) {
        return <Dashboard />;
    }

    // If not logged in, show Login
    return currentPage === 'signup' ? <Signup /> : <Login />;
};

export default AuthWrapper;