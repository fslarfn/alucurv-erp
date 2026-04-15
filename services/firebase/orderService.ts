import { IOrderService } from '../interfaces';
import { Order } from '../../types/order';
import { db } from '../../lib/firebase';
import {
    collection,
    getDocs,
    doc,
    setDoc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    QuerySnapshot,
    orderBy,
    query
} from 'firebase/firestore';

const COLLECTION_NAME = 'orders';

class OrderServiceFirebase implements IOrderService {

    async getAll(): Promise<Order[]> {
        // Default sort by date desc
        const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Order));
    }

    async getById(id: string): Promise<Order | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Order;
        } else {
            return null;
        }
    }

    async create(data: Omit<Order, 'id'>): Promise<Order> {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
        return { id: docRef.id, ...data };
    }

    // Explicit method for full Order object creation (supports custom ID for import)
    async createOrder(data: Order): Promise<void> {
        const { id, ...rest } = data;
        if (id) {
            await setDoc(doc(db, COLLECTION_NAME, id), rest);
        } else {
            await addDoc(collection(db, COLLECTION_NAME), rest);
        }
    }

    async update(id: string, data: Partial<Order>): Promise<Order> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, data);
        const updatedDoc = await this.getById(id);
        if (!updatedDoc) throw new Error("Order not found after update");
        return updatedDoc;
    }

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    }

    // Real-time listener
    subscribe(callback: (orders: Order[]) => void): () => void {
        const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
        return onSnapshot(q, (snapshot: QuerySnapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Order));
            callback(orders);
        });
    }

    // Seeding Helper
    async seedInitialData(orders: Omit<Order, 'id'>[]): Promise<void> {
        const existing = await this.getAll();
        if (existing.length === 0) {
            const batch = orders.map(order => this.create(order));
            await Promise.all(batch);
            console.log("Orders seeded.");
        }
    }
}

export const orderService = new OrderServiceFirebase();
