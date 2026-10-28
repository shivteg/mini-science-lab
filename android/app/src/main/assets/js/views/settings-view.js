// Mini Science Lab - Settings & System State View Controller

class SettingsView {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    const settings = window.storageManager.getSettings();
    const profile = window.storageManager.getProfile();

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-home" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Settings</h2>
          <span class="header-step-pill">⚙️ System</span>
        </div>

        <!-- Settings Groups -->
        <div class="settings-group-card">
          <h4>🔊 Audio & Effects</h4>
          
          <div class="settings-row">
            <div class="settings-row-text">
              <strong>Sound Effects</strong>
              <span>Button clicks, chimes & success fanfare</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="toggle-sound" ${settings.sound ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="settings-row">
            <div class="settings-row-text">
              <strong>Laboratory Ambient Music</strong>
              <span>Soft gentle background science chimes</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="toggle-music" ${settings.music ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Display & Theme -->
        <div class="settings-group-card">
          <h4>🎨 Appearance & Text</h4>

          <div class="settings-row">
            <div class="settings-row-text">
              <strong>Theme Mode</strong>
              <span>Select color palette</span>
            </div>
            <div class="chip-group" id="theme-chips">
              <button class="chip-btn ${settings.theme === 'light' ? 'active' : ''}" data-theme="light">☀️ Light</button>
              <button class="chip-btn ${settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">🌙 Dark</button>
              <button class="chip-btn ${settings.theme === 'system' ? 'active' : ''}" data-theme="system">📱 Auto</button>
            </div>
          </div>

          <div class="settings-row">
            <div class="settings-row-text">
              <strong>Text Size</strong>
              <span>Child-readable font scaling</span>
            </div>
            <div class="chip-group" id="text-size-chips">
              <button class="chip-btn ${settings.textSize === 'small' ? 'active' : ''}" data-size="small">Small</button>
              <button class="chip-btn ${settings.textSize === 'medium' ? 'active' : ''}" data-size="medium">Medium</button>
              <button class="chip-btn ${settings.textSize === 'large' ? 'active' : ''}" data-size="large">Large</button>
            </div>
          </div>
        </div>

        <!-- Safety & System -->
        <div class="settings-group-card">
          <h4>🛡️ Safety & Information</h4>

          <div class="settings-menu-row" id="row-offline-info">
            <div class="settings-row-text">
              <strong>📶 Offline Mode Info</strong>
              <span>100% offline, zero internet needed</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <div class="settings-menu-row" id="row-parental-controls">
            <div class="settings-row-text">
              <strong>👨‍👩‍👧 Parental Controls</strong>
              <span>Child-proof settings lock</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <div class="settings-menu-row" id="row-privacy-policy">
            <div class="settings-row-text">
              <strong>🔒 Privacy & Data</strong>
              <span>Zero tracking, safe for kids</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <div class="settings-menu-row" id="row-help-about">
            <div class="settings-row-text">
              <strong>ℹ️ About Mini Science Lab</strong>
              <span>Version 2.2.0 & Credits</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="settings-group-card danger-zone">
          <h4>⚠️ Danger Zone</h4>
          <div class="settings-row">
            <div class="settings-row-text">
              <strong style="color:#ef4444;">Reset All Progress</strong>
              <span>Erase XP, badges, and start fresh</span>
            </div>
            <button class="btn-danger-sm" id="btn-reset-progress">Reset</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    const backBtn = container.querySelector('#btn-back-home');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('home');
    };

    const soundToggle = container.querySelector('#toggle-sound');
    if (soundToggle) {
      soundToggle.onchange = (e) => {
        window.soundEngine.setSoundEnabled(e.target.checked);
        window.storageManager.updateSettings({ sound: e.target.checked });
        if (e.target.checked) window.soundEngine.click();
      };
    }

    const musicToggle = container.querySelector('#toggle-music');
    if (musicToggle) {
      musicToggle.onchange = (e) => {
        window.soundEngine.setMusicEnabled(e.target.checked);
        window.storageManager.updateSettings({ music: e.target.checked });
      };
    }

    const themeChips = container.querySelectorAll('#theme-chips .chip-btn');
    themeChips.forEach(chip => {
      chip.onclick = () => {
        window.soundEngine.click();
        themeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const theme = chip.dataset.theme;
        window.storageManager.updateSettings({ theme });
        this.app.applyTheme(theme);
      };
    });

    const textSizeChips = container.querySelectorAll('#text-size-chips .chip-btn');
    textSizeChips.forEach(chip => {
      chip.onclick = () => {
        window.soundEngine.click();
        textSizeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const textSize = chip.dataset.size;
        window.storageManager.updateSettings({ textSize });
        this.app.applyTextSize(textSize);
      };
    });

    const bind = (id, fn) => {
      const el = container.querySelector(id);
      if (el) el.onclick = () => {
        window.soundEngine.click();
        fn();
      };
    };

    bind('#row-offline-info', () => this.showOfflineInfoModal());
    bind('#row-parental-controls', () => this.showParentalControlsModal());
    bind('#row-privacy-policy', () => this.showPrivacyModal());
    bind('#row-help-about', () => this.showAboutModal());
    bind('#btn-reset-progress', () => this.showResetConfirmModal());
  }

