"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus, NEXT_STATUS } from '../types/order';
import { useInventory } from './InventoryContext';
import { orderService } from '../services/firebase/orderService'; // Import Firebase Service
import { mockOrders } from '../data/mockOrders';

interface OrderContextType {
    orders: Order[];
    advanceOrderStatus: (id: string, technicianIds?: string[] | string) => Promise<void>;
    isLoading: boolean;
    refreshOrders: () => Promise<void>;
    createOrder: (order: Omit<Order, 'id' | 'status'>) => Promise<void>;
    importOrder: (order: Omit<Order, 'id'>) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;
    updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { reduceStockForOrder } = useInventory();

    // Initial Data Fetch & Subscription
    useEffect(() => {
        // 1. Subscribe to Realtime Updates
        const unsubscribe = orderService.subscribe((newOrders) => {
            setOrders(newOrders);
            setIsLoading(false);
        });

        // 2. Check for Seeding (One-off check)
        const checkAndSeed = async () => {
            try {
                const currentOrders = await orderService.getAll();
                if (currentOrders.length === 0) {
                    console.log("Orders DB empty. Seeding initial order data...");
                    // Strip IDs if we want Firestore to generate them, but for Orders usually we want custom IDs?
                    // Let's keep custom IDs for Orders if possible, or usually Firestore generates random ones.
                    // IMPORTANT: addDoc generates random ID. setDoc needs ID. 
                    // My service uses addDoc which ignores ID in data. 
                    // Let's accept random IDs for now for simplicity of migration.
                    await orderService.seedInitialData(mockOrders.map(({ id, ...rest }) => rest));
                }
            } catch (error) {
                console.error("Order Seeding check failed:", error);
            }
        };
        checkAndSeed();

        return () => unsubscribe();
    }, []);

    const fetchOrders = async () => {
        // Compatibility method, though subscription handles it mostly.
        const data = await orderService.getAll();
        setOrders(data);
    };

    const createOrder = async (orderData: Omit<Order, 'id' | 'status'>) => {
        const newOrder: Order = {
            ...orderData,
            id: `ord-${Date.now()}`,
            status: 'Pesanan Masuk'
        };
        await orderService.createOrder(newOrder);
    };

    const importOrder = async (orderData: Omit<Order, 'id'>) => {
        // Direct creation for imported data
        const newOrder: Order = {
            ...orderData,
            id: `imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        };
        await orderService.createOrder(newOrder);
    };

    const advanceOrderStatus = async (id: string, technicianIdsOrId?: string[] | string) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;

        const nextStatus = NEXT_STATUS[order.status];
        if (!nextStatus) return;

        // Optimistic Update (UI first)
        const oldOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));

        try {
            // Logic khusus saat Selesai
            if (nextStatus === 'Selesai') {
                await reduceStockForOrder(order.items);
            }

            // Handle technician IDs
            let newTechIds = order.technicianIds || [];
            if (Array.isArray(technicianIdsOrId)) {
                newTechIds = technicianIdsOrId;
            } else if (typeof technicianIdsOrId === 'string') {
                newTechIds = [technicianIdsOrId];
            }

            // Call Service
            await orderService.update(id, {
                status: nextStatus,
                technicianIds: newTechIds
            });

            // No need to refetch, subscription will catch it.
        } catch (error) {
            console.error("Failed to update status", error);
            setOrders(oldOrders); // Rollback if fail
            alert("Gagal update status. Coba lagi.");
        }
    };

    const deleteOrder = async (id: string) => {
        if (!confirm('Yakin ingin menghapus pesanan ini?')) return;
        const oldOrders = [...orders];
        setOrders(prev => prev.filter(o => o.id !== id)); // Optimistic
        try {
            await orderService.delete(id);
        } catch (error) {
            console.error("Failed to delete order", error);
            setOrders(oldOrders);
            alert("Gagal menghapus pesanan.");
        }
    };

    const updateOrder = async (id: string, data: Partial<Order>) => {
        const oldOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o)); // Optimistic
        try {
            await orderService.update(id, data);
        } catch (error) {
            console.error("Failed to update order", error);
            setOrders(oldOrders);
            alert("Gagal update pesanan.");
        }
    };

    return (
        <OrderContext.Provider value={{
            orders,
            advanceOrderStatus,
            isLoading,
            refreshOrders: fetchOrders,
            createOrder,
            importOrder,
            deleteOrder,
            updateOrder
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrder() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
}
