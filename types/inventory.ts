export type StockStatus = 'AMAN' | 'MENIPIS' | 'BUAT LAGI';

export interface InventoryItem {
    id: string;
    category: string; // e.g., 'Kaca', 'Aluminium', 'Aksesoris'
    name: string; // e.g., 'Kaca Hitam 5mm'
    variant: string; // e.g., 'Hitam Doff', 'Putih'
    size: string; // e.g., '100x200', 'Diameter 50'
    stock: number;
    unit: string; // e.g., 'lembar', 'batang', 'pcs'
    minStock: number; // Threshold for 'MENIPIS' (usually 2)
}

export const getStockStatus = (stock: number, minStock: number = 2): StockStatus => {
    if (stock === 0) return 'BUAT LAGI';
    if (stock <= minStock) return 'MENIPIS';
    return 'AMAN';
};

export const getStatusColor = (status: StockStatus): string => {
    switch (status) {
        case 'AMAN': return 'success';
        case 'MENIPIS': return 'warning';
        case 'BUAT LAGI': return 'danger';
    }
};
