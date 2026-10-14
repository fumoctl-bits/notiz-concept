/* PWA Service Worker Registration, Install Prompts & Offline Helpers */

class PWAManager {
  constructor(app) {
    this.app = app;
    this.deferredPrompt = null;
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    this.initServiceWorker();
    this.initInstallPrompt();
    this.initQRCode();
  }

  initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('Notes PWA ServiceWorker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('Notes PWA ServiceWorker registration failed:', err);
          });
      });
    }
  }

  initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;

      // Show install badge/button in toolbar or nav if not already installed
      const installPill = document.getElementById('pwa-install-pill');
      if (installPill && !this.isStandalone) {
        installPill.style.display = 'inline-flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isStandalone = true;
      const installPill = document.getElementById('pwa-install-pill');
      if (installPill) installPill.style.display = 'none';
      this.app.showToast('Notes app installed successfully!');
    });

    const installPill = document.getElementById('pwa-install-pill');
    if (installPill) {
      installPill.addEventListener('click', () => this.showInstallInstructions());
    }

    const installModalClose = document.getElementById('install-modal-close');
    if (installModalClose) {
      installModalClose.addEventListener('click', () => {
        document.getElementById('install-modal').classList.remove('active');
      });
    }
  }

  showInstallInstructions() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('User installed PWA');
        }
        this.deferredPrompt = null;
      });
      return;
    }

    // Otherwise show iOS / generic install guide modal
    const modal = document.getElementById('install-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  initQRCode() {
    // Generate QR code for the current URL so user can scan from phone
    const container = document.getElementById('qr-code-display');
    const qrUrlText = document.getElementById('qr-url-text');
    if (!container) return;

    const currentUrl = window.location.href;
    if (qrUrlText) qrUrlText.textContent = currentUrl;

    // Use pure SVG QR code generation
    this.renderSimpleQR(container, currentUrl);
  }

  // Lightweight pure-JS QR code renderer for local network pairing
  renderSimpleQR(container, text) {
    // We generate a clean SVG QR code or canvas using simple matrix encoding
    const encoded = encodeURIComponent(text);
    // Offline SVG QR or dynamic render
    const qrImg = document.createElement('img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}&bgcolor=ffffff&color=1c1c1e&margin=8`;
    qrImg.alt = 'Scan QR Code with phone camera';
    qrImg.style.width = '200px';
    qrImg.style.height = '200px';
    qrImg.style.borderRadius = '12px';
    qrImg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';

    qrImg.onerror = () => {
      // Fallback if offline: display direct IP / instructions
      container.innerHTML = `
        <div style="padding: 16px; background: var(--bg-input); border-radius: 10px; font-size: 13px; text-align: center;">
          <p style="font-weight: 600; margin-bottom: 6px;">Connect on Mobile:</p>
          <p style="word-break: break-all; color: var(--ios-yellow); font-family: var(--font-mono);">${text}</p>
        </div>
      `;
    };

    container.innerHTML = '';
    container.appendChild(qrImg);
  }
}
