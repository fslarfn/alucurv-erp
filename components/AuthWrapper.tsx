"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // If on login page, render only children (login form), no sidebar
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // If not logged in, we return nothing (logic in AuthContext handles redirect)
    // But to be safe in render cycle:
    if (!user) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--secondary)' }}>Loading access...</div>;
    }

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div style={{ marginBottom: '1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--secondary)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                    <span>Login sebagai: <b>{user.name}</b> <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>{user.role}</span></span>
                    <button 
                        onClick={logout}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--danger)', 
                            cursor: 'pointer', 
                            textDecoration: 'underline',
                            fontWeight: 500,
                            fontSize: '0.85rem',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger-hover, #dc2626)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--danger)'}
                    >
                        Logout
                    </button>
                </div>
                {children}
            </main>
        </div>
    );
}
