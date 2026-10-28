// Mini Science Lab - More Menu & Help/Support View Controller
// Matches visual references (Screen 34 & 36 in s1.jpeg / s2.jpeg / s3.jpeg)

class MoreView {
  constructor(app) {
    this.app = app;
  }

  // 1. More Menu Screen
  renderMoreMenu(container) {
    const profile = window.storageManager.getProfile();
    const stats = window.storageManager.state.stats;
    const completedExps = window.storageManager.state.completedExperiments.length;
    const unlockedBadges = window.storageManager.state.unlockedBadges.length;

    container.innerHTML = `
      <div class="page-content">
        <!-- Top Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-home" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>More Features</h2>
          <span class="header-step-pill">⭐ Lvl ${stats.level}</span>
        </div>

        <!-- Explorer Mini Banner -->
        <div class="more-user-strip">
          <div class="strip-avatar">${this.getAvatarEmoji(profile.avatarId)}</div>
          <div class="strip-info">
            <h4>${profile.name}</h4>
            <span>${window.storageManager.getLevelTitle(stats.level)} • ${stats.xp} Total XP</span>
          </div>
          <button class="btn-sm btn-subtle" id="btn-more-edit-profile">Edit ✏️</button>
        </div>

        <!-- More Menu Items List -->
        <div class="more-nav-list">
          <!-- 1. My Science Lab -->
          <div class="more-menu-item" id="more-item-mylab">
            <div class="more-item-icon bg-green">🧪</div>
            <div class="more-item-body">
              <strong>My Science Lab</strong>
              <span>Progress ring, completed activities & journal</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <!-- 2. Achievements -->
          <div class="more-menu-item" id="more-item-achievements">
            <div class="more-item-icon bg-amber">🏆</div>
            <div class="more-item-body">
              <strong>Achievements & Badges</strong>
              <span>${unlockedBadges} of 12 badges unlocked</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <!-- 3. Science Library -->
          <div class="more-menu-item" id="more-item-library">
            <div class="more-item-icon bg-blue">📚</div>
            <div class="more-item-body">
              <strong>Science Library</strong>
              <span>Fascinating facts, trivia & space guides</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <!-- 4. Settings -->
          <div class="more-menu-item" id="more-item-settings">
            <div class="more-item-icon bg-purple">⚙️</div>
            <div class="more-item-body">
              <strong>Settings & Preferences</strong>
              <span>Sound, music, theme & text sizing</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <!-- 5. Offline Mode Status -->
          <div class="more-menu-item" id="more-item-offline">
            <div class="more-item-icon bg-sky">📶</div>
            <div class="more-item-body">
              <strong>Offline Mode Info</strong>
              <span>100% offline, zero internet needed</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <!-- 6. Help & Support -->
          <div class="more-menu-item" id="more-item-help">
            <div class="more-item-icon bg-rose">❓</div>
            <div class="more-item-body">
              <strong>Help & Support</strong>
              <span>How to use, safety tips & FAQs</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <!-- 7. About Mini Science Lab -->
          <div class="more-menu-item" id="more-item-about">
            <div class="more-item-icon bg-teal">ℹ️</div>
            <div class="more-item-body">
              <strong>About Mini Science Lab</strong>
              <span>Version 2.2.0 & Child Safety</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <!-- 8. Exit App -->
          <div class="more-menu-item item-exit" id="more-item-exit">
            <div class="more-item-icon bg-red">🚪</div>
            <div class="more-item-body">
              <strong style="color:#ef4444;">Exit Application</strong>
              <span>Safe exit confirmation</span>
            </div>
            <span class="more-item-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>
        </div>
      </div>
    `;

    this.bindMoreEvents(container);
  }

  bindMoreEvents(container) {
    const bind = (id, fn) => {
      const el = container.querySelector(id);
      if (el) el.onclick = () => {
        window.soundEngine.click();
        fn();
      };
    };

    bind('#btn-back-home', () => this.app.navigate('home'));
    bind('#btn-more-edit-profile', () => this.app.navigate('profile_setup'));
    bind('#more-item-mylab', () => this.app.navigate('my_lab'));
    bind('#more-item-achievements', () => this.app.navigate('achievements'));
    bind('#more-item-library', () => this.app.navigate('library'));
    bind('#more-item-settings', () => this.app.navigate('settings'));
    bind('#more-item-offline', () => this.app.navigate('offline_screen'));
    bind('#more-item-help', () => this.app.navigate('help_support'));
    bind('#more-item-about', () => this.showAboutDialog());
    bind('#more-item-exit', () => this.showExitDialog());
  }

