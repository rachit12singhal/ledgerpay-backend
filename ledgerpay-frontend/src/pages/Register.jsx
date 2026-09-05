import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/format';
import { IconBank } from '../components/Icons';

function Register() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setApiError('');
        setSuccessMessage('');

        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        if (!password.trim()) newErrors.password = 'Password is required';
        if (!confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
        if (password.trim() && confirmPassword.trim() && password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setIsLoading(true);

        try {
            await api.post('/api/auth/register', {
                fullName,
                email,
                phoneNumber,
                password,
            });

            setSuccessMessage('Account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            setApiError(getApiErrorMessage(error, 'Unable to create your account. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card auth-card--wide">
                <div className="auth-brand-wrap">
                    <div className="auth-brand-icon">
                        <IconBank />
                    </div>
                    <div className="auth-brand">LedgerPay</div>
                    <p className="auth-tagline">Open your account in minutes</p>
                </div>
                <h1 className="auth-heading">Create Your Account</h1>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            className="form-input"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            disabled={isLoading || !!successMessage}
                            autoComplete="name"
                        />
                        {errors.fullName && <p className="field-error">{errors.fullName}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={isLoading || !!successMessage}
                            autoComplete="email"
                        />
                        {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            className="form-input"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter your phone number"
                            disabled={isLoading || !!successMessage}
                            autoComplete="tel"
                        />
                        {errors.phoneNumber && <p className="field-error">{errors.phoneNumber}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            disabled={isLoading || !!successMessage}
                            autoComplete="new-password"
                        />
                        {errors.password && <p className="field-error">{errors.password}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            disabled={isLoading || !!successMessage}
                            autoComplete="new-password"
                        />
                        {errors.confirmPassword && (
                            <p className="field-error">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {apiError && <div className="alert alert--error">{apiError}</div>}
                    {successMessage && <div className="alert alert--success">{successMessage}</div>}

                    <button
                        type="submit"
                        className="btn btn--primary btn--block"
                        disabled={isLoading || !!successMessage}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Back to Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
