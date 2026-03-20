import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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
                <h2>Dang Nhap</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhap email"
                            required
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
                    <small>Admin: admin@barbershop.com / admin123</small><br />
                    <small>Staff: staff1@barbershop.com / staff123</small>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
