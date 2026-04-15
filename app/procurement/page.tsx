"use client";

import { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { useInventory } from '../../context/InventoryContext';
import { Supplier, POItem } from '../../types/procurement';

export default function ProcurementPage() {
    const { suppliers, addSupplier, purchaseOrders, createPO, receivePO } = useProcurement();
    const { items: inventoryItems } = useInventory();

    const [activeTab, setActiveTab] = useState<'po' | 'suppliers'>('po');
    const [showPOForm, setShowPOForm] = useState(false);
    const [showSupplierForm, setShowSupplierForm] = useState(false);

    // Form States (PO)
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [poItems, setPoItems] = useState<POItem[]>([]);

    // Temp Item State for adding to PO
    const [tempItemId, setTempItemId] = useState('');
    const [tempQty, setTempQty] = useState(1);
    const [tempPrice, setTempPrice] = useState(0);

    // Form States (Supplier)
    const [supName, setSupName] = useState('');
    const [supContact, setSupContact] = useState('');
    const [supPhone, setSupPhone] = useState('');
    const [supAddress, setSupAddress] = useState('');

    const formatMoney = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

    const handleAddSupplier = (e: React.FormEvent) => {
        e.preventDefault();
        addSupplier({ name: supName, contactPerson: supContact, phone: supPhone, address: supAddress });
        setShowSupplierForm(false);
        setSupName(''); setSupContact(''); setSupPhone(''); setSupAddress('');
    };

    const handleAddItemToPO = () => {
        const invItem = inventoryItems.find(i => i.id === tempItemId);
        if (!invItem) return;

        const newItem: POItem = {
            inventoryId: invItem.id,
            itemName: invItem.name,
            qty: tempQty,
            unit: invItem.unit,
            pricePerUnit: tempPrice,
            total: tempQty * tempPrice
        };
        setPoItems([...poItems, newItem]);
        setTempItemId('');
        setTempQty(1);
        setTempPrice(0);
    };

    const handleCreatePO = () => {
        const supplier = suppliers.find(s => s.id === selectedSupplierId);
        if (!supplier || poItems.length === 0) return;

        const totalAmount = poItems.reduce((sum, i) => sum + i.total, 0);

        createPO({
            supplierId: supplier.id,
            supplierName: supplier.name,
            date: new Date().toISOString().split('T')[0],
            items: poItems,
            totalAmount
        });

        setShowPOForm(false);
        setPoItems([]);
        setSelectedSupplierId('');
    };

    return (
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass glass-panel" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Modul Pembelian (PO)</h1>
                        <p>Kelola supplier dan stok masuk.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className={`btn ${activeTab === 'po' ? 'btn-primary' : 'glass'}`} onClick={() => setActiveTab('po')}>Purchase Order</button>
                        <button className={`btn ${activeTab === 'suppliers' ? 'btn-primary' : 'glass'}`} onClick={() => setActiveTab('suppliers')}>Data Supplier</button>
                    </div>
                </div>
            </div>

            {/* SUPPLIER TAB */}
            {activeTab === 'suppliers' && (
                <div className="dashboard-grid">
                    <div className="glass glass-panel">
                        <h2>Daftar Supplier</h2>
                        <button className="btn btn-primary" style={{ marginBottom: '1rem' }} onClick={() => setShowSupplierForm(!showSupplierForm)}>+ Supplier Baru</button>

                        {showSupplierForm && (
                            <form onSubmit={handleAddSupplier} style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    <input placeholder="Nama PT/Toko" className="input-field" value={supName} onChange={e => setSupName(e.target.value)} required />
                                    <input placeholder="Kontak (Pak Budi)" className="input-field" value={supContact} onChange={e => setSupContact(e.target.value)} required />
                                    <input placeholder="No HP/WA" className="input-field" value={supPhone} onChange={e => setSupPhone(e.target.value)} required />
                                    <input placeholder="Alamat" className="input-field" value={supAddress} onChange={e => setSupAddress(e.target.value)} />
                                    <button type="submit" className="btn btn-success">Simpan</button>
                                </div>
                            </form>
                        )}

                        <table style={{ width: '100%', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left' }}><th>Nama</th><th>Kontak</th><th>Telp</th></tr>
                            </thead>
                            <tbody>
                                {suppliers.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.5rem' }}>{s.name}</td>
                                        <td>{s.contactPerson}</td>
                                        <td>{s.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PO TAB */}
            {activeTab === 'po' && (
                <div className="dashboard-grid">
                    <div className="glass glass-panel" style={{ gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h2>Riwayat PO</h2>
                            <button className="btn btn-primary" onClick={() => setShowPOForm(true)}>+ Buat PO Baru</button>
                        </div>

                        {showPOForm && (
                            <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--primary)', borderRadius: '8px' }}>
                                <h3>Form Purchase Order</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label>Pilih Supplier</label>
                                        <select className="input-field" value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)}>
                                            <option value="">-- Pilih --</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label>Tambah Item ke List PO</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <select className="input-field" value={tempItemId} onChange={e => setTempItemId(e.target.value)}>
                                                <option value="">-- Barang --</option>
                                                {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                                            </select>
                                            <input type="number" className="input-field" placeholder="Qty" style={{ width: '80px' }} value={tempQty} onChange={e => setTempQty(Number(e.target.value))} />
                                            <input type="number" className="input-field" placeholder="Harga/Unit" style={{ width: '120px' }} value={tempPrice} onChange={e => setTempPrice(Number(e.target.value))} />
                                            <button className="btn" onClick={handleAddItemToPO} disabled={!tempItemId}>+</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Items */}
                                {poItems.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                            <thead><tr><th>Item</th><th>Qty</th><th>Harga</th><th>Total</th></tr></thead>
                                            <tbody>
                                                {poItems.map((pi, idx) => (
                                                    <tr key={idx}>
                                                        <td>{pi.itemName}</td>
                                                        <td>{pi.qty} {pi.unit}</td>
                                                        <td>{formatMoney(pi.pricePerUnit)}</td>
                                                        <td>{formatMoney(pi.total)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                            Grand Total: {formatMoney(poItems.reduce((a, b) => a + b.total, 0))}
                                        </div>
                                        <div style={{ marginTop: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="btn" onClick={() => setShowPOForm(false)}>Batal</button>
                                            <button className="btn btn-success" onClick={handleCreatePO}>Simpan & Kirim PO</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* List PO */}
                        <div style={{ marginTop: '1rem' }}>
                            <table style={{ width: '100%', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', background: 'var(--background)', color: 'var(--secondary)' }}>
                                        <th style={{ padding: '0.5rem' }}>No PO</th>
                                        <th>Supplier</th>
                                        <th>Tanggal</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchaseOrders.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>Belum ada data PO.</td></tr>}
                                    {purchaseOrders.map(po => (
                                        <tr key={po.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{po.poNumber}</td>
                                            <td>{po.supplierName}</td>
                                            <td>{po.date}</td>
                                            <td>{formatMoney(po.totalAmount)}</td>
                                            <td>
                                                <span className={`badge ${po.status === 'Received' ? 'badge-success' : 'badge-warning'}`}>
                                                    {po.status}
                                                </span>
                                            </td>
                                            <td>
                                                {po.status !== 'Received' && (
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                        onClick={() => {
                                                            if (confirm(`Terima barang dari ${po.poNumber}? Stok akan bertambah otomatis.`)) {
                                                                receivePO(po.id);
                                                            }
                                                        }}
                                                    >
                                                        📦 Terima Barang
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
