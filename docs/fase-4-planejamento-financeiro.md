# Fase 4 - Planejamento Financeiro Familiar

## Objetivo

Transformar o sistema de um controle de lançamentos para uma plataforma de planejamento financeiro familiar.

A ideia central é separar o que é lançamento eventual, conta fixa, pagamento, responsabilidade individual e planejamento de renda.

---

## 1. Conceito de Despesas Previstas

Despesas previstas devem representar somente valores ainda não pagos no mês selecionado.

Regra:

```txt
Despesas previstas = Em aberto + Atrasado
```

Valores pagos deixam de ser previsão e passam para:

```txt
Pago no mês
```

---

## 2. Contas Fixas

Criar um módulo para despesas recorrentes que acontecem todo mês, como:

- Internet
- Academia
- Assinaturas de streaming
- Curso
- Seguro do carro
- Seguro da casa
- Financiamento
- Condomínio
- Plano de saúde

### Regra

A conta fixa é cadastrada uma única vez.

Todo mês o sistema gera ou prevê automaticamente o lançamento correspondente.

Se o valor mudar, o usuário atualiza a conta fixa e o histórico anterior permanece preservado.

### Coleção sugerida

```txt
fixedAccounts
```

### Campos sugeridos

```txt
familyId
description
categoryId
amount
dueDay
ownerUserId
splitMode
status
startMonth
endMonth
createdBy
createdAt
updatedBy
updatedAt
isArchived
```

### Tipos de divisão

```txt
individual
proporcional_por_renda
meio_a_meio
manual
```

---

## 3. Visão Consolidada vs Individual

O sistema deve permitir duas leituras:

### Visão consolidada

Mostra a família como uma unidade financeira.

Usada para:

- total de receitas
- total de despesas
- total pago
- total em aberto
- saldo familiar
- planejamento conjunto

### Visão individual

Mostra a responsabilidade e participação de cada pessoa.

Usada para:

- quem lançou
- quem pagou
- quanto cada um deve contribuir
- quanto cada um já pagou
- saldo individual dentro da divisão familiar

---

## 4. Divisão Proporcional por Renda

O sistema deverá permitir cadastrar a renda mensal de cada usuário.

Exemplo:

```txt
Junior: R$ 4.000,00
Júlia: R$ 2.000,00
Total familiar: R$ 6.000,00
```

Participação proporcional:

```txt
Junior: 66,67%
Júlia: 33,33%
```

Se uma despesa conjunta for R$ 900,00:

```txt
Junior contribui: R$ 600,00
Júlia contribui: R$ 300,00
```

### Coleção sugerida

```txt
incomeProfiles
```

### Campos sugeridos

```txt
familyId
userId
userName
referenceMonth
incomeAmount
createdAt
updatedAt
```

---

## 5. Regra 50/30/20

A regra 50/30/20 será usada como painel de saúde financeira.

### Estrutura

```txt
50% - Necessidades
30% - Desejos
20% - Reserva / investimentos / dívidas estratégicas
```

### Classificação por categoria

Necessidades:

- Moradia
- Água
- Luz
- Internet
- Alimentação essencial
- Saúde
- Transporte essencial
- Seguro

Desejos:

- Streaming
- Lazer
- Restaurantes
- Compras pessoais
- Assinaturas não essenciais

Reserva / 20%:

- Reserva de emergência
- Investimentos
- Amortização planejada de dívida
- Objetivos financeiros

### Indicadores

```txt
Renda total
Limite 50%
Gasto real 50%
Limite 30%
Gasto real 30%
Meta 20%
Valor reservado
Desvio da regra
```

---

## 6. Módulos futuros indispensáveis

### Contas fixas

Cadastrar despesas recorrentes.

### Receitas

Cadastrar renda mensal individual e familiar.

### Planejamento

Simular mês antes de ele acontecer.

### Relatórios

Exportar visão mensal em Excel ou PDF.

### Histórico

Consultar meses anteriores sem perder registros.

### Auditoria

Preservar quem lançou, quem pagou, quem excluiu e quando cada ação ocorreu.

---

## 7. Próximas implementações recomendadas

1. Criar módulo de receitas.
2. Criar cadastro de contas fixas.
3. Criar geração automática de lançamentos mensais a partir das contas fixas.
4. Criar visão consolidada e individual.
5. Criar painel da regra 50/30/20.
6. Criar relatório mensal.
