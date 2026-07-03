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
accounts.js: concluído
CSS Fase 3: concluído
Dashboard com contas: concluído
Cadastro de conta no Firestore: concluído
Listagem de contas do mês: concluído
Indicadores básicos de despesas: concluído
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

## Teste realizado

```txt
URL: https://junior-liberato.github.io/controle-financeiro-liberato/
Usuário: Junior Liberato
Conta teste: Testando
Valor: R$ 125,00
Vencimento: 10/07/2026
Resultado: conta cadastrada, listada no dashboard e indicadores atualizados
```

## Próximos passos

1. Criar ação para marcar conta como paga.
2. Criar ação para editar conta.
3. Criar ação para excluir/arquivar conta.
4. Criar filtros por mês e status.
5. Iniciar módulo de receitas.
