export function renderDashboard(app, appUser) {
  const userName = appUser?.name || 'Usuário';

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
          <strong>R$ 0,00</strong>
        </article>
        <article class="metric-card">
          <span>Despesas previstas</span>
          <strong>R$ 0,00</strong>
        </article>
        <article class="metric-card">
          <span>Em aberto</span>
          <strong>R$ 0,00</strong>
        </article>
        <article class="metric-card warning">
          <span>Atrasado</span>
          <strong>R$ 0,00</strong>
        </article>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h3>Próximos vencimentos</h3>
          <button class="btn btn-primary">+ Nova conta</button>
        </div>
        <div class="empty-state">
          Nenhuma conta cadastrada ainda.
        </div>
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
}
