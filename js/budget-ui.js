import { budgetGroups } from './budget-rule.js';
import { getBudgetSettings, saveBudgetSettings } from './budget-settings.js';

let currentUser = null;
let observerStarted = false;
let currentSettings = null;
let rerenderCallback = null;

function buildBudgetSettingsButton() {
  return `
    <button class="btn btn-secondary budget-config-btn" id="open-budget-settings" type="button">
      Configurar proporção
    </button>
  `;
}

function buildBudgetExplanationModal(item) {
  return `
    <div class="modal-backdrop" id="budget-explanation-modal">
      <div class="modal-card small-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Regra financeira</span>
            <h3>${item.label}</h3>
          </div>
          <button class="btn btn-secondary" id="close-budget-explanation" type="button">Fechar</button>
        </div>

        <p class="muted">${item.description}</p>

        <div class="empty-state">
          <strong>Resumo:</strong><br>
          ${item.key === 'needs' ? 'Aqui entram os gastos que você precisa pagar para manter a vida funcionando.' : ''}
          ${item.key === 'wants' ? 'Aqui entram os gastos de escolha, conforto e lazer. São importantes, mas podem ser ajustados.' : ''}
          ${item.key === 'goals' ? 'Aqui entra o dinheiro que ajuda a construir segurança e futuro financeiro.' : ''}
        </div>
      </div>
    </div>
  `;
}

function buildBudgetSettingsModal(settings) {
  return `
    <div class="modal-backdrop" id="budget-settings-modal">
      <div class="modal-card small-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Planejamento</span>
            <h3>Configurar proporção</h3>
          </div>
          <button class="btn btn-secondary" id="close-budget-settings" type="button">Fechar</button>
        </div>

        <p class="muted">A soma precisa fechar exatamente 100%.</p>

        <form id="budget-settings-form" class="form-stack">
          <label class="field-label">
            Necessidades (%)
            <input class="input" id="budget-needs" type="number" min="0" max="100" required value="${settings.needs}">
          </label>

          <label class="field-label">
            Desejos (%)
            <input class="input" id="budget-wants" type="number" min="0" max="100" required value="${settings.wants}">
          </label>

          <label class="field-label">
            Reserva e objetivos (%)
            <input class="input" id="budget-goals" type="number" min="0" max="100" required value="${settings.goals}">
          </label>

          <p id="budget-settings-status" class="status-message"></p>

          <div class="modal-actions">
            <button class="btn btn-secondary" id="cancel-budget-settings" type="button">Cancelar</button>
            <button class="btn btn-primary" type="submit">Salvar proporção</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function openExplanation(key) {
  const item = {
    key,
    ...budgetGroups[key]
  };

  document.body.insertAdjacentHTML('beforeend', buildBudgetExplanationModal(item));

  document.querySelector('#close-budget-explanation')?.addEventListener('click', () => {
    document.querySelector('#budget-explanation-modal')?.remove();
  });
}

function openSettingsModal() {
  document.body.insertAdjacentHTML('beforeend', buildBudgetSettingsModal(currentSettings));

  const modal = document.querySelector('#budget-settings-modal');
  const closeButton = document.querySelector('#close-budget-settings');
  const cancelButton = document.querySelector('#cancel-budget-settings');
  const form = document.querySelector('#budget-settings-form');
  const status = document.querySelector('#budget-settings-status');

  const close = () => modal?.remove();

  closeButton?.addEventListener('click', close);
  cancelButton?.addEventListener('click', close);

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const settings = {
      needs: Number(document.querySelector('#budget-needs').value || 0),
      wants: Number(document.querySelector('#budget-wants').value || 0),
      goals: Number(document.querySelector('#budget-goals').value || 0)
    };

    const total = settings.needs + settings.wants + settings.goals;

    if (total !== 100) {
      status.textContent = `A soma atual é ${total}%. Ajuste para fechar 100%.`;
      return;
    }

    status.textContent = 'Salvando proporção...';

    try {
      await saveBudgetSettings(currentUser, settings);
      currentSettings = settings;
      close();
      await rerenderCallback?.();
    } catch (error) {
      console.error('Erro ao salvar proporção:', error);
      status.textContent = `Erro ao salvar: ${error.code || error.message || 'erro-desconhecido'}`;
    }
  });
}

function enhanceBudgetPanel() {
  const planningHeader = document.querySelector('.planning-header');
  const planningPanel = document.querySelector('.planning-panel');

  if (!planningHeader || !planningPanel) return;

  if (!document.querySelector('#open-budget-settings')) {
    planningHeader.insertAdjacentHTML('beforeend', buildBudgetSettingsButton());
  }

  document.querySelector('#open-budget-settings')?.addEventListener('click', openSettingsModal);

  document.querySelectorAll('.budget-rule-card').forEach((card) => {
    const title = card.querySelector('.budget-rule-title strong')?.textContent?.trim() || '';
    const key = Object.entries(budgetGroups).find(([, value]) => value.label === title)?.[0];

    if (!key || card.dataset.explanationReady === 'true') return;

    card.dataset.explanationReady = 'true';
    card.classList.add('clickable-budget-card');
    card.addEventListener('click', () => openExplanation(key));
  });
}

export async function setupBudgetUi(appUser, rerender) {
  currentUser = appUser;
  rerenderCallback = rerender;
  currentSettings = await getBudgetSettings(appUser);
  enhanceBudgetPanel();

  if (observerStarted) return;

  const app = document.querySelector('#app');
  const observer = new MutationObserver(() => enhanceBudgetPanel());
  observer.observe(app, { childList: true, subtree: true });
  observerStarted = true;
}

export function getCurrentBudgetSettings() {
  return currentSettings;
}
