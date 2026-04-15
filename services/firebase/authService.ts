import { IAuthService } from '../interfaces';
import { User, LoginCredentials, RegisterData, Role } from '../../types/auth';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

class AuthServiceFirebase implements IAuthService {

    async login(credentials: LoginCredentials): Promise<User> {
        try {
            // Auto-append domain if simple username is provided
            let email = credentials.username;
            if (!email.includes('@')) {
                email = `${email}@alucurv.com`;
                console.log(`Auto-appending domain: ${email}`);
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, credentials.password);

            const firebaseUser = userCredential.user;

            // Get User Details from Firestore (Role, Name)
            // Wrap in try-catch specifically for Firestore fetching with TIMEOUT
            let userData: any = {};
            try {
                // Create a timeout promise (e.g., 2 seconds)
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));
                const fetchDoc = getDoc(doc(db, "users", firebaseUser.uid));

                const userDoc: any = await Promise.race([fetchDoc, timeout]);

                if (userDoc.exists()) {
                    userData = userDoc.data();
                }
            } catch (firestoreError) {
                console.warn("Firestore fetch failed/timed-out, using fallback:", firestoreError);
                // Fallback: Default to empty
                userData = {};
            }

            // Determine Role Fallback
            // DEV MODE: Default to OWNER during setup if DB fails
            // This ensures you get access even if Firestore is blocked/offline
            let fallbackRole = Role.OWNER;

            // Optional: Logic to downgrade if needed, but for now we prioritize access
            if (firebaseUser.email && firebaseUser.email.includes('gudang')) {
                fallbackRole = Role.GUDANG;
            }

            return {
                id: firebaseUser.uid,
                name: userData.name || firebaseUser.displayName || "Owner (Offline Mode)",
                role: (userData.role as Role) || fallbackRole,
                username: userData.username || firebaseUser.email || ""
            };

        } catch (error: any) {
            console.error("Login Error:", error);
            throw new Error(error.message || "Login failed");
        }
    }

    async logout(): Promise<void> {
        await signOut(auth);
    }

    async register(data: RegisterData): Promise<User> {
        console.log("Starting registration for:", data.username);
        // data.username must be email for firebase auth
        try {
            console.log("Attempting createUserWithEmailAndPassword...");
            const userCredential = await createUserWithEmailAndPassword(auth, data.username, data.password);
            console.log("User created in Auth:", userCredential.user.uid);
            const firebaseUser = userCredential.user;

            const newUser: User = {
                id: firebaseUser.uid,
                name: data.name,
                role: data.role,
                username: data.username
            };

            // Save additional info to Firestore
            console.log("Attempting to save user data to Firestore...");
            try {
                await setDoc(doc(db, "users", firebaseUser.uid), {
                    name: data.name,
                    role: data.role,
                    username: data.username,
                    email: data.username // redundant but okay
                });
                console.log("User data saved to Firestore successfully.");
            } catch (firestoreError) {
                console.warn("Firestore save failed (Offline?), skipping profile save:", firestoreError);
                // We don't throw here, because Auth is already successful.
                // The user can login, and we can try to save profile later or handle missing profile in login.
            }

            return newUser;
        } catch (error: any) {
            console.error("Register Error Code:", error.code);
            console.error("Register Error Message:", error.message);
            throw new Error(error.message || "Registration failed");
        }
    }

    async getCurrentUser(): Promise<User | null> {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        resolve({
                            id: firebaseUser.uid,
                            name: userData.name,
                            role: userData.role as Role,
                            username: userData.username
                        });
                    } else {
                        // Session exists but no firestore doc?
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
                unsubscribe();
            });
        });
    }
}

export const authService = new AuthServiceFirebase();
