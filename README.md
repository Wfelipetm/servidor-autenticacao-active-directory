# Auth Server - Autenticação via Active Directory

Este servidor de autenticação funciona com Active Directory (AD) usando LDAP e armazena dados temporariamente em memória.

## Configuração

1. **Copie o arquivo de exemplo das variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

2. **Configure as variáveis no arquivo `.env`:**
   - `LDAP_URL`: URL do seu servidor AD (ex: `ldap://192.168.1.100:389`)
   - `LDAP_BIND_DN`: DN do usuário para bind (ex: `CN=svc_ldap,OU=ServiceAccounts,DC=empresa,DC=com`)
   - `LDAP_BIND_CREDENTIALS`: Senha do usuário de bind
   - `LDAP_SEARCH_BASE`: Base de busca (ex: `OU=Usuarios,DC=empresa,DC=com`)
   - `LDAP_SEARCH_FILTER`: Filtro de busca (mantenha `(sAMAccountName={{username}})`)

## Instalação

```bash
npm install
```

## Execução

```bash
npm start
```

## Endpoints

- `POST /api/users/register` - Registro local (sem AD)
- `POST /api/users/login` - Login (AD ou local)
- `GET /api/users/profile` - Perfil do usuário autenticado (requer token)

## Como funciona o login

- **Email (@)**: Login local com usuários cadastrados via register
- **Username (.)**: Login via Active Directory (ex: `joao.silva`)

## Autenticação

O sistema usa JWT tokens. Para acessar rotas protegidas, envie o token no header:
```
Authorization: Bearer <seu_token_jwt>
```
