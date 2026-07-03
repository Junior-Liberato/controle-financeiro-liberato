# Regras de Negócio

## Sistema Financeiro Familiar Liberato

Este documento define as regras funcionais do aplicativo.

## 1. Acesso e segurança

- O aplicativo poderá estar disponível por link público.
- Os dados somente serão exibidos após login.
- Apenas usuários autorizados poderão acessar a família vinculada.
- Cada registro terá `familyId`.
- Cada criação e alteração registrará o usuário responsável.

## 2. Histórico

- O sistema não apagará dados automaticamente.
- Dados antigos poderão ser arquivados.
- O histórico financeiro será tratado como patrimônio da família.
- A exclusão definitiva será usada apenas em situações específicas.

## 3. Contas a pagar

Uma conta representa um compromisso financeiro fora do cartão de crédito.

Exemplos:

- Luz
- Água
- Internet
- Aluguel
- Condomínio
- Financiamento
- Assinaturas
- Boletos

Regras:

- Toda conta deve ter descrição, valor, vencimento, categoria e responsável.
- Contas vencidas e não pagas serão classificadas como atrasadas.
- Conta paga deve registrar data de pagamento.
- Contas canceladas não entram no total a pagar.
- Contas arquivadas não aparecem na visão mensal padrão.

## 4. Receitas

Uma receita representa entrada de dinheiro.

Exemplos:

- Salário
- Renda extra
- Reembolso
- Venda
- Benefício

Regras:

- Toda receita deve ter descrição, valor, data e responsável.
- Receita recorrente será implementada em versão futura.
- Receita cancelada ou arquivada não entra nos totais do mês.

## 5. Cartões de crédito

Cada cartão terá configuração própria.

Campos principais:

- nome
- banco
- titular
- limite
- dia de fechamento
- dia de vencimento
- status

Regras:

- Cada cartão calcula sua própria fatura.
- Cada cartão pode ter fechamento e vencimento diferentes.
- Cartões inativos não aceitam novas compras, mas mantêm histórico.
- Cartões cancelados preservam faturas antigas.

## 6. Alteração de fechamento e vencimento

O usuário poderá alterar fechamento e vencimento de cada cartão.

Regras:

- Alterações não devem modificar faturas antigas automaticamente.
- O sistema deve manter histórico de configuração do cartão.
- Ao alterar as datas, o sistema deverá permitir aplicar a mudança somente às próximas faturas ou também à fatura atual.
- Faturas futuras usam a configuração mais recente válida.
- Faturas antigas usam a configuração vigente na época.

## 7. Compras no cartão

O usuário poderá lançar compras ao longo do mês.

Regras:

- A compra deve ser vinculada a um cartão.
- A compra pode ser à vista ou parcelada.
- Se for parcelada, o sistema gera parcelas automaticamente.
- Cada parcela será vinculada ao mês/fatura correspondente.
- A compra original guarda o valor total.
- As parcelas guardam os valores mensais.

Exemplo:

Compra de R$ 600,00 em 3 parcelas.

O sistema gera:

- parcela 1 de 3: R$ 200,00
- parcela 2 de 3: R$ 200,00
- parcela 3 de 3: R$ 200,00

## 8. Fatura provisória

Durante o mês, o sistema calcula a fatura provisória com base nas parcelas lançadas.

Essa fatura é uma previsão.

Ela serve para acompanhamento, mas ainda não é o valor oficial.

## 9. Fatura fechada

Quando a fatura real fechar, o usuário poderá lançar o valor oficial.

Regra principal:

O valor da fatura fechada prevalece sobre a soma das compras lançadas.

Exemplo:

- Compras lançadas no app: R$ 1.250,00
- Fatura real fechada: R$ 1.430,00
- Diferença: R$ 180,00

Nesse caso, o valor oficial a pagar será R$ 1.430,00.

A diferença será registrada como ajuste de conciliação.

## 10. Conciliação da fatura

Ao lançar a fatura fechada, o sistema compara:

```txt
closedAmount - calculatedAmount = differenceAmount
```

Se a diferença for zero:

```txt
status = reconciled
```

Se houver diferença:

```txt
status = with_difference
```

A diferença indica compras não lançadas, ajustes, juros, encargos ou arredondamentos.

## 11. Pagamento da fatura

A fatura pode ser marcada como paga.

Regras:

- O pagamento registra `paidAt`.
- A fatura paga entra como despesa realizada.
- Se houver valor fechado, o pagamento considera `closedAmount`.
- Se não houver valor fechado, o pagamento considera `calculatedAmount`.

## 12. Dashboard

O dashboard deve apresentar visão mensal.

Indicadores:

- receitas do mês
- despesas previstas
- total pago
- total em aberto
- total atrasado
- saldo previsto
- próximos vencimentos
- resumo dos cartões

Regras:

- Contas canceladas não entram nos totais.
- Faturas fechadas usam valor oficial.
- Faturas não fechadas usam valor calculado.
- Receitas entram conforme mês de referência.

## 13. Calendário financeiro

O calendário mostrará eventos por data.

Eventos possíveis:

- vencimento de conta
- pagamento de conta
- recebimento de receita
- fechamento de fatura
- vencimento de fatura

## 14. Backup

O sistema deverá permitir exportação dos dados.

Tipos:

- JSON completo
- CSV para análise
- Excel em versão futura

Regras:

- O backup JSON será a base para restauração completa.
- CSV e Excel serão usados para conferência e relatórios.

## 15. Auditoria

Ações importantes devem gerar log.

Exemplos:

- criação de conta
- pagamento de conta
- alteração de cartão
- fechamento de fatura
- exportação de backup

## 16. Princípio geral

O sistema deve funcionar mesmo quando o uso não for perfeito.

Por isso:

- compras do cartão podem ser lançadas ao longo do mês;
- fatura fechada corrige a realidade;
- diferenças são registradas;
- histórico não é apagado;
- alterações em cartões preservam configurações antigas.
