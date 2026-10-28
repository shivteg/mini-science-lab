// Mini Science Lab - My Lab View Controller
// Provides My Lab Hub, My Progress (Screen 25), Completed Activities (Screen 26), Quiz History, Science Journal & Saved Favourites

class MyLabView {
  constructor(app) {
    this.app = app;
    this.favFilter = 'all'; // 'all', 'experiments', 'facts'
    this.completedFilter = 'all'; // 'all', 'experiments', 'simulations'
  }

  // 1. My Lab Main Dashboard (Screen 24 in s1.jpeg / s3.jpeg)
  render(container) {
    const profile = window.storageManager.getProfile();
    const stats = window.storageManager.state.stats;
    const completedExps = window.storageManager.state.completedExperiments;
    const completedQuizzes = window.storageManager.state.completedQuizzes;
    const completedSims = window.storageManager.state.completedSimulations;
    const notes = window.storageManager.getNotes();
    const favExps = window.storageManager.state.favorites.experiments || [];
    const favFacts = window.storageManager.state.favorites.facts || [];

    const totalPossible = 10 + 7 + 6; // 10 exps, 7 sims, 6 quizzes
    const currentCompleted = completedExps.length + completedSims.length + (completedQuizzes.length > 0 ? Math.min(6, completedQuizzes.length) : 0);
    const overallPercent = Math.min(100, Math.round((currentCompleted / totalPossible) * 100));

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
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-home" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>My Science Lab</h2>
          <button class="btn-header-action" id="btn-lab-settings" aria-label="Settings">⚙️</button>
        </div>

        <!-- User Profile Card -->
        <div class="mylab-profile-hero">
          <div class="mylab-avatar">${avatarIcon}</div>
          <div class="mylab-user-info">
            <h3>${profile.name}</h3>
            <span class="mylab-level-pill">Level ${stats.level} • ${window.storageManager.getLevelTitle(stats.level)}</span>
            <div class="mylab-xp-row">
              <span>⭐ ${stats.xp} Total XP</span>
              <span>🔥 ${stats.streakDays} Day Streak</span>
            </div>
          </div>
        </div>

        <!-- Overall Progress Ring Card (Tapping opens dedicated Screen 25) -->
        <div class="progress-ring-card" id="card-open-progress" style="cursor: pointer;" title="Tap to view detailed progress">
          <div class="ring-circle-box">
            <svg viewBox="0 0 100 100" class="progress-ring-svg">
              <circle cx="50" cy="50" r="42" class="ring-bg" />
              <circle cx="50" cy="50" r="42" class="ring-bar" style="stroke-dasharray: 264; stroke-dashoffset: ${264 - (264 * overallPercent) / 100};" />
            </svg>
            <div class="ring-number">${overallPercent}%</div>
          </div>
          <div class="ring-info-col">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h4>My Progress</h4>
              <span style="font-size:12px; color:#0284c7; font-weight:bold; display:flex; align-items:center; gap:2px;">View Details ${window.CHEVRON_RIGHT_SVG}</span>
            </div>
            <p>Overall scientific curriculum completion</p>
            <div class="progress-pills-row">
              <span class="pill-stat">🔬 ${completedExps.length}/10 Exps</span>
              <span class="pill-stat">⚡ ${completedSims.length}/7 Sims</span>
              <span class="pill-stat">🧠 ${completedQuizzes.length} Quizzes</span>
            </div>
          </div>
        </div>

        <!-- My Lab Section Menu Cards -->
        <div class="mylab-menu-list">
          <!-- 1. Dedicated Progress Screen Link -->
          <div class="mylab-menu-item" id="menu-item-progress">
            <div class="mylab-menu-icon bg-sky">📊</div>
            <div class="mylab-menu-text">
              <h4>Learning Progress</h4>
              <p>Overall percentage and subject breakdowns</p>
            </div>
            <span class="mylab-menu-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <!-- 2. Completed Activities Link (Screen 26) -->
          <div class="mylab-menu-item" id="menu-completed-exps">
            <div class="mylab-menu-icon bg-green">✅</div>
            <div class="mylab-menu-text">
              <h4>Completed Activities</h4>
              <p>${completedExps.length + completedSims.length} experiments & simulations completed</p>
            </div>
            <span class="mylab-menu-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <!-- 3. Quiz History -->
          <div class="mylab-menu-item" id="menu-quiz-history">
            <div class="mylab-menu-icon bg-purple">🧠</div>
            <div class="mylab-menu-text">
              <h4>Quiz History & Scores</h4>
              <p>${completedQuizzes.length} quiz scores and answers recorded</p>
            </div>
            <span class="mylab-menu-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <!-- 4. Science Journal -->
          <div class="mylab-menu-item" id="menu-science-journal">
            <div class="mylab-menu-icon bg-amber">📝</div>
            <div class="mylab-menu-text">
              <h4>My Science Journal</h4>
              <p>${notes.length} personal lab notes & observations</p>
            </div>
            <span class="mylab-menu-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>

          <!-- 5. Saved Favourites -->
          <div class="mylab-menu-item" id="menu-saved-favorites">
            <div class="mylab-menu-icon bg-rose">⭐</div>
            <div class="mylab-menu-text">
              <h4>Saved Favourites</h4>
              <p>${favExps.length + favFacts.length} bookmarked activities & facts</p>
            </div>
            <span class="mylab-menu-arrow">${window.CHEVRON_RIGHT_SVG}</span>
          </div>
        </div>
      </div>
    `;

    this.bindMainEvents(container);
  }

  bindMainEvents(container) {
    const bind = (id, fn) => {
      const el = container.querySelector(id);
      if (el) el.onclick = () => {
        window.soundEngine.click();
        fn();
      };
    };

    bind('#btn-back-home', () => this.app.navigate('home'));
    bind('#btn-lab-settings', () => this.app.navigate('settings'));
    bind('#card-open-progress', () => this.app.navigate('my_progress'));
    bind('#menu-item-progress', () => this.app.navigate('my_progress'));
    bind('#menu-completed-exps', () => this.app.navigate('completed_activities'));
    bind('#menu-quiz-history', () => this.app.navigate('quiz_history'));
    bind('#menu-science-journal', () => this.app.navigate('science_journal'));
    bind('#menu-saved-favorites', () => this.app.navigate('saved_activities'));
  }

  // 2. Dedicated Learning Progress Screen (Screen 25 in s1.jpeg / s3.jpeg)
  renderProgressScreen(container) {
    const stats = window.storageManager.state.stats;
    const completedExps = window.storageManager.state.completedExperiments.length;
    const completedSims = window.storageManager.state.completedSimulations.length;
    const completedQuizzes = window.storageManager.state.completedQuizzes.length;
    const unlockedBadges = window.storageManager.state.unlockedBadges.length;

    const totalExps = 10;
    const totalSims = 7;
    const totalQuizzes = 6;
    const totalPossible = totalExps + totalSims + totalQuizzes;
    const currentCompleted = completedExps + completedSims + Math.min(totalQuizzes, completedQuizzes);
    const overallPercent = Math.min(100, Math.round((currentCompleted / totalPossible) * 100));

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-mylab" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>My Progress</h2>
          <span class="header-step-pill">⭐ Lvl ${stats.level}</span>
        </div>

        <!-- Big Hero Progress Circle (Exact match to Screen 25) -->
        <div class="progress-hero-card">
          <div class="large-ring-box">
            <svg viewBox="0 0 120 120" class="progress-ring-svg-lg">
              <circle cx="60" cy="60" r="50" class="ring-bg" stroke-width="12" />
              <circle cx="60" cy="60" r="50" class="ring-bar" stroke-width="12" style="stroke-dasharray: 314; stroke-dashoffset: ${314 - (314 * overallPercent) / 100};" />
            </svg>
            <div class="large-ring-label">
              <span class="pct-num">${overallPercent}%</span>
              <span class="pct-sub">Overall</span>
            </div>
          </div>
          <h3>Overall Science Progress</h3>
          <p>You have mastered ${currentCompleted} of ${totalPossible} scientific challenges!</p>
        </div>

        <!-- Subject Breakdown Section -->
        <div class="progress-breakdown-list">
          <!-- 1. Experiments -->
          <div class="progress-sub-card">
            <div class="sub-card-top">
              <div class="sub-card-icon bg-sky">🔬</div>
              <div class="sub-card-info">
                <strong>Hands-on Experiments</strong>
                <span>${completedExps} of ${totalExps} Completed</span>
              </div>
              <span class="sub-card-pct">${Math.round((completedExps / totalExps) * 100)}%</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill bg-sky" style="width: ${(completedExps / totalExps) * 100}%;"></div>
            </div>
          </div>

          <!-- 2. Simulations -->
          <div class="progress-sub-card">
            <div class="sub-card-top">
              <div class="sub-card-icon bg-amber">⚡</div>
              <div class="sub-card-info">
                <strong>Virtual Physics & Nature Labs</strong>
                <span>${completedSims} of ${totalSims} Explored</span>
              </div>
              <span class="sub-card-pct">${Math.round((completedSims / totalSims) * 100)}%</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill bg-amber" style="width: ${(completedSims / totalSims) * 100}%;"></div>
            </div>
          </div>

          <!-- 3. Quizzes -->
          <div class="progress-sub-card">
            <div class="sub-card-top">
              <div class="sub-card-icon bg-purple">🧠</div>
              <div class="sub-card-info">
                <strong>Science Quizzes</strong>
                <span>${completedQuizzes} Quizzes Recorded</span>
              </div>
              <span class="sub-card-pct">${Math.min(100, Math.round((completedQuizzes / totalQuizzes) * 100))}%</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill bg-purple" style="width: ${Math.min(100, (completedQuizzes / totalQuizzes) * 100)}%;"></div>
            </div>
          </div>

          <!-- 4. Badges -->
          <div class="progress-sub-card">
            <div class="sub-card-top">
              <div class="sub-card-icon bg-rose">🏆</div>
              <div class="sub-card-info">
                <strong>Achievements Unlocked</strong>
                <span>${unlockedBadges} of 12 Badges Earned</span>
              </div>
              <span class="sub-card-pct">${Math.round((unlockedBadges / 12) * 100)}%</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill bg-rose" style="width: ${(unlockedBadges / 12) * 100}%;"></div>
            </div>
          </div>
        </div>

        <button class="btn-primary-fun btn-block" id="btn-progress-continue" style="margin-top:20px;">
          Continue Exploring 🚀
        </button>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-mylab');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('my_lab');
    };

    const continueBtn = container.querySelector('#btn-progress-continue');
    if (continueBtn) continueBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('experiments');
    };
  }

  // 3. Dedicated Completed Activities Screen (Screen 26 in s1.jpeg / s3.jpeg)
  renderCompletedActivitiesScreen(container) {
    const completedExpIds = window.storageManager.state.completedExperiments;
    const completedSimIds = window.storageManager.state.completedSimulations;

    const completedExps = window.EXPERIMENTS_DATA.filter(e => completedExpIds.includes(e.id));
    const allSims = [
      { id: 'circuit', title: 'Build a Circuit', category: 'Electricity', icon: '⚡' },
      { id: 'solar', title: 'Solar System Explorer', category: 'Astronomy', icon: '🪐' },
      { id: 'water_cycle', title: 'The Water Cycle', category: 'Earth Science', icon: '🌧️' },
      { id: 'states_of_matter', title: 'States of Matter', category: 'Physics', icon: '🧊' },
      { id: 'magnets', title: 'Magnet Lab', category: 'Physics', icon: '🧲' },
      { id: 'human_body', title: 'Human Body Explorer', category: 'Biology', icon: '🫀' },
      { id: 'plant_growth', title: 'Plant Growth & Botany', category: 'Botany', icon: '🌱' }
    ];
    const completedSims = allSims.filter(s => completedSimIds.includes(s.id));

    let items = [];
    if (this.completedFilter === 'all' || this.completedFilter === 'experiments') {
      items = items.concat(completedExps.map(e => ({ ...e, type: 'experiment', xp: 50 })));
    }
    if (this.completedFilter === 'all' || this.completedFilter === 'simulations') {
      items = items.concat(completedSims.map(s => ({ ...s, type: 'simulation', xp: 30 })));
    }

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-mylab" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Completed Activities</h2>
          <span class="header-step-pill">✅ ${completedExps.length + completedSims.length} Total</span>
        </div>

        <!-- Filter Chips -->
        <div class="category-chip-scroll">
          <button class="category-chip ${this.completedFilter === 'all' ? 'active' : ''}" data-filter="all">
            All (${completedExps.length + completedSims.length})
          </button>
          <button class="category-chip ${this.completedFilter === 'experiments' ? 'active' : ''}" data-filter="experiments">
            Experiments (${completedExps.length})
          </button>
          <button class="category-chip ${this.completedFilter === 'simulations' ? 'active' : ''}" data-filter="simulations">
            Simulations (${completedSims.length})
          </button>
        </div>

        <!-- Activities List -->
        <div class="completed-activities-list">
          ${items.length === 0 ? `
            <div class="empty-state-card">
              <div class="empty-icon">🔬</div>
              <h4>No completed activities yet</h4>
              <p>Explore an experiment or simulation to earn XP and celebrate your findings!</p>
              <button class="btn-primary-fun btn-sm" id="btn-go-explore" style="margin-top:10px;">Start an Experiment 🚀</button>
            </div>
          ` : items.map(it => `
            <div class="completed-item-card" data-type="${it.type}" data-id="${it.id}">
              <div class="item-icon-box">${it.icon}</div>
              <div class="item-info-col">
                <strong>${it.title}</strong>
                <span>${it.category} • ⭐ +${it.xp} XP</span>
              </div>
              <span class="meta-tag meta-done">Completed ✅</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-mylab');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('my_lab');
    };

