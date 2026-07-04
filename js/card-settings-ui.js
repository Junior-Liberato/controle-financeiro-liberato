import { getCardSettings, saveCardSettings } from './card-settings.js';

let currentUser = null;
let observerStarted = false;

function buildCardSettingsModal(settings) {
  return `
    <div class="modal-backdrop" id="card-settings-modal">
      <div class="modal-card small-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Cartão de crédito</span>
            <h3>Fechamento e vencimento</h3>
          </div>
          <button class="btn btn-secondary" id="close-card-settings" type="button">Fechar</button>
        </div>

        <p class="muted">Essas datas serão usadas para definir em qual fatura cada compra no cartão vai cair.</p>

        <form id="card-settings-form" class="form-stack">
          <label class="field-label">
            Dia de fechamento
            <input class="input" id="card-closing-day" type="number" min="1" max="31" required value="${settings.closingDay}">
          </label>

          <label class="field-label">
            Dia de vencimento
            <input class="input" id="card-due-day" type="number" min="1" max="31" required value="${settings.dueDay}">
          </label>

          <p id="card-settings-status" class="status-message"></p>

          <div class="modal-actions">
            <button class="btn btn-secondary" id="cancel-card-settings" type="button">Cancelar</button>
            <button class="btn btn-primary" type="submit">Salvar configuração</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

async function openCardSettings() {
  const settings = await getCardSettings(currentUser);

  document.body.insertAdjacentHTML('beforeend', buildCardSettingsModal(settings));

  const modal = document.querySelector('#card-settings-modal');
  const closeButton = document.querySelector('#close-card-settings');
  const cancelButton = document.querySelector('#cancel-card-settings');
  const form = document.querySelector('#card-settings-form');
  const status = document.querySelector('#card-settings-status');

  const close = () => modal?.remove();

  closeButton?.addEventListener('click', close);
  cancelButton?.addEventListener('click', close);

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = 'Salvando configuração...';

    try {
      await saveCardSettings(currentUser, {
        closingDay: document.querySelector('#card-closing-day').value,
        dueDay: document.querySelector('#card-due-day').value
      });

      close();
    } catch (error) {
      console.error('Erro ao salvar configuração do cartão:', error);
      status.textContent = error.message || 'Erro ao salvar configuração.';
    }
  });
}

function injectCardSettingsOption() {
  const settingsList = document.querySelector('.settings-list');

  if (!settingsList || document.querySelector('#card-settings-option')) return;

  settingsList.insertAdjacentHTML('beforeend', `
    <button class="settings-option" id="card-settings-option" type="button">
      <strong>Configurar cartão</strong>
      <span>Defina o dia de fechamento e vencimento da fatura.</span>
    </button>
  `);

  document.querySelector('#card-settings-option')?.addEventListener('click', async () => {
    document.querySelector('#settings-modal')?.remove();
    await openCardSettings();
  });
}

export function setupCardSettingsUi(appUser) {
  currentUser = appUser;
  injectCardSettingsOption();

  if (observerStarted) return;

  const observer = new MutationObserver(() => injectCardSettingsOption());
  observer.observe(document.body, { childList: true, subtree: true });
  observerStarted = true;
}
