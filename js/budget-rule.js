export const budgetGroups = {
  needs: {
    label: 'Necessidades',
    percent: 0.5,
    description: 'Gastos essenciais para manter a casa e a rotina funcionando, como moradia, água, luz, internet, alimentação, saúde e transporte.'
  },
  wants: {
    label: 'Desejos',
    percent: 0.3,
    description: 'Gastos que melhoram o conforto e o lazer, mas que podem ser ajustados quando necessário, como streaming, lazer, restaurantes e compras pessoais.'
  },
  goals: {
    label: 'Reserva e objetivos',
    percent: 0.2,
    description: 'Dinheiro reservado para segurança e crescimento financeiro, como reserva de emergência, investimentos, metas e amortizações planejadas.'
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

export function calculateBudgetRule(accounts, totalIncome, customSettings = null) {
  const settings = customSettings || {
    needs: 50,
    wants: 30,
    goals: 20
  };

  const summary = {
    needs: { ...budgetGroups.needs, percent: Number(settings.needs || 0) / 100, actual: 0 },
    wants: { ...budgetGroups.wants, percent: Number(settings.wants || 0) / 100, actual: 0 },
    goals: { ...budgetGroups.goals, percent: Number(settings.goals || 0) / 100, actual: 0 }
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

export function calculateIncomeContribution(accounts, revenues) {
  const activeAccounts = accounts.filter((account) => account.status !== 'cancelled');
  const totalIncome = revenues.reduce((sum, revenue) => sum + Number(revenue.incomeAmount || 0), 0);
  const totalExpenses = activeAccounts.reduce((sum, account) => sum + Number(account.amount || 0), 0);

  return revenues
    .map((revenue) => {
      const incomeAmount = Number(revenue.incomeAmount || 0);
      const incomePercent = totalIncome > 0 ? incomeAmount / totalIncome : 0;
      const idealContribution = totalExpenses * incomePercent;
      const paidAmount = activeAccounts
        .filter((account) => account.status === 'paid' && account.paidBy === revenue.userId)
        .reduce((sum, account) => sum + Number(account.amount || 0), 0);
      const difference = paidAmount - idealContribution;

      return {
        userId: revenue.userId,
        userName: revenue.userName || 'Usuário',
        incomeAmount,
        incomePercent,
        idealContribution,
        paidAmount,
        difference
      };
    })
    .sort((a, b) => b.incomeAmount - a.incomeAmount);
}
