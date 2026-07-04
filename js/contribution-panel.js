import { listAccountsByMonth } from './accounts.js';
import { calculateIncomeContribution } from './budget-rule.js';
import { formatCurrency } from './formatters.js';
import { listRevenuesByMonth } from './revenues.js';

let observerStarted = false;
let renderTimer = null;
let currentUser = null;

function ensureContributionStyles() {
  if (document.querySelector('#contribution-css')) return;

  const link = document.createElement('link');
  link.id = 'contribution-css';
  link.rel = 'stylesheet';
  link.href = 'css/contribution.css?v=20260704-19';
  document.head.appendChild(link);
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
}

function getReferenceMonth() {
  return document.querySelector('#reference-month-filter')?.value || new Date().toISOString().slice(0, 7);
}

function getDifferenceLabel(value) {
  if (value > 0) return `Pagou ${formatCurrency(value)} acima do proporcional`;
  if (value < 0) return `Falta ${formatCurrency(Math.abs(value))} para o proporcional`;
  return 'Equilibrado com o proporcional';
}

function buildContributionHtml(contributions) {
  if (!contributions.length) {
    return `
      <section class="income-contribution-panel">
        <div class="income-contribution-header">
          <strong>Divisão proporcional por renda</strong>
          <span>Cadastre a renda de cada usuário para visualizar a divisão.</span>
        </div>
      </section>
    `;
  }

  return `
    <section class="income-contribution-panel">
      <div class="income-contribution-header">
        <strong>Divisão proporcional por renda</strong>
        <span>Mostra a participação de cada usuário na renda familiar e compara com o que já foi pago.</span>
      </div>

      <div class="income-contribution-grid">
        ${contributions.map((item) => `
          <article class="income-user-card">
            <div class="income-user-title">
              <strong>${item.userName}</strong>
              <span>${formatPercent(item.incomePercent)}</span>
            </div>

            <div class="income-user-bar">
              <span style="width: ${Math.min(item.incomePercent * 100, 100)}%"></span>
            </div>

            <div class="income-user-values">
              <div><span>Renda cadastrada</span><strong>${formatCurrency(item.incomeAmount)}</strong></div>
              <div><span>Contribuição ideal</span><strong>${formatCurrency(item.idealContribution)}</strong></div>
              <div><span>Pago no mês</span><strong>${formatCurrency(item.paidAmount)}</strong></div>
            </div>

            <p class="income-user-message ${item.difference < 0 ? 'negative' : 'positive'}">
              ${getDifferenceLabel(item.difference)}
            </p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

async function renderContributionPanel() {
  if (!currentUser) return;

  const planningPanel = document.querySelector('.planning-panel');

  if (!planningPanel) return;

  const referenceMonth = getReferenceMonth();
  const [accounts, revenues] = await Promise.all([
    listAccountsByMonth(currentUser, referenceMonth),
    listRevenuesByMonth(currentUser, referenceMonth)
  ]);

  const contributions = calculateIncomeContribution(accounts, revenues);
  const existingPanel = planningPanel.querySelector('.income-contribution-panel');
  existingPanel?.remove();

  planningPanel.insertAdjacentHTML('beforeend', buildContributionHtml(contributions));
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    renderContributionPanel().catch((error) => {
      console.error('Erro ao renderizar contribuição proporcional:', error);
    });
  }, 200);
}

export function observeContributionPanel(appUser) {
  currentUser = appUser;
  ensureContributionStyles();
  scheduleRender();

  if (observerStarted) return;

  const app = document.querySelector('#app');
  const observer = new MutationObserver(() => {
    scheduleRender();
  });

  observer.observe(app, {
    childList: true,
    subtree: true
  });

  observerStarted = true;
}
