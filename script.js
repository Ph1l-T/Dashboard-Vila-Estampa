// Funções de toggle para ícones nos cards da home
function toggleTelamovelIcon(el) {
    const img = el.querySelector('img');
    if (el.dataset.state === 'off') {
        img.src = 'images/icons/icon-small-telamovel-on.svg';
        el.dataset.state = 'on';
    } else {
        img.src = 'images/icons/icon-small-telamovel-off.svg';
        el.dataset.state = 'off';
    }
}

function toggleSmartglassIcon(el) {
    const img = el.querySelector('img');
    if (el.dataset.state === 'off') {
        img.src = 'images/icons/icon-small-smartglass-on.svg';
        el.dataset.state = 'on';
    } else {
        img.src = 'images/icons/icon-small-smartglass-off.svg';
        el.dataset.state = 'off';
    }
}

function toggleShaderIcon(el) {
    const img = el.querySelector('img');
    if (el.dataset.state === 'off') {
        img.src = 'images/icons/icon-small-shader-on.svg';
        el.dataset.state = 'on';
    } else {
        img.src = 'images/icons/icon-small-shader-off.svg';
        el.dataset.state = 'off';
    }
}

function toggleLightIcon(el) {
    const img = el.querySelector('img');
    const deviceIdsAttr = el.dataset.deviceIds;
    const deviceIds = deviceIdsAttr ? deviceIdsAttr.split(',') : [];

    if (el.dataset.state === 'off') {
        img.src = 'images/icons/icon-small-light-on.svg';
        el.dataset.state = 'on';
        deviceIds.forEach(id => sendHubitatCommand(id, 'on'));
    } else {
        img.src = 'images/icons/icon-small-light-off.svg';
        el.dataset.state = 'off';
        deviceIds.forEach(id => sendHubitatCommand(id, 'off'));
    }
}

function toggleTvIcon(el) {
    const img = el.querySelector('img');
    if (el.dataset.state === 'off') {
        img.src = 'images/icons/icon-small-tv-on.svg';
        el.dataset.state = 'on';
    } else {
        img.src = 'images/icons/icon-small-tv-off.svg';
        el.dataset.state = 'off';
    }
}

// Botões dos cômodos nas páginas internas
function toggleRoomControl(el) {
    const ICON_ON = 'images/icons/icon-small-light-on.svg';
    const ICON_OFF = 'images/icons/icon-small-light-off.svg';
    const img = el.querySelector('.room-control-icon');
    const isOff = (el.dataset.state || 'off') === 'off';
    const newState = isOff ? 'on' : 'off';
    const deviceId = el.dataset.deviceId;
    
    if (!deviceId) return;
    
    // Marcar comando recente para proteger contra polling
    recentCommands.set(deviceId, Date.now());
    
    // Atualizar UI imediatamente
    el.dataset.state = newState;
    if (img) img.src = newState === 'on' ? ICON_ON : ICON_OFF;
    
    // Persist locally
    setStoredState(deviceId, newState);
    
    console.log(`Enviando comando ${newState} para dispositivo ${deviceId}`);
    
    // Send to Hubitat
    sendHubitatCommand(deviceId, newState === 'on' ? 'on' : 'off')
        .then(() => {
            console.log(`✅ Comando ${newState} enviado com sucesso para dispositivo ${deviceId}`);
        })
        .catch(error => {
            console.error(`❌ Erro ao enviar comando para dispositivo ${deviceId}:`, error);
            // Em caso de erro, reverter o estado visual
            const revertState = newState === 'on' ? 'off' : 'on';
            el.dataset.state = revertState;
            if (img) img.src = revertState === 'on' ? ICON_ON : ICON_OFF;
            setStoredState(deviceId, revertState);
        });
}

function setRoomControlUI(el, state) {
    const ICON_ON = 'images/icons/icon-small-light-on.svg';
    const ICON_OFF = 'images/icons/icon-small-light-off.svg';
    const normalized = state === 'on' ? 'on' : 'off';
    el.dataset.state = normalized;
    const img = el.querySelector('.room-control-icon');
    if (img) img.src = normalized === 'on' ? ICON_ON : ICON_OFF;
}

function deviceStateKey(deviceId) {
    return `deviceState:${deviceId}`;
}

function getStoredState(deviceId) {
    try {
        return localStorage.getItem(deviceStateKey(deviceId));
    } catch (e) {
        return null;
    }
}

function setStoredState(deviceId, state) {
    try {
        localStorage.setItem(deviceStateKey(deviceId), state);
    } catch (e) {
        // ignore
    }
}

