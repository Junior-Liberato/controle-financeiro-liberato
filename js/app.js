import { observarAutenticacao, entrar, sair, recuperarSenha } from './auth.js';
import { renderDashboard } from './dashboard.js';

const app = document.querySelector('#app');

function renderLogin(message = '') {
  app.innerHTML = `
    <section class="center-shell">
      <div class="login-card">
        <div class="brand-mark">FL</div>
        <h1>Família Liberato</h1>
        <p class="muted">Controle financeiro familiar</p>

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

observarAutenticacao((firebaseUser, appUser) => {
  if (!firebaseUser || !appUser) {
    renderLogin();
    return;
  }

  renderDashboard(app, appUser);

  const logoutButton = document.querySelector('#logout-btn');

  logoutButton?.addEventListener('click', async () => {
    await sair();
  });
});
