import { InventoryItem } from "../types/inventory";

export const mockInventory: InventoryItem[] = [
    {
        id: '1',
        category: 'Kaca',
        name: 'Kaca Cermin',
        variant: 'Silver',
        size: 'Diameter 40cm',
        stock: 5,
        unit: 'pcs',
        minStock: 2
    },
    {
        id: '2',
        category: 'Kaca',
        name: 'Kaca Cermin',
        variant: 'Silver',
        size: 'Diameter 50cm',
        stock: 2,
        unit: 'pcs',
        minStock: 2
    },
    {
        id: '3',
        category: 'Kusnen',
        name: 'Kusen Aluminium',
        variant: 'Hitam Doff',
        size: '3 inch',
        stock: 0,
        unit: 'batang',
        minStock: 5
    },
    {
        id: '4',
        category: 'Aksesoris',
        name: 'Gantungan',
        variant: 'Standard',
        size: '-',
        stock: 15,
        unit: 'pcs',
        minStock: 5
    },
    {
        id: '5',
        category: 'Backing',
        name: 'Triplek',
        variant: 'Melamin',
        size: '122x244',
        stock: 1,
        unit: 'lembar',
        minStock: 3
    }
];
