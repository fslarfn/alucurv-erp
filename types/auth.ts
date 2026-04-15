export enum Role {
    OWNER = 'Owner',
    ADMIN = 'Admin',
    GUDANG = 'Gudang',
    PRODUKSI = 'Produksi'
}

export interface User {
    id: string; // Firebase UID
    username: string; // Treated as email prefix or full email
    name: string;
    role: Role;
    email?: string; // Optional for compatibility
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
    name: string;
    role: Role;
}

// Deprecated but kept for reference if needed temporarily
export const MOCK_USERS: Record<string, User & { password: string }> = {
    'owner': { id: 'mock-1', username: 'owner', name: 'Boss Alucurv', role: Role.OWNER, password: '123' },
    'admin': { id: 'mock-2', username: 'admin', name: 'Admin Kantor', role: Role.ADMIN, password: '123' },
    'gudang': { id: 'mock-3', username: 'gudang', name: 'Staff Gudang', role: Role.GUDANG, password: '123' },
    'produksi': { id: 'mock-4', username: 'produksi', name: 'Kepala Produksi', role: Role.PRODUKSI, password: '123' },
};
