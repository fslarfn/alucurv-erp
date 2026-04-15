"use client";

import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { Order } from '../types/order';

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateOrderModal({ isOpen, onClose }: CreateOrderModalProps) {
    const { createOrder } = useOrder();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        customerName: '',
        customerAddress: '',
        customerPhone: '',
        date: new Date().toISOString().split('T')[0],
        invoice: `INV/${new Date().getFullYear()}${new Date().getMonth() + 1}/${Math.floor(Math.random() * 10000)}`,
        expedition: '',
        legacyDescription: '',
        totalAmount: 0
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate
            if (!formData.customerName || !formData.totalAmount) {
                alert("Nama Pelanggan dan Total Harga wajib diisi!");
                setIsSubmitting(false);
                return;
            }

            const newOrder: Omit<Order, 'id' | 'status'> = {
                invoice: formData.invoice,
                customer: {
                    name: formData.customerName,
                    address: formData.customerAddress || '-',
                    phone: formData.customerPhone || '-'
                },
                date: formData.date,
                expedition: formData.expedition || 'Ambil Sendiri',
                legacyDescription: formData.legacyDescription,
                items: [], // Empty for manual legacy-style order
                totalAmount: Number(formData.totalAmount)
            };

            await createOrder(newOrder);
            alert("Order berhasil dibuat!");
            // Reset form
            setFormData({
                customerName: '',
                customerAddress: '',
                customerPhone: '',
                date: new Date().toISOString().split('T')[0],
                invoice: `INV/${new Date().getFullYear()}${new Date().getMonth() + 1}/${Math.floor(Math.random() * 10000)}`,
                expedition: '',
                legacyDescription: '',
                totalAmount: 0
            });
            onClose();
        } catch (error) {
            console.error("Failed to create order", error);
            alert("Gagal membuat order.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Buat Order Baru</h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">No. Invoice</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.invoice}
                                onChange={e => setFormData({ ...formData, invoice: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Tanggal</label>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Nama Pelanggan <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            placeholder="Contoh: Bpk. Budi"
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">No. Telepon</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.customerPhone}
                                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                placeholder="08..."
                            />
                        </div>
                        <div>
                            <label className="label">Ekspedisi</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.expedition}
                                onChange={e => setFormData({ ...formData, expedition: e.target.value })}
                                placeholder="JNE / Ambil Sendiri"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Alamat</label>
                        <textarea
                            className="input-field"
                            rows={2} // Reduced rows
                            value={formData.customerAddress}
                            onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                            placeholder="Alamat pengiriman..."
                        />
                    </div>

                    <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <label className="label" style={{ fontWeight: 'bold', color: '#334155' }}>Detail Pesanan (Manual)</label>
                        <textarea
                            className="input-field"
                            rows={4}
                            value={formData.legacyDescription}
                            onChange={e => setFormData({ ...formData, legacyDescription: e.target.value })}
                            placeholder="Deskripsikan barang pesanan, ukuran, warna, dll..."
                            style={{ marginBottom: '0.5rem' }}
                        />

                        <label className="label">Total Harga (Rp) <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="number"
                            className="input-field"
                            value={formData.totalAmount || ''}
                            onChange={e => setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>Batal</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Buat Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
