import os

def main():
    service_file = "src/firebaseService.ts"
    with open(service_file, "r") as f:
        content = f.read()

    # Add Expense to types import
    content = content.replace("import { Bill, UserProfile } from './types';", "import { Bill, Expense, UserProfile } from './types';")

    # Add Expense functions
    expense_funcs = """
// Sync Expenses in Firestore
export const subscribeToExpenses = (uid: string, callback: (expenses: Expense[]) => void) => {
  const expensesRef = collection(db, 'expenses');
  const q = query(expensesRef, where('userId', '==', uid));
  
  return onSnapshot(q, (snapshot) => {
    const list: Expense[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        name: data.name || '',
        category: data.category || 'other',
        amount: Number(data.amount) || 0,
        date: data.date || '',
        notes: data.notes || ''
      });
    });
    list.sort((a, b) => a.date.localeCompare(b.date));
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'expenses');
  });
};

export const addExpenseInDb = async (uid: string, expense: Omit<Expense, 'id'>) => {
  const expensesRef = collection(db, 'expenses');
  try {
    await addDoc(expensesRef, {
      ...expense,
      userId: uid,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'expenses');
  }
};

export const updateExpenseInDb = async (expenseId: string, updates: Partial<Expense>) => {
  const docRef = doc(db, 'expenses', expenseId);
  try {
    await updateDoc(docRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `expenses/${expenseId}`);
  }
};

export const deleteExpenseFromDb = async (expenseId: string) => {
  const docRef = doc(db, 'expenses', expenseId);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `expenses/${expenseId}`);
  }
};
"""
    
    # Append to the end of the file
    content += "\n" + expense_funcs

    with open(service_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
