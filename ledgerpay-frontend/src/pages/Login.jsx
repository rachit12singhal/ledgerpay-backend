import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        setApiError('');

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/api/auth/login', {
                email,
                password,
            });

            console.log('Login response:', response.data);

            const token = response.data.token;

            localStorage.setItem('token', token);

            console.log('Login successful. Token stored.');

            navigate('/dashboard');

        } catch (error) {
            console.error('Login error:', error);

            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Response data:', error.response.data);
            } else if (error.request) {
                console.log(
                    'No response received from backend:',
                    error.request
                );
            } else {
                console.log(
                    'Request setup error:',
                    error.message
                );
            }

            setApiError(
                'Login failed. Please check your email and password.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-logo">
                    LedgerPay
                </div>

                <h1 className="login-heading">
                    Welcome Back
                </h1>

                <form onSubmit={handleSubmit} noValidate>

                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />

                        {errors.email && (
                            <p className="field-error">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />

                        {errors.password && (
                            <p className="field-error">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {apiError && (
                        <p className="field-error">
                            {apiError}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? 'Logging in...'
                            : 'Login'}
                    </button>

                </form>

                <p className="login-footer-text">
                    Don't have an account?{' '}
                    <Link to="/register">
                        Register
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Login;