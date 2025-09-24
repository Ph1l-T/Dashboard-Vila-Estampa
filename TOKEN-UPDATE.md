# 🔑 URGENTE: Atualizar Token do Hubitat

## ❌ Problema Confirmado:
```xml
<oauth>
<error_description>null</error_description>
<error>invalid_token</error>
</oauth>
```
**O token de acesso mudou/expirou - por isso o dashboard não funciona!**

## 🔧 PASSOS PARA CORRIGIR:

### 1. **Gerar Novo Token no Hubitat:**
1. Acesse sua **interface web do Hubitat**
2. Vá em **Apps** → **Maker API**
3. Clique em **"Get Token"** ou **"Generate New Token"**
4. **COPIE** o novo token (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 2. **Atualizar nos Arquivos (3 locais):**

#### A) `wrangler.toml` (linhas 9 e 16):
```toml
HUBITAT_ACCESS_TOKEN = "SEU_NOVO_TOKEN_AQUI"
```

#### B) `script.js` (linha 367):
```javascript
const HUBITAT_ACCESS_TOKEN = 'SEU_NOVO_TOKEN_AQUI';
```

#### C) `functions/polling.js` (linha 40):
```javascript
const ACCESS_TOKEN = env.HUBITAT_ACCESS_TOKEN || 'SEU_NOVO_TOKEN_AQUI';
```

### 3. **Testar o Novo Token:**
Acesse no navegador:
```
https://cloud.hubitat.com/api/e45cb756-9028-44c2-8a00-e6fb3651856c/apps/172/devices?access_token=beddf703-c860-47bf-a6df-3df6ccc98138
```
**✅ NOVO TOKEN APLICADO:** `beddf703-c860-47bf-a6df-3df6ccc98138`

### 4. **Fazer Deploy:**
```bash
git add .
git commit -m "fix: Atualizar token Hubitat expirado"
git push origin main
```

### 5. **Configurar no Cloudflare Pages:**
1. **Cloudflare Pages** → **dashboard-eletrize** → **Settings** → **Environment variables**
2. Atualizar:
   ```
   HUBITAT_ACCESS_TOKEN = SEU_NOVO_TOKEN_AQUI
   ```
3. **Re-deploy** o projeto

## ✅ **Após Corrigir:**
- ✅ Dashboard funcionará normalmente
- ✅ Polling funcionará
- ✅ Comandos serão executados  
- ✅ Estados sincronizarão

**Este é o motivo de tudo não estar funcionando! 🎯**