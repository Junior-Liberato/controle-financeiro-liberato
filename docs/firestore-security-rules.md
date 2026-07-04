# Firestore Security Rules

## Objetivo

Definir as regras de segurança do Cloud Firestore para o Sistema Financeiro Familiar Liberato.

## Regra atual do Firebase

Ao criar o Firestore em modo de produção, o Firebase inicia com acesso totalmente bloqueado:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Essa configuração é segura, porém impede o aplicativo de acessar qualquer dado.

## Estratégia do projeto

O acesso será baseado em três pontos:

1. Usuário autenticado pelo Firebase Authentication.
2. Documento do usuário na coleção `users`.
3. Campo `familyId` igual ao da família do usuário.

## Estrutura esperada do usuário

Cada usuário deverá ter um documento em:

```txt
users/{uid}
```

Campos esperados:

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

## Papéis

```txt
admin
member
```

## Status permitido

```txt
active
```

Usuários sem documento, sem família ou inativos não poderão acessar dados financeiros.

## Regras propostas

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function userDoc() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    function isActiveUser() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && userDoc().data.status == 'active';
    }

    function userFamilyId() {
      return userDoc().data.familyId;
    }

    function isAdmin() {
      return isActiveUser() && userDoc().data.role == 'admin';
    }

    function belongsToUserFamily() {
      return isActiveUser()
        && resource.data.familyId == userFamilyId();
    }

    function newDataBelongsToUserFamily() {
      return isActiveUser()
        && request.resource.data.familyId == userFamilyId();
    }

    match /users/{userId} {
      allow read: if isActiveUser() && request.auth.uid == userId;
      allow create, update, delete: if isAdmin();
    }

    match /userSecurity/{userId} {
      allow read, create, update: if isActiveUser()
        && request.auth.uid == userId
        && request.resource.data.familyId == userFamilyId();
      allow delete: if false;
    }

    match /families/{familyId} {
      allow read: if isActiveUser() && familyId == userFamilyId();
      allow create, update, delete: if isAdmin() && familyId == userFamilyId();
    }

    match /accounts/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /revenues/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /fixedAccounts/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /incomeProfiles/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /cards/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /cardSettingsHistory/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /cardPurchases/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /cardInstallments/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /cardInvoices/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /categories/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /paymentMethods/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /settings/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /backups/{docId} {
      allow read, update, delete: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
    }

    match /activityLog/{docId} {
      allow read: if belongsToUserFamily();
      allow create: if newDataBelongsToUserFamily();
      allow update, delete: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Observação importante

Antes do aplicativo funcionar, será necessário criar manualmente no Firestore:

1. Documento da família.
2. Documento do usuário Junior.
3. Documento do usuário Júlia.

## Atualização necessária para o PIN

Com a criação do PIN, é necessário publicar as regras atualizadas no Firebase Console para liberar a coleção:

```txt
userSecurity
```

Cada usuário só pode ler e atualizar o próprio documento de segurança.
