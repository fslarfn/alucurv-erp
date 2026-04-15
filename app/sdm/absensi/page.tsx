"use client";

import { useState } from 'react';
import { useEmployee } from '../../../context/EmployeeContext';
import { Attendance } from '../../../types/employee';

export default function AbsensiPage() {
    const { employees, attendance, recordAttendance } = useEmployee();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Simple today's records filter
    const todaysRecords = attendance.filter(a => a.date === selectedDate);

    const handleCheckIn = (employeeId: string) => {
        // Prevent double check-in
        if (todaysRecords.find(a => a.employeeId === employeeId)) return;

        recordAttendance({
            employeeId,
            date: selectedDate,
            checkIn: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            checkOut: '-',
            isOvertime: false,
            overtimeDuration: 0
        });
    };

    const handleCheckOut = (id: string, currentlyOvertime: boolean, currentDuration: number) => {
        // In a real app, this would update the specific record.
        // For mock, we assume simplistic "toggle" or just display.
        // Since recordAttendance adds new, we need an 'updateAttendance' in context for real implementation.
        // For this MVP, we will assume Check-In is the primary action for "Presence".
        alert("Fitur Check-Out full akan diimplementasikan saat ada Backend. Saat ini Check-In sudah cukup untuk menghitung kehadiran.");
    };

    return (
        <div style={{ padding: '0 1rem' }}>
            <div className="glass glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Absensi & Lembur</h1>
                    <p>Catat kehadiran harian dan jam lembur tim.</p>
                </div>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
            </div>

            <div className="glass glass-panel custom-table">
                <h3>Kehadiran Hari Ini ({selectedDate})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    {employees.map(emp => {
                        const record = todaysRecords.find(r => r.employeeId === emp.id);
                        return (
                            <div key={emp.id} style={{
                                padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px',
                                background: record ? 'var(--primary-light)' : 'white',
                                display: 'flex', flexDirection: 'column', gap: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold' }}>{emp.name}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{emp.role}</span>
                                </div>

                                {record ? (
                                    <>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: '500' }}>
                                            ✅ Hadir: {record.checkIn}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            {record.isOvertime ? (
                                                <span className="badge badge-warning">Lembur {record.overtimeDuration} Hari</span>
                                            ) : (
                                                <button className="btn" style={{ fontSize: '0.8rem' }} onClick={() => alert("Fitur update lembur perlu backend.")}>+ Set Lembur</button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '0.5rem' }}
                                        onClick={() => handleCheckIn(emp.id)}
                                    >
                                        Check-In Masuk
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
