# App Info Menu Snippets

## HTML

### Logo trigger in the fixed header
```html
<button class="app-logo-trigger" type="button" aria-label="Abrir informacoes do aplicativo">
    <img src="images/icons/Vila-Estampa.svg" alt="Vila Estampa" />
</button>
```

### Popup markup (place alongside the other overlays)
```html
<!-- App Info Popup -->
<div class="app-info-overlay" id="app-info-overlay" aria-hidden="true">
    <div class="app-info-dialog" role="dialog" aria-labelledby="app-info-title" aria-modal="true">
        <button class="app-info-close" type="button" aria-label="Fechar menu de informacoes">&times;</button>
        <div class="app-info-header">
            <img class="app-info-logo" src="images/pwa/app-icon-512.png" alt="Logo do aplicativo">
            <div class="app-info-heading">
                <h2 class="app-info-title" id="app-info-title">Dashboard Eletrize</h2>
                <p class="app-info-subtitle">Controle integrado para a Vila Estampa</p>
            </div>
        </div>
        <div class="app-info-content">
            <ul class="app-info-list">
                <li>Monitoramento rapido dos ambientes</li>
                <li>Acesso a cenarios e controles favoritos</li>
                <li>Sincronizacao com dispositivos inteligentes</li>
            </ul>
        </div>
        <div class="app-info-footer">
            <span class="app-info-version" id="app-info-version"></span>
        </div>
    </div>
</div>
```

## CSS
```css
/* App info menu */
.app-logo-trigger {
    background: transparent;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.app-logo-trigger:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.55);
    outline-offset: 6px;
}

.app-info-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    background: rgba(5, 5, 5, 0.65);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
    z-index: 1200;
}

.app-info-overlay.is-visible {
    opacity: 1;
    pointer-events: auto;
}

.app-info-dialog {
    width: min(420px, 92vw);
    background: rgba(12, 12, 12, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
    color: #fff;
    padding: 32px 28px;
    position: relative;
    overflow: hidden;
}

.app-info-close {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 36px;
    height: 36px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 20px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
}

.app-info-close:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: scale(1.05);
}

.app-info-close:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 3px;
}

.app-info-header {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 24px;
}

.app-info-logo {
    width: 72px;
    height: 72px;
    border-radius: 18px;
    flex-shrink: 0;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

.app-info-heading {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.app-info-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0;
}

.app-info-subtitle {
    margin: 0;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.75);
}

.app-info-content {
    margin-bottom: 24px;
}

.app-info-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 12px;
}

.app-info-list li {
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.95rem;
}

.app-info-footer {
    text-align: center;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
}

body.app-info-open {
    overflow: hidden;
}
```

## JavaScript
```js
const APP_INFO_VERSION = '1.0';
const APP_INFO_VISIBLE_CLASS = 'is-visible';
const appInfoOverlay = document.getElementById('app-info-overlay');
const appInfoVersionLabel = document.getElementById('app-info-version');
let appInfoReturnFocusElement = null;

function updateAppInfoVersion() {
    if (appInfoVersionLabel) {
        appInfoVersionLabel.textContent = 'Versao ' + APP_INFO_VERSION;
    }
}

function openAppInfoMenu() {
    if (!appInfoOverlay) return;
    appInfoReturnFocusElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    appInfoOverlay.classList.add(APP_INFO_VISIBLE_CLASS);
    appInfoOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('app-info-open');
    const dialog = appInfoOverlay.querySelector('.app-info-dialog');
    if (dialog && typeof dialog.focus === 'function') {
        dialog.setAttribute('tabindex', '-1');
        try {
            dialog.focus({ preventScroll: true });
        } catch (err) {
            dialog.focus();
        }
    }
}

function closeAppInfoMenu() {
    if (!appInfoOverlay) return;
    appInfoOverlay.classList.remove(APP_INFO_VISIBLE_CLASS);
    appInfoOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('app-info-open');
    if (appInfoReturnFocusElement && typeof appInfoReturnFocusElement.focus === 'function') {
        appInfoReturnFocusElement.focus();
    }
}

function handleAppLogoTrigger(event) {
    event.preventDefault();
    openAppInfoMenu();
}

function setupAppInfoMenu() {
    document.querySelectorAll('.app-logo-trigger').forEach(trigger => {
        trigger.removeEventListener('click', handleAppLogoTrigger);
        trigger.addEventListener('click', handleAppLogoTrigger);
    });
}

function initializeAppInfoMenu() {
    if (!appInfoOverlay) return;
    if (appInfoOverlay.dataset.ready === 'true') return;
    appInfoOverlay.dataset.ready = 'true';
    updateAppInfoVersion();

    appInfoOverlay.addEventListener('click', event => {
        if (event.target === appInfoOverlay) {
            closeAppInfoMenu();
        }
    });

    const closeBtn = appInfoOverlay.querySelector('.app-info-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAppInfoMenu);
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && appInfoOverlay.classList.contains(APP_INFO_VISIBLE_CLASS)) {
            closeAppInfoMenu();
        }
    });
}
```

## SPA wiring
```js
// After rendering a page
spaRoot.innerHTML = pages[page]();
setupAppInfoMenu();

// During startup
window.addEventListener('DOMContentLoaded', () => {
    initializeAppInfoMenu();
    renderSpa();
    // ...
});
```
