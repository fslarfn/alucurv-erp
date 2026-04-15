"use client";

import { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { NEXT_STATUS, STATUS_COLOR, Order } from '../../types/order';
import LabelModal from '../../components/LabelModal';
import TechnicianAssignmentModal from '../../components/TechnicianAssignmentModal';
import { useEmployee } from '../../context/EmployeeContext';

import OrderImportModal from '../../components/OrderImportModal';
import EditOrderModal from '../../components/EditOrderModal';
import CreateOrderModal from '../../components/CreateOrderModal';

export default function OrdersPage() {
    const { orders, advanceOrderStatus, isLoading, deleteOrder, updateOrder } = useOrder();

    // Label Modal State
    const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);

    // Technician Modal State
    const [isTechModalOpen, setIsTechModalOpen] = useState(false);
    const [finishingOrderId, setFinishingOrderId] = useState<string | null>(null);

    // Import Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Edit Modal State
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    // Filter State
    const [filterMonth, setFilterMonth] = useState<string>(''); // Format: YYYY-MM

    // Helper to get employee name
    const { employees } = useEmployee();
    const getTechNames = (ids?: string[]) => {
        if (!ids || ids.length === 0) return '-';
        return ids.map(id => employees.find(e => e.id === id)?.name || id).join(', ');
    };

    const handleStatusClick = (order: Order) => {
        const nextStatus = NEXT_STATUS[order.status];
        if (nextStatus === 'Selesai') {
            // Open Modal asking for technician
            setFinishingOrderId(order.id);
            setIsTechModalOpen(true);
        } else {
            advanceOrderStatus(order.id);
        }
    };

    const handleTechnicianConfirm = (techIds: string[]) => {
        if (finishingOrderId) {
            advanceOrderStatus(finishingOrderId, techIds);
            setIsTechModalOpen(false);
            setFinishingOrderId(null);
        }
    };

    const handleExport = () => {
        const headers = ["ID", "Invoice", "Customer", "Address", "Phone", "Expedition", "Status", "Date", "TotalAmount", "Technicians", "LegacyDescription"];

        // Use filtered orders for export? Or all? Usually visible. Let's use filtered.
        const rows = filteredOrders.map(order => {
            // Fallback for old data
            const techIds = order.technicianIds || (order.technicianId ? [order.technicianId] : []);

            return [
                order.id,
                order.invoice,
                `"${order.customer.name}"`,
                `"${order.customer.address}"`,
                order.customer.phone,
                order.expedition,
                order.status,
                order.date,
                order.totalAmount,
                `"${getTechNames(techIds)}"`,
                `"${order.legacyDescription || ''}"`
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `orders_data_${filterMonth || 'all'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        if (!filterMonth) return true;
        return order.date.startsWith(filterMonth);
    });

    return (
        <div style={{ padding: '0 1rem' }}>
            <div className="glass glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Order Tracking</h1>
                    <p>Pantau status produksi dan pengiriman pesanan.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Month Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>📅 Filter:</span>
                        <input
                            type="month"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem' }}
                        />
                        {filterMonth && (
                            <button
                                onClick={() => setFilterMonth('')}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--secondary)', fontSize: '1.1rem' }}
                                title="Hapus Filter"
                            >
                                &times;
                            </button>
                        )}
                    </div>

                    <button className="btn" onClick={() => setIsImportModalOpen(true)} style={{ background: '#0ea5e9', color: 'white' }}>📂 Import CSV</button>
                    <button className="btn" onClick={handleExport}>📥 Export CSV</button>
                    <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>+ Order Baru</button>
                </div>
            </div>

            {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
                    Loading orders...
                </div>
            ) : (
                <div className="dashboard-grid">
                    {filteredOrders.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
                            Tidak ada pesanan ditemukan {filterMonth ? `untuk bulan ${filterMonth}` : ''}.
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className="glass glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                                {/* Action Menu (Top Right) */}
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setEditingOrder(order)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title="Edit Pesanan"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => deleteOrder(order.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title="Hapus Pesanan"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', paddingRight: '4rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{order.customer.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>{order.invoice}</div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '-0.5rem' }}>
                                    <span className={`badge badge-${STATUS_COLOR[order.status]}`}>
                                        {order.status}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>
                                        {order.date}
                                    </span>
                                </div>

                                <div style={{ fontSize: '0.9rem', padding: '0.5rem', background: 'var(--background)', borderRadius: '8px' }}>
                                    <div><b>Ekspedisi:</b> {order.expedition || '-'}</div>
                                    <div style={{ marginTop: '0.25rem' }}><b>Tujuan:</b> {order.customer.address || '-'}</div>
                                    {(order.technicianIds && order.technicianIds.length > 0) || order.technicianId ? (
                                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)', color: 'var(--primary)' }}>
                                            <b>Teknisi:</b> {getTechNames(order.technicianIds || (order.technicianId ? [order.technicianId] : []))}
                                        </div>
                                    ) : null}
                                </div>

                                <div>
                                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Item:</div>
                                    {order.legacyDescription ? (
                                        <div style={{ fontSize: '0.95rem', color: '#334155', background: '#f8fafc', padding: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                            {order.legacyDescription}
                                        </div>
                                    ) : (
                                        <ul style={{ listStyle: 'disc', paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                                            {order.items.map((item, idx) => (
                                                <li key={idx}>Item ID: {item.itemId} (Qty: {item.qty})</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
                                        Rp {order.totalAmount.toLocaleString('id-ID')}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <button
                                        className="btn"
                                        style={{ fontSize: '0.8rem', border: '1px solid var(--border)', flex: 1 }}
                                        onClick={() => setSelectedLabelOrder(order)}
                                    >
                                        🖨️ Label
                                    </button>

                                    {NEXT_STATUS[order.status] && (
                                        <button
                                            className="btn btn-primary"
                                            style={{ fontSize: '0.8rem', flex: 1.5 }}
                                            onClick={() => handleStatusClick(order)}
                                        >
                                            Next: {NEXT_STATUS[order.status]} &rarr;
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {selectedLabelOrder && (
                <LabelModal
                    order={selectedLabelOrder}
                    onClose={() => setSelectedLabelOrder(null)}
                />
            )}

            <TechnicianAssignmentModal
                isOpen={isTechModalOpen}
                onClose={() => setIsTechModalOpen(false)}
                onConfirm={handleTechnicianConfirm}
            />

            <OrderImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />

            <EditOrderModal
                order={editingOrder}
                isOpen={!!editingOrder}
                onClose={() => setEditingOrder(null)}
                onSave={updateOrder}
            />

            <CreateOrderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
