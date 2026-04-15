export type EmployeeRole = 'Admin' | 'Tukang Rakit' | 'Tukang Bending' | 'Helper';

export interface Employee {
    id: string;
    name: string;
    role: EmployeeRole;
    baseSalary: number; // Gaji Pokok
    mealAllowance: number; // Uang Makan per hari
    productionRate: number; // Upah per unit (Borongan)
    bpjsKesehatan: number; // Nominal potongan tetap
    bpjsKetenagakerjaan: number; // Nominal potongan tetap
    joinedDate: string;
}

export interface Attendance {
    id: string;
    employeeId: string;
    date: string; // ISO Date YYYY-MM-DD
    checkIn: string; // HH:mm
    checkOut: string; // HH:mm
    isOvertime: boolean;
    overtimeDuration: number; // jam (opsional, jika perhitungan per jam) OR hari (1)
}

export interface PayrollRecord {
    id: string;
    employeeId: string;
    period: string; // YYYY-MM
    baseSalary: number;
    attendanceDays: number; // Jumlah hari hadir
    mealAllowanceTotal: number;
    overtimeDays: number; // Jumlah hari lembur
    overtimePay: number;
    productionCount: number; // Jumlah unit yang dikerjakan
    productionPay: number; // Total upah borongan
    grossSalary: number;
    deductions: {
        bpjsKesehatan: number;
        bpjsKetenagakerjaan: number;
        kasbon: number;
    };
    netSalary: number;
    generatedAt: string;
}
