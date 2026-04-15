"use client";

import { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { STATUS_COLOR } from '../../types/order';

export default function SchedulePage() {
    const { orders } = useOrder();

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    // Metrics
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

    // Logic: Map orders to days
    // Order.date string format YYYY-MM-DD
    const getOrdersForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return orders.filter(o => o.date === dateStr);
    };

    return (
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass glass-panel" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Kalender Produksi</h1>
                    <p>Timeline pesanan dan deadline produksi.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn" onClick={prevMonth}>&larr; Prev</button>
                    <h2 style={{ minWidth: '200px', textAlign: 'center' }}>{monthNames[month]} {year}</h2>
                    <button className="btn" onClick={nextMonth}>Next &rarr;</button>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="glass glass-panel">

                    {/* Calendar Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '1px',
                        background: 'var(--border)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        {/* Header Days */}
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                            <div key={d} style={{ background: 'var(--background)', padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                                {d}
                            </div>
                        ))}

                        {/* Empty Cells until 1st Day */}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} style={{ background: 'white', minHeight: '120px' }} />
                        ))}

                        {/* Days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayOrders = getOrdersForDay(day);
                            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                            return (
                                <div key={day} style={{
                                    background: isToday ? '#fffbeb' : 'white',
                                    minHeight: '120px',
                                    padding: '0.5rem',
                                    position: 'relative',
                                    border: isToday ? '2px solid var(--warning)' : 'none'
                                }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: isToday ? 'var(--warning)' : 'inherit' }}>
                                        {day}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {dayOrders.map(o => (
                                            <div key={o.id} style={{
                                                fontSize: '0.7rem',
                                                padding: '0.25rem',
                                                borderRadius: '4px',
                                                background: o.status === 'Selesai' ? '#d1fae5' : '#e0f2fe',
                                                borderLeft: `3px solid var(--${STATUS_COLOR[o.status] || 'primary'})`,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }} title={`${o.customer.name} - ${o.status}`}>
                                                {o.customer.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass glass-panel">
                    <h3>Keterangan</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-secondary">Pesanan Masuk</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-warning">Diproduksi</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-primary">Siap Kirim</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-success">Selesai</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