  // 2. Dedicated Help & Support Screen (Screen 24 in s3.jpeg / Screen 36 in s1.jpeg)
  renderHelpSupport(container) {
    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-more" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Help & Support</h2>
          <span class="header-step-pill">❓ Guide</span>
        </div>

        <!-- Mascot Tip Banner -->
        <div class="mascot-hero-card">
          <div class="mascot-svg-wrap">
            ${window.RobotMascot.getSVG('happy', 64, true)}
          </div>
          <div class="mascot-bubble">
            <h4>Need a hand, Explorer?</h4>
            <p>Everything you need to know about conducting safe experiments and having fun!</p>
          </div>
        </div>

        <!-- Accordion FAQ Sections -->
        <div class="help-accordion-list">
          <!-- 1. How to use the app -->
          <div class="accordion-card">
            <div class="accordion-header" data-acc="1">
              <span class="acc-icon">📱</span>
              <strong>How to Use Mini Science Lab?</strong>
              <span class="acc-toggle">▼</span>
            </div>
            <div class="accordion-body">
              <p>Explore science through 4 exciting interactive areas:</p>
              <ul>
                <li><strong>Experiments:</strong> Hands-on kitchen science projects with real household supplies. Complete the safety checklist first!</li>
                <li><strong>Simulations:</strong> Interactive virtual labs where you can build circuits, explore orbits, and test plant growth.</li>
                <li><strong>Quizzes:</strong> Test your knowledge and earn stars, XP points, and level-ups.</li>
                <li><strong>My Lab:</strong> Check your stats, completed activities, and write your own science notes in the journal!</li>
              </ul>
            </div>
          </div>

          <!-- 2. Safety Guidelines -->
          <div class="accordion-card">
            <div class="accordion-header" data-acc="2">
              <span class="acc-icon">🛡️</span>
              <strong>Important Safety Guidelines</strong>
              <span class="acc-toggle">▼</span>
            </div>
            <div class="accordion-body">
              <p>Science is fun when we stay safe! Always follow these rules:</p>
              <ul>
                <li>👨‍👧 Always ask an adult (parent or teacher) before starting an experiment.</li>
                <li>🚫 Never taste, eat, or drink any substances used in experiments.</li>
                <li>🧼 Wash your hands thoroughly with soap and water after every lab activity.</li>
                <li>🧽 Clean up spills immediately and keep your workspace tidy.</li>
              </ul>
            </div>
          </div>

          <!-- 3. Offline Mode -->
          <div class="accordion-card">
            <div class="accordion-header" data-acc="3">
              <span class="acc-icon">📶</span>
              <strong>Does it work without internet?</strong>
              <span class="acc-toggle">▼</span>
            </div>
            <div class="accordion-body">
              <p><strong>Yes, 100%!</strong> All experiments, simulations, quizzes, sound effects, and badges are bundled right into the app. Your progress, notes, and XP are stored safely on your device.</p>
            </div>
          </div>

          <!-- 4. XP and Leveling Up -->
          <div class="accordion-card">
            <div class="accordion-header" data-acc="4">
              <span class="acc-icon">⭐</span>
              <strong>How do I earn XP and Badges?</strong>
              <span class="acc-toggle">▼</span>
            </div>
            <div class="accordion-body">
              <p>You earn XP by:</p>
              <ul>
                <li>Conducting experiments (+50 XP each)</li>
                <li>Exploring interactive simulations (+30 XP each)</li>
                <li>Scoring high on science quizzes (+10 XP per question + bonuses!)</li>
                <li>Unlocking achievements (+50 to +150 XP bonus)</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Child Feedback & Rating -->
        <div class="child-feedback-card">
          <h4>How much do you love Mini Science Lab?</h4>
          <p>Tap a friendly face to share your reaction:</p>
          <div class="reaction-row">
            <button class="btn-reaction" data-react="love">😍 Love it!</button>
            <button class="btn-reaction" data-react="fun">😊 Super Fun!</button>
            <button class="btn-reaction" data-react="cool">🚀 Awesome!</button>
          </div>
          <div class="reaction-toast" id="reaction-toast" style="display:none;">
            ⭐ Thanks for being an awesome young scientist!
          </div>
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-more');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('more');
    };

