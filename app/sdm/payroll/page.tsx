"use client";

import { useState } from 'react';
import { useEmployee } from '../../../context/EmployeeContext';
import { PayrollRecord } from '../../../types/employee';

export default function PayrollPage() {
    const { employees, generatePayroll, payrollHistory } = useEmployee();
    const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [generatedRecord, setGeneratedRecord] = useState<PayrollRecord | null>(null);

    const handleGenerate = async (id: string) => {
        try {
            const record = await generatePayroll(id, period);
            setGeneratedRecord(record);
        } catch (error) {
            console.error("Error generating payroll:", error);
            alert("Gagal generate slip gaji");
        }
    };

    const formatMoney = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

    return (
        <div style={{ padding: '0 1rem' }}>
            <div className="glass glass-panel">
                <h1>Penggajian (Payroll)</h1>
                <p>Generate slip gaji otomatis berdasarkan absensi dan produksi.</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label>Periode:</label>
                    <input
                        type="month"
                        value={period}
                        onChange={e => setPeriod(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Employee List */}
                <div className="glass glass-panel">
                    <h3>Pilih Karyawan</h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        {employees.map(emp => (
                            <li key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                                <div>
                                    <div style={{ fontWeight: '500' }}>{emp.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{emp.role}</div>
                                </div>
                                <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => handleGenerate(emp.id)}>
                                    Hitung Gaji
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Slip Preview */}
                <div className="glass glass-panel">
                    {generatedRecord ? (
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem' }}>
                                <h2 style={{ color: 'var(--primary)', marginBottom: 0 }}>SLIP GAJI</h2>
                                <p style={{ fontSize: '0.9rem' }}>Periode: {generatedRecord.period}</p>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{employees.find(e => e.id === generatedRecord.employeeId)?.name}</div>
                                <div style={{ color: 'var(--secondary)' }}>ID: {generatedRecord.employeeId}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ color: 'var(--success)', marginBottom: '1rem' }}>PENERIMAAN</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Gaji Pokok</span>
                                        <span>{formatMoney(generatedRecord.baseSalary)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Tunj. Makan ({generatedRecord.attendanceDays} hari)</span>
                                        <span>{formatMoney(generatedRecord.mealAllowanceTotal)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Lembur ({generatedRecord.overtimeDays} hari)</span>
                                        <span>{formatMoney(generatedRecord.overtimePay)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Upah Produksi ({generatedRecord.productionCount} unit)</span>
                                        <span>{formatMoney(generatedRecord.productionPay)}</span>
                                    </div>
                                    <hr style={{ margin: '1rem 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>Total Kotor</span>
                                        <span>{formatMoney(generatedRecord.grossSalary)}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>POTONGAN</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>BPJS Kesehatan</span>
                                        <span>{formatMoney(generatedRecord.deductions.bpjsKesehatan)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>BPJS Ketenagakerjaan</span>
                                        <span>{formatMoney(generatedRecord.deductions.bpjsKetenagakerjaan)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Kasbon</span>
                                        <span>{formatMoney(generatedRecord.deductions.kasbon)}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '8px', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>TAKE HOME PAY</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                    {formatMoney(generatedRecord.netSalary)}
                                </div>
                            </div>

                            <button className="btn" style={{ marginTop: '2rem', width: '100%' }} onClick={() => window.print()}>
                                🖨️ Cetak / Download PDF
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--secondary)' }}>
                            Pilih karyawan untuk melihat slip gaji.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

