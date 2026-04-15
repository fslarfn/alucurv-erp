import { db } from '../../lib/firebase';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    QuerySnapshot,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { Employee, Attendance, PayrollRecord } from '../../types/employee';

const EMP_COLLECTION = 'employees';
const ATT_COLLECTION = 'attendance';
const PAY_COLLECTION = 'payrolls';

class EmployeeServiceFirebase {

    // --- EMPLOYEES ---

    async getEmployees(): Promise<Employee[]> {
        const q = query(collection(db, EMP_COLLECTION));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Employee));
    }

    async addEmployee(data: Omit<Employee, 'id'>): Promise<Employee> {
        const docRef = await addDoc(collection(db, EMP_COLLECTION), data);
        return { id: docRef.id, ...data };
    }

    async updateEmployee(id: string, data: Partial<Employee>): Promise<void> {
        const docRef = doc(db, EMP_COLLECTION, id);
        await updateDoc(docRef, data);
    }

    async deleteEmployee(id: string): Promise<void> {
        await deleteDoc(doc(db, EMP_COLLECTION, id));
    }

    subscribeEmployees(callback: (employees: Employee[]) => void): () => void {
        const q = query(collection(db, EMP_COLLECTION));
        return onSnapshot(q, (snapshot: QuerySnapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Employee));
            callback(items);
        });
    }

    // --- ATTENDANCE ---

    async getAttendance(employeeId?: string): Promise<Attendance[]> {
        let q;
        if (employeeId) {
            q = query(collection(db, ATT_COLLECTION), where("employeeId", "==", employeeId));
        } else {
            q = query(collection(db, ATT_COLLECTION));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Attendance));
    }

    async addAttendance(data: Omit<Attendance, 'id'>): Promise<Attendance> {
        const docRef = await addDoc(collection(db, ATT_COLLECTION), data);
        return { id: docRef.id, ...data };
    }

    subscribeAttendance(callback: (attendance: Attendance[]) => void): () => void {
        // Limit to recent attendance might be better for performance, but for now get all
        const q = query(collection(db, ATT_COLLECTION), orderBy('date', 'desc'));
        return onSnapshot(q, (snapshot: QuerySnapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Attendance));
            callback(items);
        });
    }

    // --- PAYROLL ---

    async getPayrolls(employeeId?: string): Promise<PayrollRecord[]> {
        let q;
        if (employeeId) {
            q = query(collection(db, PAY_COLLECTION), where("employeeId", "==", employeeId));
        } else {
            q = query(collection(db, PAY_COLLECTION), orderBy('generatedAt', 'desc'));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as PayrollRecord));
    }

    async savePayroll(data: PayrollRecord): Promise<void> {
        // Use custom ID for payroll if provided (e.g. pay-empId-period) or auto-gen
        // The Context uses custom ID logic. Let's respect that if we can, 
        // using setDoc instead of addDoc if we want strict ID control.
        // For simplicity with addDoc in other methods, let's use setDoc here to match Context logic.
        const { id, ...rest } = data;
        await import('firebase/firestore').then(mod => mod.setDoc(doc(db, PAY_COLLECTION, id), rest));
    }

    subscribePayrolls(callback: (payrolls: PayrollRecord[]) => void): () => void {
        const q = query(collection(db, PAY_COLLECTION), orderBy('generatedAt', 'desc'));
        return onSnapshot(q, (snapshot: QuerySnapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PayrollRecord));
            callback(items);
        });
    }

    // --- SEEDING ---
    async seedInitialEmployees(employees: Omit<Employee, 'id'>[]): Promise<void> {
        const existing = await this.getEmployees();
        if (existing.length === 0) {
            const batch = employees.map(emp => this.addEmployee(emp));
            await Promise.all(batch);
            console.log("Initial Employees Seeded.");
        }
    }
}

export const employeeService = new EmployeeServiceFirebase();
