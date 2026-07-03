import { db } from './firebase-init.js';
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

export async function createAccount(appUser, accountData) {
  const dueDate = new Date(`${accountData.dueDate}T12:00:00`);

  return addDoc(collection(db, 'accounts'), {
    familyId: appUser.familyId,
    description: accountData.description,
    categoryId: accountData.categoryId || 'outros',
    amount: Number(accountData.amount),
    dueDate: Timestamp.fromDate(dueDate),
    referenceMonth: accountData.referenceMonth,
    responsibleUserId: accountData.responsibleUserId || appUser.uid,
    status: 'open',
    paymentMethodId: accountData.paymentMethodId || 'pix',
    paidAt: null,
    notes: accountData.notes || '',
    isRecurring: false,
    recurrenceId: null,
    createdBy: appUser.uid,
    createdAt: serverTimestamp(),
    updatedBy: appUser.uid,
    updatedAt: serverTimestamp(),
    isArchived: false
  });
}

export async function listAccountsByMonth(appUser, referenceMonth) {
  const accountsQuery = query(
    collection(db, 'accounts'),
    where('familyId', '==', appUser.familyId),
    where('referenceMonth', '==', referenceMonth),
    where('isArchived', '==', false)
  );

  const snapshot = await getDocs(accountsQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));
}
