export const budgetGroups = {
  needs: {
    label: 'Necessidades',
    percent: 0.5,
    description: 'Moradia, contas essenciais, alimentação, saúde e transporte essencial.'
  },
  wants: {
    label: 'Desejos',
    percent: 0.3,
    description: 'Lazer, assinaturas, compras pessoais e gastos flexíveis.'
  },
  goals: {
    label: 'Reserva e objetivos',
    percent: 0.2,
    description: 'Reserva, investimentos, metas e amortizações planejadas.'
  }
};

export function getBudgetGroupByCategory(categoryId) {
  const map = {
    agua: 'needs',
    luz: 'needs',
    internet: 'needs',
    moradia: 'needs',
    alimentacao: 'needs',
    transporte: 'needs',
    saude: 'needs',
    educacao: 'needs',
    'cartao-credito': 'wants',
    lazer: 'wants',
    assinaturas: 'wants',
    outros: 'wants'
  };

  return map[categoryId] || 'wants';
}

export function calculateBudgetRule(accounts, totalIncome) {
  const summary = {
    needs: { ...budgetGroups.needs, actual: 0 },
    wants: { ...budgetGroups.wants, actual: 0 },
    goals: { ...budgetGroups.goals, actual: 0 }
  };

  accounts
    .filter((account) => account.status !== 'cancelled')
    .forEach((account) => {
      const group = getBudgetGroupByCategory(account.categoryId);
      summary[group].actual += Number(account.amount || 0);
    });

  return Object.entries(summary).map(([key, item]) => {
    const limit = Number(totalIncome || 0) * item.percent;
    const difference = limit - item.actual;
    const usedPercent = limit > 0 ? (item.actual / limit) * 100 : 0;

    return {
      key,
      label: item.label,
      description: item.description,
      percent: item.percent,
      limit,
      actual: item.actual,
      difference,
      usedPercent,
      status: usedPercent > 100 ? 'above' : 'ok'
    };
  });
}
