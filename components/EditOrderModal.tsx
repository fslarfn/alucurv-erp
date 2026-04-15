"use client";
import React, { useState, useEffect } from 'react';
import { Order } from '../types/order';

interface EditOrderModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: Partial<Order>) => Promise<void>;
}

export default function EditOrderModal({ order, isOpen, onClose, onSave }: EditOrderModalProps) {
    const [formData, setFormData] = useState<Partial<Order>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (order) {
            setFormData({
                legacyDescription: order.legacyDescription || '',
                totalAmount: order.totalAmount,
                // Add fields as needed
            });
        }
    }, [order]);

    if (!isOpen || !order) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(order.id, formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Pesanan</h2>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Deskripsi (Legacy)</label>
                    <textarea
                        className="input-field"
                        rows={4}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        value={formData.legacyDescription}
                        onChange={e => setFormData({ ...formData, legacyDescription: e.target.value })}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Total Harga (Rp)</label>
                    <input
                        type="number"
                        className="input-field"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        value={formData.totalAmount}
                        onChange={e => setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })}
                    />
                </div>

                <div className="modal-actions">
                    <button className="btn" onClick={onClose} disabled={isSaving}>Batal</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
