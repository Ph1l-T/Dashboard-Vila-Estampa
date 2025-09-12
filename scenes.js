// IDs atualizados para cobrir todas as luzes dos ambientes
const ALL_LIGHT_IDS = [
  '231','232','233','234','235', // Escritório
  '236','237',                   // Projetos
  '238','239','240',             // Programação
  '241','242','243','244',       // Sinuca
  '245','246',                   // Piscina
  '248','249','250',             // Eletrize Solar
  '251','252',                   // Gourmet
  '253',                         // Home
  '254','255','256','257','258', // Funcionários
  '259','260',                   // Cinema
  '261','262','263'              // Recepção
];
const ALL_CURTAIN_IDS = ['38', '39', '40', '42', '43'];
let masterConfirmCallback = null;

function showPopup(message, onConfirm) {
    const popup = document.getElementById('confirmation-popup');
    const messageEl = document.getElementById('popup-message');
    const confirmBtn = document.getElementById('popup-confirm');
    const cancelBtn = document.getElementById('popup-cancel');
    const overlay = popup;

    messageEl.textContent = message;
    masterConfirmCallback = onConfirm;

    popup.style.display = 'flex';

    confirmBtn.onclick = () => {
        if (typeof masterConfirmCallback === 'function') {
            masterConfirmCallback();
        }
    };
    cancelBtn.onclick = hidePopup;
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            hidePopup();
        }
    };
}

function hidePopup() {
    const popup = document.getElementById('confirmation-popup');
    popup.style.display = 'none';
    const confirmBtn = document.getElementById('popup-confirm');
    confirmBtn.onclick = null;
    masterConfirmCallback = null;
}

function updateMasterLightToggleState() {
    const btn = document.getElementById('master-light-toggle-btn');
    if (!btn) return;

    const icon = document.getElementById('master-light-toggle-icon');
    const label = document.getElementById('master-light-toggle-label');

    const areAnyLightsOn = ALL_LIGHT_IDS.some(id => (getStoredState(id) || 'off') === 'on');

    if (areAnyLightsOn) {
        btn.dataset.action = 'off';
        label.textContent = 'Desligar Tudo';
        icon.src = 'images/icons/icon-small-light-on.svg';
    } else {
        btn.dataset.action = 'on';
        label.textContent = 'Ligar Tudo';
        icon.src = 'images/icons/icon-small-light-off.svg';
    }
}

function handleMasterLightToggle() {
    const btn = document.getElementById('master-light-toggle-btn');
    const action = btn.dataset.action;

    const message = action === 'on'
        ? 'Você tem certeza que gostaria de ligar tudo?'
        : 'Você tem certeza que gostaria de desligar tudo?';

    showPopup(message, () => executeMasterLightToggle(action));
}

function executeMasterLightToggle(action) {
    const promises = ALL_LIGHT_IDS.map(id => {
        return sendHubitatCommand(id, action).then(() => {
            setStoredState(id, action);
        });
    });

    Promise.all(promises).then(() => {
        console.log(`Master light toggle ${action} complete.`);
        updateMasterLightToggleState();
        hidePopup();
    }).catch(err => {
        console.error(`Master light toggle ${action} failed:`, err);
        hidePopup();
    });
}

function handleMasterCurtainToggle(action) {
    const message = action === 'open'
        ? 'Você tem certeza que gostaria de subir todas as cortinas?'
        : 'Você tem certeza que gostaria de descer todas as cortinas?';

    showPopup(message, () => executeMasterCurtainToggle(action));
}

function executeMasterCurtainToggle(action) {
    const promises = ALL_CURTAIN_IDS.map(id => sendCurtainCommand(id, action));

    Promise.all(promises).then(() => {
        console.log(`Master curtain toggle ${action} complete.`);
        hidePopup();
    }).catch(err => {
        console.error(`Master curtain toggle ${action} failed:`, err);
        hidePopup();
    });
}

function initScenesPage() {
    updateMasterLightToggleState();
}

