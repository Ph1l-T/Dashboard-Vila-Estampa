# Eletrize Dashboard - Documentação Completa

## 📋 Visão Geral

Este documento consolida todos os procedimentos de teste, comandos de debug, informações de diagnóstico e guias de solução de problemas para o projeto Dashboard-Eletrize PWA. Serve como uma referência completa para desenvolvimento, testes e manutenção.

---

## 🔧 Procedimentos de Desenvolvimento e Testes

### Testes de Compatibilidade Mobile

#### Detecção Mobile e Inicialização
```javascript
// Testar detecção mobile
console.log('É mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

// Testar inicialização do app
window.initializeApp();

// Verificar se elementos DOM foram carregados
console.log('Container do app:', document.getElementById('app'));
console.log('Container dos ambientes:', document.getElementById('rooms-container'));
```

#### Checklist de Testes de UI Mobile
- [ ] App carrega corretamente em navegadores mobile
- [ ] Eventos de toque funcionam adequadamente nos botões
- [ ] Animações de carregamento são exibidas corretamente
- [ ] Botões mestres se posicionam corretamente durante carregamento
- [ ] Efeitos glassmorphism renderizam no mobile
- [ ] Prompt de instalação PWA aparece
- [ ] Funcionalidade offline funciona

### Protocolo de Teste dos Botões Mestres

#### Teste de Estado dos Botões
```javascript
// Testar funcionalidade dos botões mestres
function testMasterButtons() {
    const masterBtns = document.querySelectorAll('.room-master-btn');
    console.log('Botões mestres encontrados:', masterBtns.length);
    
    masterBtns.forEach((btn, index) => {
        console.log(`Botão ${index}:`, {
            text: btn.textContent,
            classes: btn.classList.toString(),
            style: btn.style.cssText
        });
    });
}

// Testar animação do estado de carregamento
function testLoadingState(roomId) {
    const btn = document.querySelector(`[data-room="${roomId}"] .room-master-btn`);
    btn.classList.add('loading');
    setTimeout(() => btn.classList.remove('loading'), 3000);
}
```

#### Validação do Efeito Glassmorphism
- [ ] backdrop-filter: blur(10px) aplicado
- [ ] Fundo rgba(255,255,255,0.1) 
- [ ] border-radius de 16px
- [ ] Efeitos hover funcionando
- [ ] Estado de carregamento preserva glassmorphism

### Testes de Sincronização

#### Sincronização de Estado dos Dispositivos
```javascript
// Testar sincronização dos dispositivos
async function testDeviceSync() {
    const devices = ['231', '232', '233', '234', '235'];
    
    for (const deviceId of devices) {
        try {
            const response = await fetch(`/api/hubitat/${deviceId}`);
            const data = await response.json();
            console.log(`Dispositivo ${deviceId}:`, data);
        } catch (error) {
            console.error(`Erro ao testar dispositivo ${deviceId}:`, error);
        }
    }
}

// Testar funcionalidade de polling
async function testPolling() {
    const devices = ['231', '232', '233'];
    const response = await fetch(`/api/polling?devices=${devices.join(',')}`);
    const data = await response.json();
    console.log('Resultado do polling:', data);
}
```

#### Comandos de Sincronização Manual
```javascript
// Forçar atualização de todos os estados dos dispositivos
window.refreshAllDevices();

// Atualizar ambiente específico
window.updateRoomDevices('living-room');

// Testar conexão com Hubitat
window.testHubitatConnection();
```

---

## 🐛 Referência de Comandos de Debug

### Comandos de Console

#### Debug da Aplicação
```javascript
// Verificar estado da aplicação
console.log('App inicializado:', window.appInitialized);
console.log('Cena atual:', window.currentScene);
console.log('Cache de dispositivos:', window.deviceCache);

// Debug dos dados dos ambientes
console.log('Configurações dos ambientes:', window.roomConfigs);

// Verificar service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Registros do service worker:', registrations);
});

// Estado de instalação PWA
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Prompt de instalação PWA disponível');
});
```

#### Debug de Rede
```javascript
// Testar endpoints da API
fetch('/api/hubitat/231').then(r => r.json()).then(console.log);

// Testar com tratamento de erro
async function debugAPI(deviceId, command = '') {
    try {
        const url = `/api/hubitat/${deviceId}${command ? '/' + command : ''}`;
        console.log('Testando:', url);
        
        const response = await fetch(url);
        console.log('Status:', response.status);
        
        const data = await response.json();
        console.log('Dados:', data);
    } catch (error) {
        console.error('Erro da API:', error);
    }
}
```

