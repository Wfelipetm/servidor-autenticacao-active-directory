# Testes da API de Autenticação

## 1. Teste de Login Local (sem AD)

### Primeiro, registre um usuário local:
```bash
curl -X POST http://localhost:5001/api/users/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Teste Local\",\"email\":\"teste@local.com\",\"password\":\"123456\",\"role\":\"admin\"}"
```

### Depois faça login com email:
```bash
curl -X POST http://localhost:5001/api/users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"data\":\"teste@local.com\",\"password\":\"123456\"}"
```

## 2. Teste de Login com Active Directory

### Para login AD, use username no formato nome.sobrenome:
```bash
curl -X POST http://localhost:5001/api/users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"data\":\"joao.silva\",\"password\":\"senhaDoAD\"}"
```

## 3. Teste do Perfil do Usuário (com token)

### Use o token retornado no login:
```bash
curl -X GET http://localhost:5001/api/users/profile ^
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI"
```

## 4. Teste usando PowerShell (alternativa)

### Registro:
```powershell
$body = @{
    name = "Teste Local"
    email = "teste@local.com"
    password = "123456"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/users/register" -Method POST -Body $body -ContentType "application/json"
```

### Login:
```powershell
$loginBody = @{
    data = "teste@local.com"
    password = "123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5001/api/users/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $response.token
```

### Perfil:
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5001/api/users/profile" -Method GET -Headers $headers
```
