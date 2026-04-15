"use client";

import { useInventory } from '../../context/InventoryContext';
import { getStockStatus, getStatusColor } from '../../types/inventory';

export default function InventoryPage() {
    const { items, updateStock } = useInventory();

    return (
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Inventory Gudang</h1>
                    <p>Monitor stok bahan baku dan produk jadi.</p>
                </div>
                <button className="btn btn-primary">+ Tambah Item</button>
            </div>

            <div className="glass glass-panel table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama Item</th>
                            <th>Varian</th>
                            <th>Ukuran</th>
                            <th>Stok</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => {
                            const status = getStockStatus(item.stock, item.minStock);
                            const statusColor = getStatusColor(status);

                            return (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{item.category}</div>
                                    </td>
                                    <td>{item.variant}</td>
                                    <td>{item.size}</td>
                                    <td>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {item.stock} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{item.unit}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${statusColor}`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn"
                                                style={{ padding: '0.25rem 0.75rem', background: 'var(--background)' }}
                                                onClick={() => updateStock(item.id, -1)}
                                            >
                                                -
                                            </button>
                                            <button
                                                className="btn"
                                                style={{ padding: '0.25rem 0.75rem', background: 'var(--background)' }}
                                                onClick={() => updateStock(item.id, 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