#### Debug do DOM
```javascript
// Verificar elementos ausentes
const requiredElements = ['app', 'rooms-container', 'scene-selector'];
requiredElements.forEach(id => {
    const el = document.getElementById(id);
    console.log(`Elemento #${id}:`, el ? 'Encontrado' : 'AUSENTE');
});

// Debug de classes CSS
function debugClasses(selector) {
    document.querySelectorAll(selector).forEach((el, i) => {
        console.log(`${selector}[${i}]:`, el.classList.toString());
    });
}
```

### Comandos de Debug Específicos por Dispositivo

#### Teste de Dispositivos Individuais
```javascript
// Testar dispositivos específicos
const devices = {
    'luzes-sala': '231',
    'cortinas-sala': '232',
    'tv-sala': '233',
    'luzes-cozinha': '234',
    'luzes-piscina': '235'
};

// Testar todos os dispositivos
Object.entries(devices).forEach(([name, id]) => {
    debugAPI(id).then(() => console.log(`${name} (${id}) testado`));
});

// Testar comandos dos dispositivos
async function testDeviceCommands(deviceId) {
    const commands = ['on', 'off', 'toggle'];
    for (const cmd of commands) {
        console.log(`Testando ${deviceId} ${cmd}`);
        await debugAPI(deviceId, cmd);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
```

#### Testes Baseados em Ambientes
```javascript
// Testar funcionalidade do ambiente
function testRoom(roomName) {
    console.log(`Testando ambiente: ${roomName}`);
    
    // Verificar container do ambiente
    const roomEl = document.querySelector(`[data-room="${roomName}"]`);
    console.log('Elemento do ambiente:', roomEl);
    
    // Verificar dispositivos no ambiente
    const devices = roomEl?.querySelectorAll('[data-device]');
    console.log('Dispositivos encontrados:', devices?.length || 0);
    
    // Verificar botão mestre
    const masterBtn = roomEl?.querySelector('.room-master-btn');
    console.log('Botão mestre:', masterBtn);
}
```

---

## 📊 Diagnósticos Mobile

### Monitoramento de Performance

#### Verificações de Performance Mobile
```javascript
// Verificar métricas de performance
function checkMobilePerformance() {
    if ('performance' in window) {
        const nav = performance.getEntriesByType('navigation')[0];
        console.log('Tempo de carregamento:', nav.loadEventEnd - nav.loadEventStart, 'ms');
        console.log('DOM pronto:', nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart, 'ms');
    }
    
    // Verificar uso de memória (Chrome mobile)
    if ('memory' in performance) {
        console.log('Uso de memória:', performance.memory);
    }
}

// Monitorar eventos de toque
function monitorTouchEvents() {
    ['touchstart', 'touchmove', 'touchend'].forEach(event => {
        document.addEventListener(event, (e) => {
            console.log(`Evento de toque: ${event}`, e.touches.length);
        }, { passive: true });
    });
}
```

#### Diagnósticos de Viewport e Display
```javascript
// Verificar configurações de viewport
function checkViewport() {
    console.log('Largura do viewport:', window.innerWidth);
    console.log('Altura do viewport:', window.innerHeight);
    console.log('Proporção de pixels:', window.devicePixelRatio);
    console.log('Orientação da tela:', screen.orientation?.type);
}

// Testar media queries CSS
function testMediaQueries() {
    const queries = [
        '(max-width: 768px)',
        '(orientation: portrait)',
        '(orientation: landscape)',
        '(hover: none)',
        '(pointer: coarse)'
    ];
    
    queries.forEach(query => {
        console.log(`Media query ${query}:`, window.matchMedia(query).matches);
    });
}
```

### Diagnósticos de Problemas Específicos do Mobile

#### Problemas Comuns do Mobile
```javascript
// Testar responsividade do toque
function testTouchResponsiveness() {
    const buttons = document.querySelectorAll('button, .clickable');
    console.log('Elementos interativos encontrados:', buttons.length);
    
    buttons.forEach((btn, i) => {
        if (btn.offsetWidth < 44 || btn.offsetHeight < 44) {
            console.warn(`Botão ${i} muito pequeno para toque:`, btn.offsetWidth, 'x', btn.offsetHeight);
        }
    });
}

// Verificar problemas específicos do iOS Safari
function checkiOSIssues() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
        console.log('iOS detectado');
        console.log('Modo standalone:', window.navigator.standalone);
        console.log('Versão do Safari:', navigator.userAgent.match(/Version\/([\d.]+)/)?.[1]);
    }
}
```

---

## 🔍 Guia de Solução de Problemas

### Problemas Comuns e Soluções

#### 1. Erros de Sintaxe JavaScript
**Sintomas:** Página em branco, erros no console
**Debug:** Verificar console do navegador para erros de sintaxe
**Solução:** Verificar se todas as funções estão fechadas corretamente, checar chaves/pontos e vírgulas ausentes

#### 2. Problemas de Posicionamento dos Botões Mestres
**Sintomas:** Botões desalinhados durante carregamento
**Debug:** Verificar classes CSS e estilos glassmorphism
**Solução:** Garantir posicionamento CSS adequado e estilos de estado de carregamento

#### 3. Imagens Ausentes (Erros 404)
**Sintomas:** Referências de imagem quebradas no console
**Debug:** Verificar objeto ROOM_PHOTOS e existência dos arquivos de imagem
**Solução:** Remover referências a imagens inexistentes

#### 4. Problemas de Conexão da API
**Sintomas:** Comandos de dispositivos não funcionam
**Debug:** Testar endpoints `/api/hubitat/{deviceId}`
**Solução:** Verificar Cloudflare Functions e credenciais do Hubitat

#### 5. Problemas de Instalação PWA
**Sintomas:** Prompt de instalação não aparece
**Debug:** Verificar manifest.json e registro do service worker
**Solução:** Verificar HTTPS, manifest válido e service worker

### Sequência de Debug de Emergência

```javascript
// Execução completa de diagnóstico
async function runFullDiagnostic() {
    console.log('=== DIAGNÓSTICO ELETRIZE DASHBOARD ===');
    
    // 1. Verificar inicialização do app
    console.log('1. Inicialização do app:', window.appInitialized || 'NÃO INICIALIZADO');
    
    // 2. Verificar elementos DOM
    console.log('2. Elementos DOM críticos:');
    ['app', 'rooms-container', 'scene-selector'].forEach(id => {
        console.log(`  - #${id}:`, document.getElementById(id) ? '✓' : '✗');
    });
    
    // 3. Testar conectividade da API
    console.log('3. Testando API...');
    try {
        const response = await fetch('/api/hubitat/231');
        console.log('  - Status da API:', response.status === 200 ? '✓' : '✗');
    } catch (error) {
        console.log('  - Status da API: ✗', error.message);
    }
    
    // 4. Verificar service worker
    console.log('4. Service worker:');
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('  - Registrado:', registrations.length > 0 ? '✓' : '✗');
    }
    
    // 5. Detecção mobile
    console.log('5. Detecção mobile:', /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? '✓' : '✗');
    
    console.log('=== DIAGNÓSTICO COMPLETO ===');
}

