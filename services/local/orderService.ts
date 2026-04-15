import { IOrderService } from '../interfaces';
import { Order, OrderStatus } from '../../types/order';
import { mockOrders } from '../../data/mockOrders';

const STORAGE_KEY = 'alucurv_orders';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class OrderServiceLocal implements IOrderService {

    private getLocalData(): Order[] {
        if (typeof window === 'undefined') return mockOrders;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            // Initialize with mock data if empty
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders));
            return mockOrders;
        }
        return JSON.parse(stored);
    }

    private setLocalData(data: Order[]) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
    }

    async getAll(): Promise<Order[]> {
        await delay(500); // Simulate network
        return this.getLocalData();
    }

    async getById(id: string): Promise<Order | null> {
        await delay(200);
        const orders = this.getLocalData();
        return orders.find(o => o.id === id) || null;
    }

    async create(data: Omit<Order, 'id'>): Promise<Order> {
        await delay(500);
        const orders = this.getLocalData();
        const newOrder: Order = {
            ...data,
            id: `ord-${Date.now()}` // Generate ID
        };
        this.setLocalData([newOrder, ...orders]);
        return newOrder;
    }

    async update(id: string, data: Partial<Order>): Promise<Order> {
        await delay(500);
        const orders = this.getLocalData();
        let updatedOrder: Order | null = null;

        const newOrders = orders.map(o => {
            if (o.id === id) {
                updatedOrder = { ...o, ...data };
                return updatedOrder;
            }
            return o;
        });

        if (!updatedOrder) throw new Error('Order not found');

        this.setLocalData(newOrders);
        return updatedOrder;
    }

    async delete(id: string): Promise<void> {
        await delay(500);
        const orders = this.getLocalData();
        const newOrders = orders.filter(o => o.id !== id);
        this.setLocalData(newOrders);
    }
}

export const orderService = new OrderServiceLocal();
