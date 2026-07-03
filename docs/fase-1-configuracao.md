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
Firestore Database criado: concluído
Local do Firestore: southamerica-east1 (São Paulo)
Regras de segurança Firestore: concluído
Base inicial Firestore: concluído
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

Modo:

```txt
Produção
```

Localização:

```txt
southamerica-east1 (São Paulo)
```

Status:

```txt
Concluído
```

### Firestore Security Rules

Status:

```txt
Concluído
```

### Base inicial Firestore

Documentos iniciais:

```txt
families/familia-liberato
users/OZI2Zs8FjzfUHLaB1FwsEoErErV2
users/KGdXVZw770UUiykGvhTtKi9wGDI3
```

Status:

```txt
Concluído
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

Agora o projeto seguirá para:

1. inicialização do Firebase no JavaScript;
2. tela de login;
3. validação de usuário autorizado;
4. carregamento do usuário ativo;
5. conexão com Firestore;
6. criação do dashboard inicial.

## Arquivos já criados

```txt
README.md
css/style.css
js/app.js
js/firebase.js
docs/firebase-arquitetura.md
docs/regras-negocio.md
docs/fase-1-configuracao.md
docs/firestore-security-rules.md
docs/base-inicial-firestore.md
```
