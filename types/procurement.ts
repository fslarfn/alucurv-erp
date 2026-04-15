export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    address: string;
}

export interface POItem {
    inventoryId: string; // Link to Inventory Item
    itemName: string;    // Snapshot name
    qty: number;
    unit: string;
    pricePerUnit: number;
    total: number;
}

export type POStatus = 'Draft' | 'Sent' | 'Received' | 'Cancelled';

export interface PurchaseOrder {
    id: string;
    poNumber: string; // e.g., PO/2026/02/001
    supplierId: string;
    supplierName: string;
    date: string;
    status: POStatus;
    items: POItem[];
    totalAmount: number;
    notes?: string;
}
