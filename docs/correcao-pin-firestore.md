# Correção do PIN - Regras do Firestore

## Sintoma

Ao tentar criar ou alterar o PIN, o aplicativo mostra erro mesmo com a senha de login correta.

## Causa mais provável

A senha é validada pelo Firebase Authentication, mas o salvamento do PIN é feito no Firestore, na coleção:

```txt
userSecurity
```

Se as regras do Firestore ainda não liberaram essa coleção, o Firebase retorna:

```txt
permission-denied
```

Nesse caso, o problema não é a senha.

---

## Regra correta para userSecurity

No Firebase Console, dentro de Firestore Database > Rules, incluir esta regra dentro do bloco principal:

```js
match /userSecurity/{userId} {
  allow read: if isActiveUser()
    && request.auth.uid == userId;

  allow create, update: if isActiveUser()
    && request.auth.uid == userId
    && request.resource.data.familyId == userFamilyId();

  allow delete: if false;
}
```

## Atenção

Não usar `request.resource.data` na regra de leitura.

Para leitura, deve ser usado apenas:

```js
allow read: if isActiveUser() && request.auth.uid == userId;
```

Motivo: `request.resource` só existe em gravações, como create/update.

---

## Fluxo esperado depois da correção

1. Usuário abre configurações.
2. Clica em Alterar PIN.
3. Digita PIN de 4 números.
4. Confirma o PIN.
5. Digita a senha de login.
6. Firebase valida a senha.
7. Firestore salva o PIN criptografado/hash na coleção `userSecurity`.

---

## Observação de segurança

O PIN não é salvo em texto puro.

O app salva apenas um hash gerado localmente antes de gravar no Firestore.
