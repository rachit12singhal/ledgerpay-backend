import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { storeUser } from '../utils/auth';
import { getApiErrorMessage } from '../utils/format';
import { IconBank } from '../components/Icons';

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Email is required';
        if (!password.trim()) newErrors.password = 'Password is required';

        setErrors(newErrors);
        setApiError('');

        if (Object.keys(newErrors).length > 0) return;

        setIsLoading(true);

        try {
            const response = await api.post('/api/auth/login', { email, password });
            const { token, id, fullName, email: userEmail, createdAt } = response.data;

            localStorage.setItem('token', token);
            storeUser({ id, fullName, email: userEmail, createdAt });

            navigate('/dashboard');
        } catch (error) {
            setApiError(
                getApiErrorMessage(error, 'Login failed. Please check your email and password.')
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand-wrap">
                    <div className="auth-brand-icon">
                        <IconBank />
                    </div>
                    <div className="auth-brand">LedgerPay</div>
                    <p className="auth-tagline">Secure digital banking</p>
                </div>
                <h1 className="auth-heading">Welcome Back</h1>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={isLoading}
                            autoComplete="email"
                        />
                        {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                        {errors.password && <p className="field-error">{errors.password}</p>}
                    </div>

                    {apiError && <div className="alert alert--error">{apiError}</div>}

                    <button type="submit" className="btn btn--primary btn--block" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
