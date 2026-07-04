const explanations = {
  needs: {
    title: 'Necessidades',
    text: 'São os gastos essenciais para manter a vida funcionando: moradia, água, luz, internet, alimentação, saúde, educação e transporte essencial.',
    summary: 'Tudo aquilo que normalmente não dá para cortar sem afetar a rotina da casa.'
  },
  wants: {
    title: 'Desejos',
    text: 'São gastos de conforto, lazer e escolhas pessoais: streaming, restaurantes, passeios, compras pessoais e assinaturas não essenciais.',
    summary: 'São importantes para qualidade de vida, mas podem ser ajustados quando necessário.'
  },
  goals: {
    title: 'Reserva e objetivos',
    text: 'É o dinheiro voltado para segurança e futuro: reserva de emergência, investimentos, metas e amortizações planejadas.',
    summary: 'Essa parte ajuda a família a construir estabilidade e realizar planos.'
  }
};

function getKeyFromCard(card) {
  if (card.dataset.budgetKey) return card.dataset.budgetKey;

  const title = card.querySelector('.budget-rule-title strong')?.textContent?.trim().toLowerCase() || '';

  if (title.includes('necess')) return 'needs';
  if (title.includes('desej')) return 'wants';
  if (title.includes('reserva') || title.includes('objetivo')) return 'goals';

  return null;
}

function openBudgetExplanation(key) {
  const item = explanations[key];

  if (!item) return;

  document.querySelector('#budget-explanation-modal')?.remove();

  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-backdrop" id="budget-explanation-modal">
      <div class="modal-card small-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Regra financeira</span>
            <h3>${item.title}</h3>
          </div>
          <button class="btn btn-secondary" id="close-budget-explanation" type="button">Fechar</button>
        </div>

        <p class="muted">${item.text}</p>

        <div class="empty-state">
          <strong>Resumo:</strong><br>
          ${item.summary}
        </div>
      </div>
    </div>
  `);

  document.querySelector('#close-budget-explanation')?.addEventListener('click', () => {
    document.querySelector('#budget-explanation-modal')?.remove();
  });
}

function markCardsAsClickable() {
  document.querySelectorAll('.budget-rule-card').forEach((card) => {
    card.classList.add('clickable-budget-card');
  });
}

export function setupBudgetClickFix() {
  markCardsAsClickable();

  document.addEventListener('click', (event) => {
    const card = event.target.closest('.budget-rule-card');

    if (!card) return;

    const key = getKeyFromCard(card);
    openBudgetExplanation(key);
  });

  const observer = new MutationObserver(() => markCardsAsClickable());
  observer.observe(document.body, { childList: true, subtree: true });
}
