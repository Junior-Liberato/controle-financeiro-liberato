# Fase 1 - Configuração Inicial

## Estratégia escolhida

O repositório permanecerá privado durante o desenvolvimento.

A publicação será decidida quando a primeira versão funcional estiver pronta.

## GitHub

Repositório:

```txt
Junior-Liberato/controle-financeiro-liberato
```

Status:

```txt
Privado
```

Branch principal:

```txt
main
```

## Firebase

Nome oficial do projeto Firebase:

```txt
Sistema Financeiro Familiar
```

Observação: o Firebase limita o nome do projeto a 30 caracteres, por isso o nome foi ajustado sem a palavra "Liberato".

## Status da configuração

```txt
Projeto Firebase criado: concluído
App Web criado: concluído
Arquivo js/firebase.js configurado: concluído
Authentication ativado: concluído
Usuários iniciais criados: concluído
Firestore Database: pendente
```

## Serviços ativados

### Authentication

Método:

```txt
E-mail e senha
```

Usuários iniciais:

```txt
Junior Liberato
Júlia Liberato
```

Status:

```txt
Concluído
```

### Firestore Database

Modo recomendado:

```txt
Produção
```

Localização:

```txt
South America, se disponível
```

Se não estiver disponível, usar a opção recomendada pelo Firebase.

Status:

```txt
Pendente
```

## Configuração Web App

Aplicativo Web criado:

```txt
Controle Financeiro Liberato Web
```

Configuração inserida no arquivo:

```txt
js/firebase.js
```

## Observação sobre segurança das chaves

As chaves de configuração do Firebase Web não são senha do banco.

A segurança real será feita por:

- Firebase Authentication
- Firestore Security Rules
- familyId
- lista de usuários autorizados

## Próxima etapa técnica

Depois de criar o Firestore Database, o projeto seguirá para:

1. criação das regras de segurança;
2. inicialização do Firebase no JavaScript;
3. tela de login;
4. validação de usuário autorizado;
5. criação da família inicial;
6. conexão com Firestore.

## Arquivos já criados

```txt
README.md
css/style.css
js/app.js
js/firebase.js
docs/firebase-arquitetura.md
docs/regras-negocio.md
docs/fase-1-configuracao.md
```
