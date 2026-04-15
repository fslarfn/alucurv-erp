"use client";

import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { useInventory } from '../context/InventoryContext';
import { Order, OrderStatus } from '../types/order';

interface OrderImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OrderImportModal({ isOpen, onClose }: OrderImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [skipDuplicates, setSkipDuplicates] = useState(true); // Default to skip
    const { importOrder, orders } = useOrder(); // Get existing orders to check dupes

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            parseCSV(e.target.files[0]);
        }
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            const lines = text.split(/\r?\n/); // Handle various newlines

            // Robust CSV Line Parser (Handles quotes and commas inside quotes)
            const parseLine = (line: string) => {
                const result = [];
                let current = '';
                let inQuote = false;

                for (let i = 0; i < line.length; i++) {
                    const char = line[i];

                    if (char === '"') {
                        // Handle escaped quotes ("") or toggle quote mode
                        if (i + 1 < line.length && line[i + 1] === '"') {
                            current += '"';
                            i++; // Skip next quote
                        } else {
                            inQuote = !inQuote;
                        }
                    } else if (char === ',' && !inQuote) {
                        result.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim());
                return result;
            };

            // 1. Parse All Lines First
            const parsedLines = lines.map(line => parseLine(line)).filter(row => row.length > 0);

            if (parsedLines.length < 2) return; // Need header + data

            // 2. Analyze Header to find Indices
            const header = parsedLines[0].map(c => c.toLowerCase());

            const getIndex = (keywords: string[]) => header.findIndex(h => keywords.some(k => h.includes(k)));

            const idxName = getIndex(['nama', 'customer', 'pelanggan']);
            const idxDesc = getIndex(['deskripsi', 'detail', 'item', 'produk']);
            const idxNominal = getIndex(['nominal', 'harga', 'amount', 'total', 'price', 'rp']);
            const idxDate = getIndex(['tanggal', 'date', 'tgl']);
            // Status columns - check for specific headers
            const idxSelesai = getIndex(['sampai', 'selesai', 'finish']);
            const idxKirim = getIndex(['dikirim', 'kirim', 'delivery']);
            const idxProduksi = getIndex(['produksi', 'proses']);
            const idxRakit = getIndex(['rakit', 'assembly']);

            // Fallback indices if headers not found (User's specific legacy format fallback)
            // User Format: Tanggal | Nama | Deskripsi | Deadline | Nominal
            const mapName = idxName > -1 ? idxName : 1;
            const mapDesc = idxDesc > -1 ? idxDesc : 2;
            const mapNominal = idxNominal > -1 ? idxNominal : 4;
            const mapDate = idxDate > -1 ? idxDate : 0;

            const parsed = [];

            for (let i = 1; i < parsedLines.length; i++) {
                const cols = parsedLines[i];
                if (cols.length < 3) continue;

                // Extraction
                let name = cols[mapName] || '-';
                let desc = cols[mapDesc] || '-';
                let nominalStr = cols[mapNominal] || '0';
                let dateStr = cols[mapDate] || new Date().toISOString().split('T')[0];

                // Clean Currency
                // Remove decimals first if standard format (e.g. ,00 or .00 at end)
                // Heuristic: if ends with ,00 or .00, remove it.
                nominalStr = nominalStr.replace(/[,.]00$/, '');
                // Remove non-digits
                const totalAmount = parseInt(nominalStr.replace(/[^0-9]/g, '')) || 0;

                // Cleanup Desc
                desc = desc.replace(/^"|"$/g, '').replace(/""/g, '"');

                // Logic Status
                let status: OrderStatus = 'Pesanan Masuk';

                const isChecked = (idx: number) => idx > -1 && cols[idx] && (cols[idx].toLowerCase() === 'true' || cols[idx] === '1' || cols[idx].toLowerCase() === 'v' || cols[idx] === '✓');

                if (isChecked(idxSelesai)) status = 'Selesai';
                else if (isChecked(idxKirim)) status = 'Siap Kirim';
                else if (isChecked(idxProduksi) || isChecked(idxRakit)) status = 'Diproduksi';

                // Handle Date Parsing if basic conversion needed (User uses 7-Jul-2025)
                // We keep raw string for now or try to standardize? 
                // System uses YYYY-MM-DD.
                // Let's try to parse "7-Jul-2025" -> "2025-07-07"
                // Simple parser for standard formats:
                try {
                    const d = new Date(dateStr);
                    if (!isNaN(d.getTime())) {
                        dateStr = d.toISOString().split('T')[0];
                    }
                } catch (e) {
                    // keep original string or fallback to today
                }

                // CHECK DUPLICATE
                const isDuplicate = orders.some(o =>
                    o.customer.name.toLowerCase() === name.toLowerCase() &&
                    Math.abs(o.totalAmount - totalAmount) < 100
                );

                parsed.push({
                    tempId: Math.random().toString(),
                    customerName: name,
                    description: desc,
                    date: dateStr,
                    totalAmount,
                    status,
                    isDuplicate,
                    raw: lines[i] // maps to original raw line not strictly correct line index if parsedLines filtered, but okay for key
                });
            }
            setPreviewData(parsed);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        setIsProcessing(true);
        try {
            let processedCount = 0;
            let skippedCount = 0;

            for (const item of previewData) {
                if (skipDuplicates && item.isDuplicate) {
                    skippedCount++;
                    continue;
                }

                const newOrder: Omit<Order, 'id'> = {
                    invoice: `INV/IMP/${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    customer: {
                        name: item.customerName,
                        address: '-', // Placeholder
                        phone: '-' // Placeholder
                    },
                    expedition: '-',
                    status: item.status,
                    date: new Date().toISOString().split('T')[0], // Use current date for system, or item.date if valid
                    items: [], // Legacy items have no structured inventory link
                    totalAmount: item.totalAmount,
                    legacyDescription: item.description
                };

                await importOrder(newOrder);
                processedCount++;
            }
            alert(`Selesai! Berhasil import ${processedCount} pesanan. (${skippedCount} dilewati karena duplikat)`);
            onClose();
            // window.location.reload(); // No reload needed with context
        } catch (error) {
            console.error("Import failed", error);
            alert("Gagal import. Cek console.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '900px', width: '95%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Import Order dari CSV</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f0f9ff', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ margin: 0 }}><strong>Tips:</strong> Sistem otomatis mendeteksi format CSV Anda. Pastikan ada kolom <strong>Nama, Deskripsi, Nominal</strong>.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <input type="file" accept=".csv" onChange={handleFileChange} />

                    {previewData.some(d => d.isDuplicate) && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: '#fff7ed', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #fdba74' }}>
                            <input
                                type="checkbox"
                                checked={skipDuplicates}
                                onChange={e => setSkipDuplicates(e.target.checked)}
                            />
                            <span style={{ color: '#c2410c', fontWeight: '500' }}>Lewati {previewData.filter(d => d.isDuplicate).length} Data Duplikat?</span>
                        </label>
                    )}
                </div>

                {previewData.length > 0 && (
                    <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                                <tr>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Nama</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Deskripsi</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Nominal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row) => (
                                    <tr key={row.tempId} style={{ background: row.isDuplicate ? '#fff1f2' : 'white', opacity: (row.isDuplicate && skipDuplicates) ? 0.5 : 1 }}>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                            {row.isDuplicate ? (
                                                <span style={{ color: '#e11d48', fontWeight: 'bold', fontSize: '0.75rem', border: '1px solid #e11d48', padding: '2px 6px', borderRadius: '4px' }}>DUPLIKAT</span>
                                            ) : (
                                                <span className={`badge badge-${getStatusColorBadge(row.status)}`}>{row.status}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', fontWeight: '500' }}>{row.customerName}</td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', maxWidth: '300px' }}>{row.description}</td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>Rp {row.totalAmount.toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn" onClick={onClose} disabled={isProcessing}>Batal</button>
                    <button className="btn btn-primary" onClick={handleImport} disabled={!file || isProcessing || previewData.length === 0}>
                        {isProcessing ? 'Memproses...' : `Import (${previewData.length - (skipDuplicates ? previewData.filter(d => d.isDuplicate).length : 0)} Data)`}
                    </button>
                </div>
            </div>
        </div>
    );
}

function getStatusColorBadge(status: OrderStatus) {
    switch (status) {
        case 'Pesanan Masuk': return 'secondary';
        case 'Diproduksi': return 'warning';
        case 'Siap Kirim': return 'primary';
        case 'Selesai': return 'success';
        default: return 'secondary';
    }
}
