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

### 🛡️ Sistema de Proteção
```javascript
// Ver quais dispositivos estão protegidos
window.debugEletrize.showProtections()

// Limpar todas as proteções (use com cuidado)
window.debugEletrize.clearProtections()
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
// Verificar proteções ativas
window.debugEletrize.showProtections()

// Se necessário, limpar proteções
window.debugEletrize.clearProtections()
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

- **Proteção**: 8 segundos após comando manual
- **Polling**: A cada 10 segundos em produção
- **Timeout**: Estados salvos em localStorage como backup