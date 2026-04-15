"use client";

import { useState } from 'react';
import { useEmployee } from '../../context/EmployeeContext';
import { Employee, EmployeeRole } from '../../types/employee';

const ROLES: EmployeeRole[] = ['Admin', 'Tukang Rakit', 'Tukang Bending', 'Helper'];

export default function SDMPage() {
    const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployee();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Employee>>({
        name: '', role: 'Helper', baseSalary: 0, mealAllowance: 0, productionRate: 0,
        bpjsKesehatan: 0, bpjsKetenagakerjaan: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...formData,
            joinedDate: editingId ? (employees.find(e => e.id === editingId)?.joinedDate || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
        } as any;

        if (editingId) {
            updateEmployee(editingId, data);
        } else {
            addEmployee(data);
        }
        closeModal();
    };

    const openEdit = (emp: Employee) => {
        setFormData(emp);
        setEditingId(emp.id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            name: '', role: 'Helper', baseSalary: 0, mealAllowance: 0, productionRate: 0,
            bpjsKesehatan: 0, bpjsKetenagakerjaan: 0
        });
    };

    const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

    return (
        <div style={{ padding: '0 1rem' }}>
            <div className="glass glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Manajemen SDM</h1>
                    <p>Kelola data karyawan, gaji, dan potongan BPJS.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Tambah Karyawan</button>
            </div>

            <div className="glass glass-panel table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Role</th>
                            <th>Gaji Pokok</th>
                            <th>Uang Makan/Hari</th>
                            <th>Upah/Unit</th>
                            <th>Potongan BPJS (Total)</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id}>
                                <td style={{ fontWeight: '500' }}>{emp.name}</td>
                                <td><span className="badge badge-secondary">{emp.role}</span></td>
                                <td>{formatCurrency(emp.baseSalary)}</td>
                                <td>{formatCurrency(emp.mealAllowance)}</td>
                                <td>{formatCurrency(emp.productionRate)}</td>
                                <td style={{ color: 'var(--danger)' }}>{formatCurrency(emp.bpjsKesehatan + emp.bpjsKetenagakerjaan)}</td>
                                <td>
                                    <button className="btn" style={{ marginRight: '0.5rem' }} onClick={() => openEdit(emp)}>Edit</button>
                                    <button className="btn btn-danger" onClick={() => deleteEmployee(emp.id)}>Hapus</button>
                                </td>
                            </tr>
                        ))}
                        {employees.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Belum ada data karyawan.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-panel" style={{ background: 'white', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2>{editingId ? 'Edit Karyawan' : 'Tambah Karyawan'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nama Lengkap</label>
                                <input
                                    type="text" required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Posisi / Role</label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Gaji Pokok</label>
                                    <input
                                        type="number" min="0" required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        value={formData.baseSalary}
                                        onChange={e => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Uang Makan (Harian)</label>
                                    <input
                                        type="number" min="0" required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        value={formData.mealAllowance}
                                        onChange={e => setFormData({ ...formData, mealAllowance: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Upah Borongan (per Unit)</label>
                                <input
                                    type="number" min="0" required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    value={formData.productionRate}
                                    onChange={e => setFormData({ ...formData, productionRate: Number(e.target.value) })}
                                />
                                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Hanya berlaku untuk posisi produksi.</p>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                            <h3 style={{ fontSize: '1rem', color: 'var(--secondary)' }}>Potongan Bulanan (Deductions)</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>BPJS Kesehatan</label>
                                    <input
                                        type="number" min="0" required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        value={formData.bpjsKesehatan}
                                        onChange={e => setFormData({ ...formData, bpjsKesehatan: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>BPJS Ketenagakerjaan</label>
                                    <input
                                        type="number" min="0" required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        value={formData.bpjsKetenagakerjaan}
                                        onChange={e => setFormData({ ...formData, bpjsKetenagakerjaan: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="btn" onClick={closeModal}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
