"use client";

import { useState } from 'react';
import { useEmployee } from '../context/EmployeeContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (technicianIds: string[]) => void;
}

export default function TechnicianAssignmentModal({ isOpen, onClose, onConfirm }: Props) {
    const { employees } = useEmployee();
    const [selectedId, setSelectedId] = useState<string>('');

    // Filter only technical roles
    const technicians = employees.filter(e => e.role === 'Tukang Rakit' || e.role === 'Tukang Bending' || e.role === 'Helper');

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
            <div className="glass-panel" style={{ background: 'white', width: '400px', maxWidth: '90%' }}>
                <h2>Pilih Teknisi</h2>
                <p>Siapa yang mengerjakan pesanan ini?</p>

                <div style={{ margin: '1rem 0' }}>
                    <select
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                        value={selectedId}
                        onChange={e => setSelectedId(e.target.value)}
                    >
                        <option value="">-- Pilih Nama --</option>
                        {technicians.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button className="btn" onClick={onClose}>Batal</button>
                    <button
                        className="btn btn-primary"
                        disabled={!selectedId}
                        onClick={() => onConfirm([selectedId])}
                    >
                        Simpan & Selesai
                    </button>
                </div>
            </div>
        </div>
    );
}
