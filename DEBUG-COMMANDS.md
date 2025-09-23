# 🛠️ Comandos de Debug - Dashboard Eletrize

## 📋 Comandos Disponíveis no Console

Abra o console do navegador (F12) e use os comandos abaixo:

### 🔍 Verificação de Estados
```javascript
// Verificar um dispositivo específico
window.debugEletrize.checkDevice('366')

// Verificar todos os dispositivos
window.debugEletrize.checkAllDevices()
```

### 🏠 Botões Master
```javascript
// Verificar status dos botões master
window.debugEletrize.checkMasterButtons()

// Sincronizar todos os controles visíveis
window.debugEletrize.syncControls()

// Verificar comandos protegidos (anti-conflito polling)
window.debugEletrize.checkProtectedCommands()

// Testar animação de loading nos botões master
window.debugEletrize.testMasterLoading()
```

### 🔄 Carregamento e Polling
```javascript
// Recarregar todos os estados globalmente
window.debugEletrize.reloadStates()

// Forçar uma atualização de polling
window.debugEletrize.forcePolling()
```

### 🎨 Interface
```javascript
// Mostrar tela de loading manualmente
window.debugEletrize.showLoader()

// Esconder tela de loading
window.debugEletrize.hideLoader()
```

## 🔧 Fluxo de Inicialização

1. **Tela de Loading** (0-10%): Interface carregada
2. **Conexão** (10-30%): Conectando com servidor
3. **Dados** (30-70%): Recebendo estados dos dispositivos
4. **Processamento** (70-95%): Aplicando estados na UI
5. **Finalização** (95-100%): Carregamento concluído
6. **Polling** (após 3s): Sistema de atualização automática

## 🎯 Estados dos Dispositivos

### IDs dos Dispositivos
- **366**: Luz Home
- **365**: Luz Gourmet  
- **364**: Luz Piscina
- **363**: Luz Sinuca
- **362**: Luz Recepção

### Estados Possíveis
- `on`: Dispositivo ligado
- `off`: Dispositivo desligado
- `null`: Estado desconhecido/erro

## 🚨 Resolução de Problemas

### Botões não atualizam?
```javascript
// Verificar estados dos botões master
window.debugEletrize.checkMasterButtons()

// Verificar se há comandos sendo protegidos
window.debugEletrize.checkProtectedCommands()

// Sincronizar todos os controles
window.debugEletrize.syncControls()
```

### Estados incorretos?
```javascript
// Recarregar estados globalmente
window.debugEletrize.reloadStates()

// Verificar todos os dispositivos
window.debugEletrize.checkAllDevices()
```

### Polling parou?
```javascript
// Forçar nova atualização
window.debugEletrize.forcePolling()
```

## 📱 Modo Desenvolvimento vs Produção

- **Desenvolvimento** (localhost): Usa localStorage apenas
- **Produção** (Cloudflare): Usa API real + localStorage como backup

## 🎛️ Configurações Importantes

- **Polling**: A cada 5 segundos em produção (otimizado)
- **Proteção Anti-Conflito**: 8 segundos após comando manual
- **Rate Limit**: ~12 requests/minuto (seguro para Hubitat)
- **Backup**: Estados salvos em localStorage como fallback
- **Mobile**: Console logging desabilitado para evitar travamentos