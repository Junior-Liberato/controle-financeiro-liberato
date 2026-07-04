import { archiveAccount, createAccount, listAccountsByMonth, markAccountAsPaid } from './accounts.js';
import { auth } from './firebase-init.js';
import { formatCurrency, formatDateBR, getCurrentReferenceMonth } from './formatters.js';
import {
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

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

function getCreatedByLabel(account) {
  return account.createdByName || account.createdBy || 'Não informado';
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

function getCreatedAtTime(account) {
  if (account.createdAt?.toDate) return account.createdAt.toDate().getTime();
  if (account.createdAt) return new Date(account.createdAt).getTime();
  return 0;
}

function sortAccountsByLatest(accounts) {
  return [...accounts].sort((a, b) => getCreatedAtTime(b) - getCreatedAtTime(a));
}

function buildPasswordModal(account) {
  return `
    <div class="modal-backdrop" id="delete-password-modal">
      <div class="modal-card small-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Confirmação de segurança</span>
            <h3>Excluir lançamento</h3>
          </div>
          <button class="btn btn-secondary" id="close-delete-modal" type="button">Fechar</button>
        </div>

        <p class="muted">Este lançamento foi criado por ${getCreatedByLabel(account)}. Para excluir, confirme sua senha de login.</p>

        <form id="delete-password-form" class="form-stack">
          <label class="field-label">
            Senha
            <input class="input" id="delete-password-input" type="password" required autocomplete="current-password">
          </label>

          <p id="delete-password-status" class="status-message"></p>

          <div class="modal-actions">
            <button class="btn btn-secondary" id="cancel-delete-password" type="button">Cancelar</button>
            <button class="btn btn-danger" type="submit">Confirmar exclusão</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function buildAccountsList(accounts) {
  const sortedAccounts = sortAccountsByLatest(accounts);

  if (!sortedAccounts.length) {
    return '<div class="empty-state">Nenhuma conta cadastrada ainda.</div>';
  }

  return `
    <div class="accounts-list">
      ${sortedAccounts.map((account) => `
        <div class="account-row account-row-premium">
          <div class="account-main">
            <div class="account-title-line">
              <span class="account-category-pill">${getCategoryLabel(account.categoryId)}</span>
              <strong>${getCategoryLabel(account.categoryId)}</strong>
            </div>
            <p class="account-subtitle">${account.notes || 'Sem observação informada.'}</p>
            <div class="account-meta">
              Descrição: ${account.description || '-'}<br>
              ID: ${account.launchCode || account.id}<br>
              Vencimento: ${formatDateBR(account.dueDate)} • Status: ${getAccountStatusLabel(account)}<br>
              Lançado por: ${getCreatedByLabel(account)}
            </div>
          </div>
          <div class="account-actions">
            <div class="account-value">${formatCurrency(account.amount)}</div>
            ${account.status === 'open' ? `<button class="btn btn-secondary pay-account-btn" data-account-id="${account.id}" type="button">Marcar como paga</button>` : ''}
            <button class="btn btn-danger delete-account-btn" data-account-id="${account.id}" type="button">Excluir</button>
          </div>
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

async function confirmOtherUserDeletion(account) {
  return new Promise((resolve) => {
    document.body.insertAdjacentHTML('beforeend', buildPasswordModal(account));

    const modal = document.querySelector('#delete-password-modal');
    const closeButton = document.querySelector('#close-delete-modal');
    const cancelButton = document.querySelector('#cancel-delete-password');
    const form = document.querySelector('#delete-password-form');
    const status = document.querySelector('#delete-password-status');

    const close = (result) => {
      modal?.remove();
      resolve(result);
    };

    closeButton?.addEventListener('click', () => close(false));
    cancelButton?.addEventListener('click', () => close(false));

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = 'Confirmando senha...';

      try {
        const currentUser = auth.currentUser;
        const password = document.querySelector('#delete-password-input').value;
        const credential = EmailAuthProvider.credential(currentUser.email, password);

        await reauthenticateWithCredential(currentUser, credential);
        close(true);
      } catch (error) {
        console.error('Erro ao confirmar senha:', error);
        status.textContent = 'Senha inválida. Tente novamente.';
      }
    });
  });
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

  document.querySelectorAll('.pay-account-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const accountId = button.dataset.accountId;
      button.textContent = 'Baixando...';
      button.disabled = true;

      try {
        await markAccountAsPaid(appUser, accountId);
        await renderDashboard(app, appUser);
      } catch (error) {
        console.error('Erro ao marcar conta como paga:', error);
        button.textContent = 'Erro ao baixar';
      }
    });
  });

  document.querySelectorAll('.delete-account-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const accountId = button.dataset.accountId;
      const account = accounts.find((item) => item.id === accountId);

      if (!account) return;

      const sameUser = account.createdBy === appUser.uid;
      const confirmed = sameUser
        ? window.confirm('Deseja realmente excluir este lançamento?')
        : await confirmOtherUserDeletion(account);

      if (!confirmed) return;

      button.textContent = 'Excluindo...';
      button.disabled = true;

      try {
        await archiveAccount(appUser, accountId);
        await renderDashboard(app, appUser);
      } catch (error) {
        console.error('Erro ao excluir lançamento:', error);
        button.textContent = 'Erro ao excluir';
      }
    });
  });

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
