"use client";

import { useState } from 'react';
import { useMasterData } from '../../context/MasterDataContext';
import { MaterialPrice, PackingCost } from '../../types/masterData';

export default function MasterDataPage() {
    const { materials, packingCosts, updateMaterialPrice, updatePackingCost } = useMasterData();

    // Edit States
    const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
    const [tempMaterialPrice, setTempMaterialPrice] = useState<number>(0);

    const [editingPackingCategory, setEditingPackingCategory] = useState<string | null>(null);
    const [tempPackingPrice, setTempPackingPrice] = useState<number>(0);

    // Handlers for Material
    const startEditMaterial = (m: MaterialPrice) => {
        setEditingMaterialId(m.id);
        setTempMaterialPrice(m.price);
    };

    const saveMaterial = () => {
        if (editingMaterialId) {
            updateMaterialPrice(editingMaterialId, tempMaterialPrice);
            setEditingMaterialId(null);
        }
    };

    // Handlers for Packing
    const startEditPacking = (p: PackingCost) => {
        setEditingPackingCategory(p.category);
        setTempPackingPrice(p.price);
    };

    const savePacking = () => {
        if (editingPackingCategory) {
            updatePackingCost(editingPackingCategory as any, tempPackingPrice);
            setEditingPackingCategory(null);
        }
    };

    const formatMoney = (val: number) => `Rp ${Math.round(val).toLocaleString('id-ID')}`;

    return (
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass glass-panel" style={{ marginBottom: '2rem' }}>
                <h1>Master Data Bahan & Biaya</h1>
                <p>Kelola harga dasar material dan biaya operasional yang digunakan dalam kalkulasi HPP.</p>
            </div>

            <div className="dashboard-grid">
                {/* Material Prices */}
                <div className="glass glass-panel">
                    <h2>Harga Bahan Baku</h2>
                    <table className="table" style={{ width: '100%', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.5rem' }}>Material</th>
                                <th style={{ padding: '0.5rem' }}>Unit</th>
                                <th style={{ padding: '0.5rem' }}>Harga Saat Ini</th>
                                <th style={{ padding: '0.5rem' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.map(m => (
                                <tr key={m.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        <div style={{ fontWeight: '500' }}>{m.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{m.category}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>/{m.unit}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        {editingMaterialId === m.id ? (
                                            <input
                                                type="number"
                                                autoFocus
                                                value={tempMaterialPrice}
                                                onChange={e => setTempMaterialPrice(Number(e.target.value))}
                                                style={{ width: '100px', padding: '0.25rem' }}
                                            />
                                        ) : (
                                            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{formatMoney(m.price)}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        {editingMaterialId === m.id ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={saveMaterial}>Simpan</button>
                                                <button className="btn" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={() => setEditingMaterialId(null)}>Batal</button>
                                            </div>
                                        ) : (
                                            <button className="btn" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={() => startEditMaterial(m)}>✏️ Edit</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Packing Costs */}
                <div className="glass glass-panel">
                    <h2>Biaya Packing Variabel</h2>
                    <table className="table" style={{ width: '100%', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.5rem' }}>Kategori</th>
                                <th style={{ padding: '0.5rem' }}>Range Diameter</th>
                                <th style={{ padding: '0.5rem' }}>Biaya</th>
                                <th style={{ padding: '0.5rem' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packingCosts.map(p => (
                                <tr key={p.category} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        <span className="badge badge-warning">{p.category}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>
                                        {p.minDiameter}cm - {p.maxDiameter}cm
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        {editingPackingCategory === p.category ? (
                                            <input
                                                type="number"
                                                autoFocus
                                                value={tempPackingPrice}
                                                onChange={e => setTempPackingPrice(Number(e.target.value))}
                                                style={{ width: '100px', padding: '0.25rem' }}
                                            />
                                        ) : (
                                            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{formatMoney(p.price)}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        {editingPackingCategory === p.category ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={savePacking}>Simpan</button>
                                                <button className="btn" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={() => setEditingPackingCategory(null)}>Batal</button>
                                            </div>
                                        ) : (
                                            <button className="btn" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={() => startEditPacking(p)}>✏️ Edit</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
