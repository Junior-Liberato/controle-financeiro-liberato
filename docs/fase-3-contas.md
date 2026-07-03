# Fase 3 - Contas a Pagar

## Objetivo

Iniciar a primeira funcionalidade operacional do sistema: cadastro e listagem de contas a pagar.

## Escopo da Fase 3

- Ajustar layout do dashboard.
- Criar módulo de contas.
- Criar botão Nova Conta.
- Criar formulário de cadastro.
- Salvar conta no Firestore.
- Listar contas do mês no dashboard.
- Calcular indicadores básicos.

## Arquivos envolvidos

```txt
css/style.css
js/accounts.js
js/dashboard.js
js/app.js
js/formatters.js
```

## Status

```txt
formatters.js: concluído
accounts.js: pendente
CSS Fase 3: pendente
Dashboard com contas: pendente
```

## Observação técnica

O conector do GitHub bloqueou automaticamente alguns arquivos com gravação no Firestore e alterações maiores de interface.

Quando isso ocorrer, os arquivos serão aplicados manualmente pelo GitHub Web.

## Modelo inicial da conta

Coleção:

```txt
accounts
```

Campos principais:

```txt
familyId
description
categoryId
amount
dueDate
referenceMonth
responsibleUserId
status
paymentMethodId
paidAt
notes
isRecurring
recurrenceId
createdBy
createdAt
updatedBy
updatedAt
isArchived
```

## Regra de referência mensal

A conta terá o campo `referenceMonth` no formato:

```txt
AAAA-MM
```

Exemplo:

```txt
2026-07
```

## Próximos passos

1. Criar `js/accounts.js` manualmente.
2. Atualizar `css/style.css` manualmente se necessário.
3. Atualizar dashboard para exibir contas.
4. Testar o cadastro da primeira conta.
