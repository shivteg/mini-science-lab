// Mini Science Lab - Home Dashboard View Controller

class HomeView {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    const profile = window.storageManager.getProfile();
    const stats = window.storageManager.state.stats;
    const completedExps = window.storageManager.state.completedExperiments.length;
    const completedSims = window.storageManager.state.completedSimulations.length;
    const completedQuizzes = window.storageManager.state.completedQuizzes.length;
    const unlockedBadges = window.storageManager.state.unlockedBadges.length;
    const levelTitle = window.storageManager.getLevelTitle(stats.level);

    // Pick avatar emoji / icon
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
    const avatarIcon = avatarIcons[profile.avatarId] || '👦';

    container.innerHTML = `
      <div class="page-content home-view-wrap">
        <!-- Top Profile Bar -->
        <div class="home-top-bar">
          <div class="user-greeting" id="btn-header-profile" style="cursor: pointer;">
            <div class="user-avatar-circle">${avatarIcon}</div>
            <div class="greeting-text">
              <span class="greeting-subtitle">Hi ${profile.name || 'Explorer'}! 👋</span>
              <span class="greeting-title">${levelTitle}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="xp-streak-pill" id="btn-header-xp" style="cursor: pointer;">
              <span class="xp-star">⭐</span>
              <span class="xp-number">${stats.xp} XP</span>
              <span class="level-tag">Lvl ${stats.level}</span>
            </div>
            <button class="btn-header-action" id="btn-home-notifications" title="Notifications" aria-label="Notifications" style="position: relative;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="notif-badge-counter" style="display: none;">0</span>
            </button>
            <button class="btn-header-action" id="btn-home-settings" title="Settings" aria-label="Settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Robot Mascot Daily Science Banner -->
        <div class="mascot-hero-card" id="btn-home-mascot" style="cursor: pointer;" title="Tap to hear Sparky talk!">
          <div class="mascot-svg-wrap" id="home-mascot-slot">
            ${window.RobotMascot.getSVG('happy', 84, true)}
          </div>
          <div class="mascot-bubble">
            <h4>Ready to explore science today?</h4>
            <div class="sparky-listen-pill">🎙️ Tap to hear Sparky!</div>
            <p>Conduct safe experiments, run exciting simulations, or challenge your mind with a quiz!</p>
          </div>
        </div>

        <!-- Quick Launch Feature Grid -->
        <div class="section-title-row">
          <h3>Explore Science</h3>
          <span class="section-hint">Choose an activity</span>
        </div>

        <div class="feature-grid">
          <!-- Experiments Card -->
          <div class="feature-card card-experiments" id="home-card-experiments">
            <div class="card-icon-bubble bg-sky">🔬</div>
            <div class="card-info">
              <h4>Experiments</h4>
              <p>Safe hands-on fun</p>
            </div>
            <div class="card-stat-badge">${completedExps}/10 Done</div>
          </div>

          <!-- Simulations Card -->
          <div class="feature-card card-simulations" id="home-card-simulations">
            <div class="card-icon-bubble bg-amber">⚡</div>
            <div class="card-info">
              <h4>Simulations</h4>
              <p>Circuits, space & more</p>
            </div>
            <div class="card-stat-badge">${completedSims}/6 Labs</div>
          </div>

          <!-- Quizzes Card -->
          <div class="feature-card card-quizzes" id="home-card-quizzes">
            <div class="card-icon-bubble bg-purple">❓</div>
            <div class="card-info">
              <h4>Quizzes</h4>
              <p>Test your knowledge</p>
            </div>
            <div class="card-stat-badge">${completedQuizzes} Finished</div>
          </div>

          <!-- My Lab Card -->
          <div class="feature-card card-mylab" id="home-card-mylab">
            <div class="card-icon-bubble bg-green">🧪</div>
            <div class="card-info">
              <h4>My Lab</h4>
              <p>Progress & Journal</p>
            </div>
            <div class="card-stat-badge">⭐ Stats</div>
          </div>

          <!-- Achievements Card -->
          <div class="feature-card card-achievements" id="home-card-achievements">
            <div class="card-icon-bubble bg-rose">🏆</div>
            <div class="card-info">
              <h4>Achievements</h4>
              <p>Badges & rewards</p>
            </div>
            <div class="card-stat-badge">${unlockedBadges}/12 Badges</div>
          </div>

          <!-- Science Library Card -->
          <div class="feature-card card-library" id="home-card-library">
            <div class="card-icon-bubble bg-blue">📚</div>
            <div class="card-info">
              <h4>Science Library</h4>
              <p>Cool facts & articles</p>
            </div>
            <div class="card-stat-badge">12 Facts</div>
          </div>
        </div>

        <!-- Featured Activity of the Day -->
        <div class="featured-banner-card" id="home-card-featured">
          <div class="featured-badge">🌟 Activity of the Day</div>
          <div class="featured-content">
            <div class="featured-text">
              <h4>Magnet Magic</h4>
              <p>Discover how invisible magnetic forces attract metals and test household objects!</p>
              <div class="featured-meta">
                <span>⏱️ 10 mins</span> • <span>Easy</span> • <span>+50 XP</span>
              </div>
            </div>
            <div class="featured-icon">🧲</div>
          </div>
          <button class="btn-primary-fun btn-block" style="margin-top:12px;">Start Activity 🚀</button>
        </div>
      </div>
    `;

    this.bindEvents(container);
    if (window.notificationService) {
      window.notificationService.updateNotificationBadge();
    }
  }

  bindEvents(container) {
    const bind = (id, fn) => {
      const el = container.querySelector(id);
      if (el) el.onclick = () => {
        window.soundEngine.click();
        fn();
      };
    };

    bind('#btn-header-profile', () => this.app.navigate('profile_setup'));
    bind('#btn-header-xp', () => this.app.navigate('my_lab'));
    bind('#btn-home-notifications', () => {
      if (window.notificationService) {
        window.notificationService.openNotificationCenter();
      }
    });
    bind('#btn-home-settings', () => this.app.navigate('settings'));
    bind('#home-card-experiments', () => this.app.navigate('experiments'));
    bind('#home-card-simulations', () => this.app.navigate('simulations'));
    bind('#home-card-quizzes', () => this.app.navigate('quizzes'));
    bind('#home-card-mylab', () => this.app.navigate('my_lab'));
    bind('#home-card-achievements', () => this.app.navigate('achievements'));
    bind('#home-card-library', () => this.app.navigate('library'));
    bind('#home-card-featured', () => {
      this.app.selectedExperimentId = 'magnet_magic';
      this.app.navigate('experiment_detail');
    });

    const mascotCard = container.querySelector('#btn-home-mascot');
    if (mascotCard) {
      mascotCard.onclick = () => {
        window.soundEngine.click();
        const mascotSlot = container.querySelector('#home-mascot-slot');
        if (mascotSlot) {
          mascotSlot.innerHTML = window.RobotMascot.getSVG('excited', 84, true);
        }
        const audio = window.soundEngine.playVoice('welcome_mascot.wav');
        if (audio) {
          audio.onended = () => {
            if (mascotSlot) mascotSlot.innerHTML = window.RobotMascot.getSVG('happy', 84, true);
          };
        }
      };
    }
  }
}

window.HomeView = HomeView;
