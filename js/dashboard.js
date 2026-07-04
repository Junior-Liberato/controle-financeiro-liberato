import { archiveAccount, createAccount, listAccountsByMonth, markAccountAsPaid } from './accounts.js';
import { sair } from './auth.js';
import { calculateBudgetRule } from './budget-rule.js';
import { formatCurrency, formatDateBR, getCurrentReferenceMonth } from './formatters.js';
import { listRevenuesByMonth, saveMonthlyRevenue } from './revenues.js';
import {
  createOrUpdatePin,
  hasPinConfigured,
  verifyPin
} from './security.js';

let selectedReferenceMonth = getCurrentReferenceMonth();
let selectedStatusFilter = 'all';
let selectedUserFilter = 'all';

function isOverdue(account) {
  if (account.status !== 'open') return false;

  const dueDate = typeof account.dueDate?.toDate === 'function'
    ? account.dueDate.toDate()
    : new Date(account.dueDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

function getAccountStatusLabel(account) {
  if (account.status === 'paid') return 'Pago';
  if (isOverdue(account)) return 'Atrasado';
  return 'Em aberto';
}

function getAccountStatusKey(account) {
  if (account.status === 'paid') return 'paid';
  if (isOverdue(account)) return 'overdue';
  return 'open';
}

function getAccountValueClass(account) {
  return `account-value status-${getAccountStatusKey(account)}`;
}

function getCreatedByLabel(account) {
  return account.createdByName || account.createdBy || 'Não informado';
}

function getPaidByLabel(account) {
  return account.paidByName || account.paidBy || 'Não informado';
}

function getCategoryLabel(categoryId) {
  const categories = {
    agua: 'Água',
    luz: 'Luz',
    internet: 'Internet',
    moradia: 'Moradia',
    alimentacao: 'Alimentação',
    'cartao-credito': 'Cartão de Crédito',
    transporte: 'Transporte',
    saude: 'Saúde',
    educacao: 'Educação',
    lazer: 'Lazer',
    assinaturas: 'Assinaturas',
    outros: 'Outros'
  };

  return categories[categoryId] || 'Lançamento';
}

function getCreatedAtDate(account) {
  if (account.createdAt?.toDate) return account.createdAt.toDate();
  if (account.createdAt) return new Date(account.createdAt);
  return null;
}

function getCreatedAtTime(account) {
  const date = getCreatedAtDate(account);
  return date ? date.getTime() : 0;
}

function formatCreatedAt(account) {
  const date = getCreatedAtDate(account);

  if (!date) return 'Data não informada';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function sortAccountsByLatest(accounts) {
  return [...accounts].sort((a, b) => getCreatedAtTime(b) - getCreatedAtTime(a));
}

function getAccountUserKey(account) {
  return account.createdBy || 'unknown';
}

function getUserOptions(accounts) {
  const users = new Map();

  accounts.forEach((account) => {
    users.set(getAccountUserKey(account), getCreatedByLabel(account));
  });

  return [...users.entries()].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
}

function filterAccounts(accounts) {
  return accounts.filter((account) => {
    const statusMatches = selectedStatusFilter === 'all' || getAccountStatusKey(account) === selectedStatusFilter;
    const userMatches = selectedUserFilter === 'all' || getAccountUserKey(account) === selectedUserFilter;

    return statusMatches && userMatches;
  });
}

function getCurrentUserRevenue(revenues, appUser) {
  return revenues.find((revenue) => revenue.userId === appUser.uid);
}

function buildDashboardControls(accounts) {
  const statusOptions = [
    { key: 'all', label: 'Todos' },
    { key: 'open', label: 'Em aberto' },
    { key: 'paid', label: 'Pagos' },
    { key: 'overdue', label: 'Atrasados' }
  ];

  const userOptions = getUserOptions(accounts);

  return `
    <section class="dashboard-controls">
      <label class="filter-label">
        Mês de referência
        <input class="input filter-input" id="reference-month-filter" type="month" value="${selectedReferenceMonth}">
      </label>

      <label class="filter-label">
        Status
        <select class="input filter-input" id="status-filter-select">
          ${statusOptions.map((option) => `
            <option value="${option.key}" ${selectedStatusFilter === option.key ? 'selected' : ''}>${option.label}</option>
          `).join('')}
        </select>
      </label>

      <label class="filter-label">
        Usuário
        <select class="input filter-input" id="user-filter-select">
          <option value="all" ${selectedUserFilter === 'all' ? 'selected' : ''}>Todos</option>
          ${userOptions.map(([uid, name]) => `
            <option value="${uid}" ${selectedUserFilter === uid ? 'selected' : ''}>${name}</option>
          `).join('')}
        </select>
      </label>
    </section>
  `;
}

function buildPinSetupModal(title = 'Criar PIN de segurança') {
  return `
    <div class="modal-backdrop" id="pin-setup-modal">
      <div class="modal-card small-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Segurança</span>
            <h3>${title}</h3>
          </div>
          <button class="btn btn-secondary" id="close-pin-setup" type="button">Fechar</button>
        </div>

        <p class="muted">Crie um PIN de 4 números. Ele será usado para marcar contas como pagas e excluir lançamentos.</p>

        <form id="pin-setup-form" class="form-stack">
          <label class="field-label">
            Novo PIN
            <input class="input pin-input" id="new-pin-input" type="password" inputmode="numeric" maxlength="4" required placeholder="0000">
          </label>

          <label class="field-label">
            Confirmar PIN
            <input class="input pin-input" id="confirm-pin-input" type="password" inputmode="numeric" maxlength="4" required placeholder="0000">
          </label>

          <label class="field-label">
            Senha de login
            <input class="input" id="pin-password-input" type="password" required autocomplete="current-password">
          </label>

          <p id="pin-setup-status" class="status-message"></p>

          <div class="modal-actions">
            <button class="btn btn-secondary" id="cancel-pin-setup" type="button">Cancelar</button>
            <button class="btn btn-primary" type="submit">Salvar PIN</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function buildPinConfirmModal({ title, description, requireReason = false }) {
  return `
    <div class="modal-backdrop" id="pin-confirm-modal">
      <div class="modal-card small-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Confirmação por PIN</span>
            <h3>${title}</h3>
          </div>
          <button class="btn btn-secondary" id="close-pin-confirm" type="button">Fechar</button>
        </div>

        <p class="muted">${description}</p>

        <form id="pin-confirm-form" class="form-stack">
          <label class="field-label">
            PIN de 4 dígitos
            <input class="input pin-input" id="confirm-action-pin" type="password" inputmode="numeric" maxlength="4" required placeholder="0000">
          </label>

          ${requireReason ? `
            <label class="field-label">
              Justificativa obrigatória
              <textarea class="input" id="delete-reason-input" required placeholder="Explique por que este lançamento será excluído."></textarea>
            </label>
          ` : ''}

          <p id="pin-confirm-status" class="status-message"></p>

          <div class="modal-actions">
            <button class="btn btn-secondary" id="cancel-pin-confirm" type="button">Cancelar</button>
            <button class="btn btn-primary" type="submit">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function buildSettingsModal() {
  return `
    <div class="modal-backdrop" id="settings-modal">
      <div class="modal-card small-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Configurações</span>
            <h3>Preferências do sistema</h3>
          </div>
          <button class="btn btn-secondary" id="close-settings-modal" type="button">Fechar</button>
        </div>

        <div class="settings-list">
          <button class="settings-option" id="change-pin-option" type="button">
            <strong>Alterar PIN</strong>
            <span>Atualize o PIN de 4 dígitos usado em pagamentos e exclusões.</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function buildRevenueModal(currentRevenue) {
  return `
    <div class="modal-backdrop" id="revenue-modal">
      <div class="modal-card small-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Receitas</span>
            <h3>Minha renda do mês</h3>
          </div>
          <button class="btn btn-secondary" id="close-revenue-modal" type="button">Fechar</button>
        </div>

        <form id="revenue-form" class="form-stack">
          <label class="field-label">
            Renda mensal
            <input class="input" id="revenue-amount" type="number" step="0.01" min="0" required value="${currentRevenue?.incomeAmount || ''}" placeholder="0,00">
          </label>

          <label class="field-label">
            Observação
            <textarea class="input" id="revenue-notes" placeholder="Opcional">${currentRevenue?.notes || ''}</textarea>
          </label>

          <p id="revenue-status" class="status-message"></p>

          <div class="modal-actions">
            <button class="btn btn-secondary" id="cancel-revenue" type="button">Cancelar</button>
            <button class="btn btn-primary" type="submit">Salvar renda</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function buildAccountsList(accounts) {
  const filteredAccounts = filterAccounts(accounts);
  const sortedAccounts = sortAccountsByLatest(filteredAccounts);

  if (!sortedAccounts.length) {
    return '<div class="empty-state">Nenhum lançamento encontrado para os filtros selecionados.</div>';
  }

  return `
    <div class="accounts-list">
      ${sortedAccounts.map((account) => `
        <div class="account-row account-row-premium collapsed-account status-card-${getAccountStatusKey(account)}" data-account-id="${account.id}">
          <div class="account-main">
            <div class="account-title-line">
              <strong>${getCategoryLabel(account.categoryId)}</strong>
              <span class="account-created-date">${formatCreatedAt(account)}</span>
              <span class="account-status-pill status-pill-${getAccountStatusKey(account)}">${getAccountStatusLabel(account)}</span>
            </div>
            <p class="account-subtitle">${account.description || 'Sem descrição informada.'}</p>
            <div class="account-details">
              <div>Observação: ${account.notes || 'Sem observação informada.'}</div>
              <div>ID: ${account.launchCode || account.id}</div>
              <div>Vencimento: ${formatDateBR(account.dueDate)}</div>
              <div>Status: ${getAccountStatusLabel(account)}</div>
              <div>Lançado por: ${getCreatedByLabel(account)}</div>
              ${account.status === 'paid' ? `<div>Pago por: ${getPaidByLabel(account)}</div>` : ''}
            </div>
          </div>
          <div class="account-actions">
            <div class="${getAccountValueClass(account)}">${formatCurrency(account.amount)}</div>
            ${account.status === 'open' ? `<button class="btn btn-secondary pay-account-btn" data-account-id="${account.id}" type="button">Marcar como paga</button>` : ''}
            <button class="btn btn-danger delete-account-btn" data-account-id="${account.id}" type="button">Excluir</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function buildNewAccountModal() {
  return `
    <div class="modal-backdrop" id="account-modal">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Contas a pagar</span>
            <h3>Nova conta</h3>
          </div>
          <button class="btn btn-secondary" id="close-account-modal" type="button">Fechar</button>
        </div>

        <form id="new-account-form" class="form-stack">
          <label class="field-label">
            Descrição
            <input class="input" id="account-description" required placeholder="Ex: Energia elétrica">
          </label>

          <label class="field-label">
            Valor
            <input class="input" id="account-amount" type="number" step="0.01" min="0" required placeholder="0,00">
          </label>

          <label class="field-label">
            Vencimento
            <input class="input" id="account-due-date" type="date" required>
          </label>

          <label class="field-label">
            Categoria
            <select class="input" id="account-category">
              <option value="agua">Água</option>
              <option value="luz">Luz</option>
              <option value="internet">Internet</option>
              <option value="moradia">Moradia</option>
              <option value="alimentacao">Alimentação</option>
              <option value="cartao-credito">Cartão de Crédito</option>
              <option value="transporte">Transporte</option>
              <option value="saude">Saúde</option>
              <option value="educacao">Educação</option>
              <option value="lazer">Lazer</option>
              <option value="assinaturas">Assinaturas</option>
              <option value="outros">Outros</option>
            </select>
          </label>

          <label class="field-label">
            Observação
            <textarea class="input" id="account-notes" placeholder="Opcional"></textarea>
          </label>

          <p id="account-form-status" class="status-message"></p>

          <div class="modal-actions">
            <button class="btn btn-secondary" id="cancel-account" type="button">Cancelar</button>
            <button class="btn btn-primary" type="submit">Salvar conta</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function buildBudgetRulePanel(accounts, revenues) {
  const totalIncome = revenues.reduce((sum, revenue) => sum + Number(revenue.incomeAmount || 0), 0);
  const ruleItems = calculateBudgetRule(accounts, totalIncome);

  if (totalIncome <= 0) {
    return `
      <section class="planning-panel">
        <div class="planning-header">
          <div>
            <span class="eyebrow">Planejamento</span>
            <h3>Regra 50/30/20</h3>
          </div>
          <button class="btn btn-primary" id="open-revenue-modal" type="button">Cadastrar renda</button>
        </div>
        <div class="empty-state">Cadastre a renda mensal para ativar o painel da regra 50/30/20.</div>
      </section>
    `;
  }

  return `
    <section class="planning-panel">
      <div class="planning-header">
        <div>
          <span class="eyebrow">Planejamento</span>
          <h3>Regra 50/30/20</h3>
          <p class="muted">Renda familiar cadastrada: ${formatCurrency(totalIncome)}</p>
        </div>
        <button class="btn btn-primary" id="open-revenue-modal" type="button">Atualizar renda</button>
      </div>

      <div class="budget-rule-grid">
        ${ruleItems.map((item) => `
          <article class="budget-rule-card ${item.status === 'above' ? 'budget-alert' : ''}">
            <div class="budget-rule-title">
              <strong>${item.label}</strong>
              <span>${Math.round(item.percent * 100)}%</span>
            </div>
            <div class="budget-bar">
              <span style="width: ${Math.min(item.usedPercent, 100)}%"></span>
            </div>
            <div class="budget-rule-values">
              <div><span>Limite</span><strong>${formatCurrency(item.limit)}</strong></div>
              <div><span>Realizado</span><strong>${formatCurrency(item.actual)}</strong></div>
              <div><span>Diferença</span><strong>${formatCurrency(item.difference)}</strong></div>
            </div>
            <p class="budget-rule-message">${item.status === 'above' ? 'Acima do recomendado.' : 'Dentro do recomendado.'}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function setupPinInputs(scope = document) {
  scope.querySelectorAll('.pin-input').forEach((input) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 4);
    });
  });
}

async function openPinSetup(appUser, title = 'Criar PIN de segurança') {
  return new Promise((resolve) => {
    document.body.insertAdjacentHTML('beforeend', buildPinSetupModal(title));

    const modal = document.querySelector('#pin-setup-modal');
    const closeButton = document.querySelector('#close-pin-setup');
    const cancelButton = document.querySelector('#cancel-pin-setup');
    const form = document.querySelector('#pin-setup-form');
    const status = document.querySelector('#pin-setup-status');

    setupPinInputs(modal);

    const close = (result) => {
      modal?.remove();
      resolve(result);
    };

    closeButton?.addEventListener('click', () => close(false));
    cancelButton?.addEventListener('click', () => close(false));

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();

      const pin = document.querySelector('#new-pin-input').value;
      const confirmPin = document.querySelector('#confirm-pin-input').value;
      const password = document.querySelector('#pin-password-input').value;

      if (!/^\d{4}$/.test(pin)) {
        status.textContent = 'O PIN precisa ter exatamente 4 números.';
        return;
      }

      if (pin !== confirmPin) {
        status.textContent = 'Os PINs informados não conferem.';
        return;
      }

      status.textContent = 'Salvando PIN...';

      try {
        await createOrUpdatePin(appUser, pin, password);
        close(true);
      } catch (error) {
        console.error('Erro ao salvar PIN:', error);
        status.textContent = error?.code === 'permission-denied'
          ? 'Firebase bloqueou o salvamento. Verifique as regras da coleção userSecurity.'
          : 'Não foi possível salvar o PIN. Confira sua senha de login.';
      }
    });
  });
}

async function ensurePinConfigured(appUser) {
  const configured = await hasPinConfigured(appUser.uid);

  if (configured) return true;

  return openPinSetup(appUser, 'Criar PIN de segurança');
}

async function requestPinConfirmation(appUser, options) {
  const hasPin = await ensurePinConfigured(appUser);

  if (!hasPin) return { confirmed: false, reason: '' };

  return new Promise((resolve) => {
    document.body.insertAdjacentHTML('beforeend', buildPinConfirmModal(options));

    const modal = document.querySelector('#pin-confirm-modal');
    const closeButton = document.querySelector('#close-pin-confirm');
    const cancelButton = document.querySelector('#cancel-pin-confirm');
    const form = document.querySelector('#pin-confirm-form');
    const status = document.querySelector('#pin-confirm-status');

    setupPinInputs(modal);

    const close = (result) => {
      modal?.remove();
      resolve(result);
    };

    closeButton?.addEventListener('click', () => close({ confirmed: false, reason: '' }));
    cancelButton?.addEventListener('click', () => close({ confirmed: false, reason: '' }));

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();

      const pin = document.querySelector('#confirm-action-pin').value;
      const reasonInput = document.querySelector('#delete-reason-input');
      const reason = reasonInput?.value.trim() || '';

      if (options.requireReason && !reason) {
        status.textContent = 'Informe a justificativa para excluir lançamento de outro usuário.';
        return;
      }

      status.textContent = 'Validando PIN...';

      try {
        const validPin = await verifyPin(appUser.uid, pin);

        if (!validPin) {
          status.textContent = 'PIN inválido. Tente novamente.';
          return;
        }

        close({ confirmed: true, reason });
      } catch (error) {
        console.error('Erro ao validar PIN:', error);
        status.textContent = 'Não foi possível validar o PIN.';
      }
    });
  });
}

function openSettings(appUser) {
  document.body.insertAdjacentHTML('beforeend', buildSettingsModal());

  const modal = document.querySelector('#settings-modal');
  const closeButton = document.querySelector('#close-settings-modal');
  const changePinButton = document.querySelector('#change-pin-option');

  closeButton?.addEventListener('click', () => modal?.remove());

  changePinButton?.addEventListener('click', async () => {
    modal?.remove();
    await openPinSetup(appUser, 'Alterar PIN de segurança');
  });
}

function openRevenueModal(appUser, revenues, rerender) {
  const currentRevenue = getCurrentUserRevenue(revenues, appUser);
  document.body.insertAdjacentHTML('beforeend', buildRevenueModal(currentRevenue));

  const modal = document.querySelector('#revenue-modal');
  const closeButton = document.querySelector('#close-revenue-modal');
  const cancelButton = document.querySelector('#cancel-revenue');
  const form = document.querySelector('#revenue-form');
  const status = document.querySelector('#revenue-status');

  const closeModal = () => modal?.remove();

  closeButton?.addEventListener('click', closeModal);
  cancelButton?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = 'Salvando renda...';

    try {
      await saveMonthlyRevenue(appUser, {
        referenceMonth: selectedReferenceMonth,
        incomeAmount: document.querySelector('#revenue-amount').value,
        notes: document.querySelector('#revenue-notes').value.trim()
      });

      closeModal();
      await rerender();
    } catch (error) {
      console.error('Erro ao salvar renda:', error);
      status.textContent = `Erro ao salvar renda: ${error.code || 'erro-desconhecido'}`;
    }
  });
}

export async function renderDashboard(app, appUser) {
  const userName = appUser?.name || 'Usuário';
  const accounts = await listAccountsByMonth(appUser, selectedReferenceMonth);
  const revenues = await listRevenuesByMonth(appUser, selectedReferenceMonth);
  const totalIncome = revenues.reduce((sum, revenue) => sum + Number(revenue.incomeAmount || 0), 0);

  const totalForecast = accounts
    .filter((account) => account.status !== 'paid' && account.status !== 'cancelled')
    .reduce((sum, account) => sum + Number(account.amount || 0), 0);

  const totalOpen = accounts
    .filter((account) => getAccountStatusKey(account) === 'open')
    .reduce((sum, account) => sum + Number(account.amount || 0), 0);

  const totalOverdue = accounts
    .filter((account) => getAccountStatusKey(account) === 'overdue')
    .reduce((sum, account) => sum + Number(account.amount || 0), 0);

  const totalPaid = accounts
    .filter((account) => account.status === 'paid')
    .reduce((sum, account) => sum + Number(account.amount || 0), 0);

  app.innerHTML = `
    <section class="app-layout">
      <header class="topbar">
        <div>
          <span class="eyebrow">Sistema Financeiro Familiar</span>
          <h2>Olá, ${userName}</h2>
        </div>
        <div class="topbar-actions">
          <button id="settings-btn" class="btn btn-secondary icon-btn" title="Configurações" type="button">⚙️</button>
          <button id="logout-btn" class="btn btn-secondary">Sair</button>
        </div>
      </header>

      <section class="dashboard-grid">
        <article class="metric-card">
          <span>Receitas do mês</span>
          <strong>${formatCurrency(totalIncome)}</strong>
        </article>
        <article class="metric-card">
          <span>Despesas previstas</span>
          <strong>${formatCurrency(totalForecast)}</strong>
        </article>
        <article class="metric-card">
          <span>Em aberto</span>
          <strong>${formatCurrency(totalOpen)}</strong>
        </article>
        <article class="metric-card warning">
          <span>Atrasado</span>
          <strong>${formatCurrency(totalOverdue)}</strong>
        </article>
      </section>

      <section class="secondary-metrics">
        <article class="mini-metric">
          <span>Pago no mês</span>
          <strong class="status-paid">${formatCurrency(totalPaid)}</strong>
        </article>
        <article class="mini-metric">
          <span>Lançamentos</span>
          <strong>${accounts.length}</strong>
        </article>
      </section>

      ${buildBudgetRulePanel(accounts, revenues)}
      ${buildDashboardControls(accounts)}

      <section class="panel">
        <div class="panel-header">
          <h3>Próximos vencimentos</h3>
          <button class="btn btn-primary" id="open-account-modal">+ Nova conta</button>
        </div>
        ${buildAccountsList(accounts)}
      </section>

      <nav class="bottom-nav" aria-label="Menu principal">
        <button class="nav-item active">Início</button>
        <button class="nav-item">Contas</button>
        <button class="nav-item">Cartões</button>
        <button class="nav-item">Receitas</button>
        <button class="nav-item">Mais</button>
      </nav>
    </section>
  `;

  const rerender = async () => renderDashboard(app, appUser);

  document.querySelector('#logout-btn')?.addEventListener('click', async () => {
    await sair();
  });

  document.querySelector('#settings-btn')?.addEventListener('click', () => {
    openSettings(appUser);
  });

  document.querySelector('#open-revenue-modal')?.addEventListener('click', () => {
    openRevenueModal(appUser, revenues, rerender);
  });

  document.querySelector('#reference-month-filter')?.addEventListener('change', async (event) => {
    selectedReferenceMonth = event.target.value || getCurrentReferenceMonth();
    selectedUserFilter = 'all';
    await rerender();
  });

  document.querySelector('#status-filter-select')?.addEventListener('change', async (event) => {
    selectedStatusFilter = event.target.value || 'all';
    await rerender();
  });

  document.querySelector('#user-filter-select')?.addEventListener('change', async (event) => {
    selectedUserFilter = event.target.value || 'all';
    await rerender();
  });

  document.querySelectorAll('.collapsed-account').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
  });

  document.querySelectorAll('.pay-account-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      const accountId = button.dataset.accountId;

      const pinResult = await requestPinConfirmation(appUser, {
        title: 'Marcar como paga',
        description: 'Informe seu PIN para confirmar o pagamento deste lançamento.',
        requireReason: false
      });

      if (!pinResult.confirmed) return;

      button.textContent = 'Baixando...';
      button.disabled = true;

      try {
        await markAccountAsPaid(appUser, accountId);
        await rerender();
      } catch (error) {
        console.error('Erro ao marcar conta como paga:', error);
        button.textContent = 'Erro ao baixar';
      }
    });
  });

  document.querySelectorAll('.delete-account-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      const accountId = button.dataset.accountId;
      const account = accounts.find((item) => item.id === accountId);

      if (!account) return;

      const isOtherUserAccount = account.createdBy !== appUser.uid;
      const pinResult = await requestPinConfirmation(appUser, {
        title: 'Excluir lançamento',
        description: isOtherUserAccount
          ? 'Este lançamento foi criado por outro usuário. Informe seu PIN e uma justificativa para excluir.'
          : 'Informe seu PIN para excluir este lançamento.',
        requireReason: isOtherUserAccount
      });

      if (!pinResult.confirmed) return;

      button.textContent = 'Excluindo...';
      button.disabled = true;

      try {
        await archiveAccount(appUser, accountId, pinResult.reason);
        await rerender();
      } catch (error) {
        console.error('Erro ao excluir lançamento:', error);
        button.textContent = 'Erro ao excluir';
      }
    });
  });

  document.querySelector('#open-account-modal')?.addEventListener('click', () => {
    document.body.insertAdjacentHTML('beforeend', buildNewAccountModal());

    const modal = document.querySelector('#account-modal');
    const closeButton = document.querySelector('#close-account-modal');
    const cancelButton = document.querySelector('#cancel-account');
    const form = document.querySelector('#new-account-form');
    const status = document.querySelector('#account-form-status');

    const closeModal = () => modal?.remove();

    closeButton?.addEventListener('click', closeModal);
    cancelButton?.addEventListener('click', closeModal);

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = 'Salvando conta...';

      try {
        await createAccount(appUser, {
          description: document.querySelector('#account-description').value.trim(),
          amount: document.querySelector('#account-amount').value,
          dueDate: document.querySelector('#account-due-date').value,
          categoryId: document.querySelector('#account-category').value,
          referenceMonth: selectedReferenceMonth,
          notes: document.querySelector('#account-notes').value.trim()
        });

        closeModal();
        await rerender();
      } catch (error) {
        console.error('Erro ao salvar conta:', error);
        status.textContent = `Erro ao salvar: ${error.code || 'erro-desconhecido'}`;
      }
    });
  });
}
