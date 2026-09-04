import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        setApiError('');
        setSuccessMessage('');

        const newErrors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Confirm password is required';
        }

        if (
            password.trim() &&
            confirmPassword.trim() &&
            password !== confirmPassword
        ) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/api/auth/register', {
                fullName,
                email,
                phoneNumber,
                password,
            });

            setSuccessMessage('Account created successfully! Redirecting to login...');

            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setApiError(error.response.data.message);
            } else {
                setApiError('Unable to create your account. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-logo">LedgerPay</div>
                <h1 className="register-heading">Create Your Account</h1>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            disabled={isLoading}
                        />
                        {errors.fullName && <p className="field-error">{errors.fullName}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                        {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter your phone number"
                            disabled={isLoading}
                        />
                        {errors.phoneNumber && <p className="field-error">{errors.phoneNumber}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            disabled={isLoading}
                        />
                        {errors.password && <p className="field-error">{errors.password}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <p className="field-error">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {apiError && <p className="field-error">{apiError}</p>}
                    {successMessage && <p className="field-success">{successMessage}</p>}

                    <button type="submit" className="register-button" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="register-footer-text">
                    Already have an account? <Link to="/login">Back to Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;