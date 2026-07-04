# Estratégia de Aplicação da Regra 50/30/20

## Objetivo

Aplicar a regra 50/30/20 como uma régua de saúde financeira familiar, não como uma regra rígida.

O sistema deverá mostrar onde a família está em relação ao ideal e permitir análise consolidada e individual.

---

## Estrutura da regra

```txt
50% - Necessidades
30% - Desejos
20% - Reserva, investimentos, metas ou amortizações planejadas
```

---

## Passo 1 - Cadastrar receitas

Cada usuário cadastra sua renda mensal.

Exemplo:

```txt
Junior: R$ 4.000,00
Júlia: R$ 2.000,00
Renda familiar total: R$ 6.000,00
```

A partir disso, o sistema calcula os limites:

```txt
Necessidades - 50%: R$ 3.000,00
Desejos - 30%: R$ 1.800,00
Reserva/Objetivos - 20%: R$ 1.200,00
```

---

## Passo 2 - Classificar cada lançamento

Cada categoria terá um grupo orçamentário chamado `budgetGroup`.

Valores possíveis:

```txt
needs
wants
goals
```

Tradução:

```txt
needs = Necessidades
wants = Desejos
goals = Reserva, investimentos, metas ou amortizações planejadas
```

Exemplos:

```txt
Água -> needs
Luz -> needs
Internet -> needs
Moradia -> needs
Alimentação -> needs
Saúde -> needs
Seguro -> needs
Streaming -> wants
Lazer -> wants
Restaurantes -> wants
Academia -> wants ou needs, conforme decisão da família
Investimentos -> goals
Reserva de emergência -> goals
Amortização planejada -> goals
```

---

## Passo 3 - Calcular o realizado do mês

O sistema soma os lançamentos do mês por grupo:

```txt
Total needs
Total wants
Total goals
```

A análise pode funcionar em dois modos:

```txt
Modo competência: considera todos os lançamentos do mês, pagos ou não pagos.
Modo caixa: considera apenas lançamentos pagos.
```

Decisão inicial:

```txt
O painel principal deve começar pelo modo competência.
```

Motivo: ele mostra o compromisso financeiro real do mês, mesmo que ainda não tenha sido pago.

---

## Passo 4 - Comparação visual

O painel 50/30/20 deve mostrar, para cada grupo:

```txt
Grupo
Limite ideal
Valor realizado
Diferença
Percentual usado
Status
```

Exemplo:

```txt
Necessidades
Limite: R$ 3.000,00
Realizado: R$ 3.250,00
Diferença: -R$ 250,00
Uso: 108,33%
Status: Acima do recomendado
```

---

## Passo 5 - Alertas simples

O sistema deverá interpretar os números em linguagem simples.

Exemplos:

```txt
Necessidades estão acima do recomendado.
Desejos estão dentro do limite.
Reserva do mês ainda não atingiu a meta de 20%.
```

---

## Passo 6 - Divisão proporcional por renda

Depois de classificar os gastos, o sistema calcula quanto cada pessoa deveria contribuir com base na renda.

Exemplo:

```txt
Renda total: R$ 6.000,00
Junior representa 66,67% da renda
Júlia representa 33,33% da renda
```

Se as necessidades do mês forem R$ 3.000,00:

```txt
Junior deveria contribuir: R$ 2.000,00
Júlia deveria contribuir: R$ 1.000,00
```

O sistema também compara com o que cada pessoa efetivamente pagou:

```txt
Quanto cada um deveria contribuir
Quanto cada um pagou
Diferença entre ideal e realizado
```

---

## Passo 7 - Visão consolidada vs individual

### Visão consolidada

Mostra a família como uma unidade financeira:

```txt
Renda total
Gastos totais
Pago no mês
Em aberto
Atrasado
Saldo previsto
Distribuição 50/30/20
```

### Visão individual

Mostra cada usuário:

```txt
Renda individual
Participação percentual na renda
Valor ideal de contribuição
Valor efetivamente pago
Saldo entre ideal e pago
Lançamentos feitos
Pagamentos realizados
```

---

## Ordem de implementação

```txt
1. Criar módulo de receitas
2. Cadastrar renda mensal por usuário
3. Criar grupo orçamentário nas categorias
4. Salvar budgetGroup em cada lançamento
5. Criar painel 50/30/20 consolidado
6. Criar cálculo proporcional por renda
7. Criar visão individual por usuário
8. Criar alertas automáticos
9. Integrar contas fixas ao planejamento
```

---

## Decisão prática

A regra 50/30/20 não deve bloquear lançamentos.

Ela deve funcionar como orientação, mostrando:

```txt
onde está dentro do limite
onde passou do recomendado
quanto falta para atingir reserva/meta
quanto cada pessoa deveria contribuir
quanto cada pessoa já contribuiu
```