  showOfflineInfoModal() {
    const modal = document.createElement('div');
    modal.className = 'quiz-review-overlay';
    modal.innerHTML = `
      <div class="quiz-review-dialog">
        <div class="review-dialog-header">
          <h3>📶 100% Offline App</h3>
          <button class="btn-close-dialog" id="btn-close-offline">✖</button>
        </div>
        <div class="modal-body-pad">
          <div style="text-align:center; font-size:44px; margin-bottom:10px;">⚡</div>
          <p><strong>Mini Science Lab is an offline-first learning companion!</strong></p>
          <p>Every single experiment, interactive simulation, quiz question, mascot animation, sound synthesizer, and science fact is stored directly on your Android device.</p>
          <ul style="margin: 12px 0 16px 20px; line-height: 1.6;">
            <li>Zero internet connection required.</li>
            <li>No data usage or Wi-Fi needed on road trips or outdoors.</li>
            <li>All your badges, XP points, and science journal notes stay safe on your device.</li>
          </ul>
        </div>
        <button class="btn-primary-fun btn-block" id="btn-done-offline">Got It!</button>
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => { window.soundEngine.click(); document.body.removeChild(modal); };
    modal.querySelector('#btn-close-offline').onclick = close;
    modal.querySelector('#btn-done-offline').onclick = close;
  }

  showParentalControlsModal() {
    const n1 = Math.floor(Math.random() * 8) + 4;
    const n2 = Math.floor(Math.random() * 8) + 3;
    const expected = n1 + n2;

    const modal = document.createElement('div');
    modal.className = 'quiz-review-overlay';
    modal.innerHTML = `
      <div class="quiz-review-dialog">
        <div class="review-dialog-header">
          <h3>👨‍👩‍👧 Parental Gate</h3>
          <button class="btn-close-dialog" id="btn-close-parental">✖</button>
        </div>
        <div class="modal-body-pad">
          <p>Please answer the math problem to confirm you are an adult:</p>
          <div style="font-size: 22px; font-weight: bold; text-align: center; margin: 16px 0; color: #0284c7;">
            ${n1} + ${n2} = ?
          </div>
          <input type="number" id="input-parental-math" class="input-form" placeholder="Enter answer" style="text-align: center; font-size: 20px;" />
          <p class="section-hint" style="margin-top: 10px;">Parental gate protects settings and progress resets from accidental clicks.</p>
        </div>
        <button class="btn-primary-fun btn-block" id="btn-verify-parental">Unlock Controls</button>
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => { window.soundEngine.click(); document.body.removeChild(modal); };
    modal.querySelector('#btn-close-parental').onclick = close;

    modal.querySelector('#btn-verify-parental').onclick = () => {
      const val = parseInt(modal.querySelector('#input-parental-math').value, 10);
      if (val === expected) {
        window.soundEngine.correct();
        alert('Parental Controls Unlocked! Full administrative access granted.');
        close();
      } else {
        window.soundEngine.wrong();
        alert('Incorrect answer. Access locked.');
      }
    };
  }

