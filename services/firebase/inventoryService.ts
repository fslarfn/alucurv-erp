import { IInventoryService } from '../interfaces';
import { InventoryItem } from '../../types/inventory';
import { db } from '../../lib/firebase';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    increment,
    runTransaction,
    onSnapshot,
    QuerySnapshot
} from 'firebase/firestore';

const COLLECTION_NAME = 'inventory';

class InventoryServiceFirebase implements IInventoryService {

    // Implement standard CRUD
    async getAll(): Promise<InventoryItem[]> {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as InventoryItem));
    }

    async getById(id: string): Promise<InventoryItem | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as InventoryItem;
        } else {
            return null;
        }
    }

    async create(data: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
        return { id: docRef.id, ...data };
    }

    async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, data);
        const updatedDoc = await this.getById(id);
        if (!updatedDoc) throw new Error("Item not found after update");
        return updatedDoc;
    }

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    }

    // Specific Method: Update Stock safely using increment
    async updateStock(id: string, qtyDelta: number): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            stock: increment(qtyDelta)
        });
    }

    // Real-time helper (not in interface but useful for Context)
    subscribe(callback: (items: InventoryItem[]) => void): () => void {
        const q = collection(db, COLLECTION_NAME);
        return onSnapshot(q, (snapshot: QuerySnapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as InventoryItem));
            callback(items);
        });
    }

    // Seeding helper
    async seedInitialData(items: Omit<InventoryItem, 'id'>[]): Promise<void> {
        // Check if empty first to avoid duplicates
        const existing = await this.getAll();
        if (existing.length === 0) {
            const batch = items.map(item => this.create(item));
            await Promise.all(batch);
            console.log("Seeding completed.");
        }
    }
}

export const inventoryService = new InventoryServiceFirebase();
