import { observarAutenticacao, entrar, sair, recuperarSenha } from './auth.js';
import { setupBudgetClickFix } from './budget-click-fix.js?v=20260704-22';
import { setupBudgetUi } from './budget-ui.js?v=20260704-21';
import { setupCardSettingsUi } from './card-settings-ui.js?v=20260704-22';
import { observeContributionPanel } from './contribution-panel.js?v=20260704-19';
import { observeHomeRecent } from './home-recent.js?v=20260704-21';
import { setupNavigation } from './navigation.js?v=20260704-21';
import { setupPaymentFlow } from './payment-flow.js?v=20260704-22';
import { renderDashboard } from './dashboard.js?v=20260704-18';

const app = document.querySelector('#app');

function renderLogin(message = '') {
  app.innerHTML = `
    <section class="center-shell">
      <div class="login-card">
        <div class="brand-mark">CF</div>
        <h1>CONTROLE FINANCEIRO</h1>
        <p class="muted">Desenvolvido por Adilson Liberato Junior</p>

        <form id="login-form" class="form-stack">
          <label class="field-label">
            E-mail
            <input class="input" id="email" type="email" autocomplete="email" required>
          </label>

          <label class="field-label">
            Senha
            <input class="input" id="password" type="password" autocomplete="current-password" required>
          </label>

          <button class="btn btn-primary" type="submit">Entrar</button>
          <button class="btn btn-ghost" id="reset-password" type="button">Esqueci minha senha</button>
        </form>

        <p id="status-message" class="status-message">${message}</p>
        <small class="muted">Acesso restrito aos usuários autorizados.</small>
      </div>
    </section>
  `;

  const form = document.querySelector('#login-form');
  const resetButton = document.querySelector('#reset-password');
  const status = document.querySelector('#status-message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.querySelector('#email').value.trim();
    const senha = document.querySelector('#password').value;

    status.textContent = 'Validando acesso...';

    try {
      await entrar(email, senha);
    } catch (error) {
      console.error('Erro ao entrar:', error);
      status.textContent = `Erro ao entrar: ${error.code || 'erro-desconhecido'}`;
    }
  });

  resetButton.addEventListener('click', async () => {
    const email = document.querySelector('#email').value.trim();

    if (!email) {
      status.textContent = 'Informe seu e-mail para recuperar a senha.';
      return;
    }

    try {
      await recuperarSenha(email);
      status.textContent = 'E-mail de recuperação enviado.';
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      status.textContent = `Erro ao recuperar: ${error.code || 'erro-desconhecido'}`;
    }
  });
}

observarAutenticacao(async (firebaseUser, appUser) => {
  if (!firebaseUser || !appUser) {
    renderLogin();
    return;
  }

  const rerender = async () => {
    await renderDashboard(app, appUser);
    setupNavigation();
  };

  await rerender();
  setupPaymentFlow();
  setupCardSettingsUi(appUser);
  setupBudgetClickFix();
  observeHomeRecent(appUser);
  observeContributionPanel(appUser);
  await setupBudgetUi(appUser, rerender);

  const logoutButton = document.querySelector('#logout-btn');

  logoutButton?.addEventListener('click', async () => {
    await sair();
  });
});