  showPrivacyModal() {
    const modal = document.createElement('div');
    modal.className = 'quiz-review-overlay';
    modal.innerHTML = `
      <div class="quiz-review-dialog">
        <div class="review-dialog-header">
          <h3>🔒 Child Safety & Privacy</h3>
          <button class="btn-close-dialog" id="btn-close-privacy">✖</button>
        </div>
        <div class="modal-body-pad">
          <p><strong>Mini Science Lab is completely safe for children:</strong></p>
          <ul style="margin: 12px 0 16px 20px; line-height: 1.6;">
            <li>No personal data collection or tracking.</li>
            <li>No ads, pop-ups, or third-party analytic trackers.</li>
            <li>No social media, open chats, or external links.</li>
            <li>All profile information (name, avatar) remains strictly on your device storage.</li>
            <li>Safe, non-toxic, adult-supervised household science experiments only.</li>
          </ul>
        </div>
        <button class="btn-primary-fun btn-block" id="btn-done-privacy">Understood</button>
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => { window.soundEngine.click(); document.body.removeChild(modal); };
    modal.querySelector('#btn-close-privacy').onclick = close;
    modal.querySelector('#btn-done-privacy').onclick = close;
  }

  showAboutModal() {
    const modal = document.createElement('div');
    modal.className = 'quiz-review-overlay';
    modal.innerHTML = `
      <div class="quiz-review-dialog">
        <div class="review-dialog-header">
          <h3>About Mini Science Lab</h3>
          <button class="btn-close-dialog" id="btn-close-about">✖</button>
        </div>
        <div class="modal-body-pad" style="text-align: center;">
          <div style="margin: 10px 0;">
            ${window.RobotMascot.getSVG('happy', 70, false)}
          </div>
          <h4>Mini Science Lab</h4>
          <span class="meta-tag meta-difficulty easy" style="margin-bottom: 12px; display: inline-block;">v1.0.0 Offline Android Edition</span>
          <p>An interactive, playful STEM learning application inspiring curious young minds through hands-on science experiments, dynamic physics simulations, and rewarding quizzes.</p>
          <div style="margin-top: 14px; font-size: 13px; color: #64748b;">
            Built with ❤️ for young scientists everywhere.
          </div>
        </div>
        <button class="btn-primary-fun btn-block" id="btn-done-about">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => { window.soundEngine.click(); document.body.removeChild(modal); };
    modal.querySelector('#btn-close-about').onclick = close;
    modal.querySelector('#btn-done-about').onclick = close;
  }

  showResetConfirmModal() {
    const modal = document.createElement('div');
    modal.className = 'quiz-review-overlay';
    modal.innerHTML = `
      <div class="quiz-review-dialog">
        <div class="review-dialog-header">
          <h3>Reset All Progress?</h3>
          <button class="btn-close-dialog" id="btn-close-reset">✖</button>
        </div>
        <div class="modal-body-pad" style="text-align: center;">
          <div style="font-size: 40px; margin-bottom: 8px;">⚠️</div>
          <p><strong>Are you sure you want to reset all your progress?</strong></p>
          <p style="color: #64748b; font-size: 13px; margin-top: 6px;">
            This will reset your XP back to 0, lock all unlocked badges, clear your experiment history and delete personal journal notes. This cannot be undone!
          </p>
        </div>
        <div class="result-actions-grid">
          <button class="btn-secondary-fun" id="btn-cancel-reset">Cancel</button>
          <button class="btn-danger-sm" id="btn-confirm-reset" style="padding: 12px;">Yes, Reset Progress</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => { window.soundEngine.click(); document.body.removeChild(modal); };
    modal.querySelector('#btn-close-reset').onclick = close;
    modal.querySelector('#btn-cancel-reset').onclick = close;

    modal.querySelector('#btn-confirm-reset').onclick = () => {
      window.soundEngine.wrong();
      window.storageManager.resetAllProgress();
      document.body.removeChild(modal);
      alert('All progress has been reset.');
      this.app.navigate('home');
    };
  }
}

window.SettingsView = SettingsView;
