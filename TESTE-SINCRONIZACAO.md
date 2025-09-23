# 🧪 Teste de Sincronização - Dashboard Eletrize

## 📋 Como Testar o Carregamento Global

### 1️⃣ **Teste Básico - Carregamento Inicial**
1. Abra o site (você verá a tela de loading)
2. Aguarde o carregamento completo (100%)
3. No console, digite:
```javascript
window.debugEletrize.checkAllDevices()
```
4. ✅ **Esperado**: Todos os dispositivos devem ter estados salvos

### 2️⃣ **Teste de Navegação - Estados Persistentes**
1. Na página Home, observe os ícones dos botões master
2. Navegue para qualquer cômodo (ex: Gourmet)
3. Os controles devem mostrar os mesmos estados da Home
4. ✅ **Esperado**: Estados consistentes entre páginas

### 3️⃣ **Teste de Comando Manual**
1. Em qualquer página, clique para ligar/desligar uma luz
2. Navegue para outra página
3. Volte para a primeira página
4. ✅ **Esperado**: Estado deve permanecer como você deixou

### 4️⃣ **Teste de Sincronização Automática**
1. No console, simule uma mudança:
```javascript
// Simular mudança de estado
localStorage.setItem('device_state_366', 'on')
window.debugEletrize.syncControls()
```
2. ✅ **Esperado**: Todos os controles do device 366 devem atualizar

## 🔍 **Verificações Detalhadas**

### Estados Específicos por Cômodo:
```javascript
// Verificar Home Master
window.debugEletrize.checkDevice('366') // Luz Home

// Verificar Gourmet  
window.debugEletrize.checkDevice('365') // Luz Gourmet

// Verificar Piscina
window.debugEletrize.checkDevice('364') // Luz Piscina

// Ver todos os estados
window.debugEletrize.checkAllDevices()
```

### Forçar Recarregamento:
```javascript
// Se algo não estiver funcionando
window.debugEletrize.reloadStates()
```

### Ver Status do Sistema:
```javascript
// Verificar proteções ativas
window.debugEletrize.showProtections()

// Sincronizar tudo manualmente
window.debugEletrize.syncControls()
```

## 🚨 **Problemas Conhecidos e Soluções**

### ❌ "Estados não sincronizam"
```javascript
// Solução 1: Forçar sincronização
window.debugEletrize.syncControls()

// Solução 2: Recarregar estados
window.debugEletrize.reloadStates()
```

### ❌ "Botões ficam 'travados'"
```javascript
// Limpar proteções
window.debugEletrize.clearProtections()
```

### ❌ "Tela de loading não aparece"
```javascript
// Mostrar manualmente
window.debugEletrize.showLoader()

// Esconder após teste
window.debugEletrize.hideLoader()
```

## 🎯 **Resultados Esperados**

✅ **SUCESSO** - O sistema deve:
- Carregar todos os estados na inicialização
- Manter consistência entre páginas
- Atualizar automaticamente novos elementos
- Sincronizar mudanças em tempo real

❌ **FALHA** - Se algum teste falhar:
1. Verifique o console para erros
2. Use os comandos de debug
3. Reporte o problema com os logs

---

## 📱 **Teste Mobile**
- Abra em dispositivo móvel
- Teste navegação entre páginas
- Verifique se estados permanecem consistentes
- Touch/tap deve funcionar normalmente

## 🔄 **Teste de Polling (Produção)**
- Aguarde 10 segundos após inicialização
- Polling deve sincronizar automaticamente
- Mudanças externas devem aparecer
- Proteções devem funcionar por 8 segundos