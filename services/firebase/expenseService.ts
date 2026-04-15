import { db } from '../../lib/firebase';
import { Expense } from '../../types/expense';
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    QuerySnapshot,
    query,
    orderBy
} from 'firebase/firestore';

const COLLECTION_NAME = 'expenses';

class ExpenseServiceFirebase {

    async getExpenses(): Promise<Expense[]> {
        const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Expense));
    }

    async addExpense(data: Omit<Expense, 'id'>): Promise<Expense> {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
        return { id: docRef.id, ...data };
    }

    async deleteExpense(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    }

    subscribeExpenses(callback: (expenses: Expense[]) => void): () => void {
        const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
        return onSnapshot(q, (snapshot: QuerySnapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Expense));
            callback(items);
        });
    }

    // Seeding if needed (probably not for expenses, but good practice to have method ready)
    async seedInitialData(expenses: Omit<Expense, 'id'>[]): Promise<void> {
        const existing = await this.getExpenses();
        if (existing.length === 0) {
            const batch = expenses.map(e => this.addExpense(e));
            await Promise.all(batch);
            console.log("Initial Expenses Seeded.");
        }
    }
}

export const expenseService = new ExpenseServiceFirebase();
