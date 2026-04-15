"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const menuIcons: { [key: string]: string } = {
    '/': '📊',
    '/inventory': '📦',
    '/procurement': '🛒',
    '/hpp': '💰',
    '/orders': '📋',
    '/schedule': '📅',
    '/master-data': '🏭',
    '/sdm': '👥',
    '/sdm/absensi': '⏰',
    '/sdm/payroll': '💳',
    '/expenses': '💸',
    '/customers': '🤝',
};

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        production: true,
        hrd: true,
        finance: true,
    });

    const isActive = (path: string) => pathname === path;

    if (!user) return null;

    const isOwner = user.role === 'Owner';
    const isAdmin = user.role === 'Admin' || isOwner;
    const isProduction = user.role === 'Produksi' || isOwner;
    const isGudang = user.role === 'Gudang' || isOwner;

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <aside className="sidebar">
            {/* Logo & Brand */}
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '1.8rem' }}>🏭</div>
                    <div>
                        <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>ALUCURV</h1>
                    </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', margin: '0 0 0.75rem 0' }}>Operational Suite</p>
                <div className="badge badge-primary" style={{ width: 'fit-content' }}>{user.role}</div>
            </div>

            {/* Main Navigation */}
            <nav className="sidebar-nav">

                {/* DASHBOARD */}
                <Link href="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                    <span className="nav-icon">{menuIcons['/']}</span>
                    <span className="nav-label">Dashboard</span>
                </Link>

                {/* PRODUKSI SECTION */}
                {(isProduction || isGudang) && (
                    <>
                        <div className="nav-section">
                            <button 
                                className="nav-section-header"
                                onClick={() => toggleSection('production')}
                            >
                                <span style={{ fontSize: '1rem' }}>⚙️</span>
                                <span className="nav-section-title">PRODUKSI</span>
                                <span className={`nav-section-toggle ${expandedSections.production ? 'expanded' : ''}`}>›</span>
                            </button>
                            
                            {expandedSections.production && (
                                <div className="nav-section-items">
                                    {isGudang && (
                                        <>
                                            <Link href="/inventory" className={`nav-item ${isActive('/inventory') ? 'active' : ''}`}>
                                                <span className="nav-icon">{menuIcons['/inventory']}</span>
                                                <span className="nav-label">Inventory Gudang</span>
                                            </Link>
                                            <Link href="/procurement" className={`nav-item ${isActive('/procurement') ? 'active' : ''}`}>
                                                <span className="nav-icon">{menuIcons['/procurement']}</span>
                                                <span className="nav-label">Pembelian (PO)</span>
                                            </Link>
                                        </>
                                    )}

                                    {isOwner && (
                                        <Link href="/hpp" className={`nav-item ${isActive('/hpp') ? 'active' : ''}`}>
                                            <span className="nav-icon">{menuIcons['/hpp']}</span>
                                            <span className="nav-label">Kalkulator HPP</span>
                                        </Link>
                                    )}

                                    {(isProduction || isAdmin) && (
                                        <>
                                            <Link href="/orders" className={`nav-item ${isActive('/orders') ? 'active' : ''}`}>
                                                <span className="nav-icon">{menuIcons['/orders']}</span>
                                                <span className="nav-label">Order Tracking</span>
                                            </Link>
                                            <Link href="/schedule" className={`nav-item ${isActive('/schedule') ? 'active' : ''}`}>
                                                <span className="nav-icon">{menuIcons['/schedule']}</span>
                                                <span className="nav-label">Kalender Produksi</span>
                                            </Link>
                                        </>
                                    )}

                                    {isOwner && (
                                        <Link href="/master-data" className={`nav-item ${isActive('/master-data') ? 'active' : ''}`}>
                                            <span className="nav-icon">{menuIcons['/master-data']}</span>
                                            <span className="nav-label">Master Data Bahan</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* HRD & PAYROLL SECTION */}
                {(isOwner || isAdmin) && (
                    <>
                        <div className="nav-section">
                            <button 
                                className="nav-section-header"
                                onClick={() => toggleSection('hrd')}
                            >
                                <span style={{ fontSize: '1rem' }}>👔</span>
                                <span className="nav-section-title">HRD & PAYROLL</span>
                                <span className={`nav-section-toggle ${expandedSections.hrd ? 'expanded' : ''}`}>›</span>
                            </button>
                            
                            {expandedSections.hrd && (
                                <div className="nav-section-items">
                                    <Link href="/sdm" className={`nav-item ${isActive('/sdm') ? 'active' : ''}`}>
                                        <span className="nav-icon">{menuIcons['/sdm']}</span>
                                        <span className="nav-label">Data Karyawan</span>
                                    </Link>
                                    <Link href="/sdm/absensi" className={`nav-item ${isActive('/sdm/absensi') ? 'active' : ''}`}>
                                        <span className="nav-icon">{menuIcons['/sdm/absensi']}</span>
                                        <span className="nav-label">Absensi & Lembur</span>
                                    </Link>
                                    {isOwner && (
                                        <Link href="/sdm/payroll" className={`nav-item ${isActive('/sdm/payroll') ? 'active' : ''}`}>
                                            <span className="nav-icon">{menuIcons['/sdm/payroll']}</span>
                                            <span className="nav-label">Penggajian</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* FINANCE & CRM SECTION */}
                {(isOwner || isAdmin) && (
                    <>
                        <div className="nav-section">
                            <button 
                                className="nav-section-header"
                                onClick={() => toggleSection('finance')}
                            >
                                <span style={{ fontSize: '1rem' }}>💼</span>
                                <span className="nav-section-title">FINANCE & CRM</span>
                                <span className={`nav-section-toggle ${expandedSections.finance ? 'expanded' : ''}`}>›</span>
                            </button>
                            
                            {expandedSections.finance && (
                                <div className="nav-section-items">
                                    <Link href="/expenses" className={`nav-item ${isActive('/expenses') ? 'active' : ''}`}>
                                        <span className="nav-icon">{menuIcons['/expenses']}</span>
                                        <span className="nav-label">Pengeluaran (Expense)</span>
                                    </Link>
                                    <Link href="/customers" className={`nav-item ${isActive('/customers') ? 'active' : ''}`}>
                                        <span className="nav-icon">{menuIcons['/customers']}</span>
                                        <span className="nav-label">Database Pelanggan</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                    &copy; 2026 Alucurv Team
                </div>
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
                    v1.0 - Demo Mode
                </div>
            </div>
        </aside>
    );
}
