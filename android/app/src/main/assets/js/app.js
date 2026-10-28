// Mini Science Lab - Main App Controller, Navigation Router & State Manager

// Common SVG Icon Snippets
window.BACK_ICON_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
window.CHEVRON_RIGHT_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

class MiniScienceApp {
  constructor() {
    this.currentScreen = 'splash';
    this.selectedExperimentId = 'magnet_magic';
    this.selectedFactId = 'fact_sun';
    this.selectedSimulationId = 'circuit';
    this.activeSimInstance = null;

    // View controllers
    this.homeView = new window.HomeView(this);
    this.experimentsView = new window.ExperimentsView(this);
    this.quizView = new window.QuizView(this);
    this.myLabView = new window.MyLabView(this);
    this.achievementsView = new window.AchievementsView(this);
    this.libraryView = new window.LibraryView(this);
    this.settingsView = new window.SettingsView(this);
    this.moreView = new window.MoreView(this);

    // Containers
    this.mainContainer = document.getElementById('main-screen-container');
    this.bottomNav = document.getElementById('bottom-nav-bar');

    this.init();
  }

  init() {
    // Apply saved preferences
    const settings = window.storageManager.getSettings();
    this.applyTheme(settings.theme || 'light');
    this.applyTextSize(settings.textSize || 'medium');
    window.soundEngine.setSoundEnabled(settings.sound !== false);
    window.soundEngine.setMusicEnabled(settings.music === true);

    // Bind bottom navigation tabs
    this.bindBottomNav();

    // App operates 100% offline seamlessly
    this.bindNetworkListener();

    // Register Service Worker for offline PWA
    this.registerServiceWorker();

    // Route to initial screen
    const profile = window.storageManager.getProfile();
    if (!profile.hasCompletedOnboarding) {
      this.navigate('splash');
      // Auto advance from splash to welcome after 2.2 seconds
      setTimeout(() => {
        if (this.currentScreen === 'splash') {
          this.navigate('welcome');
        }
      }, 2200);
    } else {
      this.navigate('home');
    }
  }