    const chips = container.querySelectorAll('.category-chip');
    chips.forEach(c => {
      c.onclick = () => {
        window.soundEngine.click();
        this.completedFilter = c.dataset.filter;
        this.renderCompletedActivitiesScreen(container);
      };
    });

    const startBtn = container.querySelector('#btn-go-explore');
    if (startBtn) startBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('experiments');
    };

    const cards = container.querySelectorAll('.completed-item-card');
    cards.forEach(card => {
      card.onclick = () => {
        window.soundEngine.click();
        const type = card.dataset.type;
        const id = card.dataset.id;
        if (type === 'experiment') {
          this.app.selectedExperimentId = id;
          this.app.navigate('experiment_detail');
        } else {
          this.app.navigate(`sim_${id}`);
        }
      };
    });
  }

  // 4. Dedicated Quiz History Screen
  renderQuizHistoryScreen(container) {
    const history = window.storageManager.state.completedQuizzes;

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-mylab" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Quiz History</h2>
          <span class="header-step-pill">🧠 ${history.length} Taken</span>
        </div>

        <div class="quiz-history-list-wrap">
          ${history.length === 0 ? `
            <div class="empty-state-card">
              <div class="empty-icon">🧠</div>
              <h4>No quizzes taken yet</h4>
              <p>Test your knowledge in the Quizzes tab to earn XP and level up!</p>
              <button class="btn-primary-fun btn-sm" id="btn-start-quiz" style="margin-top:12px;">Take a Quiz 🚀</button>
            </div>
          ` : history.map((q, idx) => `
            <div class="quiz-history-card">
              <div class="q-history-top">
                <span class="q-history-icon">🏆</span>
                <div class="q-history-info">
                  <strong>${q.title}</strong>
                  <span class="q-history-date">📅 ${q.date}</span>
                </div>
                <div class="q-history-score ${q.percentage >= 80 ? 'high' : ''}">
                  ${q.score}/${q.total} (${q.percentage}%)
                </div>
              </div>
              <div class="q-history-bottom">
                <span>⭐ Earned +${q.xpEarned} XP</span>
                <span class="status-pill-sub">${q.percentage >= 80 ? 'Mastered 🎉' : 'Completed 👍'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-mylab');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('my_lab');
    };

    const startBtn = container.querySelector('#btn-start-quiz');
    if (startBtn) startBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('quizzes');
    };
  }

  // 5. Dedicated Science Journal Screen
  renderJournalScreen(container) {
    const notes = window.storageManager.getNotes();

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-mylab" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Science Journal</h2>
          <span class="header-step-pill">📝 ${notes.length} Notes</span>
        </div>

        <!-- Add Note Card -->
        <div class="journal-composer-card">
          <h4>✍️ Write a Lab Observation</h4>
          <input type="text" id="journal-input-title" class="input-form" placeholder="Observation Title (e.g. Floating Egg Experiment)" maxlength="40" />
          <textarea id="journal-input-content" class="textarea-form" rows="3" placeholder="What did you observe or discover today?"></textarea>
          <button class="btn-primary-fun btn-block" id="btn-journal-save">Save Observation ⭐</button>
        </div>

        <!-- Notes List -->
        <div class="journal-notes-list">
          ${notes.length === 0 ? `
            <div class="empty-state-card">
              <div class="empty-icon">📝</div>
              <h4>Your journal is empty</h4>
              <p>Record your science questions, hypotheses, and daily discoveries above!</p>
            </div>
          ` : notes.map(n => `
            <div class="journal-card">
              <div class="journal-card-header">
                <strong>${n.title}</strong>
                <button class="btn-journal-del" data-id="${n.id}">🗑️</button>
              </div>
              <p class="journal-card-text">${n.content}</p>
              <div class="journal-card-footer">
                <span>📅 ${n.date}</span>
                <span class="meta-tag meta-xp">Lab Observation</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-mylab');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('my_lab');
    };

    const saveBtn = container.querySelector('#btn-journal-save');
    if (saveBtn) saveBtn.onclick = () => {
      const title = container.querySelector('#journal-input-title').value.trim();
      const content = container.querySelector('#journal-input-content').value.trim();
      if (!title && !content) {
        alert('Please write a title or note description first!');
        return;
      }
      window.soundEngine.fanfare();
      window.storageManager.addNote(title || 'Lab Observation', 'General', content);
      this.renderJournalScreen(container);
    };

    const delBtns = container.querySelectorAll('.btn-journal-del');
    delBtns.forEach(btn => {
      btn.onclick = () => {
        window.soundEngine.click();
        window.storageManager.deleteNote(btn.dataset.id);
        this.renderJournalScreen(container);
      };
    });
  }

  // 6. Dedicated Saved Activities / Favourites Screen
  renderFavoritesScreen(container) {
    const favExps = window.storageManager.state.favorites.experiments || [];
    const favFacts = window.storageManager.state.favorites.facts || [];

    const expItems = window.EXPERIMENTS_DATA.filter(e => favExps.includes(e.id));
    const factItems = window.SCIENCE_FACTS.filter(f => favFacts.includes(f.id));

    let displayItems = [];
    if (this.favFilter === 'all' || this.favFilter === 'experiments') {
      displayItems = displayItems.concat(expItems.map(e => ({ ...e, favType: 'experiment' })));
    }
    if (this.favFilter === 'all' || this.favFilter === 'facts') {
      displayItems = displayItems.concat(factItems.map(f => ({ ...f, favType: 'fact' })));
    }

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-mylab" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Saved Favourites</h2>
          <span class="header-step-pill">⭐ ${expItems.length + factItems.length} Saved</span>
        </div>

        <!-- Filter Chips -->
        <div class="category-chip-scroll">
          <button class="category-chip ${this.favFilter === 'all' ? 'active' : ''}" data-filter="all">
            All (${expItems.length + factItems.length})
          </button>
          <button class="category-chip ${this.favFilter === 'experiments' ? 'active' : ''}" data-filter="experiments">
            Experiments (${expItems.length})
          </button>
          <button class="category-chip ${this.favFilter === 'facts' ? 'active' : ''}" data-filter="facts">
            Science Facts (${factItems.length})
          </button>
        </div>

        <!-- Favourites Grid -->
        <div class="favs-grid-list">
          ${displayItems.length === 0 ? `
            <div class="empty-state-card">
              <div class="empty-icon">⭐</div>
              <h4>No favourites saved yet</h4>
              <p>Tap the star icon on any experiment or science fact to bookmark it here!</p>
            </div>
          ` : displayItems.map(it => `
            <div class="fav-card-item" data-fav-type="${it.favType}" data-id="${it.id}">
              <div class="fav-item-icon">${it.icon}</div>
              <div class="fav-item-content">
                <strong>${it.title}</strong>
                <span>${it.category} • ${it.favType === 'experiment' ? `⏱️ ${it.duration}` : 'Science Fact'}</span>
              </div>
              <span class="fav-open-arrow">${window.CHEVRON_RIGHT_SVG}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-mylab');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('my_lab');
    };

    const chips = container.querySelectorAll('.category-chip');
    chips.forEach(c => {
      c.onclick = () => {
        window.soundEngine.click();
        this.favFilter = c.dataset.filter;
        this.renderFavoritesScreen(container);
      };
    });

    const cards = container.querySelectorAll('.fav-card-item');
    cards.forEach(card => {
      card.onclick = () => {
        window.soundEngine.click();
        const type = card.dataset.favType;
        const id = card.dataset.id;
        if (type === 'experiment') {
          this.app.selectedExperimentId = id;
          this.app.navigate('experiment_detail');
        } else {
          this.app.selectedFactId = id;
          this.app.navigate('fact_detail');
        }
      };
    });
  }
}

window.MyLabView = MyLabView;
