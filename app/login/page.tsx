"use client";

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/firebase/authService';
import { Role } from '../../types/auth';

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Secret Register State
    const [clickCount, setClickCount] = useState(0);
    const [showRegister, setShowRegister] = useState(false);
    const [regName, setRegName] = useState('');

    const handleLogoClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if (newCount >= 5) {
            setShowRegister(true);
            setError("Mode Registrasi Aktif! Silakan buat akun Owner.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (showRegister) {
                // Register Mode
                // Auto append email
                let email = username;
                if (!email.includes('@')) email = `${username}@alucurv.com`;

                await authService.register({
                    username: email,
                    password: password,
                    name: regName,
                    role: Role.OWNER // Hardcoded for first user
                });

                alert("Registrasi Berhasil! Silakan Login.");
                setShowRegister(false);
                setClickCount(0);
                setPassword('');
            } else {
                // Login Mode
                const success = await login(username, password);
                if (!success) {
                    setError('Login Gagal! Cek username/password.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', // Light Teal Gradient (Hijau-Putih)
            fontFamily: 'var(--font-inter), sans-serif',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Background Shapes */}
            <div style={{
                position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, rgba(255,255,255,0) 70%)',
                borderRadius: '50%', filter: 'blur(60px)', zIndex: 0
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, rgba(255,255,255,0) 70%)',
                borderRadius: '50%', filter: 'blur(60px)', zIndex: 0
            }} />

            <div className="glass" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '3rem 2.5rem',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 1)',
                borderRadius: '24px',
                boxShadow: '0 20px 40px -10px rgba(13, 148, 136, 0.15)', // Soft teal shadow
                zIndex: 1,
                color: '#334155' // Slate 700 text
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div
                        onClick={handleLogoClick}
                        style={{
                            width: '64px', height: '64px', margin: '0 auto 1rem',
                            background: 'linear-gradient(135deg, #0d9488, #14b8a6)', // Teal Gradient Logo
                            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', boxShadow: '0 10px 20px rgba(13, 148, 136, 0.3)',
                            color: 'white', cursor: 'pointer', transition: 'transform 0.2s',
                        }}
                        className="logo-icon"
                    >
                        🏢
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px', color: '#0f766e' }}>ALUCURV</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                        {showRegister ? 'Create Owner Account' : 'Operational Suite Access'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {error && (
                        <div style={{
                            background: showRegister ? '#dcfce7' : '#fef2f2',
                            color: showRegister ? '#166534' : '#ef4444',
                            padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center',
                            border: `1px solid ${showRegister ? '#bbf7d0' : '#fee2e2'}`
                        }}>
                            {error || (showRegister && "Masukkan detail akun Owner baru.")}
                        </div>
                    )}

                    {showRegister && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                Full Name
                            </label>
                            <input
                                style={{
                                    width: '100%', padding: '0.875rem 1rem', borderRadius: '12px',
                                    background: '#f8fafc', border: '1px solid #e2e8f0',
                                    color: '#1e293b', fontSize: '1rem', outline: 'none',
                                    transition: 'all 0.2s ease',
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                                }}
                                type="text"
                                value={regName}
                                onChange={e => setRegName(e.target.value)}
                                placeholder="e.g. Budi Santoso"
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            Username
                        </label>
                        <input
                            style={{
                                width: '100%', padding: '0.875rem 1rem', borderRadius: '12px',
                                background: '#f8fafc', border: '1px solid #e2e8f0',
                                color: '#1e293b', fontSize: '1rem', outline: 'none',
                                transition: 'all 0.2s ease',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                            }}
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="ex: owner"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            Password
                        </label>
                        <input
                            style={{
                                width: '100%', padding: '0.875rem 1rem', borderRadius: '12px',
                                background: '#f8fafc', border: '1px solid #e2e8f0',
                                color: '#1e293b', fontSize: '1rem', outline: 'none',
                                transition: 'all 0.2s ease',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                            }}
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder={showRegister ? "Min 6 chars" : "••••••"}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            marginTop: '1rem', width: '100%', padding: '1rem',
                            background: isLoading ? '#cbd5e1' : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', // Primary Teal
                            color: 'white', border: 'none', borderRadius: '12px',
                            fontSize: '1rem', fontWeight: '700', cursor: isLoading ? 'wait' : 'pointer',
                            boxShadow: isLoading ? 'none' : '0 10px 20px -5px rgba(13, 148, 136, 0.4)',
                            transform: isLoading ? 'scale(0.98)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {isLoading ? 'Memproses...' : (showRegister ? 'Buat Akun Owner' : 'Sign In')}
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                        {showRegister ? 'Kembali ke Login?' : 'Demo Access Credentials'}
                    </p>
                    {showRegister ? (
                        <button onClick={() => setShowRegister(false)} style={{ background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer', textDecoration: 'underline' }}>
                            Cancel Registration
                        </button>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {/* Keep demo pills for visual, but they wont work until registered */}
                            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Tap logo 5x to Register</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