  bindNetworkListener() {
    // Native offline app: gracefully handle network events silently with zero intrusive popups
    const updateOnlineStatus = () => {
      console.log('Network state updated. App is 100% offline capable.');
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
          console.log('Mini Science Lab Service Worker registered:', reg.scope);
        }).catch((err) => {
          console.log('Service Worker registration skipped/failed:', err);
        });
      });
    }
  }

  applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    if (theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.add('theme-light');
    }
  }

  applyTextSize(size) {
    document.body.classList.remove('text-small', 'text-medium', 'text-large');
    document.body.classList.add(`text-${size}`);
  }

  bindBottomNav() {
    const navItems = this.bottomNav.querySelectorAll('.nav-tab-item');
    navItems.forEach(item => {
      item.onclick = () => {
        window.soundEngine.click();
        const target = item.dataset.nav;
        this.navigate(target);
      };
    });
  }

  updateBottomNavVisibility(screen) {
    const screensWithNav = [
      'home', 'experiments', 'simulations', 'quizzes', 'more',
      'my_lab', 'my_progress', 'completed_activities', 'quiz_history',
      'science_journal', 'saved_activities', 'achievements', 'library', 'settings', 'help_support'
    ];
    if (screensWithNav.includes(screen)) {
      this.bottomNav.style.display = 'flex';
      const navItems = this.bottomNav.querySelectorAll('.nav-tab-item');
      navItems.forEach(item => {
        // Highlight active tab
        const navKey = item.dataset.nav;
        if (navKey === screen) {
          item.classList.add('active');
        } else if (navKey === 'more' && ['my_lab', 'my_progress', 'completed_activities', 'quiz_history', 'science_journal', 'saved_activities', 'achievements', 'library', 'settings', 'help_support', 'more'].includes(screen)) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    } else {
      this.bottomNav.style.display = 'none';
    }
  }

  navigate(screenName) {
    if (this.activeSimInstance && typeof this.activeSimInstance.destroy === 'function') {
      this.activeSimInstance.destroy();
      this.activeSimInstance = null;
    }

    this.currentScreen = screenName;
    this.updateBottomNavVisibility(screenName);
    window.scrollTo(0, 0);

    switch (screenName) {
      case 'splash':
        this.renderSplashScreen();
        break;
      case 'welcome':
        this.renderWelcomeScreen();
        break;
      case 'profile_setup':
        this.renderProfileSetupScreen();
        break;
      case 'avatar_selection':
        this.renderAvatarSelectionScreen();
        break;
      case 'home':
        this.homeView.render(this.mainContainer);
        break;

      // Experiments
      case 'experiments':
        this.experimentsView.renderCatalogue(this.mainContainer);
        break;
      case 'experiment_detail':
        this.experimentsView.renderDetail(this.mainContainer);
        break;
      case 'experiment_materials':
        this.experimentsView.renderMaterials(this.mainContainer);
        break;
      case 'experiment_safety':
        this.experimentsView.renderSafety(this.mainContainer);
        break;
      case 'experiment_steps':
        this.experimentsView.renderSteps(this.mainContainer);
        break;
      case 'experiment_result':
        this.experimentsView.renderResult(this.mainContainer);
        break;

      // Simulations
      case 'simulations':
        this.renderSimulationsMenu();
        break;
      case 'sim_circuit':
        this.renderSimulationHolder('circuit');
        break;
      case 'sim_solar':
        this.renderSimulationHolder('solar');
        break;
      case 'sim_water_cycle':
        this.renderSimulationHolder('water_cycle');
        break;
      case 'sim_states_matter':
      case 'sim_states_of_matter':
        this.renderSimulationHolder('states_matter');
        break;
      case 'sim_magnets':
        this.renderSimulationHolder('magnets');
        break;
      case 'sim_human_body':
        this.renderSimulationHolder('human_body');
        break;
      case 'sim_plant_growth':
        this.renderSimulationHolder('plant_growth');
        break;

      // Quizzes
      case 'quizzes':
        this.quizView.renderCatalogue(this.mainContainer);
        break;
      case 'quiz_question':
        this.quizView.renderQuestion(this.mainContainer);
        break;
      case 'quiz_result':
        this.quizView.renderResult(this.mainContainer);
        break;

      // My Lab Screens
      case 'my_lab':
        this.myLabView.render(this.mainContainer);
        break;
      case 'my_progress':
        this.myLabView.renderProgressScreen(this.mainContainer);
        break;
      case 'completed_activities':
        this.myLabView.renderCompletedActivitiesScreen(this.mainContainer);
        break;
      case 'quiz_history':
        this.myLabView.renderQuizHistoryScreen(this.mainContainer);
        break;
      case 'science_journal':
        this.myLabView.renderJournalScreen(this.mainContainer);
        break;
      case 'saved_activities':
        this.myLabView.renderFavoritesScreen(this.mainContainer);
        break;

      // Achievements
      case 'achievements':
        this.achievementsView.render(this.mainContainer);
        break;

      // Science Library
      case 'library':
        this.libraryView.renderCatalogue(this.mainContainer);
        break;
      case 'fact_detail':
        this.libraryView.renderDetail(this.mainContainer);
        break;

      // More & Support
      case 'more':
        this.moreView.renderMoreMenu(this.mainContainer);
        break;
      case 'help_support':
        this.moreView.renderHelpSupport(this.mainContainer);
        break;
      case 'offline_screen':
        this.moreView.renderOfflineScreen(this.mainContainer);
        break;
      case 'error_screen':
        this.moreView.renderErrorScreen(this.mainContainer);
        break;

      // Settings
      case 'settings':
        this.settingsView.render(this.mainContainer);
        break;

      default:
        this.homeView.render(this.mainContainer);
        break;
    }
  }

  // Splash Screen
  renderSplashScreen() {
    this.mainContainer.innerHTML = `
      <div class="splash-screen-wrap">
        <div class="splash-content">
          <div class="splash-mascot-box">
            ${window.RobotMascot.getSVG('excited', 130, true)}
          </div>
          <h1 class="splash-app-title">Mini<br/><span>Science Lab</span></h1>
          <p class="splash-tagline">Explore • Experiment • Learn • Grow!</p>
          <div class="splash-loading-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    `;

    this.mainContainer.querySelector('.splash-screen-wrap').onclick = () => {
      this.navigate('welcome');
    };
  }

  // Welcome Screen
  renderWelcomeScreen() {
    this.mainContainer.innerHTML = `
      <div class="page-content welcome-screen-wrap">
        <div class="welcome-mascot-row">
          ${window.RobotMascot.getSVG('waving', 110, true)}
        </div>
        <h2 class="welcome-heading">Welcome to<br/>Mini Science Lab!</h2>
        <p class="welcome-sub">Make science fun with experiments, interactive simulations, and exciting quizzes!</p>

        <div class="welcome-cards-list">
          <div class="welcome-bullet-card">
            <span class="bullet-icon">🔬</span>
            <div class="bullet-text">
              <strong>Fun Experiments</strong>
              <p>Safe hands-on projects with everyday household items</p>
            </div>
          </div>

          <div class="welcome-bullet-card">
            <span class="bullet-icon">⚡</span>
            <div class="bullet-text">
              <strong>Interactive Simulations</strong>
              <p>Build working circuits, explore outer space & grow botanical plants</p>
            </div>
          </div>

          <div class="welcome-bullet-card">
            <span class="bullet-icon">🧠</span>
            <div class="bullet-text">
              <strong>Exciting Quizzes</strong>
              <p>Test your knowledge, unlock awesome badges & earn XP rewards</p>
            </div>
          </div>
        </div>

        <div class="welcome-actions">
          <button class="btn-primary-fun btn-block" id="btn-welcome-get-started">Get Started 🚀</button>
          <button class="btn-subtle btn-block" id="btn-welcome-existing">I already have a profile</button>
        </div>
      </div>
    `;

    const getStartedBtn = this.mainContainer.querySelector('#btn-welcome-get-started');
    if (getStartedBtn) getStartedBtn.onclick = () => {
      window.soundEngine.click();
      this.navigate('profile_setup');
    };

    const existingBtn = this.mainContainer.querySelector('#btn-welcome-existing');
    if (existingBtn) existingBtn.onclick = () => {
      window.soundEngine.click();
      this.navigate('home');
    };
  }

  // Profile Setup Screen
  renderProfileSetupScreen() {
    const profile = window.storageManager.getProfile();

    this.mainContainer.innerHTML = `
      <div class="page-content">
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-welcome" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Create Your Profile</h2>
          <span class="header-step-pill">1 / 2</span>
        </div>

        <div class="profile-hero-avatar-box">
          <div class="profile-avatar-large" id="avatar-preview-circle">👦</div>
          <span class="avatar-tap-hint">Your Scientist ID</span>
        </div>

        <div class="form-group-card">
          <label class="form-label">What is your Explorer Name?</label>
          <input type="text" class="input-form" id="input-profile-name" value="${profile.name || 'Science Explorer'}" placeholder="Enter your name" maxlength="20" />
        </div>

        <div class="form-group-card">
          <label class="form-label">Choose your age group:</label>
          <div class="chip-group-vertical" id="age-chips">
            <button class="chip-btn-wide ${profile.ageGroup === '6-8' ? 'active' : ''}" data-age="6-8">
              <strong>6 – 8 Years</strong> (Grades 1 – 3)
            </button>
            <button class="chip-btn-wide ${profile.ageGroup === '9-11' ? 'active' : ''}" data-age="9-11">
              <strong>9 – 11 Years</strong> (Grades 4 – 6)
            </button>
            <button class="chip-btn-wide ${profile.ageGroup === '12-14' ? 'active' : ''}" data-age="12-14">
              <strong>12 – 14 Years</strong> (Grades 7 – 9)
            </button>
          </div>
        </div>

        <div class="floating-bottom-bar">
          <button class="btn-primary-fun btn-block" id="btn-profile-next">
            Next: Choose Avatar 🎨
          </button>
        </div>
      </div>
    `;

    const backBtn = this.mainContainer.querySelector('#btn-back-welcome');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.navigate('welcome');
    };

    let selectedAge = profile.ageGroup || '9-11';
    const ageChips = this.mainContainer.querySelectorAll('#age-chips .chip-btn-wide');
    ageChips.forEach(chip => {
      chip.onclick = () => {
        window.soundEngine.click();
        ageChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedAge = chip.dataset.age;
      };
    });

    const nextBtn = this.mainContainer.querySelector('#btn-profile-next');
    if (nextBtn) nextBtn.onclick = () => {
      const nameInput = this.mainContainer.querySelector('#input-profile-name');
      const name = nameInput.value.trim() || 'Science Explorer';
      window.storageManager.updateProfile({ name, ageGroup: selectedAge });
      window.soundEngine.click();
      this.navigate('avatar_selection');
    };
  }

  // Avatar Selection Screen
  renderAvatarSelectionScreen() {
    const profile = window.storageManager.getProfile();
    let currentAvatarId = profile.avatarId || 'avatar_explorer_boy';

    const avatars = [
      { id: 'avatar_explorer_boy', icon: '👦', name: 'Curious Boy' },
      { id: 'avatar_scientist_girl', icon: '👧', name: 'Girl Scientist' },
      { id: 'avatar_curious_boy', icon: '🧒', name: 'Astro Junior' },
      { id: 'avatar_braids_girl', icon: '👩', name: 'Brave Explorer' },
      { id: 'avatar_astro_kid', icon: '👨‍🚀', name: 'Cosmic Kid' },
      { id: 'avatar_robot_mascot', icon: '🤖', name: 'Robot Buddy' },
      { id: 'avatar_chemist_kid', icon: '🧑‍🔬', name: 'Chemist' },
      { id: 'avatar_nature_kid', icon: '🤠', name: 'Field Guide' }
    ];

    this.mainContainer.innerHTML = `
      <div class="page-content">
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-profile-setup" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Choose Your Avatar</h2>
          <span class="header-step-pill">2 / 2</span>
        </div>

        <div class="screen-instructions-box">
          <p>Pick your favorite science avatar to represent you on your dashboard and achievements!</p>
        </div>

        <div class="avatars-grid-wrap">
          ${avatars.map(av => `
            <div class="avatar-card-picker ${av.id === currentAvatarId ? 'selected' : ''}" data-avatar-id="${av.id}">
              <div class="avatar-emoji-circle">${av.icon}</div>
              <span class="avatar-picker-name">${av.name}</span>
              <div class="avatar-check-badge">${av.id === currentAvatarId ? '✓' : ''}</div>
            </div>
          `).join('')}
        </div>

        <div class="floating-bottom-bar">
          <button class="btn-primary-fun btn-block" id="btn-finish-onboarding">
            Start Exploring! 🚀
          </button>
        </div>
      </div>
    `;

    const backBtn = this.mainContainer.querySelector('#btn-back-profile-setup');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.navigate('profile_setup');
    };

    const cards = this.mainContainer.querySelectorAll('.avatar-card-picker');
    cards.forEach(card => {
      card.onclick = () => {
        window.soundEngine.blip();
        cards.forEach(c => {
          c.classList.remove('selected');
          c.querySelector('.avatar-check-badge').textContent = '';
        });
        card.classList.add('selected');
        card.querySelector('.avatar-check-badge').textContent = '✓';
        currentAvatarId = card.dataset.avatarId;
      };
    });

    const finishBtn = this.mainContainer.querySelector('#btn-finish-onboarding');
    if (finishBtn) finishBtn.onclick = () => {
      window.soundEngine.badgeUnlock();
      window.storageManager.updateProfile({
        avatarId: currentAvatarId,
        hasCompletedOnboarding: true
      });
      window.storageManager.addXP(50, 'Onboarding');
      this.navigate('home');
      setTimeout(() => {
        this.showNewBadgeModal('first_steps');
      }, 600);
    };
  }

  // Simulations Menu (7 Interactive Labs)
  renderSimulationsMenu() {
    const completedSims = window.storageManager.state.completedSimulations;

    const sims = [
      { id: 'sim_circuit', icon: '⚡', title: 'Build a Circuit', category: 'Electricity', desc: 'Connect wires, battery & switch to light the bulb with moving electrons!', color: '#fbbf24', simKey: 'circuit' },
      { id: 'sim_solar', icon: '🪐', title: 'Solar System Explorer', category: 'Astronomy', desc: 'Watch orbiting planets around the Sun, control speed & tap to inspect cosmic facts!', color: '#38bdf8', simKey: 'solar' },
      { id: 'sim_water_cycle', icon: '🌧️', title: 'The Water Cycle', category: 'Earth Science', desc: 'Follow evaporation, cloud condensation, rain precipitation & ocean collection!', color: '#60a5fa', simKey: 'water_cycle' },
      { id: 'sim_states_matter', icon: '🧊', title: 'States of Matter', category: 'Physics / Chemistry', desc: 'Heat and cool particles: see ice freeze, water flow, and steam boil!', color: '#a855f7', simKey: 'states_of_matter' },
      { id: 'sim_magnets', icon: '🧲', title: 'Magnet Lab', category: 'Physics', desc: 'Interact with magnetic field lines, attract iron paperclips & test materials!', color: '#f43f5e', simKey: 'magnets' },
      { id: 'sim_human_body', icon: '🫀', title: 'Human Body Explorer', category: 'Biology', desc: 'Interactive organs: brain, lungs, beating heart pulse, stomach & digestion!', color: '#10b981', simKey: 'human_body' },
      { id: 'sim_plant_growth', icon: '🌱', title: 'Plant Growth & Botany', category: 'Biology & Botany', desc: 'Plant a seed, control sunlight and water, watch roots grow, flowers bloom & fruit harvest!', color: '#22c55e', simKey: 'plant_growth' }
    ];

    this.mainContainer.innerHTML = `
      <div class="page-content">
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-home" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Simulations</h2>
          <span class="header-step-pill">⚡ 7 Labs</span>
        </div>

        <div class="simulations-hero-banner">
          <div class="sim-hero-mascot">
            ${window.RobotMascot.getSVG('happy', 70, false)}
          </div>
          <div class="sim-hero-text">
            <h4>Hands-on Virtual Science Labs</h4>
            <p>Every simulation responds to your taps, switches, and sliders!</p>
          </div>
        </div>

        <div class="simulations-list-grid">
          ${sims.map(sim => {
            const isDone = completedSims.includes(sim.simKey);
            return `
              <div class="sim-menu-card" data-sim-target="${sim.id}">
                <div class="sim-card-icon" style="background:${sim.color}20; border-color:${sim.color};">
                  ${sim.icon}
                </div>
                <div class="sim-card-body">
                  <div class="sim-card-meta-row">
                    <span class="sim-card-cat">${sim.category}</span>
                    ${isDone ? `<span class="meta-tag meta-done">✅ Explored</span>` : `<span class="meta-tag meta-xp">⭐ +30 XP</span>`}
                  </div>
                  <h4 class="sim-card-title">${sim.title}</h4>
                  <p class="sim-card-desc">${sim.desc}</p>
                </div>
                <div class="sim-card-action-circle">
                  ${window.CHEVRON_RIGHT_SVG}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const backBtn = this.mainContainer.querySelector('#btn-back-home');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.navigate('home');
    };

    const cards = this.mainContainer.querySelectorAll('.sim-menu-card');
    cards.forEach(card => {
      card.onclick = () => {
        window.soundEngine.click();
        const target = card.dataset.simTarget;
        this.navigate(target);
      };
    });
  }

  // Simulation Holder View
  renderSimulationHolder(simType) {
    this.mainContainer.innerHTML = `
      <div class="page-content sim-page-container">
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-sims" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Interactive Lab</h2>
          <span class="header-step-pill">⚡ Live</span>
        </div>

        <div id="sim-active-container"></div>
      </div>
    `;

    const backBtn = this.mainContainer.querySelector('#btn-back-sims');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.navigate('simulations');
    };

    if (simType === 'circuit') {
      this.activeSimInstance = new window.CircuitSimulation('sim-active-container');
    } else if (simType === 'solar') {
      this.activeSimInstance = new window.SolarSimulation('sim-active-container');
    } else if (simType === 'water_cycle') {
      this.activeSimInstance = new window.WaterCycleSimulation('sim-active-container');
    } else if (simType === 'states_matter') {
      this.activeSimInstance = new window.StatesOfMatterSimulation('sim-active-container');
    } else if (simType === 'magnets') {
      this.activeSimInstance = new window.MagnetsSimulation('sim-active-container');
    } else if (simType === 'human_body') {
      this.activeSimInstance = new window.HumanBodySimulation('sim-active-container');
    } else if (simType === 'plant_growth') {
      this.activeSimInstance = new window.PlantGrowthSimulation('sim-active-container');
    }

    if (this.activeSimInstance) {
      this.activeSimInstance.init();
    }
  }

  // Modals for Rewards & Celebrations
  showNewBadgeModal(badgeId) {
    const badge = window.BADGES_DATA.find(b => b.id === badgeId);
    if (!badge) return;

    window.soundEngine.badgeUnlock();

    const modal = document.createElement('div');
    modal.className = 'quiz-review-overlay';
    modal.innerHTML = `
      <div class="badge-detail-dialog unlocked">
        <div class="badge-modal-hero" style="background: radial-gradient(circle, ${badge.color}44, #ffffff);">
          <div class="badge-modal-emoji">${badge.icon}</div>
        </div>
        <span class="meta-tag meta-xp" style="margin-bottom:8px;">New Achievement!</span>
        <h3>${badge.title}</h3>
        <p class="badge-detail-desc">${badge.description}</p>
        <div class="badge-xp-reward-box">
          <span>Bonus Award:</span>
          <strong>⭐ +${badge.xpReward} XP</strong>
        </div>
        <button class="btn-primary-fun btn-block" id="btn-dismiss-badge">Awesome! 🎉</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-dismiss-badge').onclick = () => {
      window.soundEngine.click();
      document.body.removeChild(modal);
    };
  }

  showLevelUpModal(level) {
    const title = window.storageManager.getLevelTitle(level);
    window.soundEngine.fanfare();

    const modal = document.createElement('div');
    modal.className = 'quiz-review-overlay';
    modal.innerHTML = `
      <div class="level-up-dialog">
        <div class="level-up-crown">👑</div>
        <h2 class="level-number-title">Level ${level}!</h2>
        <h4 class="level-rank-name">${title}</h4>
        <p>You have reached a new scientist milestone!</p>
        <div class="level-mascot-row">
          ${window.RobotMascot.getSVG('celebrate', 90, true)}
        </div>
        <div class="badge-xp-reward-box">
          <span>Level Up Bonus:</span>
          <strong>⭐ +100 XP</strong>
        </div>
        <button class="btn-primary-fun btn-block" id="btn-dismiss-level">Keep Exploring 🚀</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-dismiss-level').onclick = () => {
      window.soundEngine.click();
      document.body.removeChild(modal);
    };
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.miniScienceApp = new MiniScienceApp();
});