async function fetchDeviceState(deviceId) {
    try {
        const url = urlDeviceInfo(deviceId);
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Hubitat state fetch failed: ${resp.status}`);
        const data = await resp.json();
        // Maker API returns attributes array; prefer currentValue, fallback to value
        const attr = Array.isArray(data.attributes) ? data.attributes.find(a => a.name === 'switch') : null;
        const state = attr?.currentValue || attr?.value || 'off';
        return state;
    } catch (error) {
        console.error(`Error fetching state for device ${deviceId}:`, error);
        return 'off'; // fallback
    }
}

async function refreshRoomControlFromHubitat(el) {
    return;
}

function initRoomPage() {
    console.log('🏠 Inicializando página de cômodo...');
    const controls = document.querySelectorAll('.room-control[data-device-id]:not([data-no-sync="true"])');
    
    controls.forEach(el => {
        const deviceId = el.dataset.deviceId;
        // SEMPRE usar estado salvo do carregamento global
        const savedState = getStoredState(deviceId);
        const fallbackState = el.dataset.state || 'off';
        const finalState = savedState !== null ? savedState : fallbackState;
        
        console.log(`🔄 Controle ${deviceId}: salvo="${savedState}", fallback="${fallbackState}", final="${finalState}"`);
        setRoomControlUI(el, finalState);
    });
    
    // Forçar atualização de botões master também
    setTimeout(updateAllMasterButtons, 50);

    // Rename label on Sinuca page: Iluminação -> Bar (UI-only)
    try {
        const route = (window.location.hash || '').replace('#','');
        if (route === 'cafe') {
            document.querySelectorAll('.room-control-label').forEach(l => {
                const t = (l.textContent || '').trim().toLowerCase();
                if (t.startsWith('ilumin')) l.textContent = 'Bar';
            });
        }
    } catch (_) {}
}

// Normalize mis-encoded Portuguese accents across the UI
window.normalizeAccents = function normalizeAccents(root) {
    try {
        const map = new Map([
            ['Escrit��rio','Escritório'],
            ['Programa��ǜo','Programação'],
            ['Recep��ǜo','Recepção'],
            ['Refeit��rio','Refeitório'],
            ['Funcionǭrios','Funcionários'],
            ['Ilumina��o','Iluminação'],
            ['Ilumina��ǜo','Iluminação'],
            ['PainǸis','Painéis'],
            ['Armǭrio','Armário'],
            ['Reuniǜo','Reunião'],
            ['CafǸ','Café'],
        ]);
        const selector = '.page-title, .room-control-label, .room-card span';
        const scope = root || document;
        scope.querySelectorAll(selector).forEach(el => {
            const before = el.textContent || '';
            let after = before;
            map.forEach((val, key) => {
                if (after.includes(key)) after = after.replaceAll(key, val);
            });
            if (after !== before) el.textContent = after;
        });
    } catch (_) {}
};

// --- Funções para a página do Escritório ---

function toggleDevice(el, deviceType) {
    const img = el.querySelector('.control-icon');
    const stateEl = el.querySelector('.control-state');
    const currentState = el.dataset.state;
    let newState;
    let newLabel;

    const icons = {
        light: {
            on: 'images/icons/icon-small-light-on.svg',
            off: 'images/icons/icon-small-light-off.svg'
        },
        tv: {
            on: 'images/icons/icon-small-tv-on.svg',
            off: 'images/icons/icon-small-tv-off.svg'
        },
        shader: {
            on: 'images/icons/icon-small-shader-on.svg',
            off: 'images/icons/icon-small-shader-off.svg'
        }
    };

    if (!icons[deviceType]) return;

    let deviceId = el.dataset.deviceId || null;
    // Fallback por label para compatibilidade
    if (!deviceId) {
        const controlLabel = el.querySelector('.control-label')?.textContent?.trim();
        if (controlLabel === 'Pendente') {
            deviceId = '102';
        } else if (controlLabel === 'Trilho') {
            deviceId = '101';
        }
    }

    if (currentState === 'off' || currentState === 'closed') {
        newState = 'on';
        newLabel = deviceType === 'shader' ? 'Abertas' : 'ON';
        img.src = icons[deviceType].on;
        if (deviceId) sendHubitatCommand(deviceId, 'on');
    } else {
        newState = deviceType === 'shader' ? 'closed' : 'off';
        newLabel = deviceType === 'shader' ? 'Fechadas' : 'OFF';
        img.src = icons[deviceType].off;
        if (deviceId) sendHubitatCommand(deviceId, 'off');
    }

    el.dataset.state = newState;
    if (stateEl) stateEl.textContent = newLabel;
}

// (removido) setupThermostat: não utilizado após retirada da página "escritorio"


// --- Controle do Hubitat ---

// Detecta se está em produção (Cloudflare Pages) ou desenvolvimento
const isProduction = !['localhost', '127.0.0.1', '::1'].includes(location.hostname);

// Detectar dispositivos móveis
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// SOLUÇÃO: Desabilitar console.log em mobile para evitar travamentos
const ENABLE_DEBUG_LOGS = !isMobile; // Logs apenas em desktop

// Função de log segura para mobile
function safeLog() {
    if (ENABLE_DEBUG_LOGS && typeof console !== 'undefined' && console.log) {
        try {
            console.log.apply(console, arguments);
        } catch (e) {
            // Silenciar se console falhar
        }
    }
}

// Sistema de debug visual para mobile (DESABILITADO - compatibilidade resolvida)
function showMobileDebug(message, type) {
    // Debug desabilitado - funcionalidade mobile estável
    return;
}

// Substituir console.log globalmente para mobile
if (!ENABLE_DEBUG_LOGS) {
    // Criar console mock silencioso para mobile
    window.console = window.console || {};
    window.console.log = function() {};
    window.console.error = function() {};
    window.console.warn = function() {};
}

// Debug mínimo apenas se necessário
if (ENABLE_DEBUG_LOGS) {
    safeLog('=== DASHBOARD ELETRIZE DEBUG ===');
    safeLog('🔍 isProduction:', isProduction, 'isMobile:', isMobile);
}

safeLog('=== AMBIENTE DETECTADO ===', {
    isProduction,
    isMobile,
    isIOS,
    userAgent: navigator.userAgent.substring(0, 60) + '...'
});
const HUBITAT_PROXY_URL = '/hubitat-proxy';
const POLLING_URL = '/polling';
const HUBITAT_DIRECT_URL = 'https://cloud.hubitat.com/api/e45cb756-9028-44c2-8a00-e6fb3651856c/apps/172/devices';
const HUBITAT_ACCESS_TOKEN = '8204fd02-e90e-4c0d-b083-431625526d10';

// Helpers de URL para endpoints comuns da API
function urlDeviceInfo(deviceId) {
    if (isProduction) {
        return `${HUBITAT_PROXY_URL}?device=${deviceId}`;
    } else {
        return `${HUBITAT_DIRECT_URL}/${deviceId}?access_token=${HUBITAT_ACCESS_TOKEN}`;
    }
}

function urlSendCommand(deviceId, command, value) {
    if (isProduction) {
        // Em produção, usar proxy do Cloudflare
        let url = `${HUBITAT_PROXY_URL}?device=${deviceId}&command=${encodeURIComponent(command)}`;
        if (value !== undefined) {
            url += `&value=${encodeURIComponent(value)}`;
        }
        return url;
    } else {
        // Em desenvolvimento, usar URL direta do Hubitat
        let url = `${HUBITAT_DIRECT_URL}/${deviceId}/${encodeURIComponent(command)}`;
        if (value !== undefined) url += `/${encodeURIComponent(value)}`;
        url += `?access_token=${HUBITAT_ACCESS_TOKEN}`;
        return url;
    }
}

function sendHubitatCommand(deviceId, command, value) {
    const url = urlSendCommand(deviceId, command, value);

    console.log(`Enviando comando para o Hubitat: ${url}`);

    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            // alguns comandos retornam vazio; não forçar JSON
            return response
                .clone()
                .json()
                .catch(() => null);
        })
        .then(data => {
            console.log('Resposta do Hubitat:', data);
            return data;
        })
        .catch(error => {
            console.error('Erro ao enviar comando para o Hubitat:', error);
            throw error;
        });
}

// --- Cortinas (abrir/parar/fechar) ---
function sendCurtainCommand(deviceId, action, commandName) {
    const cmd = commandName || 'push';
    const map = { open: 1, stop: 2, close: 3 };
    const value = map[action];
    if (value === undefined) throw new Error('Ação de cortina inválida');
    return sendHubitatCommand(deviceId, cmd, value);
}

function curtainAction(el, action) {
    try {
        const id = el?.dataset?.deviceId || el.closest('[data-device-id]')?.dataset?.deviceId;
        const cmd = el?.dataset?.cmd || 'push';
        if (!id) return;
        sendCurtainCommand(id, action, cmd);
    } catch (e) {
        console.error('Falha ao acionar cortina:', e);
    }
}

// Master on/off (Home quick toggle) removido completamente

// --- Override para contornar CORS no browser ao chamar Hubitat ---
// Envia comandos em modo no-cors (resposta opaca) e, em falha, faz um GET via Image.
try {
    if (typeof sendHubitatCommand === 'function') {
        const _corsBypassSend = function(deviceId, command, value) {
            const baseUrl = urlSendCommand(deviceId, command, value);
            // Adiciona cache-buster para evitar SW/cache do navegador
            const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `_ts=${Date.now()}`;
            console.log(`Enviando comando para o Hubitat (no-cors): ${url}`);
            try {
                return fetch(url, { mode: 'no-cors', cache: 'no-store', credentials: 'omit', redirect: 'follow', referrerPolicy: 'no-referrer', keepalive: true })
                    .then(() => null)
                    .catch(err => {
                        try {
                            const beacon = new Image();
                            beacon.referrerPolicy = 'no-referrer';
                            beacon.src = url;
                        } catch (_) { /* ignore */ }
                        console.error('Erro ao enviar comando (CORS?):', err);
                        return null;
                    });
            } catch (e) {
                try {
                    const beacon = new Image();
                    beacon.referrerPolicy = 'no-referrer';
                    beacon.src = url;
                } catch (_) { /* ignore */ }
                return Promise.resolve(null);
            }
        };
        // Sobrescreve função original
        // eslint-disable-next-line no-global-assign
        sendHubitatCommand = _corsBypassSend;
    }
} catch (_) { /* ignore */ }

// --- Polling automático de estados ---

let pollingInterval = null;
const POLLING_INTERVAL_MS = 5000; // 5 segundos - otimizado para responsividade sem sobrecarregar

// Sistema para evitar conflitos entre comandos manuais e polling
const recentCommands = new Map(); // deviceId -> timestamp do último comando
const COMMAND_PROTECTION_MS = 8000; // 8 segundos de proteção após comando manual

// Sistema de loading para botões master
function setMasterButtonLoading(button, isLoading) {
    console.log('🔄 setMasterButtonLoading chamada:', button, 'loading:', isLoading);
    
    if (isLoading) {
        button.classList.add('loading');
        button.dataset.loading = 'true';
        console.log('✅ Loading ativado - classes:', button.className);
    } else {
        button.classList.remove('loading');
        button.dataset.loading = 'false';
        console.log('❌ Loading desativado - classes:', button.className);
    }
}

function cleanupExpiredCommands() {
    const now = Date.now();
    for (const [deviceId, timestamp] of recentCommands.entries()) {
        if (now - timestamp > COMMAND_PROTECTION_MS) {
            recentCommands.delete(deviceId);
        }
    }
}

function startPolling() {
    if (pollingInterval) return; // Já está rodando
    
    // Buscar estados iniciais imediatamente
    updateDeviceStatesFromServer();
    
    // Depois iniciar polling regular
    pollingInterval = setInterval(updateDeviceStatesFromServer, POLLING_INTERVAL_MS);
    console.log('Polling iniciado - atualizando a cada', POLLING_INTERVAL_MS / 1000, 'segundos');
}

// Funções de proteção removidas para simplificar o sistema

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log('Polling parado');
    }
}

async function updateDeviceStatesFromServer() {
    try {
        // Limpar comandos antigos antes do polling
        cleanupExpiredCommands();
        
        const deviceIds = ALL_LIGHT_IDS.join(',');
        const pollingUrl = isProduction 
            ? `${POLLING_URL}?devices=${deviceIds}`
            : null; // Em dev, pular polling por enquanto
            
        if (!pollingUrl) return;
        
        const response = await fetch(pollingUrl);
        if (!response.ok) throw new Error(`Polling failed: ${response.status}`);
        
        const data = await response.json();
        
        // Atualizar UI com os novos estados (respeitando comandos pendentes)
        Object.entries(data.devices).forEach(([deviceId, deviceData]) => {
            if (deviceData.success) {
                // Só atualizar localStorage se o estado mudou
                const currentStored = getStoredState(deviceId);
                if (currentStored !== deviceData.state) {
                    setStoredState(deviceId, deviceData.state);
                }
                
                // Atualizar UI (função já verifica se elemento está pendente)
                updateDeviceUI(deviceId, deviceData.state);
            }
        });
        
        // Atualizar todos os botões master (home e cenários)
        updateAllMasterButtons();
        if (typeof updateMasterLightToggleState === 'function') {
            updateMasterLightToggleState();
        }
        
    } catch (error) {
        console.error('Erro no polling:', error);
        // Em caso de erro, reduzir frequência temporariamente
        setTimeout(() => {
            if (pollingInterval) {
                console.log('Tentando retomar polling após erro...');
            }
        }, 10000); // 10 segundos antes de tentar novamente
    }
}

function updateDeviceUI(deviceId, state, forceUpdate = false) {
    // Verificar se há comando recente que deve ser respeitado
    if (!forceUpdate) {
        const lastCommand = recentCommands.get(deviceId);
        if (lastCommand && (Date.now() - lastCommand < COMMAND_PROTECTION_MS)) {
            console.log(`🛡️ Device ${deviceId} protegido por comando recente - ignorando polling`);
            return;
        }
    }
    
    // Atualizar controles de cômodo
    const roomControls = document.querySelectorAll(`[data-device-id="${deviceId}"]`);
    roomControls.forEach(el => {
        if (el.classList.contains('room-control')) {
            const currentState = el.dataset.state;
            if (currentState !== state || forceUpdate) {
                console.log(`🔄 Atualizando device ${deviceId}: ${currentState} → ${state}${forceUpdate ? ' (forçado)' : ''}`);
                setRoomControlUI(el, state);
            }
        }
    });
    
    // Atualizar botões master da home após qualquer mudança de dispositivo
    updateAllMasterButtons();
}

function updateAllMasterButtons() {
    const masterButtons = document.querySelectorAll('.room-master-btn');
    masterButtons.forEach(btn => {
        const ids = (btn.dataset.deviceIds || '').split(',').filter(Boolean);
        if (ids.length > 0) {
            const masterState = anyOn(ids) ? 'on' : 'off';
            setMasterIcon(btn, masterState, false); // não forçar se pendente
        }
    });
}

// Funções auxiliares para botões master (movidas do HTML)
function anyOn(deviceIds) {
    return (deviceIds || []).some(id => (getStoredState(id) || 'off') === 'on');
}

function setMasterIcon(btn, state, forceUpdate = false) {
    // Não atualizar se estiver com comando pendente (exceto se forçado)
    if (!forceUpdate && btn.dataset.pending === 'true') {
        console.log('🔒 Master button pendente, ignorando atualização');
        return;
    }
    
    const img = btn.querySelector('img');
    if (!img) return;
    
    const newSrc = state === 'on' ? 'images/icons/icon-small-light-on.svg' : 'images/icons/icon-small-light-off.svg';
    const currentSrc = img.src;
    
    if (!currentSrc.includes(newSrc.split('/').pop())) {
        img.src = newSrc;
        btn.dataset.state = state;
        console.log(`🎨 Master icon atualizado: ${state}`);
    }
}

function initHomeMasters() {
    document.querySelectorAll('.room-master-btn').forEach(btn => {
        const ids = (btn.dataset.deviceIds || '').split(',').filter(Boolean);
        const state = anyOn(ids) ? 'on' : 'off';
        setMasterIcon(btn, state, true); // forçar na inicialização
    });
}

// Função chamada pelo onclick dos botões master na home
function onHomeMasterClick(event, button) {
    console.log('🖱️ onHomeMasterClick chamada!', button);
    event.preventDefault();
    event.stopPropagation();
    
    // Verificar se já está carregando
    if (button.dataset.loading === 'true') {
        console.log('⏸️ Botão já está carregando, ignorando clique');
        return;
    }
    
    const deviceIds = (button.dataset.deviceIds || '').split(',').filter(Boolean);
    console.log('🔍 Device IDs encontrados:', deviceIds);
    
    if (deviceIds.length === 0) {
        console.log('❌ Nenhum device ID encontrado');
        return;
    }
    
    // Determinar comando baseado no estado atual
    const currentState = anyOn(deviceIds) ? 'on' : 'off';
    const newCommand = currentState === 'on' ? 'off' : 'on';
    console.log('🎯 Comando determinado:', currentState, '→', newCommand);
    
    // Ativar loading visual
    console.log('🔄 Ativando loading visual...');
    setMasterButtonLoading(button, true);
    
    // Atualizar UI imediatamente
    setMasterIcon(button, newCommand);
    
    // Enviar comandos para todos os dispositivos
    const promises = deviceIds.map(deviceId => {
        // Marcar comando recente
        recentCommands.set(deviceId, Date.now());
        setStoredState(deviceId, newCommand);
        return sendHubitatCommand(deviceId, newCommand);
    });
    
    // Aguardar conclusão de todos os comandos
    Promise.allSettled(promises).finally(() => {
        // Remover loading após comandos
        setTimeout(() => {
            setMasterButtonLoading(button, false);
        }, 1000); // 1 segundo de delay para feedback visual
    });
}

// Função para o botão master da página de cenários
function handleMasterLightToggle() {
    const button = document.getElementById('master-light-toggle-btn');
    if (!button) return;
    
    // Verificar se já está carregando
    if (button.dataset.loading === 'true') {
        return;
    }
    
    // Usar todos os IDs de luzes
    const deviceIds = ALL_LIGHT_IDS;
    
    // Determinar comando baseado no estado atual
    const currentState = anyOn(deviceIds) ? 'on' : 'off';
    const newCommand = currentState === 'on' ? 'off' : 'on';
    
    // Ativar loading visual
    setMasterButtonLoading(button, true);
    
    // Enviar comandos para todos os dispositivos
    const promises = deviceIds.map(deviceId => {
        // Marcar comando recente
        recentCommands.set(deviceId, Date.now());
        setStoredState(deviceId, newCommand);
        return sendHubitatCommand(deviceId, newCommand);
    });
    
    // Aguardar conclusão de todos os comandos
    Promise.allSettled(promises).finally(() => {
        // Remover loading após comandos
        setTimeout(() => {
            setMasterButtonLoading(button, false);
            // Atualizar estado visual do botão
            updateMasterLightToggleState();
        }, 1000); // 1 segundo de delay para feedback visual
    });
}

// Função especial para atualizar estados após comandos master
function updateStatesAfterMasterCommand(deviceIds, command) {
    console.log(`🎯 Atualizando estados após master ${command} para:`, deviceIds);
    
    // Atualizar todos os dispositivos affected
    deviceIds.forEach(deviceId => {
        updateDeviceUI(deviceId, command, true);
    });
    
    // Forçar atualização de todos os masters
    setTimeout(() => {
        const masterButtons = document.querySelectorAll('.room-master-btn');
        masterButtons.forEach(btn => {
            const ids = (btn.dataset.deviceIds || '').split(',').filter(Boolean);
            if (ids.some(id => deviceIds.includes(id))) {
                const masterState = anyOn(ids) ? 'on' : 'off';
                setMasterIcon(btn, masterState, true); // forçar atualização
            }
        });
    }, 100);
}

// === SISTEMA DE CARREGAMENTO GLOBAL ===

// Controle da tela de loading
function showLoader() {
    try {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.classList.remove('hidden');
            loader.style.display = 'flex'; // Forçar display
            updateProgress(0, 'Iniciando carregamento...');
            console.log('📱 Loader exibido');
        } else {
            console.warn('⚠️ Elemento loader não encontrado');
        }
    } catch (error) {
        console.error('❌ Erro ao mostrar loader:', error);
    }
}

function hideLoader() {
    try {
        const loader = document.getElementById('global-loader');
        if (loader) {
            const delay = isMobile ? 800 : 500; // Mais tempo para mobile
            setTimeout(() => {
                loader.classList.add('hidden');
                // Esconder completamente após transição
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
                console.log('📱 Loader escondido');
            }, delay);
        }
    } catch (error) {
        console.error('❌ Erro ao esconder loader:', error);
    }
}

function updateProgress(percentage, text) {
    try {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const loaderText = document.querySelector('.loader-text');
        
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        
        if (progressText) {
            progressText.textContent = Math.round(percentage) + '%';
        }
        
        if (loaderText && text) {
            loaderText.textContent = text;
        }
        
        // Log para debug mobile
        console.log(`📊 Progresso: ${percentage}% - ${text || 'Carregando...'}`);
        
    } catch (error) {
        console.warn('⚠️ Erro ao atualizar progresso:', error);
    }
}

// Carregamento global de todos os estados dos dispositivos
async function loadAllDeviceStatesGlobally() {
    console.log('🌍 Iniciando carregamento global de estados...');
    
    // Verificar compatibilidade primeiro
    if (!checkMobileCompatibility()) {
        console.warn('📱 Modo compatibilidade ativado para mobile');
        updateProgress(20, 'Modo compatibilidade mobile...');
        
        // Modo simplificado para dispositivos incompatíveis
        console.log('📱 Carregando em modo compatibilidade mobile...');
        
        ALL_LIGHT_IDS.forEach((deviceId, index) => {
            let storedState = 'off'; // Estado padrão seguro
            
            try {
                if (typeof localStorage !== 'undefined') {
                    const stored = localStorage.getItem(`device_state_${deviceId}`);
                    if (stored) {
                        storedState = stored;
                    }
                }
            } catch (e) {
                console.warn(`localStorage inacessível para ${deviceId}:`, e);
            }
            
            // Simular delay para melhor UX
            if (index < 3) {
                setTimeout(() => {
                    updateDeviceUI(deviceId, storedState, true);
                }, index * 100);
            } else {
                updateDeviceUI(deviceId, storedState, true);
            }
            
            const progress = 20 + ((index + 1) / ALL_LIGHT_IDS.length) * 80;
            updateProgress(progress, `Dispositivo ${index + 1}/${ALL_LIGHT_IDS.length}`);
        });
        
        updateProgress(100, 'Modo compatibilidade com polling ativo!');
        return true;
    }
    
    if (!isProduction) {
        console.log('💻 Modo desenvolvimento - carregando do localStorage');
        updateProgress(20, 'Carregando estados salvos...');
        
        // Simular carregamento para melhor UX (mobile-friendly)
        try {
            await new Promise(resolve => setTimeout(resolve, isMobile ? 800 : 500));
        } catch (e) {
            // Fallback se Promise.resolve falhar
            console.warn('Promise fallback ativo');
        }
        
        ALL_LIGHT_IDS.forEach((deviceId, index) => {
            let storedState = 'off';
            try {
                storedState = getStoredState(deviceId) || 'off';
            } catch (e) {
                console.warn(`Erro ao ler estado do ${deviceId}:`, e);
            }
            
            try {
                updateDeviceUI(deviceId, storedState, true); // forceUpdate = true
            } catch (e) {
                console.warn(`Erro ao atualizar UI do ${deviceId}:`, e);
            }
            
            const progress = 20 + ((index + 1) / ALL_LIGHT_IDS.length) * 80;
            updateProgress(progress, `Dispositivo ${index + 1}/${ALL_LIGHT_IDS.length}...`);
        });
        
        updateProgress(100, 'Carregamento concluído!');
        return true;
    }
    
    try {
        updateProgress(10, 'Conectando com servidor...');
        
        const deviceIds = ALL_LIGHT_IDS.join(',');
        console.log(`📡 Buscando estados de ${ALL_LIGHT_IDS.length} dispositivos...`);
        
        updateProgress(30, 'Enviando solicitação...');
        
        // Configurações otimizadas para mobile
        const fetchOptions = {
            method: 'GET',
            cache: isMobile ? 'no-cache' : 'default',
            mode: 'cors'
        };
        
        // Timeout mais longo para mobile (compatível com browsers antigos)
        let controller, timeoutId;
        const timeout = isMobile ? 15000 : 10000; // 15s para mobile, 10s para desktop
        
        // Verificar se AbortController é suportado
        if (typeof AbortController !== 'undefined') {
            controller = new AbortController();
            timeoutId = setTimeout(() => controller.abort(), timeout);
            fetchOptions.signal = controller.signal;
        } else {
            console.warn('⚠️ AbortController não suportado - sem timeout');
        }
        
        const response = await fetch(`${POLLING_URL}?devices=${deviceIds}`, fetchOptions);
        if (timeoutId) clearTimeout(timeoutId);
        
        updateProgress(50, 'Recebendo dados...');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('❌ Erro ao parsear JSON:', jsonError);
            throw new Error('Resposta inválida do servidor');
        }
        console.log('📡 Estados recebidos:', data);
        
        updateProgress(70, 'Processando estados...');
        
        // Processar dispositivos com progresso
        const deviceEntries = Object.entries(data.devices);
        let processedCount = 0;
        
        deviceEntries.forEach(([deviceId, deviceData]) => {
            if (deviceData.success) {
                setStoredState(deviceId, deviceData.state);
                updateDeviceUI(deviceId, deviceData.state, true); // forceUpdate = true
                console.log(`✅ Device ${deviceId}: ${deviceData.state}`);
            } else {
                console.warn(`⚠️ Falha no device ${deviceId}:`, deviceData.error);
                // Usar estado salvo como fallback
                const storedState = getStoredState(deviceId) || 'off';
                updateDeviceUI(deviceId, storedState, true); // forceUpdate = true
            }
            
            processedCount++;
            const progress = 70 + (processedCount / deviceEntries.length) * 25;
            updateProgress(progress, `Aplicando estado ${processedCount}/${deviceEntries.length}...`);
        });
        
        updateProgress(95, 'Finalizando sincronização...');
        
        // Forçar atualização de todos os botões master após carregamento
        setTimeout(() => {
            updateAllMasterButtons();
            console.log('🔄 Botões master atualizados após carregamento global');
        }, 100);
        
        updateProgress(100, 'Estados carregados com sucesso!');
        console.log('✅ Carregamento global concluído com sucesso');
        return true;
        
    } catch (error) {
        console.error('❌ Erro no carregamento global:', error);
        
        // Diagnóstico específico para mobile
        if (isMobile) {
            if (error.name === 'AbortError') {
                console.warn('📱 Timeout de rede em dispositivo móvel');
                updateProgress(60, 'Timeout móvel - usando backup...');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.warn('📱 Problema de conectividade móvel');
                updateProgress(60, 'Sem rede móvel - modo offline...');
            } else {
                console.warn('📱 Erro específico de mobile:', error.message);
                updateProgress(60, 'Erro móvel - usando backup...');
            }
        } else {
            updateProgress(60, 'Erro na conexão, usando dados salvos...');
        }
        
        // Fallback para localStorage
        ALL_LIGHT_IDS.forEach((deviceId, index) => {
            const storedState = getStoredState(deviceId) || 'off';
            updateDeviceUI(deviceId, storedState, true); // forceUpdate = true
            
            const progress = 60 + ((index + 1) / ALL_LIGHT_IDS.length) * 35;
            updateProgress(progress, `Carregando backup ${index + 1}/${ALL_LIGHT_IDS.length}...`);
        });
        
        const offlineMsg = isMobile ? 'Modo offline móvel ativo' : 'Carregamento concluído (modo offline)';
        updateProgress(100, offlineMsg);
        return false;
    }
}

// Verificar compatibilidade com mobile
function checkMobileCompatibility() {
    const issues = [];
    const warnings = [];
    
    // APIs críticas (falha total se não existirem)
    if (typeof fetch === 'undefined') {
        issues.push('Fetch API não suportada');
    }
    
    if (typeof Promise === 'undefined') {
        issues.push('Promises não suportadas');
    }
    
    // APIs opcionais (warnings apenas)
    if (typeof MutationObserver === 'undefined') {
        warnings.push('MutationObserver não suportado (usar fallback)');
    }
    
    if (typeof AbortController === 'undefined') {
        warnings.push('AbortController não suportado (sem timeout)');
    }
    
    if (typeof localStorage === 'undefined') {
        warnings.push('LocalStorage não suportado (sem persistência)');
    }
    
    // Testar localStorage funcionamento
    try {
        const testKey = '__test_ls__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
    } catch (e) {
        warnings.push('LocalStorage bloqueado (modo privado?)');
    }
    
    if (warnings.length > 0) {
        console.warn('⚠️ Avisos de compatibilidade:', warnings);
    }
    
    if (issues.length > 0) {
        console.error('❌ Problemas críticos detectados:', issues);
        return false;
    }
    
    console.log('✅ Compatibilidade mobile verificada');
    return true;
}

// Observador para sincronizar novos elementos no DOM
function setupDomObserver() {
    // Verificar se MutationObserver está disponível
    if (typeof MutationObserver === 'undefined') {
        console.warn('⚠️ MutationObserver não disponível - usando fallback');
        // Fallback: verificar mudanças periodicamente
        setInterval(() => {
            syncAllVisibleControls();
        }, 5000);
        return;
    }
    
    try {
        const observer = new MutationObserver((mutations) => {
        let needsUpdate = false;
        
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Verificar se adicionou controles de dispositivos
                    const controls = node.querySelectorAll ? 
                        node.querySelectorAll('.room-control[data-device-id], .room-master-btn[data-device-ids]') :
                        [];
                    
                    if (controls.length > 0 || node.matches?.('.room-control[data-device-id], .room-master-btn[data-device-ids]')) {
                        needsUpdate = true;
                        console.log('🔍 Novos controles adicionados ao DOM, sincronizando estados...');
                    }
                }
            });
        });
        
        if (needsUpdate) {
            // Aguardar um pouco para DOM estar estável
            setTimeout(() => {
                syncAllVisibleControls();
            }, 50);
        }
    });
    
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👁️ Observador DOM configurado para sincronização automática');
        
    } catch (error) {
        console.error('❌ Erro ao configurar MutationObserver:', error);
        console.warn('📱 Usando fallback para compatibilidade mobile');
        
        // Fallback: verificar mudanças a cada 5 segundos
        setInterval(() => {
            syncAllVisibleControls();
        }, 5000);
    }
}

// Sincronizar todos os controles visíveis com estados salvos
function syncAllVisibleControls(forceMasterUpdate = false) {
    console.log('🔄 Sincronizando todos os controles visíveis...');
    
    // Sincronizar controles de cômodo
    const roomControls = document.querySelectorAll('.room-control[data-device-id]');
    let updatedControls = 0;
    
    roomControls.forEach(el => {
        const deviceId = el.dataset.deviceId;
        const savedState = getStoredState(deviceId);
        const currentState = el.dataset.state;
        
        if (savedState && currentState !== savedState) {
            console.log(`🔄 Sincronizando controle ${deviceId}: ${currentState} → ${savedState}`);
            setRoomControlUI(el, savedState);
            updatedControls++;
        }
    });
    
    // Atualizar botões master (forçar se necessário)
    const masterButtons = document.querySelectorAll('.room-master-btn');
    masterButtons.forEach(btn => {
        const ids = (btn.dataset.deviceIds || '').split(',').filter(Boolean);
        if (ids.length > 0) {
            const masterState = anyOn(ids) ? 'on' : 'off';
            setMasterIcon(btn, masterState, forceMasterUpdate);
        }
    });
    
    console.log(`✅ Sincronização completa: ${updatedControls} controles atualizados`);
}

// Comandos de debug globais
window.debugEletrize = {
    forcePolling: updateDeviceStatesFromServer,
    reloadStates: loadAllDeviceStatesGlobally,
    syncControls: syncAllVisibleControls,
    showLoader: showLoader,
    hideLoader: hideLoader,
    checkDevice: (deviceId) => {
        const stored = getStoredState(deviceId);
        console.log(`Device ${deviceId}: stored=${stored}`);
    },
    checkAllDevices: () => {
        console.log('📋 Estados de todos os dispositivos:');
        ALL_LIGHT_IDS.forEach(deviceId => {
            const stored = getStoredState(deviceId);
            console.log(`  ${deviceId}: ${stored}`);
        });
    },
    checkProtectedCommands: () => {
        console.log('🛡️ Comandos protegidos:');
        if (recentCommands.size === 0) {
            console.log('  ✅ Nenhum comando protegido');
            return;
        }
        const now = Date.now();
        recentCommands.forEach((timestamp, deviceId) => {
            const remaining = Math.max(0, COMMAND_PROTECTION_MS - (now - timestamp));
            const status = remaining > 0 ? '🔒 ATIVO' : '🔓 EXPIRADO';
            console.log(`  ${status} ${deviceId}: ${Math.ceil(remaining/1000)}s restantes`);
        });
    },
    testMasterLoading: () => {
        console.log('🔄 Testando loading nos botões master...');
        const masters = document.querySelectorAll('.room-master-btn');
        const scenes = document.querySelectorAll('.scene-control-card');
        
        console.log('Botões master encontrados:', masters.length);
        console.log('Botões de cenário encontrados:', scenes.length);
        
        // Testar botões master da home
        masters.forEach((btn, index) => {
            console.log(`Testando botão master ${index + 1}:`, btn);
            setTimeout(() => {
                setMasterButtonLoading(btn, true);
                setTimeout(() => {
                    setMasterButtonLoading(btn, false);
                }, 3000);
            }, index * 200);
        });
        
        // Testar botão de cenários também
        scenes.forEach((btn, index) => {
            setTimeout(() => {
                setMasterButtonLoading(btn, true);
                setTimeout(() => {
                    setMasterButtonLoading(btn, false);
                }, 3000);
            }, (masters.length + index) * 200);
        });
    },
    checkMasterButtons: () => {
        console.log('🏠 Status dos botões master:');
        document.querySelectorAll('.room-master-btn').forEach((btn, index) => {
            const ids = (btn.dataset.deviceIds || '').split(',').filter(Boolean);
            const route = btn.dataset.route || 'unknown';
            const pending = btn.dataset.pending === 'true';
            const currentState = btn.dataset.state || 'unknown';
            const calculatedState = anyOn(ids) ? 'on' : 'off';
            const consistent = currentState === calculatedState;
            
            console.log(`  ${index + 1}. ${route}: ${currentState} (calc: ${calculatedState}) ${consistent ? '✅' : '❌'} ${pending ? '⏳' : '🔓'}`);
        });
    },
    fixMasterButtons: () => {
        console.log('🔧 Corrigindo todos os botões master...');
        document.querySelectorAll('.room-master-btn').forEach(btn => {
            btn.dataset.pending = 'false';
            const ids = (btn.dataset.deviceIds || '').split(',').filter(Boolean);
            const state = anyOn(ids) ? 'on' : 'off';
            setMasterIcon(btn, state, true);
        });
        console.log('✅ Botões master corrigidos!');
    },
    mobileInfo: () => {
        console.log('📱 Informações do dispositivo móvel:');
        console.log('  isMobile:', isMobile);
        console.log('  isIOS:', isIOS);
        console.log('  isProduction:', isProduction);
        console.log('  User Agent:', navigator.userAgent);
        console.log('  Screen:', `${screen.width}x${screen.height}`);
        console.log('  Viewport:', `${window.innerWidth}x${window.innerHeight}`);
        console.log('  Connection:', navigator.connection ? 
            `${navigator.connection.effectiveType} (${navigator.connection.downlink}Mbps)` : 
            'Não disponível');
        checkMobileCompatibility();
    },
    testMobileApi: async () => {
        console.log('🧪 Testando APIs para mobile...');
        try {
            const testUrl = isProduction ? '/functions/polling?devices=366' : '#test';
            // Configurar timeout compatível
            const fetchConfig = { 
                method: 'GET',
                cache: 'no-cache'
            };
            
            // Adicionar timeout se AbortController for suportado
            if (typeof AbortController !== 'undefined') {
                const testController = new AbortController();
                setTimeout(() => testController.abort(), 5000);
                fetchConfig.signal = testController.signal;
            }
            
            const response = await fetch(testUrl, fetchConfig);
            console.log('✅ Fetch test:', response.status, response.statusText);
        } catch (error) {
            console.error('❌ Fetch test failed:', error);
        }
    }
};

// Versão ultra-básica para browsers problemáticos
function initUltraBasicMode() {
    try {
        showMobileDebug('🚨 Inicializando modo ultra-básico...', 'info');
        
        // Esconder loader de forma mais segura
        var loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
            showMobileDebug('✅ Loader escondido em modo básico', 'success');
        }
        
        // Definir estados básicos sem usar localStorage (pode falhar no mobile)
        var processedDevices = 0;
        ALL_LIGHT_IDS.forEach(function(deviceId) {
            try {
                var controls = document.querySelectorAll('[data-device-id="' + deviceId + '"]');
                controls.forEach(function(control) {
                    if (control.classList.contains('room-control')) {
                        control.dataset.state = 'off';
                        var img = control.querySelector('.room-control-icon');
                        if (img) {
                            img.src = 'images/icons/icon-small-light-off.svg';
                        }
                        processedDevices++;
                    }
                });
            } catch (e) {
                showMobileDebug('Erro no dispositivo ' + deviceId + ': ' + e.message, 'error');
            }
        });
        
        showMobileDebug('✅ Modo ultra-básico ativo - ' + processedDevices + ' dispositivos processados', 'success');
        
        // Verificar elementos básicos
        var controls = document.querySelectorAll('.room-control');
        var masters = document.querySelectorAll('.room-master-btn');
        showMobileDebug('🔍 Encontrados ' + controls.length + ' controles e ' + masters.length + ' masters', 'info');
        
        return true; // Sucesso
        
    } catch (error) {
        showMobileDebug('❌ ERRO CRÍTICO no modo ultra-básico: ' + error.message, 'error');
        return false; // Falha
    }
}

// Função de inicialização simplificada para mobile COM POLLING ATIVO
function initSimpleMode() {
    console.log('📱 Inicializando modo simples com polling...');
    
    try {
        console.log('📱 Tentando mostrar loader...');
        showLoader();
        
        console.log('📱 Atualizando progresso...');
        updateProgress(10, 'Modo simples com polling ativo...');
        
        console.log('📱 Processando', ALL_LIGHT_IDS.length, 'dispositivos...');
        
        // Carregar estados básicos
        for (var i = 0; i < ALL_LIGHT_IDS.length; i++) {
            var deviceId = ALL_LIGHT_IDS[i];
            var progress = 10 + ((i + 1) / ALL_LIGHT_IDS.length) * 70; // Deixar 20% para polling
            
            console.log('📱 Processando device', deviceId, '- progresso:', progress + '%');
            updateProgress(progress, 'Carregando ' + (i + 1) + '/' + ALL_LIGHT_IDS.length + '...');
            
            try {
                updateDeviceUI(deviceId, 'off', true);
            } catch (e) {
                console.error('❌ Erro no device', deviceId + ':', e);
            }
        }
        
        console.log('📱 Configurando polling para modo simples...');
        updateProgress(85, 'Ativando sincronização...');
        
        // Configurar observador DOM simplificado
        try {
            setupDomObserver();
            console.log('✅ Observador DOM configurado no modo simples');
        } catch (e) {
            console.warn('⚠️ Observador DOM falhou no modo simples:', e);
        }
        
        // Sincronizar controles visíveis
        updateProgress(90, 'Sincronizando controles...');
        setTimeout(function() {
            try {
                syncAllVisibleControls();
                console.log('✅ Controles sincronizados no modo simples');
            } catch (e) {
                console.warn('⚠️ Sincronização falhou:', e);
            }
        }, 300);
        
        // IMPLEMENTAR POLLING NO MODO SIMPLES
        updateProgress(95, 'Iniciando polling...');
        setTimeout(function() {
            if (isProduction) {
                console.log('🔄 Iniciando polling em modo simples...');
                try {
                    startPolling(); // Ativar polling completo mesmo no modo simples
                    console.log('✅ Polling ativo no modo simples');
                } catch (e) {
                    console.error('❌ Erro ao iniciar polling no modo simples:', e);
                }
            } else {
                console.log('💻 Modo desenvolvimento - polling não iniciado');
            }
            
            updateProgress(100, 'Modo simples com polling ativo!');
            
            setTimeout(function() {
                console.log('📱 Escondendo loader...');
                hideLoader();
                console.log('✅ Modo simples com polling completo ativo');
            }, 1000);
        }, 2000); // Aguardar 2s para estabilizar antes do polling
        
    } catch (error) {
        console.error('❌ ERRO CRÍTICO no modo simples:', error);
        console.error('❌ Erro stack:', error.stack);
        console.error('❌ Erro linha:', error.lineNumber || 'desconhecida');
        
        // Ativar modo ultra-básico como fallback
        console.log('🚨 Ativando modo ultra-básico...');
        initUltraBasicMode();
    }
}

// Tratamento de erros globais para debug mobile
window.onerror = function(message, source, lineno, colno, error) {
    console.error('🚨 ERRO GLOBAL DETECTADO:');
    console.error('📍 Mensagem:', message);
    console.error('📍 Arquivo:', source);
    console.error('📍 Linha:', lineno);
    console.error('📍 Coluna:', colno);
    console.error('📍 Erro:', error);
    
    // Tentar ativar modo ultra-básico
    setTimeout(function() {
        console.log('🚨 Tentando recuperação automática...');
        try {
            initUltraBasicMode();
        } catch (e) {
            console.error('💥 Falha na recuperação:', e);
        }
    }, 1000);
    
    return false; // Não impedir outros handlers
};

// Capturar promises rejeitadas
window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 PROMISE REJEITADA:', event.reason);
    console.error('🚨 Promise:', event.promise);
});

// Inicialização global da aplicação
window.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 =================================');
    console.log('🏠 DASHBOARD ELETRIZE INICIALIZANDO');
    console.log('🏠 =================================');
    console.log('🛠️ Comandos debug disponíveis: window.debugEletrize');
    console.log('📱 Mobile detectado:', isMobile);
    
    // Debug visual para mobile
    showMobileDebug('🏠 DASHBOARD ELETRIZE INICIALIZANDO', 'info');
    
    // Envolver TUDO em try-catch para capturar qualquer erro
    try {
        console.log('📱 Verificando compatibilidade mobile...');
        
        // Verificar se é mobile com limitações críticas
        if (isMobile) {
            showMobileDebug('📱 Verificando compatibilidade mobile...', 'info');
            var isCompatible = false;
            try {
                isCompatible = checkMobileCompatibility();
                showMobileDebug('📱 Compatibilidade: ' + (isCompatible ? 'OK' : 'LIMITADO'), isCompatible ? 'success' : 'error');
            } catch (e) {
                console.error('❌ Erro na verificação de compatibilidade:', e);
                showMobileDebug('❌ Erro na verificação: ' + e.message, 'error');
                isCompatible = false;
            }
            
            if (!isCompatible) {
                console.warn('📱 Dispositivo móvel com limitações detectado - usando modo simples COM POLLING');
                showMobileDebug('📱 Usando modo simples COM POLLING', 'info');
                initSimpleMode();
                return;
            }
        }
        
        console.log('📱 Tentando mostrar loader...');
        // Mostrar loader imediatamente
        showLoader();
        
        // Timeout ajustado para mobile (mais tempo para carregar)
        var initDelay = isMobile ? 2000 : 500; // Aumentei para 2s em mobile
        console.log('⏱️ Delay de inicialização: ' + initDelay + 'ms (mobile: ' + isMobile + ')');
        
        // Aguardar um pouco para UI carregar e então iniciar carregamento
        setTimeout(function() {
            console.log('📱 Iniciando carregamento principal...');
            
            try {
                // Carregamento global de todos os estados (usando Promise)
                loadAllDeviceStatesGlobally().then(function(success) {
                    console.log('📱 Carregamento global concluído, success:', success);
                    
                    // Aguardar mais tempo em mobile para estabilizar
                    var finalDelay = isMobile ? 1200 : 800;
                    setTimeout(function() {
                        // Esconder loader
                        hideLoader();
                        
                        // Configurar observador DOM (com fallback para mobile)
                        setupDomObserver();
                        
                        // Sincronizar controles já existentes (delay maior em mobile)
                        var syncDelay = isMobile ? 300 : 100;
                        setTimeout(syncAllVisibleControls, syncDelay);
                        
                        // Iniciar polling se estiver em produção (delay maior para mobile)
                        if (isProduction) {
                            var pollingDelay = isMobile ? 5000 : 3000;
                            console.log('🔄 Iniciando polling em ' + (pollingDelay/1000) + ' segundos (mobile: ' + isMobile + ')');
                            setTimeout(startPolling, pollingDelay);
                        }
                        
                        console.log('🎉 Aplicação totalmente inicializada!');
                        
                    }, finalDelay);
                    
                }).catch(function(error) {
                    console.error('❌ Erro no carregamento global:', error);
                    showMobileDebug('❌ Erro no carregamento: ' + error.message, 'error');
                    window.initializationError = error;
                    
                    // Tentar modo de emergência
                    if (!window.emergencyModeActive) {
                        console.log('🚨 Ativando modo de emergência...');
                        showMobileDebug('🚨 Ativando modo de emergência...', 'info');
                        window.emergencyModeActive = true;
                        initUltraBasicMode();
                    }
                });
                
            } catch (error) {
                console.error('💥 Erro crítico na inicialização:', error);
                showMobileDebug('💥 ERRO CRÍTICO: ' + error.message, 'error');
                
                // Modo de emergência para mobile
                if (isMobile) {
                    console.log('📱 Ativando modo de emergência para mobile...');
                    showMobileDebug('📱 Ativando modo de emergência mobile...', 'info');
                    updateProgress(80, 'Modo de emergência mobile...');
                    
                    try {
                        // Inicialização mínima sem APIs externas
                        ALL_LIGHT_IDS.forEach(function(deviceId) {
                            updateDeviceUI(deviceId, 'off', true);
                        });
                        
                        updateProgress(100, 'Modo básico carregado');
                        showMobileDebug('✅ Modo básico carregado com sucesso', 'success');
                        setTimeout(hideLoader, 1000);
                        
                    } catch (emergencyError) {
                        console.error('💥 Falha no modo de emergência:', emergencyError);
                        console.log('🚨 Ativando modo ultra-básico como último recurso...');
                        initUltraBasicMode();
                    }
                    
                } else {
                    // Desktop - mostrar erro mas tentar modo de emergência também
                    try {
                        console.error('🖥️ Erro no desktop, tentando modo de emergência...');
                        updateProgress(90, 'Tentando recuperação...');
                        
                        // Tentar modo ultra-básico também no desktop
                        setTimeout(function() {
                            try {
                                initUltraBasicMode();
                            } catch (ultraError) {
                                console.error('💀 Falha total na recuperação desktop:', ultraError);
                                updateProgress(100, 'Erro crítico - recarregue a página');
                                setTimeout(function() { hideLoader(); }, 3000);
                            }
                        }, 1000);
                        
                    } catch (e) {
                        console.error('❌ Erro no fallback desktop:', e);
                        updateProgress(100, 'Erro crítico - recarregue a página');
                        setTimeout(function() { hideLoader(); }, 3000);
                    }
                }
            }
        }, initDelay);
        
    } catch (mainError) {
        console.error('🚨 ERRO CRÍTICO NA INICIALIZAÇÃO PRINCIPAL:', mainError);
        console.error('🚨 Stack:', mainError.stack);
        
        // Último recurso - modo ultra-básico
        console.log('🚨 Executando último recurso...');
        showMobileDebug('🚨 Executando último recurso...', 'info');
        try {
            var success = initUltraBasicMode();
            if (success) {
                showMobileDebug('✅ Último recurso bem-sucedido!', 'success');
            } else {
                showMobileDebug('❌ Último recurso falhou', 'error');
            }
        } catch (finalError) {
            console.error('💀 FALHA TOTAL:', finalError);
            showMobileDebug('💀 FALHA TOTAL: ' + finalError.message, 'error');
            // No mobile, evitar alert que pode bloquear
            if (!isMobile) {
                alert('Erro crítico. Recarregue a página.');
            }
        }
    }
});

// Parar polling quando a página é fechada
window.addEventListener('beforeunload', stopPolling);
