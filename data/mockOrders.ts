import { Order } from "../types/order";

export const mockOrders: Order[] = [
    {
        id: 'ORD-001',
        invoice: 'INV/2026/02/001',
        customer: {
            name: 'Budi Santoso',
            address: 'Jl. Merdeka No. 10, Jakarta',
            phone: '08123456789'
        },
        expedition: 'Sentral Cargo',
        status: 'Pesanan Masuk',
        date: '2026-02-10',
        items: [
            { itemId: '1', qty: 2 }, // Reduces stock of Kaca Cermin (ID 1) by 2
            { itemId: '4', qty: 1 }
        ],
        totalAmount: 1500000
    },
    {
        id: 'ORD-002',
        invoice: 'INV/2026/02/002',
        customer: {
            name: 'Citra Lestari',
            address: 'Jl. Sudirman No. 45, Bandung',
            phone: '08987654321'
        },
        expedition: 'J&T Cargo',
        status: 'Siap Kirim',
        date: '2026-02-09',
        items: [
            { itemId: '2', qty: 1 }
        ],
        totalAmount: 750000
    }
];
