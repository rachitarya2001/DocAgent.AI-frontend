import React, { useState } from 'react';
import './Login.css';
import { useAuth } from '../../contexts/AuthContext';
import { apiBaseUrl } from '../../config/api';
import toast from 'react-hot-toast';

const Signup: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters long');
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch(`${apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Welcome to DocAgent.AI, ${data.user.username}!`);
                login(data.token, data.user);
                console.log('Signup successful:', data.user);
            } else {
                toast.error(` ${data.message}`);
                setError(data.message);
            }
        } catch (error) {
            toast.error(' Signup failed. Please try again.');
            setError('Signup failed. Please try again.');
            console.error('Signup error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Join DocAgent.AI</h2>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <div className="auth-switch">
                    Already have an account?
                    <button className="auth-link" onClick={() => window.location.hash = 'login'}>
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Signup;