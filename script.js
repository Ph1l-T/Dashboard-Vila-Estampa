// Funções de toggle para ícones nos cards da home
function toggleTelamovelIcon(el) {
    const img = el.querySelector('img');
    if (el.dataset.state === 'off') {
        img.src = 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-telamovel-on.svg';
        el.dataset.state = 'on';
    } else {
        img.src = 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-telamovel-off.svg';
        el.dataset.state = 'off';
    }
}

function toggleSmartglassIcon(el) {
    const img = el.querySelector('img');
    if (el.dataset.state === 'off') {
        img.src = 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-smartglass-on.svg';
        el.dataset.state = 'on';
    } else {
        img.src = 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-smartglass-off.svg';
        el.dataset.state = 'off';
    }
}

function toggleShaderIcon(el) {
    const img = el.querySelector('img');
    if (el.dataset.state === 'off') {
        img.src = 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-shader-on.svg';
        el.dataset.state = 'on';
    } else {
        img.src = 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-shader-off.svg';
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
        img.src = 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-tv-on.svg';
        el.dataset.state = 'on';
    } else {
        img.src = 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-tv-off.svg';
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
    el.dataset.state = newState;
    if (img) img.src = newState === 'on' ? ICON_ON : ICON_OFF;

    const deviceId = el.dataset.deviceId;
    if (deviceId) {
        // Persist locally
        setStoredState(deviceId, newState);
        // Send to Hubitat
        try {
            sendHubitatCommand(deviceId, newState === 'on' ? 'on' : 'off');
        } catch (e) { /* opcional: log silencioso */ }
    }
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
    const url = urlDeviceInfo(deviceId);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Hubitat state fetch failed: ${resp.status}`);
    const data = await resp.json();
    // Maker API returns attributes array; prefer currentValue, fallback to value
    const attr = Array.isArray(data.attributes) ? data.attributes.find(a => a.name === 'switch') : null;
    const state = attr?.currentValue || attr?.value || null;
    return state;
}

async function refreshRoomControlFromHubitat(el) {
    return;
}

function initRoomPage() {
    const controls = document.querySelectorAll('.room-control[data-device-id]:not([data-no-sync="true"])');
    controls.forEach(el => {
        setRoomControlUI(el, el.dataset.state || 'off');
    });
}

// --- Funções para a página do Escritório ---

function toggleDevice(el, deviceType) {
    const img = el.querySelector('.control-icon');
    const stateEl = el.querySelector('.control-state');
    const currentState = el.dataset.state;
    let newState;
    let newLabel;

    const icons = {
        light: { 
            on: 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-light-on.svg', 
            off: 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-light-off.svg' 
        },
        tv: { 
            on: 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-tv-on.svg', 
            off: 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-tv-off.svg' 
        },
        shader: { 
            on: 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-shader-on.svg', 
            off: 'https://cdn.jsdelivr.net/gh/Ph1l-T/My-Dashboard-Hubitat@main/images/icons/icon-small-shader-off.svg'
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

// Hubitat Maker API (cloud HTTPS)
const HUBITAT_CLOUD_BASE_URL = 'https://cloud.hubitat.com/api/ef4b8bb9-5b3f-43bc-aa4b-7af0c873ace3/apps/101/devices/';
const HUBITAT_ACCESS_TOKEN = '138422cd-a48d-41dc-8beb-cb0327e65c24';

// Helpers de URL para endpoints comuns da Maker API
function urlDeviceInfo(deviceId) {
    return `${HUBITAT_CLOUD_BASE_URL}${deviceId}?access_token=${HUBITAT_ACCESS_TOKEN}`;
}
function urlDeviceEvents(deviceId) {
    return `${HUBITAT_CLOUD_BASE_URL}${deviceId}/events?access_token=${HUBITAT_ACCESS_TOKEN}`;
}
function urlDeviceCommands(deviceId) {
    return `${HUBITAT_CLOUD_BASE_URL}${deviceId}/commands?access_token=${HUBITAT_ACCESS_TOKEN}`;
}
function urlDeviceCapabilities(deviceId) {
    return `${HUBITAT_CLOUD_BASE_URL}${deviceId}/capabilities?access_token=${HUBITAT_ACCESS_TOKEN}`;
}
function urlDeviceAttribute(deviceId, attribute) {
    return `${HUBITAT_CLOUD_BASE_URL}${deviceId}/attribute/${encodeURIComponent(attribute)}?access_token=${HUBITAT_ACCESS_TOKEN}`;
}
function urlSendCommand(deviceId, command, value) {
    let url = `${HUBITAT_CLOUD_BASE_URL}${deviceId}/${encodeURIComponent(command)}`;
    if (value !== undefined) url += `/${encodeURIComponent(value)}`;
    url += `?access_token=${HUBITAT_ACCESS_TOKEN}`;
    return url;
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
            const url = urlSendCommand(deviceId, command, value);
            console.log(`Enviando comando para o Hubitat (no-cors): ${url}`);
            try {
                return fetch(url, { mode: 'no-cors', cache: 'no-cache', credentials: 'omit' })
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
