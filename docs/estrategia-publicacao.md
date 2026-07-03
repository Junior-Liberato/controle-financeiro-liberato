# Estratégia de Publicação

## Situação identificada

O repositório inicialmente estava privado.

O GitHub Pages informou que, no plano atual, para habilitar Pages seria necessário:

```txt
Fazer upgrade do plano
ou
Tornar o repositório público
```

## Decisão atual

O repositório foi tornado público para permitir o uso gratuito do GitHub Pages.

Repositório:

```txt
Junior-Liberato/controle-financeiro-liberato
```

Status atual:

```txt
Público
```

URL do aplicativo:

```txt
https://junior-liberato.github.io/controle-financeiro-liberato/
```

## GitHub Pages

Fonte recomendada:

```txt
Deploy from a branch
```

Branch:

```txt
main
```

Pasta:

```txt
/root
```

## Cuidados de segurança

O código-fonte ficará visível publicamente.

Isso é aceitável para este projeto porque:

- os dados financeiros não ficam no GitHub;
- os dados ficam no Firebase;
- o acesso exige login;
- as regras do Firestore filtram por usuário e familyId;
- a chave Firebase Web não é senha do banco.

## Proteção real dos dados

A proteção real está em:

- Firebase Authentication
- Firestore Security Rules
- coleção users
- familyId
- status active

## Próximos testes

1. Abrir a URL pública.
2. Validar se a tela de login aparece.
3. Entrar com usuário cadastrado.
4. Confirmar abertura do dashboard.
5. Testar o botão Sair.
6. Testar no celular do Junior.
7. Testar no celular da Júlia.
