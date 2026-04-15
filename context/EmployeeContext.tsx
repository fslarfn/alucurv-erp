"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, Attendance, PayrollRecord } from '../types/employee';
import { employeeService } from '../services/firebase/employeeService';

interface EmployeeContextType {
    employees: Employee[];
    addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
    updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;

    attendance: Attendance[];
    recordAttendance: (record: Omit<Attendance, 'id'>) => Promise<void>;

    payrollHistory: PayrollRecord[];
    generatePayroll: (employeeId: string, period: string) => Promise<PayrollRecord>;
    isLoading: boolean;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Mock Data for Seeding
const MOCK_EMPLOYEES_SEED: Omit<Employee, 'id'>[] = [
    {
        name: 'Budi Santoso', role: 'Tukang Rakit',
        baseSalary: 3500000, mealAllowance: 25000, productionRate: 15000,
        bpjsKesehatan: 50000, bpjsKetenagakerjaan: 70000, joinedDate: '2025-01-10'
    },
    {
        name: 'Siti Aminah', role: 'Admin',
        baseSalary: 3000000, mealAllowance: 20000, productionRate: 0,
        bpjsKesehatan: 50000, bpjsKetenagakerjaan: 70000, joinedDate: '2025-02-01'
    },
];

export function EmployeeProvider({ children }: { children: ReactNode }) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Subscribe to all 3 collections
        const unsubEmp = employeeService.subscribeEmployees((data) => setEmployees(data));
        const unsubAtt = employeeService.subscribeAttendance((data) => setAttendance(data));
        const unsubPay = employeeService.subscribePayrolls((data) => {
            setPayrollHistory(data);
            setIsLoading(false); // Assume loaded when last one returns
        });

        // Auto-Seed
        const checkAndSeed = async () => {
            try {
                await employeeService.seedInitialEmployees(MOCK_EMPLOYEES_SEED);
            } catch (e) {
                console.error("Employee Seeding Error", e);
            }
        };
        checkAndSeed();

        return () => {
            unsubEmp();
            unsubAtt();
            unsubPay();
        };
    }, []);

    const addEmployee = async (emp: Omit<Employee, 'id'>) => {
        await employeeService.addEmployee(emp);
    };

    const updateEmployee = async (id: string, updates: Partial<Employee>) => {
        await employeeService.updateEmployee(id, updates);
    };

    const deleteEmployee = async (id: string) => {
        await employeeService.deleteEmployee(id);
    };

    const recordAttendance = async (record: Omit<Attendance, 'id'>) => {
        await employeeService.addAttendance(record);
    };

    const generatePayroll = async (employeeId: string, period: string): Promise<PayrollRecord> => {
        const emp = employees.find(e => e.id === employeeId);
        if (!emp) throw new Error("Employee not found");

        const periodAttendance = attendance.filter(a => a.employeeId === employeeId && a.date.startsWith(period));

        const attendanceDays = periodAttendance.length;
        const overtimeDays = periodAttendance.filter(a => a.isOvertime).length;

        // Logic Gaji Harian untuk Lembur: Base / 25
        const dailyRate = emp.baseSalary / 25;
        const overtimePay = overtimeDays * dailyRate;

        // Logic Production Pay (Placeholder until linked with Orders)
        const productionCount = 0;
        const productionPay = productionCount * emp.productionRate;

        const mealAllowanceTotal = attendanceDays * emp.mealAllowance;

        const grossSalary = emp.baseSalary + mealAllowanceTotal + overtimePay + productionPay;

        const deductions = {
            bpjsKesehatan: emp.bpjsKesehatan,
            bpjsKetenagakerjaan: emp.bpjsKetenagakerjaan,
            kasbon: 0 // Placeholder
        };

        const totalDeductions = deductions.bpjsKesehatan + deductions.bpjsKetenagakerjaan + deductions.kasbon;
        const netSalary = grossSalary - totalDeductions;

        const record: PayrollRecord = {
            id: `pay-${employeeId}-${period}`,
            employeeId,
            period,
            baseSalary: emp.baseSalary,
            attendanceDays,
            mealAllowanceTotal,
            overtimeDays,
            overtimePay,
            productionCount,
            productionPay,
            grossSalary,
            deductions,
            netSalary,
            generatedAt: new Date().toISOString()
        };

        await employeeService.savePayroll(record);
        return record;
    };

    return (
        <EmployeeContext.Provider value={{
            employees, addEmployee, updateEmployee, deleteEmployee,
            attendance, recordAttendance,
            payrollHistory, generatePayroll,
            isLoading
        }}>
            {children}
        </EmployeeContext.Provider>
    );
}

export function useEmployee() {
    const context = useContext(EmployeeContext);
    if (context === undefined) {
        throw new Error('useEmployee must be used within an EmployeeProvider');
    }
    return context;
}
