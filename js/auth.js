import { auth, db } from './firebase-init.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

export function observarAutenticacao(callback) {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null, null);
      return;
    }

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await signOut(auth);
      callback(null, null);
      return;
    }

    const appUser = userSnap.data();

    if (appUser.status !== 'active') {
      await signOut(auth);
      callback(null, null);
      return;
    }

    try {
      await updateDoc(userRef, {
        lastAccessAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('Não foi possível atualizar o último acesso:', error);
    }

    callback(firebaseUser, appUser);
  });
}

export function entrar(email, senha) {
  return signInWithEmailAndPassword(auth, email, senha);
}

export function sair() {
  return signOut(auth);
}

export function recuperarSenha(email) {
  return sendPasswordResetEmail(auth, email);
}
