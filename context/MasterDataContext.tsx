"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MaterialPrice, PackingCost, DEFAULT_PACKING_COSTS } from '../types/masterData';

interface MasterDataContextType {
    materials: MaterialPrice[];
    packingCosts: PackingCost[];
    updateMaterialPrice: (id: string, newPrice: number) => void;
    updatePackingCost: (category: PackingCost['category'], newPrice: number) => void;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_MATERIALS: MaterialPrice[] = [
    { id: 'mat-1', name: 'Aluminium Hollow 1x1', category: 'Aluminium', unit: 'batang', price: 65000 },
    { id: 'mat-2', name: 'Kaca Cermin 3mm', category: 'Kaca', unit: 'm2', price: 125000 },
    { id: 'mat-3', name: 'Kaca Cermin 5mm', category: 'Kaca', unit: 'm2', price: 185000 },
    { id: 'mat-4', name: 'Lampu LED Strip', category: 'Aksesoris', unit: 'm', price: 15000 },
    { id: 'mat-5', name: 'Trafo/Adaptor', category: 'Aksesoris', unit: 'pcs', price: 45000 },
];

export function MasterDataProvider({ children }: { children: ReactNode }) {
    const [materials, setMaterials] = useState<MaterialPrice[]>(INITIAL_MATERIALS);
    const [packingCosts, setPackingCosts] = useState<PackingCost[]>(DEFAULT_PACKING_COSTS);

    const updateMaterialPrice = (id: string, newPrice: number) => {
        setMaterials(prev => prev.map(m => m.id === id ? { ...m, price: newPrice } : m));
    };

    const updatePackingCost = (category: PackingCost['category'], newPrice: number) => {
        setPackingCosts(prev => prev.map(p => p.category === category ? { ...p, price: newPrice } : p));
    };

    return (
        <MasterDataContext.Provider value={{ materials, packingCosts, updateMaterialPrice, updatePackingCost }}>
            {children}
        </MasterDataContext.Provider>
    );
}

export function useMasterData() {
    const context = useContext(MasterDataContext);
    if (context === undefined) {
        throw new Error('useMasterData must be used within a MasterDataProvider');
    }
    return context;
}
