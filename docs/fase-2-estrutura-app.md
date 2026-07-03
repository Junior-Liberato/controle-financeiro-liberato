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
index.html: pendente
firebase-init.js: pendente
auth.js: pendente
dashboard.js: pendente
app.js completo: pendente
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

## Fluxo esperado

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

Criar manualmente o arquivo `index.html` se o conector continuar bloqueando a criação automática.
