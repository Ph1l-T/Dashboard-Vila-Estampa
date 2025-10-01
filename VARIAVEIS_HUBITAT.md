# Variáveis do Hubitat extraídas da URL fornecida

## URL fornecida:
https://cloud.hubitat.com/api/ef4b8bb9-5b3f-43bc-aa4b-7af0c873ace3/apps/101/devices?access_token=138422cd-a48d-41dc-8beb-cb0327e65c24

## Variáveis extraídas:

### HUBITAT_ACCESS_TOKEN
138422cd-a48d-41dc-8beb-cb0327e65c24

### HUBITAT_BASE_URL  
https://cloud.hubitat.com/api/ef4b8bb9-5b3f-43bc-aa4b-7af0c873ace3/apps/101/devices

### HUBITAT_FULL_URL
https://cloud.hubitat.com/api/ef4b8bb9-5b3f-43bc-aa4b-7af0c873ace3

### WEBHOOK_SHARED_SECRET
(você deve definir uma chave secreta personalizada, ex: vila-estampa-2024-secret)

## Comandos para configurar no Cloudflare Workers:

```bash
wrangler secret put HUBITAT_ACCESS_TOKEN
# Digite: 138422cd-a48d-41dc-8beb-cb0327e65c24

wrangler secret put HUBITAT_BASE_URL  
# Digite: https://cloud.hubitat.com/api/ef4b8bb9-5b3f-43bc-aa4b-7af0c873ace3/apps/101/devices

wrangler secret put HUBITAT_FULL_URL
# Digite: https://cloud.hubitat.com/api/ef4b8bb9-5b3f-43bc-aa4b-7af0c873ace3

wrangler secret put WEBHOOK_SHARED_SECRET
# Digite: sua-chave-secreta-personalizada
```