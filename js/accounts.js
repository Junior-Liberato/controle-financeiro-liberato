import { db } from './firebase-init.js';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { calculateCreditCardInvoice, getCardSettings } from './card-settings.js';

function getCategoryPrefix(categoryId) {
  const prefixes = {
    agua: 'AGU',
    luz: 'LUZ',
    internet: 'INT',
    moradia: 'MOR',
    alimentacao: 'ALI',
    'cartao-credito': 'CAR',
    transporte: 'TRA',
    saude: 'SAU',
    educacao: 'EDU',
    lazer: 'LAZ',
    assinaturas: 'ASS',
    outros: 'OUT'
  };

  return prefixes[categoryId] || 'LAN';
}

function generateLaunchCode(categoryId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 900) + 100);

  return `${getCategoryPrefix(categoryId)}-${year}${month}${day}-${hour}${minute}${second}-${random}`;
}

function isImmediatePayment(paymentMethodId) {
  return ['pix', 'debit', 'cash'].includes(paymentMethodId);
}

export async function createAccount(appUser, accountData) {
  const categoryId = accountData.categoryId || 'outros';
  const paymentMethodId = accountData.paymentMethodId || 'pix';
  const launchDateValue = accountData.launchDate || accountData.dueDate;
  const launchDate = new Date(`${launchDateValue}T12:00:00`);
  const isCreditCard = paymentMethodId === 'credit-card';
  const cardSettings = isCreditCard ? await getCardSettings(appUser) : null;
  const cardInvoice = isCreditCard ? calculateCreditCardInvoice(launchDateValue, cardSettings) : null;
  const dueDate = isCreditCard ? cardInvoice.invoiceDueDate : launchDate;
  const referenceMonth = isCreditCard ? cardInvoice.invoiceReferenceMonth : accountData.referenceMonth;
  const immediatePayment = isImmediatePayment(paymentMethodId);

  return addDoc(collection(db, 'accounts'), {
    familyId: appUser.familyId,
    launchCode: generateLaunchCode(categoryId),
    description: accountData.description,
    categoryId,
    amount: Number(accountData.amount),
    launchDate: Timestamp.fromDate(launchDate),
    dueDate: Timestamp.fromDate(dueDate),
    referenceMonth,
    responsibleUserId: accountData.responsibleUserId || appUser.uid,
    status: immediatePayment ? 'paid' : 'card_invoice',
    paymentMethodId,
    paymentMethodLabel: accountData.paymentMethodLabel || paymentMethodId,
    paidAt: immediatePayment ? serverTimestamp() : null,
    paidBy: immediatePayment ? appUser.uid : null,
    paidByName: immediatePayment ? appUser.name || appUser.email || 'Usuário' : null,
    cardInvoiceMonth: cardInvoice?.invoiceReferenceMonth || null,
    cardClosingDay: cardInvoice?.closingDay || null,
    cardDueDay: cardInvoice?.dueDay || null,
    notes: accountData.notes || '',
    isRecurring: false,
    recurrenceId: null,
    createdBy: appUser.uid,
    createdByName: appUser.name || appUser.email || 'Usuário',
    createdAt: serverTimestamp(),
    updatedBy: appUser.uid,
    updatedByName: appUser.name || appUser.email || 'Usuário',
    updatedAt: serverTimestamp(),
    isArchived: false,
    archivedAt: null,
    archivedBy: null,
    archivedByName: null,
    archiveReason: null
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

export async function markAccountAsPaid(appUser, accountId) {
  const accountRef = doc(db, 'accounts', accountId);

  return updateDoc(accountRef, {
    status: 'paid',
    paidAt: serverTimestamp(),
    paidBy: appUser.uid,
    paidByName: appUser.name || appUser.email || 'Usuário',
    updatedBy: appUser.uid,
    updatedByName: appUser.name || appUser.email || 'Usuário',
    updatedAt: serverTimestamp()
  });
}

export async function archiveAccount(appUser, accountId, reason = '') {
  const accountRef = doc(db, 'accounts', accountId);

  return updateDoc(accountRef, {
    isArchived: true,
    archivedAt: serverTimestamp(),
    archivedBy: appUser.uid,
    archivedByName: appUser.name || appUser.email || 'Usuário',
    archiveReason: reason || null,
    updatedBy: appUser.uid,
    updatedByName: appUser.name || appUser.email || 'Usuário',
    updatedAt: serverTimestamp()
  });
}
