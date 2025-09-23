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
    
    // Proteger dispositivo contra polling por 5 segundos
    protectDevice(deviceId, 5000);
    
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
            // Remover proteção em caso de erro
            deviceProtection.delete(deviceId);
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
    const controls = document.querySelectorAll('.room-control[data-device-id]:not([data-no-sync="true"])');
    controls.forEach(el => {
        setRoomControlUI(el, el.dataset.state || 'off');
    });

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
const POLLING_INTERVAL_MS = 10000; // 10 segundos (mais conservador)
const deviceProtection = new Map(); // Armazena proteções por deviceId

function startPolling() {
    if (pollingInterval) return; // Já está rodando
    
    // Buscar estados iniciais imediatamente
    updateDeviceStatesFromServer();
    
    // Depois iniciar polling regular
    pollingInterval = setInterval(updateDeviceStatesFromServer, POLLING_INTERVAL_MS);
    console.log('Polling iniciado - atualizando a cada', POLLING_INTERVAL_MS / 1000, 'segundos');
}

function protectDevice(deviceId, durationMs = 8000) {
    const until = Date.now() + durationMs;
    deviceProtection.set(deviceId, until);
    console.log(`🛡️ Device ${deviceId} protegido por ${durationMs/1000}s até`, new Date(until).toLocaleTimeString());
}

function isDeviceProtected(deviceId) {
    const until = deviceProtection.get(deviceId);
    if (!until) return false;
    
    const now = Date.now();
    if (now > until) {
        deviceProtection.delete(deviceId);
        console.log(`🔓 Proteção do device ${deviceId} expirou`);
        return false;
    }
    
    const remainingMs = until - now;
    console.log(`🔒 Device ${deviceId} ainda protegido por ${Math.ceil(remainingMs/1000)}s`);
    return true;
}

function clearAllProtections() {
    const count = deviceProtection.size;
    deviceProtection.clear();
    console.log(`🧹 Limpadas ${count} proteções de dispositivos`);
}

function showProtectionStatus() {
    const now = Date.now();
    console.log('📊 Status das proteções:');
    
    if (deviceProtection.size === 0) {
        console.log('  ✅ Nenhum dispositivo protegido');
        return;
    }
    
    deviceProtection.forEach((until, deviceId) => {
        const remaining = Math.max(0, until - now);
        const status = remaining > 0 ? '🔒 ATIVO' : '🔓 EXPIRADO';
        console.log(`  ${status} ${deviceId}: ${Math.ceil(remaining/1000)}s restantes`);
    });
}

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log('Polling parado');
    }
}

async function updateDeviceStatesFromServer() {
    try {
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
    // Não atualizar se dispositivo está protegido (exceto se forçado)
    if (!forceUpdate && isDeviceProtected(deviceId)) {
        console.log(`🛡️ Device ${deviceId} protegido - ignorando atualização do polling`);
        return;
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
            setMasterIcon(btn, masterState);
        }
    });
}

// === SISTEMA DE CARREGAMENTO GLOBAL ===

// Controle da tela de loading
function showLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.classList.remove('hidden');
        updateProgress(0, 'Iniciando carregamento...');
    }
}

function hideLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500); // Pequeno delay para melhor UX
    }
}

function updateProgress(percentage, text) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const loaderText = document.querySelector('.loader-text');
    
    if (progressFill) progressFill.style.width = percentage + '%';
    if (progressText) progressText.textContent = Math.round(percentage) + '%';
    if (loaderText && text) loaderText.textContent = text;
}

