"use client";

import { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { ExpenseCategory } from '../../types/expense';

export default function ExpensesPage() {
    const { expenses, addExpense, deleteExpense, totalExpenses } = useExpense();

    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('Lainnya');
    const [amount, setAmount] = useState<number>(0);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addExpense({ description, category, amount, date });
        setDescription('');
        setAmount(0);
    };

    const categories: ExpenseCategory[] = ['Listrik', 'Sewa', 'Alat Kerja', 'Gaji Non-Produksi', 'Lainnya'];
    const formatMoney = (val: number) => `Rp ${Math.round(val).toLocaleString('id-ID')}`;

    return (
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Expense Tracker</h1>
                    <p>Catat pengeluaran operasional di luar produksi.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Total Pengeluaran Bulan Ini</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>{formatMoney(totalExpenses)}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Input Form */}
                <div className="glass glass-panel">
                    <h2>Tambah Pengeluaran</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tanggal</label>
                            <input
                                type="date" required
                                className="input-field"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                value={date} onChange={e => setDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Kategori</label>
                            <select
                                className="input-field"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Katerangan</label>
                            <input
                                type="text" placeholder="Contoh: Beli mata bor 5mm" required
                                className="input-field"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                value={description} onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nominal (Rp)</label>
                            <input
                                type="number" min="0" required
                                className="input-field"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                value={amount} onChange={e => setAmount(Number(e.target.value))}
                            />
                        </div>
                        <button type="submit" className="btn btn-danger" style={{ marginTop: '1rem' }}>+ Catat Pengeluaran</button>
                    </form>
                </div>

                {/* List */}
                <div className="glass glass-panel">
                    <h2>Riwayat Pengeluaran</h2>
                    <div className="table-container" style={{ marginTop: '1rem' }}>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '0.5rem' }}>Tanggal</th>
                                    <th style={{ padding: '0.5rem' }}>Deskripsi</th>
                                    <th style={{ padding: '0.5rem' }}>Nominal</th>
                                    <th style={{ padding: '0.5rem' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(e => (
                                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>{e.date}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <div style={{ fontWeight: '500' }}>{e.description}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }} className="badge badge-warning">{e.category}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{formatMoney(e.amount)}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <button
                                                onClick={() => deleteExpense(e.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                                title="Hapus"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
