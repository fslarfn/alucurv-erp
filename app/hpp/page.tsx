"use client";

import { useState } from 'react';
import { useMasterData } from '../../context/MasterDataContext';

export default function HppPage() {
    const { materials, packingCosts } = useMasterData();

    // State
    const [diameter, setDiameter] = useState<number>(0);
    const [qty, setQty] = useState<number>(1);
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || '');
    const [biayaJasa, setBiayaJasa] = useState<number>(50000); // Default placeholder
    const [marginPercent, setMarginPercent] = useState<number>(30);
    const [marketplaceFeePercent, setMarketplaceFeePercent] = useState<number>(10);

    // Derived Logic
    const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

    // 1. Hitung Keliling (Circumference) -> Rumus: pi * d
    // Output dalam meter lari (m1) karena harga material biasanya per batang/meter
    const circumferenceCm = Math.PI * diameter;
    const circumferenceM = circumferenceCm / 100;

    // Estimasi pemakaian bahan (misal waste 10%)
    const materialUsageM = circumferenceM * 1.1;

    // Harga Material
    // Asumsi harga di Master Data adalah per "batang" (6m) atau per "meter".
    // Kita buat logic sederhana: Jika unit 'batang', kita asumsikan panjang 6m.
    let materialCostPerUnit = 0;
    if (selectedMaterial) {
        if (selectedMaterial.unit === 'batang') {
            const pricePerMeter = selectedMaterial.price / 6; // Asumsi batang 6m
            materialCostPerUnit = materialUsageM * pricePerMeter;
        } else if (selectedMaterial.unit === 'm' || selectedMaterial.unit === 'm2') {
            materialCostPerUnit = materialUsageM * selectedMaterial.price;
        } else {
            materialCostPerUnit = selectedMaterial.price; // Pcs
        }
    }

    // 2. Biaya Packing Dinamis
    const packingCostObj = packingCosts.find(p => diameter >= p.minDiameter && diameter <= p.maxDiameter);
    const packingCost = packingCostObj ? packingCostObj.price : 0;
    const packingCategory = packingCostObj ? packingCostObj.category : 'Custom';

    // Total Kalkulasi
    const totalMaterialCost = materialCostPerUnit * qty;
    const totalJasa = biayaJasa * qty;
    const totalOverhead = packingCost * qty; // Packing masuk overhead produksi

    const hppTotal = totalMaterialCost + totalJasa + totalOverhead;
    const hppPerUnit = hppTotal / qty;

    // Harga Jual
    const desiredMarginAmount = hppTotal * (marginPercent / 100);
    const priceBeforeFee = hppTotal + desiredMarginAmount;

    // Fee Marketplace (e.g. Tokopedia charged on Gross Price)
    // PriceFinal = PriceBeforeFee + (PriceFinal * Fee%)
    // PriceFinal * (1 - Fee%) = PriceBeforeFee
    // PriceFinal = PriceBeforeFee / (1 - Fee%)

    const recommendedPrice = priceBeforeFee / (1 - (marketplaceFeePercent / 100));
    const marketplaceFeeAmount = recommendedPrice * (marketplaceFeePercent / 100);

    const netProfit = recommendedPrice - hppTotal - marketplaceFeeAmount;

    const formatMoney = (val: number) => `Rp ${Math.round(val).toLocaleString('id-ID')}`;

    return (
        <div style={{ padding: '0 1rem' }}>
            <div className="glass glass-panel">
                <h1>Kalkulator HPP Smart (Logika Produksi)</h1>
                <p>Hitung HPP presisi dengan rumus Diameter, Packing Variabel, dan Master Data Bahan.</p>
            </div>

            <div className="dashboard-grid">
                {/* Input Section */}
                <div className="glass glass-panel">
                    <h2>Input Variabel</h2>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Material Utama</label>
                        <select
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={selectedMaterialId}
                            onChange={e => setSelectedMaterialId(e.target.value)}
                        >
                            {materials.map(m => (
                                <option key={m.id} value={m.id}>{m.name} (@ {formatMoney(m.price)}/{m.unit})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Diameter (cm)</label>
                            <input
                                type="number" min="0" placeholder="Contoh: 60"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                value={diameter || ''}
                                onChange={e => setDiameter(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Jumlah (Qty)</label>
                            <input
                                type="number" min="1"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                value={qty}
                                onChange={e => setQty(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>Rumus Produksi (Auto):</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            <span>Keliling (Bahan Potong):</span>
                            <span>{circumferenceCm.toFixed(1)} cm</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                            <span>Kategori Packing:</span>
                            <span className="badge badge-warning">{packingCategory} ({formatMoney(packingCost)})</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Biaya Jasa (Rakit/Bending)</label>
                            <input
                                type="number" min="0"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                value={biayaJasa}
                                onChange={e => setBiayaJasa(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Margin Profit (%)</label>
                            <input
                                type="number" min="0"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                value={marginPercent}
                                onChange={e => setMarginPercent(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Fee Marketplace (%)</label>
                        <input
                            type="number" min="0"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={marketplaceFeePercent}
                            onChange={e => setMarketplaceFeePercent(Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* Result Section */}
                <div className="glass glass-panel" style={{ background: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem' }}>Hasil Perhitungan</h2>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8' }}>Material (Subtotal):</span>
                            <span>{formatMoney(totalMaterialCost)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8' }}>Biaya Jasa:</span>
                            <span>{formatMoney(totalJasa)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8' }}>Packing ({packingCategory}):</span>
                            <span>{formatMoney(totalOverhead)}</span>
                        </div>

                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.2)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', color: '#fbbf24', fontWeight: 'bold' }}>
                            <span>HPP TOTAL:</span>
                            <span>{formatMoney(hppTotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: '#94a3b8' }}>HPP Satuan:</span>
                            <span>{formatMoney(hppPerUnit)}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}>
                            <span>Potongan Marketplace:</span>
                            <span>- {formatMoney(marketplaceFeeAmount)}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Rekomendasi Harga Jual</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2dd4bf' }}>{formatMoney(recommendedPrice)}</div>

                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem' }}>Est. Net Profit</span>
                            <span style={{ fontWeight: 'bold', color: '#4ade80', fontSize: '1.2rem' }}>{formatMoney(netProfit)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
