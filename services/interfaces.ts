// Base Interface for CRUD Operations
export interface IService<T> {
    getAll(): Promise<T[]>;
    getById(id: string): Promise<T | null>;
    create(data: Omit<T, 'id'>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}

// Specific Service Interfaces can extend the base
import { Order } from '../types/order';
import { InventoryItem } from '../types/inventory';

export interface IOrderService extends IService<Order> {
    // Add specific methods if needed, e.g.
    // getOrdersByCustomer(customerId: string): Promise<Order[]>;
}

export interface IInventoryService extends IService<InventoryItem> {
    updateStock(id: string, qtyDelta: number): Promise<void>;
}

import { User, LoginCredentials, RegisterData } from '../types/auth';

export interface IAuthService {
    login(credentials: LoginCredentials): Promise<User>;
    logout(): Promise<void>;
    register(data: RegisterData): Promise<User>; // For initial setup
    getCurrentUser(): Promise<User | null>;
}
