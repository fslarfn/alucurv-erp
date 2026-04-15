"use client";

import { Order } from '../types/order';

interface LabelModalProps {
    order: Order | null;
    onClose: () => void;
}

export default function LabelModal({ order, onClose }: LabelModalProps) {
    if (!order) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
                <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Label Pengiriman</h2>

                <div id="print-area" style={{ border: '2px dashed #333', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>KEPADA:</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{order.customer.name}</div>
                    <div style={{ margin: '0.5rem 0' }}>{order.customer.address}</div>
                    <div style={{ fontWeight: 'bold' }}>Telp: {order.customer.phone}</div>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{order.expedition}</span>
                        <span>{order.invoice}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button className="btn" onClick={onClose}>Tutup</button>
                    <button className="btn btn-primary" onClick={handlePrint}>Cetak Sekarang</button>
                </div>
            </div>

            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 2px solid black !important;
          }
        }
      `}</style>
        </div>
    );
}
