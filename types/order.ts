export type OrderStatus = 'Pesanan Masuk' | 'Diproduksi' | 'Siap Kirim' | 'Selesai';

export interface OrderItem {
    itemId: string;
    qty: number;
}

export interface Customer {
    name: string;
    address: string;
    phone: string;
}

export interface Order {
    id: string;
    invoice: string;
    customer: {
        name: string;
        address: string;
        phone: string;
    };
    expedition: string;
    status: OrderStatus;
    date: string;
    items: OrderItem[]; // Items to reduce from inventory
    totalAmount: number;
    technicianIds?: string[]; // Array of technician IDs
    technicianId?: string; // KEEP FOR BACKWARD COMPATIBILITY during migration
    legacyDescription?: string; // For imported data from spreadsheet
}

export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
    'Pesanan Masuk': 'Diproduksi',
    'Diproduksi': 'Siap Kirim',
    'Siap Kirim': 'Selesai',
    'Selesai': null
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
    'Pesanan Masuk': 'secondary',
    'Diproduksi': 'warning',
    'Siap Kirim': 'primary',
    'Selesai': 'success'
};
