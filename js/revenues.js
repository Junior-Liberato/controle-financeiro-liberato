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

const revenuesCache = new Map();
const CACHE_TIME_MS = 60 * 1000;

function getRevenuesCacheKey(appUser, referenceMonth) {
  return `${appUser.familyId}:${referenceMonth}`;
}

function clearRevenuesCache() {
  revenuesCache.clear();
}

export async function listRevenuesByMonth(appUser, referenceMonth) {
  const cacheKey = getRevenuesCacheKey(appUser, referenceMonth);
  const cached = revenuesCache.get(cacheKey);

  if (cached && Date.now() - cached.createdAt < CACHE_TIME_MS) {
    return cached.data;
  }

  const revenuesQuery = query(
    collection(db, 'revenues'),
    where('familyId', '==', appUser.familyId),
    where('referenceMonth', '==', referenceMonth),
    where('isArchived', '==', false)
  );

  const snapshot = await getDocs(revenuesQuery);
  const data = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));

  revenuesCache.set(cacheKey, {
    createdAt: Date.now(),
    data
  });

  return data;
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

  let result;

  if (!snapshot.empty) {
    result = await updateDoc(snapshot.docs[0].ref, payload);
  } else {
    result = await addDoc(collection(db, 'revenues'), {
      ...payload,
      createdBy: appUser.uid,
      createdByName: appUser.name || appUser.email || 'Usuário',
      createdAt: serverTimestamp()
    });
  }

  clearRevenuesCache();
  return result;
}
