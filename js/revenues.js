import { db } from './firebase-init.js';
import {
  addDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

export async function listRevenuesByMonth(appUser, referenceMonth) {
  const revenuesQuery = query(
    collection(db, 'revenues'),
    where('familyId', '==', appUser.familyId),
    where('referenceMonth', '==', referenceMonth),
    where('isArchived', '==', false)
  );

  const snapshot = await getDocs(revenuesQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));
}

export async function saveMonthlyRevenue(appUser, revenueData) {
  const revenuesQuery = query(
    collection(db, 'revenues'),
    where('familyId', '==', appUser.familyId),
    where('referenceMonth', '==', revenueData.referenceMonth),
    where('userId', '==', appUser.uid),
    where('isArchived', '==', false)
  );

  const snapshot = await getDocs(revenuesQuery);

  const payload = {
    familyId: appUser.familyId,
    referenceMonth: revenueData.referenceMonth,
    userId: appUser.uid,
    userName: appUser.name || appUser.email || 'Usuário',
    incomeAmount: Number(revenueData.incomeAmount || 0),
    notes: revenueData.notes || '',
    updatedBy: appUser.uid,
    updatedByName: appUser.name || appUser.email || 'Usuário',
    updatedAt: serverTimestamp(),
    isArchived: false
  };

  if (!snapshot.empty) {
    return updateDoc(snapshot.docs[0].ref, payload);
  }

  return addDoc(collection(db, 'revenues'), {
    ...payload,
    createdBy: appUser.uid,
    createdByName: appUser.name || appUser.email || 'Usuário',
    createdAt: serverTimestamp()
  });
}