// Executar diagnóstico
runFullDiagnostic();
```

---

## 📝 Checklists de Teste

### Checklist Pré-Deploy
- [ ] Todos os erros de sintaxe JavaScript resolvidos
- [ ] Botões mestres posicionados corretamente
- [ ] Efeitos glassmorphism aplicados
- [ ] Nenhum erro 404 de imagem no console
- [ ] Endpoints da API respondendo
- [ ] Compatibilidade mobile verificada
- [ ] Instalação PWA funcionando
- [ ] Service worker fazendo cache adequadamente
- [ ] Todos os ambientes/cenas funcionais

### Checklist de Teste Mobile
- [ ] Eventos de toque responsivos
- [ ] Botões com tamanho adequado (mín 44px)
- [ ] Animações de carregamento suaves
- [ ] Mudanças de orientação tratadas
- [ ] Escalonamento de viewport correto
- [ ] Sem rolagem horizontal
- [ ] Funcionalidade offline funciona

### Checklist de Performance
- [ ] Tempo de carregamento < 3s
- [ ] Respostas da API < 1s
- [ ] Animações suaves (60fps)
- [ ] Uso de memória estável
- [ ] Nenhum erro/aviso no console
- [ ] Cache do service worker efetivo

---

## 🚀 Referência de Comandos Rápidos

```javascript
// Comandos essenciais de debug (colar no console)
window.runFullDiagnostic = runFullDiagnostic;
window.testDeviceSync = testDeviceSync;
window.testMasterButtons = testMasterButtons;
window.checkMobilePerformance = checkMobilePerformance;
window.debugAPI = debugAPI;

// Correções rápidas
window.fixMobile = () => location.reload();
window.clearCache = () => caches.keys().then(names => names.forEach(name => caches.delete(name)));
window.forceRefresh = () => location.reload(true);
```

---

*Esta documentação consolida informações de: TESTE-SINCRONIZACAO.md, TESTE-MASTER-BUTTONS.md, TESTE-CORRECOES-MOBILE.md, DEBUG-COMMANDS.md e DIAGNOSTICO-MOBILE.md*