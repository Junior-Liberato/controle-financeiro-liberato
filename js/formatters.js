export function formatCurrency(value) {
  const numberValue = Number(value || 0);

  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function getCurrentReferenceMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

export function formatDateBR(dateValue) {
  if (!dateValue) return '-';

  const date = typeof dateValue.toDate === 'function'
    ? dateValue.toDate()
    : new Date(dateValue);

  return date.toLocaleDateString('pt-BR');
}
