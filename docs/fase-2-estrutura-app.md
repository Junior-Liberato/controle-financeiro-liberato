# Fase 2 - Estrutura Real do App

## Objetivo

Criar a primeira versão técnica do aplicativo com:

- index HTML base
- visual Dark Premium
- inicialização do Firebase
- autenticação
- validação de usuário autorizado
- dashboard inicial

## Status atual

```txt
CSS base expandido: concluído
index.html: concluído
firebase-init.js: concluído
auth.js: concluído
dashboard.js: concluído
app.js completo: concluído
```

## Observação técnica

O conector do GitHub bloqueou a criação automática de alguns arquivos com HTML e autenticação.

Quando isso acontecer, os arquivos serão fornecidos no chat para criação manual no GitHub.

## Arquivos da Fase 2

```txt
index.html
js/firebase-init.js
js/auth.js
js/dashboard.js
js/app.js
```

## Fluxo implementado

```txt
Abrir index.html
Inicializar Firebase
Verificar autenticação
Se não logado: mostrar login
Se logado e autorizado: carregar dashboard
Se usuário não autorizado: sair e bloquear acesso
```

## Regras da tela de login

- e-mail
- senha
- entrar
- recuperar senha
- mensagem de erro amigável

## Regras do dashboard inicial

- saudação com nome do usuário
- cards financeiros zerados inicialmente
- próximos vencimentos em estado vazio
- menu inferior mobile-first
- botão sair

## Próximo passo

Testar localmente ou publicar uma prévia para validar:

1. carregamento da tela de login;
2. login com usuário autorizado;
3. leitura do documento do usuário no Firestore;
4. abertura do dashboard;
5. botão sair.
