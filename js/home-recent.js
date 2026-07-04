import { listAccountsByMonth } from './accounts.js';
import { formatCurrency, formatDateBR } from './formatters.js';

let currentUser = null;
let observerStarted = false;
let renderTimer = null;

function getReferenceMonth() {
  return document.querySelector('#reference-month-filter')?.value || new Date().toISOString().slice(0, 7);
}

function getCreatedAtTime(account) {
  if (account.createdAt?.toDate) return account.createdAt.toDate().getTime();
  if (account.createdAt) return new Date(account.createdAt).getTime();
  return 0;
}

function getStatusLabel(account) {
  if (account.status === 'paid') return 'Pago';
  return 'Em aberto';
}

function buildRecentHomePanel(accounts) {
  const latest = [...accounts]
    .sort((a, b) => getCreatedAtTime(b) - getCreatedAtTime(a))
    .slice(0, 5);

  return `
    <section class="home-recent-panel">
      <div class="panel-header">
        <h3>Últimos lançamentos</h3>
        <small class="muted">Os 5 mais recentes do mês selecionado</small>
      </div>

      ${latest.length ? `
        <div class="home-recent-list">
          ${latest.map((account) => `
            <article class="home-recent-row">
              <div>
                <strong>${account.description || 'Sem descrição'}</strong>
                <span>${formatDateBR(account.dueDate)} • ${getStatusLabel(account)} • ${account.createdByName || 'Usuário'}</span>
              </div>
              <strong class="home-recent-value">${formatCurrency(account.amount)}</strong>
            </article>
          `).join('')}
        </div>
      ` : '<div class="empty-state">Nenhum lançamento encontrado neste mês.</div>'}
    </section>
  `;
}

async function renderHomeRecent() {
  if (!currentUser) return;

  const secondaryMetrics = document.querySelector('.secondary-metrics');
  if (!secondaryMetrics) return;

  document.querySelector('.home-recent-panel')?.remove();

  const accounts = await listAccountsByMonth(currentUser, getReferenceMonth());
  secondaryMetrics.insertAdjacentHTML('afterend', buildRecentHomePanel(accounts));
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    renderHomeRecent().catch((error) => {
      console.error('Erro ao renderizar últimos lançamentos:', error);
    });
  }, 200);
}

export function observeHomeRecent(appUser) {
  currentUser = appUser;
  scheduleRender();

  if (observerStarted) return;

  const app = document.querySelector('#app');
  const observer = new MutationObserver(() => scheduleRender());
  observer.observe(app, { childList: true, subtree: true });
  observerStarted = true;
}
