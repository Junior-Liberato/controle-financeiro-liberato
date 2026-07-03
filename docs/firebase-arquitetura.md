# Arquitetura Firebase

## Projeto

Sistema Financeiro Familiar Liberato

## Objetivo

Definir a estrutura de dados, regras de relacionamento e segurança do Firebase para o Controle Financeiro Liberato.

## Serviços Firebase

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting não será usado na primeira etapa, pois a hospedagem será feita pelo GitHub Pages.

## Estratégia de acesso

O aplicativo ficará hospedado no GitHub Pages, mas os dados serão protegidos no Firebase.

Mesmo que alguém tenha acesso ao link do aplicativo, os dados somente poderão ser lidos ou alterados por usuários autenticados e autorizados.

## Entidade principal

A base será organizada por família.

A família inicial será:

- Família Liberato

Todos os registros financeiros terão o campo `familyId`.

Esse campo será usado para separar os dados e impedir acesso indevido.

## Coleções principais

```txt
families
users
accounts
revenues
cards
cardSettingsHistory
cardPurchases
cardInstallments
cardInvoices
categories
paymentMethods
settings
backups
activityLog
```

## Regra geral dos documentos

Sempre que aplicável, cada documento terá:

```txt
familyId
createdBy
createdAt
updatedBy
updatedAt
isArchived
```

## families

Representa o grupo familiar.

Campos:

```txt
name
createdAt
createdBy
status
```

Exemplo:

```txt
name: Família Liberato
status: active
```

## users

Representa os usuários autorizados.

Campos:

```txt
familyId
uid
name
email
role
status
createdAt
lastAccessAt
```

Papéis:

```txt
admin
member
```

Usuários iniciais:

```txt
Junior Liberato
Júlia Liberato
```

## accounts

Representa contas a pagar fora do cartão.

Campos:

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

Status previstos:

```txt
open
paid
overdue
scheduled
cancelled
```

## revenues

Representa receitas.

Campos:

```txt
familyId
description
type
amount
receivedAt
referenceMonth
responsibleUserId
notes
isRecurring
recurrenceId
createdBy
createdAt
updatedBy
updatedAt
isArchived
```

## cards

Representa cartões cadastrados.

Campos:

```txt
familyId
name
bank
holderUserId
limitAmount
closingDay
dueDay
status
createdBy
createdAt
updatedBy
updatedAt
isArchived
```

Status:

```txt
active
inactive
cancelled
```

## cardSettingsHistory

Representa histórico de fechamento e vencimento dos cartões.

Objetivo: preservar configurações antigas e evitar bagunçar faturas passadas.

Campos:

```txt
familyId
cardId
closingDay
dueDay
validFrom
validTo
createdBy
createdAt
notes
```

Regra:

- Faturas antigas usam a configuração vigente na época.
- Novas faturas usam a configuração atual.
- Ao alterar um cartão, o sistema registra uma nova configuração no histórico.

## cardPurchases

Representa compras feitas no cartão.

Campos:

```txt
familyId
cardId
description
categoryId
totalAmount
purchaseDate
responsibleUserId
installmentsCount
notes
createdBy
createdAt
updatedBy
updatedAt
isArchived
```

## cardInstallments

Representa as parcelas geradas a partir de uma compra.

Campos:

```txt
familyId
cardId
purchaseId
invoiceId
installmentNumber
installmentsCount
amount
competenceMonth
dueDate
status
createdBy
createdAt
updatedBy
updatedAt
```

Status:

```txt
open
paid
cancelled
```

## cardInvoices

Representa a fatura mensal do cartão.

Campos:

```txt
familyId
cardId
referenceMonth
closingDate
dueDate
calculatedAmount
closedAmount
differenceAmount
status
paidAt
notes
createdBy
createdAt
updatedBy
updatedAt
```

Status:

```txt
open
closed
reconciled
with_difference
paid
overdue
```

Regra central:

O valor fechado da fatura prevalece sobre a soma das compras lançadas.

Se `closedAmount` existir, ele será o valor oficial da fatura.

Se não existir, o sistema usará `calculatedAmount` como valor provisório.

## categories

Representa categorias financeiras.

Campos:

```txt
familyId
name
type
color
icon
status
createdAt
```

Tipos:

```txt
expense
revenue
both
```

Categorias iniciais sugeridas:

```txt
Moradia
Água, Luz e Internet
Alimentação
Cartão de Crédito
Transporte
Saúde
Educação
Lazer
Assinaturas
Impostos
Outros
```

## paymentMethods

Representa formas de pagamento.

Campos:

```txt
familyId
name
status
createdAt
```

Formas iniciais:

```txt
Pix
Boleto
Débito
Crédito
Dinheiro
Transferência
Débito automático
```

## settings

Representa preferências da família.

Campos:

```txt
familyId
theme
currency
firstDayOfMonth
backupEnabled
notificationsEnabled
createdAt
updatedAt
```

## backups

Representa registros de backups exportados.

Campos:

```txt
familyId
type
period
createdBy
createdAt
fileName
notes
```

## activityLog

Representa histórico de ações importantes.

Campos:

```txt
familyId
userId
action
entity
entityId
description
createdAt
```

Exemplos de ações:

```txt
account_created
account_paid
card_invoice_closed
card_settings_changed
backup_exported
```

## Estratégia de histórico

O sistema não apagará dados automaticamente.

Dados antigos poderão ser arquivados usando `isArchived`.

A exclusão definitiva será evitada sempre que possível.

## Estratégia de consulta

As principais consultas serão por:

```txt
familyId
referenceMonth
status
categoryId
responsibleUserId
cardId
```

## Observação importante

Esta arquitetura foi definida para permitir evolução futura sem reescrever o sistema.

Recursos como planejamento, metas, anexos, patrimônio e financiamentos poderão ser adicionados usando a mesma estrutura base.
