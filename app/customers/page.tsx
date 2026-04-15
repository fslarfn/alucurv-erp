"use client";

import { useOrder } from '../../context/OrderContext';
import { STATUS_COLOR } from '../../types/order';

export default function CustomersPage() {
    const { orders } = useOrder();

    // Group orders by customer phone/name to identify unique customers
    // In a real DB, we would have a separate Customers table.
    // extracting unique customers:
    const customersMap = new Map();

    orders.forEach(order => {
        const key = order.customer.name.trim(); // Simplified grouping by Name
        if (!customersMap.has(key)) {
            customersMap.set(key, {
                name: order.customer.name,
                phone: order.customer.phone,
                address: order.customer.address,
                orders: []
            });
        }
        customersMap.get(key).orders.push(order);
    });

    const customers = Array.from(customersMap.values());

    const formatMoney = (val: number) => `Rp ${Math.round(val).toLocaleString('id-ID')}`;

    return (
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass glass-panel" style={{ marginBottom: '2rem' }}>
                <h1>CRM & Database Pelanggan</h1>
                <p>Riwayat pesanan pelanggan untuk layanan purna jual dan garansi.</p>
            </div>

            <div className="dashboard-grid">
                {customers.map((cust, idx) => (
                    <div key={idx} className="glass glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{cust.name}</h2>
                                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>{cust.phone}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>{cust.address}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>{cust.orders.length} Pesanan</div>
                                <div style={{ fontSize: '0.8rem' }}>Total Belanja: {formatMoney(cust.orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0))}</div>
                            </div>
                        </div>

                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: 'var(--secondary)' }}>
                                        <th>Date</th>
                                        <th>Invoice</th>
                                        <th>Items</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cust.orders.map((order: any) => (
                                        <tr key={order.id} style={{ borderBottom: '1px dashed rgba(0,0,0,0.1)' }}>
                                            <td style={{ padding: '0.5rem 0' }}>{order.date}</td>
                                            <td>{order.invoice}</td>
                                            <td>
                                                <ul style={{ paddingLeft: '1rem', listStyle: 'circle' }}>
                                                    {order.items.map((item: any) => (
                                                        <li key={item.itemId}>{item.itemId} (x{item.qty})</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td><span className={`badge badge-${STATUS_COLOR[order.status as keyof typeof STATUS_COLOR]}`}>{order.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                {customers.length === 0 && (
                    <div className="glass glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                        <p>Belum ada data pelanggan.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
