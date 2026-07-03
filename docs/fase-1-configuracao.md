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

Será necessário criar um projeto no Firebase Console.

Nome oficial do projeto Firebase:

```txt
Sistema Financeiro Familiar
```

Observação: o Firebase limita o nome do projeto a 30 caracteres, por isso o nome foi ajustado sem a palavra "Liberato".

## Serviços a ativar

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

## Configuração Web App

Após criar o projeto Firebase, criar um aplicativo Web.

Nome sugerido:

```txt
Controle Financeiro Liberato Web
```

O Firebase irá gerar um bloco de configuração contendo:

```txt
apiKey
authDomain
projectId
storageBucket
messagingSenderId
appId
```

Esses dados deverão ser inseridos no arquivo:

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

Depois de configurar o Firebase, o projeto seguirá para:

1. inicialização do Firebase no JavaScript;
2. tela de login;
3. validação de usuário autorizado;
4. criação da família inicial;
5. criação dos usuários iniciais;
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
