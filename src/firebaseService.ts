import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Bill, UserProfile } from './types';

// Operation Types as requested by Firestore Error Handling skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Sync User Preferences in Firestore
export const subscribeToProfile = (uid: string, callback: (profile: UserProfile | null) => void) => {
  const docRef = doc(db, 'users', uid);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as UserProfile);
    } else {
      callback(null);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  });
};

export const updateProfileInDb = async (uid: string, profile: Partial<UserProfile>) => {
  const docRef = doc(db, 'users', uid);
  try {
    await setDoc(docRef, profile, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
  }
};

// Sync Bills in Firestore
export const subscribeToBills = (uid: string, callback: (bills: Bill[]) => void) => {
  const billsRef = collection(db, 'bills');
  const q = query(billsRef, where('userId', '==', uid));
  
  return onSnapshot(q, (snapshot) => {
    const list: Bill[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        name: data.name || '',
        category: data.category || 'other',
        amount: Number(data.amount) || 0,
        dueDate: data.dueDate || '',
        status: data.status || 'Upcoming',
        recurring: data.recurring ?? false,
        frequency: data.frequency || 'monthly',
        paidMonths: data.paidMonths || [],
        reminder: data.reminder ?? false,
        reminderDays: Number(data.reminderDays) || 3,
        notes: data.notes || ''
      });
    });
    // Sort client-side by due date descending/ascending or display sequence
    list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'bills');
  });
};

export const addBillInDb = async (uid: string, bill: Omit<Bill, 'id'>) => {
  const billsRef = collection(db, 'bills');
  try {
    await addDoc(billsRef, {
      ...bill,
      userId: uid,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'bills');
  }
};

export const updateBillInDb = async (billId: string, updates: Partial<Bill>) => {
  const docRef = doc(db, 'bills', billId);
  try {
    await updateDoc(docRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `bills/${billId}`);
  }
};

export const deleteBillFromDb = async (billId: string) => {
  const docRef = doc(db, 'bills', billId);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `bills/${billId}`);
  }
};

