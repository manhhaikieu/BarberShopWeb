import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Neu da dang nhap roi thi ve trang chu
    React.useEffect(() => {
        if (user) navigate('/', { replace: true });
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Email hoac mat khau khong dung');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-logo">✂️</div>
                <h2>Dang Nhap</h2>
                <p className="login-subtitle">HKT Barber Shop</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhap email cua ban"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Mat khau</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhap mat khau"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Dang dang nhap...' : 'Dang Nhap'}
                    </button>
                </form>

                <div className="login-register-link">
                    <small>Chua co tai khoan? <Link to="/register">Dang ky ngay</Link></small>
                </div>

                <div className="login-tips">
                    <p className="tip-title">Tai khoan thu:</p>
                    <div className="tip-item">
                        <span className="tip-role admin-role">Admin</span>
                        <span>admin@barbershop.com / admin123</span>
                    </div>
                    <div className="tip-item">
                        <span className="tip-role staff-role">Staff</span>
                        <span>staff1@barbershop.com / staff123</span>
                    </div>
                    <div className="tip-item">
                        <span className="tip-role customer-role">Customer</span>
                        <span>customer1@barbershop.com / cust123</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
