# Eletrize Dashboard - Cloudflare Pages

Este projeto é um dashboard para controle de dispositivos IoT via Hubitat, hospedado no Cloudflare Pages.

## 🚀 Deploy

### 1. Configuração no Cloudflare Pages

1. **Conecte seu repositório:**
   - Acesse [Cloudflare Pages](https://pages.cloudflare.com)
   - Clique em "Create a project" > "Connect to Git"
   - Conecte sua conta GitHub e selecione o repositório `Dashboard-Eletrize`

2. **Configure o build:**
   - **Project name:** `dashboard-eletrize`
   - **Production branch:** `main`
   - **Build command:** `echo "Static site"`
   - **Build output directory:** `.` (raiz)

3. **Defina as variáveis de ambiente:**
   ```
   HUBITAT_BASE_URL = https://cloud.hubitat.com/api/e45cb756-9028-44c2-8a00-e6fb3651856c/apps/172/devices
   HUBITAT_ACCESS_TOKEN = 8204fd02-e90e-4c0d-b083-431625526d10
   ```

### 2. Configuração Manual (wrangler CLI)

Se preferir usar o wrangler CLI:

```bash
# Instale o wrangler
npm install -g wrangler

# Faça login no Cloudflare
wrangler login

# Deploy para Pages
wrangler pages project create dashboard-eletrize
wrangler pages deploy . --project-name=dashboard-eletrize
```

## 🔧 APIs Disponíveis

### Controle de Dispositivos
```
GET/POST /api/hubitat/{deviceId}
GET/POST /api/hubitat/{deviceId}/{command}
GET/POST /api/hubitat/{deviceId}/{command}/{value}
```

**Exemplos:**
- `GET /api/hubitat/231` - Buscar estado do dispositivo 231
- `POST /api/hubitat/231/on` - Ligar dispositivo 231
- `POST /api/hubitat/231/off` - Desligar dispositivo 231

### Polling de Estados
```
GET /api/polling?devices=231,232,233
```

**Resposta:**
```json
{
  "timestamp": "2025-09-23T10:30:00.000Z",
  "devices": {
    "231": { "state": "on", "success": true },
    "232": { "state": "off", "success": true },
    "233": { "state": "on", "success": true }
  }
}
```

## 🔄 Desenvolvimento Local

Para testar localmente:

```bash
# Clone o repositório
git clone https://github.com/Ph1l-T/Dashboard-Eletrize.git
cd Dashboard-Eletrize

# Execute com wrangler (simula Cloudflare Pages Functions)
wrangler pages dev .

# Ou use um servidor HTTP simples
python -m http.server 8000
# ou
npx http-server .
```

## 📝 Configuração de Variáveis

No painel do Cloudflare Pages (Settings > Environment variables):

- **HUBITAT_BASE_URL:** URL base da API do Hubitat
- **HUBITAT_ACCESS_TOKEN:** Token de acesso do Hubitat Maker API

## 🌐 URLs

- **Produção:** `https://dashboard-eletrize.pages.dev`
- **Preview:** `https://[commit-hash].dashboard-eletrize.pages.dev`

## ⚡ Recursos

- ✅ PWA (Progressive Web App)
- ✅ Service Worker para cache offline
- ✅ Middleware Cloudflare para proxy de APIs
- ✅ Polling automático de estados
- ✅ Deploy automático via Git
- ✅ HTTPS automático
- ✅ CDN global