import { auth, db } from './firebase-init.js';
import {
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

function validatePin(pin) {
  return /^\d{4}$/.test(pin || '');
}

async function hashPin(uid, pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${uid}:${pin}:controle-financeiro-liberato`);
  const buffer = await crypto.subtle.digest('SHA-256', data);

  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getSecurityRef(uid) {
  return doc(db, 'userSecurity', uid);
}

export function getSecurityErrorMessage(error) {
  const code = error?.code || '';

  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Senha de login inválida.';
  }

  if (code === 'permission-denied') {
    return 'PIN validado, mas o Firebase bloqueou o salvamento. Atualize as regras do Firestore para liberar a coleção userSecurity.';
  }

  if (code === 'unavailable') {
    return 'Falha de conexão com o Firebase. Tente novamente.';
  }

  return `Não foi possível concluir a operação. ${code || 'erro-desconhecido'}`;
}

export async function hasPinConfigured(uid) {
  try {
    const securitySnap = await getDoc(getSecurityRef(uid));
    return securitySnap.exists() && Boolean(securitySnap.data().pinHash);
  } catch (error) {
    console.error('Erro ao consultar PIN:', error);
    throw error;
  }
}

export async function verifyPin(uid, pin) {
  if (!validatePin(pin)) return false;

  const securitySnap = await getDoc(getSecurityRef(uid));

  if (!securitySnap.exists()) return false;

  const pinHash = await hashPin(uid, pin);
  return securitySnap.data().pinHash === pinHash;
}

export async function confirmPassword(password) {
  const currentUser = auth.currentUser;

  if (!currentUser?.email) {
    throw new Error('Usuário não autenticado.');
  }

  const credential = EmailAuthProvider.credential(currentUser.email, password);
  return reauthenticateWithCredential(currentUser, credential);
}

export async function createOrUpdatePin(appUser, pin, password) {
  if (!validatePin(pin)) {
    throw new Error('O PIN precisa ter exatamente 4 números.');
  }

  await confirmPassword(password);

  const pinHash = await hashPin(appUser.uid, pin);
  const securityRef = getSecurityRef(appUser.uid);

  return setDoc(securityRef, {
    familyId: appUser.familyId,
    userId: appUser.uid,
    userName: appUser.name || appUser.email || 'Usuário',
    pinHash,
    updatedAt: serverTimestamp(),
    updatedBy: appUser.uid
  }, { merge: true });
}

export async function registerPinAttempt(uid, success) {
  const securityRef = getSecurityRef(uid);

  return updateDoc(securityRef, {
    lastPinAttemptAt: serverTimestamp(),
    lastPinAttemptSuccess: success
  });
}
