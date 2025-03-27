import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthService from '../services/AuthService';
import { LuUser, LuLock, LuLogIn, LuUserPlus, LuLoader, LuCheckCircle, LuAlertCircle } from 'react-icons/lu';
import '../AuthStyles.css';

const AuthPage = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleToggleMode = () => {
        setIsLogin(!isLogin);
        setMessage('');
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                await AuthService.login(username, password);
                setMessageType('success');
                setMessage('Login successful!');
                if (onAuthSuccess) {
                    setTimeout(() => onAuthSuccess(), 1000);
                }
            } else {
                await AuthService.register(username, password);
                setMessageType('success');
                setMessage('Registration successful! You can now log in.');
                setTimeout(() => setIsLogin(true), 2000);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message ||
                (isLogin ? 'Failed to login. Please check your credentials.' :
                    'Failed to register. Username may already exist.');
            setMessageType('error');
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container-small">
            <AnimatePresence mode="wait">
                <motion.div
                    key={isLogin ? 'login' : 'register'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="auth-form-wrapper"
                >
                    <form className="auth-form" onSubmit={handleAuth}>
                        <h2 className="auth-title">{isLogin ? 'Login' : 'Register'}</h2>

                        <div className="form-group">
                            <div className="input-with-icon">
                                <LuUser className="input-icon" />
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                <LuLock className="input-icon" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`error-alert ${messageType === 'success' ? 'success' : 'error'}`}>
                                {messageType === 'success' ? <LuCheckCircle /> : <LuAlertCircle />}
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`auth-button ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <LuLoader className="spin" />
                            ) : isLogin ? (
                                <>
                                    <LuLogIn /> Login
                                </>
                            ) : (
                                <>
                                    <LuUserPlus /> Register
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </AnimatePresence>

            <div className="auth-footer">
                <p>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        className="toggle-mode-button"
                        onClick={handleToggleMode}
                        disabled={loading}
                    >
                        {isLogin ? "Register now" : "Login now"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;