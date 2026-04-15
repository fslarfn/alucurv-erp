"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem } from '../types/inventory';
import { inventoryService } from '../services/firebase/inventoryService';
import { mockInventory } from '../data/mockInventory';

interface InventoryContextType {
    items: InventoryItem[];
    updateStock: (id: string, delta: number) => Promise<void>;
    reduceStockForOrder: (orderItems: { itemId: string, qty: number }[]) => Promise<void>;
    isLoading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Data Fetch & Subscription
    useEffect(() => {
        // 1. Subscribe to Realtime Updates
        const unsubscribe = inventoryService.subscribe((newItems) => {
            setItems(newItems);
            setIsLoading(false);
        });

        // 2. Check for Seeding (One-off check)
        const checkAndSeed = async () => {
            try {
                const currentItems = await inventoryService.getAll();
                if (currentItems.length === 0) {
                    console.log("Database empty. Seeding initial inventory data...");
                    // Strip IDs from mock data as Firestore generates them (or keep them if we want consistent IDs)
                    // For simplicity, let's just push them.
                    await inventoryService.seedInitialData(mockInventory.map(({ id, ...rest }) => rest));
                }
            } catch (error) {
                console.error("Seeding check failed:", error);
            }
        };
        checkAndSeed();

        return () => unsubscribe();
    }, []);

    const updateStock = async (id: string, delta: number) => {
        try {
            await inventoryService.updateStock(id, delta);
        } catch (error) {
            console.error("Failed to update stock:", error);
            alert("Gagal update stok. Cek koneksi internet.");
        }
    };

    const reduceStockForOrder = async (orderItems: { itemId: string, qty: number }[]) => {
        // In a real app, this should be a Transaction or Batch write.
        // For now, we iterate (simple implementation).
        try {
            const updates = orderItems.map(item => inventoryService.updateStock(item.itemId, -item.qty));
            await Promise.all(updates);
        } catch (error) {
            console.error("Failed to reduce stock for order:", error);
            throw error; // Let caller handle
        }
    };

    return (
        <InventoryContext.Provider value={{ items, updateStock, reduceStockForOrder, isLoading }}>
            {children}
        </InventoryContext.Provider>
    );
}

export function useInventory() {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
}
