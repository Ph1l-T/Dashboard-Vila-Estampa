# 🚨 URGENTE: Configurar Cloudflare Functions

## ❌ Problema Identificado
As Cloudflare Functions **NÃO estão funcionando**. O servidor está retornando HTML em vez de executar as Functions JavaScript.

## 🔧 Passos para Corrigir (no painel Cloudflare):

### 1. Verificar Deploy das Functions
1. Acesse: **Cloudflare Pages** → **dashboard-eletrize** 
2. Vá em **Functions**
3. Verifique se aparecem:
   - `polling` 
   - `hubitat-proxy`
4. Se não aparecem, **force um re-deploy**

### 2. Configurar Variáveis de Ambiente
1. Vá em **Settings** → **Environment variables**
2. **Adicionar para Production:**
   ```
   HUBITAT_BASE_URL = https://cloud.hubitat.com/api/e45cb756-9028-44c2-8a00-e6fb3651856c/apps/172/devices
   HUBITAT_ACCESS_TOKEN = 8204fd02-e90e-4c0d-b083-431625526d10
   ```

### 3. Se Mudou Configurações do Hubitat:
- **URL mudou?** Atualize `HUBITAT_BASE_URL`
- **Token mudou?** Atualize `HUBITAT_ACCESS_TOKEN`  
- **IDs dos dispositivos mudaram?** Atualize no código

### 4. Forçar Re-deploy
1. **Deployments** → **View details** (último deploy)
2. **Retry deployment**
3. Aguardar conclusão completa

## 🧪 Teste se Funcionou:
Acesse no navegador:
```
https://dashboard-eletrize.pages.dev/functions/polling?devices=231
```

**Deve retornar JSON**, não HTML!

## ⚠️ Consequências se não Corrigir:
- ❌ Dashboard não funciona (CORS bloqueia API direta)
- ❌ Polling falha constantemente  
- ❌ Comandos não executam
- ❌ Estados não sincronizam

**Status atual: CRÍTICO - Functions devem ser configuradas IMEDIATAMENTE**