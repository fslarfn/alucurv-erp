"use client";

import { useInventory } from '../context/InventoryContext';
import { useOrder } from '../context/OrderContext';
import { useExpense } from '../context/ExpenseContext';
import { getStockStatus, getStatusColor } from '../types/inventory';
import { STATUS_COLOR } from '../types/order';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { items } = useInventory();
  const { orders } = useOrder();
  const { totalExpenses } = useExpense();
  const router = useRouter();

  const criticalItems = items.filter(i => getStockStatus(i.stock, i.minStock) === 'BUAT LAGI');
  const lowStockItems = items.filter(i => getStockStatus(i.stock, i.minStock) === 'MENIPIS');

  const activeOrders = orders.filter(o => o.status !== 'Selesai');
  const finishedOrders = orders.filter(o => o.status === 'Selesai');

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Simple Profit Logic for Dashboard
  // In depth analysis is in Payroll/Production reports
  // Here: Revenue - Estimated Cost (70%) - Operational Expenses
  // Or: Revenue * 30% (Margin) - Expenses
  const grossProfit = totalRevenue * 0.3; // Asumsi margin kotor rata-rata
  const netProfit = grossProfit - totalExpenses;

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, var(--primary), var(--primary-hover))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard Manager</h1>
        <p style={{ color: 'var(--secondary)' }}>Ringkasan operasional harian Alucurv.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Total Omzet</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            Rp {totalRevenue.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
            - Ops: Rp {totalExpenses.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="glass glass-panel" style={{ padding: '1.5rem', borderLeft: netProfit < 0 ? '4px solid var(--danger)' : '4px solid var(--success)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Net Profit (Est.)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: netProfit < 0 ? 'var(--danger)' : 'var(--success)' }}>
            Rp {netProfit.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
            (Margin 30% - Ops)
          </div>
        </div>

        <div className="glass glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Pesanan Aktif</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{activeOrders.length}</div>
        </div>

        <div className="glass glass-panel" style={{ padding: '1.5rem', borderLeft: criticalItems.length > 0 ? '4px solid var(--danger)' : 'none' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Stok Kritis (Buat Lagi)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: criticalItems.length > 0 ? 'var(--danger)' : 'inherit' }}>
            {criticalItems.length} Item
          </div>
        </div>
      </div>

      <div className="dashboard-grid">

        {/* Main Content - Active Orders or Production Queue */}
        <div className="glass glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Antrean Produksi</h2>
            <button className="btn" onClick={() => router.push('/orders')}>Lihat Semua &rarr;</button>
          </div>

          <div className="table-container">
            <table style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Pemesan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td>{order.invoice}</td>
                    <td>{order.customer.name}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[order.status]}`}>{order.status}</span></td>
                  </tr>
                ))}
                {activeOrders.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada pesanan aktif.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar - Notifications */}
        <div className="glass glass-panel">
          <h2>Notifikasi Stok</h2>

          {criticalItems.length === 0 && lowStockItems.length === 0 && (
            <p style={{ color: 'var(--success)' }}>Semua stok aman!</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {criticalItems.map(item => (
              <div key={item.id} style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '8px', borderLeft: '4px solid var(--danger)' }}>
                <div style={{ fontWeight: 'bold', color: '#991b1b' }}>BUAT LAGI: {item.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>Sisa: {item.stock} {item.unit}</div>
              </div>
            ))}

            {lowStockItems.map(item => (
              <div key={item.id} style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                <div style={{ fontWeight: 'bold', color: '#92400e' }}>MENIPIS: {item.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#b45309' }}>Sisa: {item.stock} {item.unit}</div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => router.push('/inventory')}>
            Kelola Stok
          </button>
        </div>

      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button className="btn glass" onClick={() => router.push('/hpp')}>Open Kalkulator HPP</button>
      </div>

    </main>
  );
}