    // Accordion click handlers
    const headers = container.querySelectorAll('.accordion-header');
    headers.forEach(h => {
      h.onclick = () => {
        window.soundEngine.blip();
        const card = h.parentElement;
        card.classList.toggle('open');
      };
    });

    // Reaction buttons
    const reactions = container.querySelectorAll('.btn-reaction');
    const toast = container.querySelector('#reaction-toast');
    reactions.forEach(r => {
      r.onclick = () => {
        window.soundEngine.fanfare();
        reactions.forEach(b => b.classList.remove('active'));
        r.classList.add('active');
        if (toast) {
          toast.style.display = 'block';
          setTimeout(() => { toast.style.display = 'none'; }, 3000);
        }
      };
    });
  }

  // 3. Dedicated Offline Screen (Screen 35 in s1.jpeg / s2.jpeg / s3.jpeg)
  renderOfflineScreen(container) {
    container.innerHTML = `
      <div class="page-content offline-screen-wrap">
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-from-offline" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Offline Status</h2>
          <span class="header-step-pill">📶 100% Offline</span>
        </div>

        <div class="offline-hero-card">
          <div class="offline-icon-pulse">📶</div>
          <div class="offline-mascot-row">
            ${window.RobotMascot.getSVG('happy', 95, true)}
          </div>
          <h2>You're Offline</h2>
          <p class="offline-primary-msg">No internet connection? No worries at all!</p>
          <p class="offline-secondary-msg">
            Mini Science Lab is built offline-first. You can still explore all experiments, interactive physics simulations, and quizzes without missing a beat!
          </p>

          <div class="offline-features-checklist">
            <div class="offline-check-item">
              <span>✅</span> All 10 Household Experiments available
            </div>
            <div class="offline-check-item">
              <span>✅</span> All 7 Interactive Simulations functional
            </div>
            <div class="offline-check-item">
              <span>✅</span> 6 Science Quizzes with instant scoring
            </div>
            <div class="offline-check-item">
              <span>✅</span> Sound Synthesizer works without downloads
            </div>
            <div class="offline-check-item">
              <span>✅</span> Progress and notes saved to local device
            </div>
          </div>

          <div class="offline-actions-row">
            <button class="btn-primary-fun btn-block" id="btn-continue-offline">
              Continue Offline 🚀
            </button>
            <button class="btn-subtle btn-block" id="btn-check-connection">
              Check Connection 🔄
            </button>
          </div>
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-from-offline');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('home');
    };

    const continueBtn = container.querySelector('#btn-continue-offline');
    if (continueBtn) continueBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('home');
    };

    const checkBtn = container.querySelector('#btn-check-connection');
    if (checkBtn) checkBtn.onclick = () => {
      window.soundEngine.blip();
      const isOnline = navigator.onLine;
      alert(isOnline ? '🌐 Connected to internet! (All features also remain offline-ready)' : '📶 Currently offline. Everything works smoothly on your device!');
    };
  }

  // 4. Dedicated Error State Screen (Screen 77 in s4.jpeg)
  renderErrorScreen(container) {
    container.innerHTML = `
      <div class="page-content offline-screen-wrap">
        <div class="offline-hero-card">
          <div class="offline-mascot-row">
            ${window.RobotMascot.getSVG('oops', 90, true)}
          </div>
          <h2 style="color:#ef4444;">Something Went Wrong!</h2>
          <p class="offline-secondary-msg">
            Our robot buddy hit a little bump in the laboratory, but don’t worry, your progress is safe!
          </p>
          <div class="offline-actions-row" style="margin-top:20px;">
            <button class="btn-primary-fun btn-block" id="btn-error-retry">
              Try Again 🔄
            </button>
            <button class="btn-subtle btn-block" id="btn-error-home">
              Go to Home Screen 🏠
            </button>
          </div>
        </div>
      </div>
    `;

    const retryBtn = container.querySelector('#btn-error-retry');
    if (retryBtn) retryBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('home');
    };

    const homeBtn = container.querySelector('#btn-error-home');
    if (homeBtn) homeBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('home');
    };
  }

  // Exit Modal Dialog (Screen 25 in s3.jpeg / Screen 76 in s4.jpeg)
  showExitDialog() {
    window.soundEngine.click();
    const modal = document.createElement('div');
    modal.className = 'quiz-review-overlay';
    modal.innerHTML = `
      <div class="badge-detail-dialog locked" style="max-width:340px; text-align:center;">
        <div class="exit-dialog-icon">🚪</div>
        <h3 style="margin-top:10px;">Exit App?</h3>
        <p style="color:#64748b; font-size:14px; margin:10px 0 20px;">
          Are you sure you want to exit Mini Science Lab? Your progress has been automatically saved!
        </p>
        <div class="exit-actions-row">
          <button class="btn-subtle" id="btn-cancel-exit" style="flex:1;">Cancel</button>
          <button class="btn-danger-sm" id="btn-confirm-exit" style="flex:1; padding:12px; font-size:15px;">Exit</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => {
      window.soundEngine.click();
      document.body.removeChild(modal);
    };

    modal.querySelector('#btn-cancel-exit').onclick = close;
    modal.querySelector('#btn-confirm-exit').onclick = () => {
      window.soundEngine.click();
      document.body.removeChild(modal);
      // Friendly good-bye toast or minimize
      alert('See you next time, young scientist! Keep exploring! 👋🚀');
    };
  }

  showAboutDialog() {
    window.soundEngine.click();
    const modal = document.createElement('div');
    modal.className = 'quiz-review-overlay';
    modal.innerHTML = `
      <div class="quiz-review-dialog">
        <div class="review-dialog-header">
          <h3>About Mini Science Lab</h3>
          <button class="btn-close-dialog" id="btn-close-about">✖</button>
        </div>
        <div class="review-questions-list">
          <div style="text-align:center; padding:15px 0;">
            ${window.RobotMascot.getSVG('happy', 75, true)}
            <h3 style="margin-top:10px; color:#0284c7;">Mini Science Lab</h3>
            <span class="meta-tag meta-done">Version 1.0.0 (Offline Edition)</span>
          </div>

          <div class="form-group-card">
            <h4>🎯 Our Mission</h4>
            <p style="font-size:13.5px; line-height:1.5; color:#475569;">
              Mini Science Lab empowers kids aged 6–14 to discover the wonder of physics, chemistry, biology, space, and earth science through safe household experiments and interactive simulations.
            </p>
          </div>

          <div class="form-group-card">
            <h4>🔒 Child Safety & Privacy Commitment</h4>
            <p style="font-size:13.5px; line-height:1.5; color:#475569;">
              ✅ 100% Offline by default<br/>
              ✅ Zero tracking, analytics, or behavioral cookies<br/>
              ✅ No public chat or third-party advertising<br/>
              ✅ COPPA & GDPR-K compliant child-first design
            </p>
          </div>

          <div class="form-group-card">
            <h4>🌟 Credits</h4>
            <p style="font-size:13px; color:#64748b;">
              Designed and developed with love for curious children everywhere.
            </p>
          </div>
        </div>
        <button class="btn-primary-fun btn-block" id="btn-dismiss-about">Awesome!</button>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => {
      window.soundEngine.click();
      document.body.removeChild(modal);
    };

    modal.querySelector('#btn-close-about').onclick = close;
    modal.querySelector('#btn-dismiss-about').onclick = close;
  }

  getAvatarEmoji(avatarId) {
    const avatarIcons = {
      avatar_explorer_boy: '👦',
      avatar_scientist_girl: '👧',
      avatar_curious_boy: '🧒',
      avatar_braids_girl: '👩',
      avatar_astro_kid: '👨‍🚀',
      avatar_robot_mascot: '🤖',
      avatar_chemist_kid: '🧑‍🔬',
      avatar_nature_kid: '🤠'
    };
    return avatarIcons[avatarId] || '👦';
  }
}

window.MoreView = MoreView;