// Carregamento global de todos os estados dos dispositivos
async function loadAllDeviceStatesGlobally() {
    console.log('🌍 Iniciando carregamento global de estados...');
    
    if (!isProduction) {
        console.log('💻 Modo desenvolvimento - carregando do localStorage');
        updateProgress(20, 'Carregando estados salvos...');
        
        // Simular carregamento para melhor UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        ALL_LIGHT_IDS.forEach((deviceId, index) => {
            const storedState = getStoredState(deviceId) || 'off';
            updateDeviceUI(deviceId, storedState, true); // forceUpdate = true
            
            const progress = 20 + ((index + 1) / ALL_LIGHT_IDS.length) * 80;
            updateProgress(progress, `Carregando dispositivo ${index + 1}/${ALL_LIGHT_IDS.length}...`);
        });
        
        updateProgress(100, 'Carregamento concluído!');
        return true;
    }
    
    try {
        updateProgress(10, 'Conectando com servidor...');
        
        const deviceIds = ALL_LIGHT_IDS.join(',');
        console.log(`📡 Buscando estados de ${ALL_LIGHT_IDS.length} dispositivos...`);
        
        updateProgress(30, 'Enviando solicitação...');
        const response = await fetch(`${POLLING_URL}?devices=${deviceIds}`);
        
        updateProgress(50, 'Recebendo dados...');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
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
        
        updateProgress(100, 'Estados carregados com sucesso!');
        console.log('✅ Carregamento global concluído com sucesso');
        return true;
        
    } catch (error) {
        console.error('❌ Erro no carregamento global:', error);
        updateProgress(60, 'Erro na conexão, usando dados salvos...');
        
        // Fallback para localStorage
        ALL_LIGHT_IDS.forEach((deviceId, index) => {
            const storedState = getStoredState(deviceId) || 'off';
            updateDeviceUI(deviceId, storedState, true); // forceUpdate = true
            
            const progress = 60 + ((index + 1) / ALL_LIGHT_IDS.length) * 35;
            updateProgress(progress, `Carregando backup ${index + 1}/${ALL_LIGHT_IDS.length}...`);
        });
        
        updateProgress(100, 'Carregamento concluído (modo offline)');
        return false;
    }
}

// Comandos de debug globais
window.debugEletrize = {
    showProtections: showProtectionStatus,
    clearProtections: clearAllProtections,
    forcePolling: updateDeviceStatesFromServer,
    reloadStates: loadAllDeviceStatesGlobally,
    showLoader: showLoader,
    hideLoader: hideLoader,
    checkDevice: (deviceId) => {
        const stored = getStoredState(deviceId);
        const protected = isDeviceProtected(deviceId);
        console.log(`Device ${deviceId}: stored=${stored}, protected=${protected}`);
    },
    checkAllDevices: () => {
        console.log('📋 Estados de todos os dispositivos:');
        ALL_LIGHT_IDS.forEach(deviceId => {
            const stored = getStoredState(deviceId);
            const protected = isDeviceProtected(deviceId);
            console.log(`  ${deviceId}: ${stored} ${protected ? '🔒' : '🔓'}`);
        });
    }
};

// Inicialização global da aplicação
window.addEventListener('DOMContentLoaded', () => {
    console.log('🏠 Dashboard Eletrize inicializando...');
    console.log('🛠️ Comandos debug disponíveis: window.debugEletrize');
    
    // Mostrar loader imediatamente
    showLoader();
    
    // Aguardar um pouco para UI carregar e então iniciar carregamento
    setTimeout(async () => {
        try {
            // Carregamento global de todos os estados
            const success = await loadAllDeviceStatesGlobally();
            
            // Aguardar um momento para mostrar 100%
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Esconder loader
            hideLoader();
            
            // Iniciar polling se estiver em produção
            if (isProduction) {
                console.log('🔄 Iniciando polling em 3 segundos...');
                setTimeout(startPolling, 3000);
            }
            
            console.log('🎉 Aplicação totalmente inicializada!');
            
        } catch (error) {
            console.error('💥 Erro crítico na inicialização:', error);
            updateProgress(100, 'Erro na inicialização');
            setTimeout(hideLoader, 2000);
        }
    }, 500); // Aguardar 500ms para DOM estar completamente pronto
});

// Parar polling quando a página é fechada
window.addEventListener('beforeunload', stopPolling);
