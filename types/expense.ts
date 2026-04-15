export type ExpenseCategory = 'Listrik' | 'Sewa' | 'Alat Kerja' | 'Gaji Non-Produksi' | 'Lainnya';

export interface Expense {
    id: string;
    date: string;
    description: string;
    category: ExpenseCategory;
    amount: number;
}
