"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Supplier, PurchaseOrder, POStatus } from '../types/procurement';
import { useInventory } from './InventoryContext';
import { useExpense } from './ExpenseContext';
import { procurementService } from '../services/firebase/procurementService';

interface ProcurementContextType {
    suppliers: Supplier[];
    addSupplier: (s: Omit<Supplier, 'id'>) => Promise<void>;
    deleteSupplier: (id: string) => Promise<void>;

    purchaseOrders: PurchaseOrder[];
    createPO: (po: Omit<PurchaseOrder, 'id' | 'status' | 'poNumber'>) => Promise<void>;
    updatePOStatus: (id: string, status: POStatus) => Promise<void>;
    receivePO: (id: string) => Promise<void>; // Special logic: Add Stock + Add Expense
    isLoading: boolean;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

const INITIAL_SUPPLIERS_SEED: Omit<Supplier, 'id'>[] = [
    { name: 'Toko Kaca Maju Jaya', contactPerson: 'Pak Budi', phone: '08123456789', address: 'Jl. Raya Bogor No 1' },
    { name: 'Distributor Alumindo', contactPerson: 'Bu Siska', phone: '08987654321', address: 'Kawasan Industri Pulo Gadung' },
];

export function ProcurementProvider({ children }: { children: ReactNode }) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { updateStock } = useInventory();
    const { addExpense } = useExpense();

    useEffect(() => {
        // Subscribe
        const unsubSuppliers = procurementService.subscribeSuppliers(setSuppliers);
        const unsubPOs = procurementService.subscribePOs((data) => {
            setPurchaseOrders(data);
            setIsLoading(false);
        });

        // Seed
        const checkAndSeed = async () => {
            try {
                await procurementService.seedInitialSuppliers(INITIAL_SUPPLIERS_SEED);
            } catch (error) {
                console.error("Procurement Seeding Failed", error);
            }
        };
        checkAndSeed();

        return () => {
            unsubSuppliers();
            unsubPOs();
        };
    }, []);

    const addSupplier = async (s: Omit<Supplier, 'id'>) => {
        await procurementService.addSupplier(s);
    };

    const deleteSupplier = async (id: string) => {
        await procurementService.deleteSupplier(id);
    };

    const createPO = async (poData: Omit<PurchaseOrder, 'id' | 'status' | 'poNumber'>) => {
        // Generate Auto Number based on current local count (might have race condition in high concurrency but ok for now)
        const poNumber = `PO/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${purchaseOrders.length + 1}`;
        const newPO: PurchaseOrder = {
            ...poData,
            id: `po-${Date.now()}`,
            status: 'Sent', // Default to sent for simplicity
            poNumber
        };
        await procurementService.createPO(newPO);
    };

    const updatePOStatus = async (id: string, status: POStatus) => {
        await procurementService.updatePOStatus(id, status);
    };

    const receivePO = async (id: string) => {
        const po = purchaseOrders.find(p => p.id === id);
        if (!po || po.status === 'Received') return;

        // 1. Update Inventory (Async)
        // We use map to trigger all updates, but since updateStock is a Promise based on InventoryContext change...
        // Wait, useInventory updateStock is now async in our previous refactor? Yes.
        for (const item of po.items) {
            await updateStock(item.inventoryId, item.qty);
        }

        // 2. Add Expense
        // NOTE: Expense is NOT yet migrated to Firebase. 
        // This call goes to ExpenseContext which might still be local.
        // We will migrate Expense next.
        addExpense({
            date: new Date().toISOString().split('T')[0],
            category: 'Lainnya',
            description: `Pembelian Stok via ${po.poNumber} (${po.supplierName})`,
            amount: po.totalAmount
        });

        // 3. Update Status
        await updatePOStatus(id, 'Received');
    };

    return (
        <ProcurementContext.Provider value={{
            suppliers, addSupplier, deleteSupplier,
            purchaseOrders, createPO, updatePOStatus, receivePO,
            isLoading
        }}>
            {children}
        </ProcurementContext.Provider>
    );
}

export function useProcurement() {
    const context = useContext(ProcurementContext);
    if (context === undefined) {
        throw new Error('useProcurement must be used within a ProcurementProvider');
    }
    return context;
}
