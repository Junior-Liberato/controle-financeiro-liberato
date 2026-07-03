import { createAccount, listAccountsByMonth } from './accounts.js';
import { formatCurrency, formatDateBR, getCurrentReferenceMonth } from './formatters.js';

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

function buildAccountsList(accounts) {
  if (!accounts.length) {
    return '<div class="empty-state">Nenhuma conta cadastrada ainda.</div>';
  }

  return `
    <div class="accounts-list">
      ${accounts.map((account) => `
        <div class="account-row">
          <div>
            <strong>${account.description}</strong>
            <div class="account-meta">
              Vencimento: ${formatDateBR(account.dueDate)} • Status: ${isOverdue(account) ? 'Atrasado' : 'Em aberto'}
            </div>
          </div>
          <div class="account-value">${formatCurrency(account.amount)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function buildNewAccountModal(appUser, referenceMonth) {
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
              <option value="agua-luz-internet">Água, Luz e Internet</option>
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

export async function renderDashboard(app, appUser) {
  const userName = appUser?.name || 'Usuário';
  const referenceMonth = getCurrentReferenceMonth();
  const accounts = await listAccountsByMonth(appUser, referenceMonth);

  const totalExpenses = accounts
    .filter((account) => account.status !== 'cancelled')
    .reduce((sum, account) => sum + Number(account.amount || 0), 0);

  const totalOpen = accounts
    .filter((account) => account.status === 'open')
    .reduce((sum, account) => sum + Number(account.amount || 0), 0);

  const totalOverdue = accounts
    .filter((account) => isOverdue(account))
    .reduce((sum, account) => sum + Number(account.amount || 0), 0);

  app.innerHTML = `
    <section class="app-layout">
      <header class="topbar">
        <div>
          <span class="eyebrow">Sistema Financeiro Familiar</span>
          <h2>Olá, ${userName}</h2>
        </div>
        <button id="logout-btn" class="btn btn-secondary">Sair</button>
      </header>

      <section class="dashboard-grid">
        <article class="metric-card">
          <span>Receitas do mês</span>
          <strong>${formatCurrency(0)}</strong>
        </article>
        <article class="metric-card">
          <span>Despesas previstas</span>
          <strong>${formatCurrency(totalExpenses)}</strong>
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

  const openModalButton = document.querySelector('#open-account-modal');

  openModalButton?.addEventListener('click', () => {
    document.body.insertAdjacentHTML('beforeend', buildNewAccountModal(appUser, referenceMonth));

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
          referenceMonth,
          notes: document.querySelector('#account-notes').value.trim()
        });

        closeModal();
        await renderDashboard(app, appUser);
      } catch (error) {
        console.error('Erro ao salvar conta:', error);
        status.textContent = `Erro ao salvar: ${error.code || 'erro-desconhecido'}`;
      }
    });
  });
}
