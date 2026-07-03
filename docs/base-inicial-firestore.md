# Base Inicial do Firestore

## Sistema Financeiro Familiar Liberato

Este documento orienta a criação manual dos primeiros documentos no Cloud Firestore.

## Objetivo

Criar a família inicial e vincular os usuários autenticados à família.

As regras de segurança dependem da coleção `users`, por isso esses documentos precisam existir antes do aplicativo conseguir acessar os dados.

## Family ID padrão

Usaremos o seguinte identificador para a família:

```txt
familia-liberato
```

## 1. Criar coleção families

No Firestore Database, aba Dados:

Criar coleção:

```txt
families
```

Criar documento com ID personalizado:

```txt
familia-liberato
```

Campos:

```txt
name: Família Liberato
status: active
createdBy: OZI2Zs8FjzfUHLaB1FwsEoErErV2
createdAt: timestamp atual
```

## 2. Criar coleção users

Criar coleção:

```txt
users
```

### Usuário Junior

Documento com ID personalizado:

```txt
OZI2Zs8FjzfUHLaB1FwsEoErErV2
```

Campos:

```txt
familyId: familia-liberato
uid: OZI2Zs8FjzfUHLaB1FwsEoErErV2
name: Junior Liberato
email: adilson.liberato.tradimaq@gmail.com
role: admin
status: active
createdAt: timestamp atual
lastAccessAt: null
```

### Usuário Júlia

Documento com ID personalizado:

```txt
KGdXVZw770UUiykGvhTtKi9wGDI3
```

Campos:

```txt
familyId: familia-liberato
uid: KGdXVZw770UUiykGvhTtKi9wGDI3
name: Júlia Liberato
email: juliaalmeida.eng@gmail.com
role: member
status: active
createdAt: timestamp atual
lastAccessAt: null
```

## 3. Criar categorias iniciais

Coleção:

```txt
categories
```

Cada categoria deve ter:

```txt
familyId
name
type
color
icon
status
createdAt
```

Categorias sugeridas:

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

## 4. Criar formas de pagamento iniciais

Coleção:

```txt
paymentMethods
```

Cada forma deve ter:

```txt
familyId
name
status
createdAt
```

Formas sugeridas:

```txt
Pix
Boleto
Débito
Crédito
Dinheiro
Transferência
Débito automático
```

## Observação

Os documentos `families` e `users` são obrigatórios para o login funcionar corretamente.

As categorias e formas de pagamento poderão ser criadas manualmente agora ou geradas posteriormente pelo próprio aplicativo quando o módulo de configuração estiver pronto.
