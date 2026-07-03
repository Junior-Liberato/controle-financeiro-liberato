# Estratégia de Publicação

## Situação identificada

O repositório está privado.

O GitHub Pages informou que, no plano atual, para habilitar Pages será necessário:

```txt
Fazer upgrade do plano
ou
Tornar o repositório público
```

## Decisão do projeto

Durante o desenvolvimento, o repositório permanecerá privado.

A publicação pública será feita somente quando a primeira versão funcional estiver pronta e validada.

## Opções de publicação

### Opção A - Manter privado durante o desenvolvimento

Status:

```txt
Escolhida
```

Vantagens:

- Código protegido durante a construção.
- Menos exposição enquanto o app ainda está em desenvolvimento.
- Permite revisar segurança antes da publicação.

Limitação:

- GitHub Pages não fica disponível no plano atual enquanto o repositório for privado.

### Opção B - Tornar o repositório público depois da validação

Vantagens:

- GitHub Pages gratuito.
- Link público para acessar pelo celular.
- Firebase continua protegendo os dados por login.

Cuidados:

- O código-fonte ficará visível.
- As regras do Firestore precisam estar corretas.
- Não pode haver segredos reais no código.

### Opção C - Criar um segundo repositório público apenas para publicação

Vantagens:

- Mantém o repositório principal privado.
- Publica somente a versão pronta.
- Melhor separação entre desenvolvimento e produção.

Possível nome:

```txt
controle-financeiro-liberato-app
```

## Recomendação

Seguir com o repositório privado até o login e dashboard serem testados localmente.

Depois, quando o app estiver funcional, criar um repositório público de publicação ou tornar este repositório público.

## Observação de segurança

As chaves Firebase Web não são senha do banco.

A proteção real dos dados está em:

- Firebase Authentication
- Firestore Security Rules
- coleção users
- familyId
- status active
