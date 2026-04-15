"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense } from '../types/expense';
import { expenseService } from '../services/firebase/expenseService';

interface ExpenseContextType {
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    totalExpenses: number;
    isLoading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const INITIAL_EXPENSES_SEED: Omit<Expense, 'id'>[] = [
    { date: '2026-02-01', description: 'Token Listrik Workshop', category: 'Listrik', amount: 500000 },
    { date: '2026-02-05', description: 'Beli Mata Bor & Lem', category: 'Alat Kerja', amount: 150000 },
];

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Subscribe
        const unsubscribe = expenseService.subscribeExpenses((data) => {
            setExpenses(data);
            setIsLoading(false);
        });

        // Seed
        const checkAndSeed = async () => {
            try {
                await expenseService.seedInitialData(INITIAL_EXPENSES_SEED);
            } catch (error) {
                console.error("Expense Seeding Failed", error);
            }
        };
        checkAndSeed();

        return () => unsubscribe();
    }, []);

    const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
        await expenseService.addExpense(newExpense);
    };

    const deleteExpense = async (id: string) => {
        await expenseService.deleteExpense(id);
    };

    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    return (
        <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense, totalExpenses, isLoading }}>
            {children}
        </ExpenseContext.Provider>
    );
}

export function useExpense() {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error('useExpense must be used within a ExpenseProvider');
    }
    return context;
}
