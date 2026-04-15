export interface MaterialPrice {
    id: string;
    name: string;
    category: 'Aluminium' | 'Kaca' | 'Aksesoris' | 'Lainnya';
    unit: string; // e.g., 'm', 'batang', 'lembar'
    price: number;
}

export interface PackingCost {
    category: 'Kecil' | 'Sedang' | 'Besar';
    minDiameter: number; // cm
    maxDiameter: number; // cm
    price: number;
}

// Default Constants
export const DEFAULT_PACKING_COSTS: PackingCost[] = [
    { category: 'Kecil', minDiameter: 0, maxDiameter: 60, price: 15000 },
    { category: 'Sedang', minDiameter: 61, maxDiameter: 90, price: 25000 },
    { category: 'Besar', minDiameter: 91, maxDiameter: 999, price: 50000 },
];
