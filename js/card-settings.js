import { db } from './firebase-init.js';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

export const defaultCardSettings = {
  closingDay: 20,
  dueDay: 10
};

function getCardSettingsRef(appUser) {
  return doc(db, 'settings', `${appUser.familyId}_card_settings`);
}

export async function getCardSettings(appUser) {
  const settingsSnap = await getDoc(getCardSettingsRef(appUser));

  if (!settingsSnap.exists()) {
    return defaultCardSettings;
  }

  return {
    ...defaultCardSettings,
    ...(settingsSnap.data().cardSettings || {})
  };
}

export async function saveCardSettings(appUser, settings) {
  const closingDay = Number(settings.closingDay || 0);
  const dueDay = Number(settings.dueDay || 0);

  if (closingDay < 1 || closingDay > 31 || dueDay < 1 || dueDay > 31) {
    throw new Error('Informe dias entre 1 e 31.');
  }

  return setDoc(getCardSettingsRef(appUser), {
    familyId: appUser.familyId,
    type: 'card_settings',
    cardSettings: {
      closingDay,
      dueDay
    },
    updatedBy: appUser.uid,
    updatedByName: appUser.name || appUser.email || 'Usuário',
    updatedAt: serverTimestamp()
  }, { merge: true });
}

function getSafeDate(year, monthIndex, day) {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return new Date(year, monthIndex, Math.min(day, lastDay), 12, 0, 0);
}

export function calculateCreditCardInvoice(purchaseDateValue, settings = defaultCardSettings) {
  const purchaseDate = new Date(`${purchaseDateValue}T12:00:00`);
  const closingDay = Number(settings.closingDay || defaultCardSettings.closingDay);
  const dueDay = Number(settings.dueDay || defaultCardSettings.dueDay);

  let invoiceMonthIndex = purchaseDate.getMonth();
  let invoiceYear = purchaseDate.getFullYear();

  if (purchaseDate.getDate() > closingDay) {
    invoiceMonthIndex += 1;

    if (invoiceMonthIndex > 11) {
      invoiceMonthIndex = 0;
      invoiceYear += 1;
    }
  }

  const invoiceReferenceMonth = `${invoiceYear}-${String(invoiceMonthIndex + 1).padStart(2, '0')}`;
  const invoiceDueDate = getSafeDate(invoiceYear, invoiceMonthIndex, dueDay);

  return {
    invoiceReferenceMonth,
    invoiceDueDate,
    closingDay,
    dueDay
  };
}
