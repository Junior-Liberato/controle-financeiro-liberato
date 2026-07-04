import { db } from './firebase-init.js';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

export const defaultBudgetSettings = {
  needs: 50,
  wants: 30,
  goals: 20
};

function getBudgetSettingsRef(appUser) {
  return doc(db, 'settings', `${appUser.familyId}_budget_rule`);
}

export async function getBudgetSettings(appUser) {
  const settingsSnap = await getDoc(getBudgetSettingsRef(appUser));

  if (!settingsSnap.exists()) {
    return defaultBudgetSettings;
  }

  return {
    ...defaultBudgetSettings,
    ...(settingsSnap.data().budgetRule || {})
  };
}

export async function saveBudgetSettings(appUser, settings) {
  const needs = Number(settings.needs || 0);
  const wants = Number(settings.wants || 0);
  const goals = Number(settings.goals || 0);
  const total = needs + wants + goals;

  if (total !== 100) {
    throw new Error('A soma das proporções precisa ser exatamente 100%.');
  }

  return setDoc(getBudgetSettingsRef(appUser), {
    familyId: appUser.familyId,
    type: 'budget_rule',
    budgetRule: {
      needs,
      wants,
      goals
    },
    updatedBy: appUser.uid,
    updatedByName: appUser.name || appUser.email || 'Usuário',
    updatedAt: serverTimestamp()
  }, { merge: true });
}
