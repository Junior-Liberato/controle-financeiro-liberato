let activeView = 'home';

const viewConfig = {
  home: {
    label: 'Início',
    selectors: ['.dashboard-grid', '.secondary-metrics']
  },
  accounts: {
    label: 'Contas',
    selectors: ['.dashboard-controls', '.panel']
  },
  cards: {
    label: 'Cartões',
    selectors: []
  },
  revenues: {
    label: 'Receitas',
    selectors: ['.planning-panel .income-contribution-panel']
  },
  more: {
    label: 'Mais',
    selectors: ['.planning-panel']
  }
};

function getAllManagedSelectors() {
  return Object.values(viewConfig)
    .flatMap((view) => view.selectors);
}

function ensureEmptyView(viewKey) {
  const appLayout = document.querySelector('.app-layout');
  const existing = document.querySelector('#empty-view-message');

  existing?.remove();

  if (!appLayout) return;

  if (viewConfig[viewKey].selectors.length) return;

  const message = document.createElement('section');
  message.id = 'empty-view-message';
  message.className = 'panel empty-view-panel';
  message.innerHTML = `
    <h3>${viewConfig[viewKey].label}</h3>
    <div class="empty-state">Este módulo já está reservado no projeto e será implementado nas próximas etapas.</div>
  `;

  const bottomNav = document.querySelector('.bottom-nav');
  appLayout.insertBefore(message, bottomNav);
}

function applyView(viewKey) {
  activeView = viewKey;

  getAllManagedSelectors().forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add('view-hidden');
    });
  });

  viewConfig[viewKey].selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.remove('view-hidden');
    });
  });

  ensureEmptyView(viewKey);

  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewKey);
  });
}

function upgradeBottomNav() {
  const labels = {
    home: 'Início',
    accounts: 'Contas',
    cards: 'Cartões',
    revenues: 'Receitas',
    more: 'Mais'
  };

  const buttons = document.querySelectorAll('.bottom-nav .nav-item');
  const keys = Object.keys(labels);

  buttons.forEach((button, index) => {
    const key = keys[index] || 'home';
    button.dataset.view = key;
    button.textContent = labels[key];
    button.type = 'button';
    button.addEventListener('click', () => applyView(key));
  });
}

export function setupNavigation() {
  upgradeBottomNav();
  applyView(activeView);
}
