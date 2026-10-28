// Mini Science Lab - Experiments View Controller (Catalogue, Details, Materials, Safety, Steps, Result)

class ExperimentsView {
  constructor(app) {
    this.app = app;
    this.searchQuery = '';
    this.categoryFilter = 'All';
    this.currentStep = 0;
    this.gatheredMaterials = new Set();
    this.safetyAccepted = false;
  }

  // 1. Catalogue Screen
  renderCatalogue(container) {
    const categories = ['All', 'Physics', 'Chemistry', 'Biology', 'Earth Science'];
    const exps = window.EXPERIMENTS_DATA.filter(exp => {
      const matchCat = this.categoryFilter === 'All' || exp.category.toLowerCase().includes(this.categoryFilter.toLowerCase());
      const matchQuery = !this.searchQuery || 
        exp.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        exp.summary.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-home" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Experiments</h2>
          <button class="btn-header-action" id="btn-exp-favorites" aria-label="Favorites">⭐</button>
        </div>

        <!-- Search Bar -->
        <div class="search-box-wrap">
          <span class="search-glass-icon">🔍</span>
          <input type="text" class="input-search" id="input-search-exp" placeholder="Search fun experiments..." value="${this.searchQuery}" />
          ${this.searchQuery ? `<button class="btn-clear-search" id="btn-clear-exp-search">✖</button>` : ''}
        </div>

        <!-- Category Chips -->
        <div class="category-chip-scroll">
          ${categories.map(c => `
            <button class="category-chip ${this.categoryFilter === c ? 'active' : ''}" data-cat="${c}">
              ${c}
            </button>
          `).join('')}
        </div>

        <!-- Experiments List -->
        <div class="experiments-list-wrap">
          ${exps.length === 0 ? `
            <div class="empty-state-card">
              <div class="empty-icon">🔍</div>
              <h4>No experiments found</h4>
              <p>Try searching for something else like "magnet" or "circuit"!</p>
            </div>
          ` : exps.map(exp => {
            const isDone = window.storageManager.isExperimentCompleted(exp.id);
            const isFav = window.storageManager.isFavorite('experiments', exp.id);
            return `
              <div class="exp-card ${isDone ? 'completed-card' : ''}" data-id="${exp.id}">
                <div class="exp-card-icon" style="background:${exp.color}15; border-color:${exp.color};">
                  ${exp.icon}
                </div>
                <div class="exp-card-body">
                  <div class="exp-card-title-row">
                    <h4>${exp.title}</h4>
                    <button class="btn-fav-star ${isFav ? 'active' : ''}" data-fav-id="${exp.id}">
                      ${isFav ? '★' : '☆'}
                    </button>
                  </div>
                  <p class="exp-card-summary">${exp.summary}</p>
                  <div class="exp-card-meta">
                    <span class="meta-tag meta-difficulty ${exp.difficulty.toLowerCase()}">${exp.difficulty}</span>
                    <span class="meta-tag meta-time">⏱️ ${exp.duration}</span>
                    <span class="meta-tag meta-cat">${exp.category}</span>
                    ${isDone ? `<span class="meta-tag meta-done">✅ Completed</span>` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.bindCatalogueEvents(container);
  }

  bindCatalogueEvents(container) {
    const backBtn = container.querySelector('#btn-back-home');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('home');
    };

    const favsBtn = container.querySelector('#btn-exp-favorites');
    if (favsBtn) favsBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('my_lab');
    };

    const searchInput = container.querySelector('#input-search-exp');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        this.renderCatalogue(container);
      };
    }

    const clearBtn = container.querySelector('#btn-clear-exp-search');
    if (clearBtn) {
      clearBtn.onclick = () => {
        this.searchQuery = '';
        this.renderCatalogue(container);
      };
    }

    const chips = container.querySelectorAll('.category-chip');
    chips.forEach(chip => {
      chip.onclick = () => {
        window.soundEngine.click();
        this.categoryFilter = chip.dataset.cat;
        this.renderCatalogue(container);
      };
    });

    const cards = container.querySelectorAll('.exp-card');
    cards.forEach(card => {
      card.onclick = (e) => {
        if (e.target.classList.contains('btn-fav-star')) return;
        window.soundEngine.click();
        this.app.selectedExperimentId = card.dataset.id;
        this.app.navigate('experiment_detail');
      };
    });

    const starBtns = container.querySelectorAll('.btn-fav-star');
    starBtns.forEach(star => {
      star.onclick = (e) => {
        e.stopPropagation();
        window.soundEngine.blip();
        const id = star.dataset.favId;
        const isFav = window.storageManager.toggleFavorite('experiments', id);
        star.classList.toggle('active', isFav);
        star.textContent = isFav ? '★' : '☆';
      };
    });
  }

  // 2. Experiment Details Screen
  renderDetail(container) {
    const exp = window.EXPERIMENTS_DATA.find(e => e.id === this.app.selectedExperimentId) || window.EXPERIMENTS_DATA[0];
    const isFav = window.storageManager.isFavorite('experiments', exp.id);
    const isDone = window.storageManager.isExperimentCompleted(exp.id);

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-catalogue" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Experiment Details</h2>
          <button class="btn-header-action ${isFav ? 'active' : ''}" id="btn-detail-fav">
            ${isFav ? '★' : '☆'}
          </button>
        </div>

        <!-- Hero Card -->
        <div class="exp-detail-hero" style="background: radial-gradient(circle at top, ${exp.color}33, #ffffff);">
          <div class="exp-detail-big-icon">${exp.icon}</div>
          <h3>${exp.title}</h3>
          <div class="exp-detail-pill-row">
            <span class="meta-tag meta-cat">${exp.category}</span>
            <span class="meta-tag meta-difficulty ${exp.difficulty.toLowerCase()}">${exp.difficulty}</span>
            <span class="meta-tag meta-time">⏱️ ${exp.duration}</span>
            <span class="meta-tag meta-xp">⭐ +50 XP</span>
          </div>
        </div>

        <!-- Description Box -->
        <div class="exp-detail-section">
          <h4>Overview</h4>
          <p class="exp-detail-text">${exp.summary}</p>
        </div>

        <!-- What You Will Learn -->
        <div class="exp-detail-section">
          <h4>What You Will Learn</h4>
          <ul class="learning-list">
            ${exp.learningOutcomes.map(item => `
              <li><span class="check-bullet">✅</span> <span>${item}</span></li>
            `).join('')}
          </ul>
        </div>

        <!-- Start Button -->
        <div class="floating-bottom-bar">
          <button class="btn-primary-fun btn-block" id="btn-start-exp-workflow">
            Start Experiment 🚀
          </button>
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-catalogue');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('experiments');
    };

    const favBtn = container.querySelector('#btn-detail-fav');
    if (favBtn) favBtn.onclick = () => {
      window.soundEngine.blip();
      const isF = window.storageManager.toggleFavorite('experiments', exp.id);
      favBtn.classList.toggle('active', isF);
      favBtn.textContent = isF ? '★' : '☆';
    };

    const startBtn = container.querySelector('#btn-start-exp-workflow');
    if (startBtn) startBtn.onclick = () => {
      window.soundEngine.click();
      this.gatheredMaterials = new Set();
      this.app.navigate('experiment_materials');
    };
  }

  // 3. Materials Required Screen
  renderMaterials(container) {
    const exp = window.EXPERIMENTS_DATA.find(e => e.id === this.app.selectedExperimentId) || window.EXPERIMENTS_DATA[0];

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-detail" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Materials Required</h2>
          <span class="header-step-pill">1 / 3</span>
        </div>

        <div class="screen-instructions-box">
          <p>Gather the following everyday materials before starting. Tap each item once you have it ready on your table!</p>
        </div>

        <!-- Materials Grid -->
        <div class="materials-grid">
          ${exp.materials.map((m, idx) => {
            const isGathered = this.gatheredMaterials.has(idx);
            return `
              <div class="material-card ${isGathered ? 'checked' : ''}" data-idx="${idx}">
                <div class="material-icon">${m.icon}</div>
                <div class="material-name">${m.name}</div>
                <div class="material-status-dot">${isGathered ? '✓' : ''}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Progress tracker -->
        <div class="materials-progress-card">
          <span id="materials-count-label">${this.gatheredMaterials.size} of ${exp.materials.length} items collected</span>
        </div>

        <!-- Action Button -->
        <div class="floating-bottom-bar">
          <button class="btn-primary-fun btn-block" id="btn-next-safety">
            Next: Safety Instructions 🛡️
          </button>
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-detail');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('experiment_detail');
    };

    const cards = container.querySelectorAll('.material-card');
    cards.forEach(card => {
      card.onclick = () => {
        window.soundEngine.click();
        const idx = parseInt(card.dataset.idx, 10);
        if (this.gatheredMaterials.has(idx)) {
          this.gatheredMaterials.delete(idx);
          card.classList.remove('checked');
          card.querySelector('.material-status-dot').textContent = '';
        } else {
          this.gatheredMaterials.add(idx);
          card.classList.add('checked');
          card.querySelector('.material-status-dot').textContent = '✓';
        }
        const lbl = container.querySelector('#materials-count-label');
        if (lbl) lbl.textContent = `${this.gatheredMaterials.size} of ${exp.materials.length} items collected`;
      };
    });

    const nextBtn = container.querySelector('#btn-next-safety');
    if (nextBtn) nextBtn.onclick = () => {
      window.soundEngine.click();
      this.safetyAccepted = false;
      this.app.navigate('experiment_safety');
    };
  }

  // 4. Safety Instructions Screen
  renderSafety(container) {
    const exp = window.EXPERIMENTS_DATA.find(e => e.id === this.app.selectedExperimentId) || window.EXPERIMENTS_DATA[0];

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-materials" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Stay Safe!</h2>
          <span class="header-step-pill">2 / 3</span>
        </div>

        <!-- Safety Warning Banner -->
        <div class="safety-hero-card">
          <div class="safety-badge-icon">⚠️</div>
          <div class="safety-hero-text">
            <h3>Adult Supervision First</h3>
            <p>Science is fun when we do it safely! Please review and follow each safety guideline below.</p>
          </div>
        </div>

        <!-- Checklist of rules -->
        <div class="safety-rules-list">
          ${exp.safetyRules.map((rule, idx) => `
            <div class="safety-rule-item">
              <span class="rule-num">${idx + 1}</span>
              <p>${rule}</p>
            </div>
          `).join('')}
        </div>

        <!-- Mandatory Agreement Checkbox -->
        <div class="safety-agreement-card">
          <label class="checkbox-label" for="chk-safety-agree">
            <input type="checkbox" id="chk-safety-agree" ${this.safetyAccepted ? 'checked' : ''} />
            <span class="custom-checkbox"></span>
            <span class="agreement-text">I promise to follow the safety rules and do this experiment with an adult supervisor.</span>
          </label>
        </div>

        <!-- Action Button -->
        <div class="floating-bottom-bar">
          <button class="btn-primary-fun btn-block" id="btn-start-steps" ${!this.safetyAccepted ? 'disabled' : ''}>
            I Understand — Start Experiment! 🔬
          </button>
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-materials');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('experiment_materials');
    };

    const chk = container.querySelector('#chk-safety-agree');
    const startBtn = container.querySelector('#btn-start-steps');
    if (chk) {
      chk.onchange = (e) => {
        window.soundEngine.click();
        this.safetyAccepted = e.target.checked;
        if (startBtn) startBtn.disabled = !this.safetyAccepted;
      };
    }

    if (startBtn) {
      startBtn.onclick = () => {
        window.soundEngine.click();
        this.currentStep = 0;
        this.app.navigate('experiment_steps');
      };
    }
  }

  // 5. Step-by-Step Guide Screen
  renderSteps(container) {
    const exp = window.EXPERIMENTS_DATA.find(e => e.id === this.app.selectedExperimentId) || window.EXPERIMENTS_DATA[0];
    const totalSteps = exp.steps.length;
    const stepData = exp.steps[this.currentStep] || exp.steps[0];

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-safety" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>${exp.title}</h2>
          <span class="header-step-pill">Step ${this.currentStep + 1} of ${totalSteps}</span>
        </div>

        <!-- Step Indicator Dots -->
        <div class="step-progress-dots">
          ${exp.steps.map((_, idx) => `
            <div class="step-dot ${idx === this.currentStep ? 'active' : (idx < this.currentStep ? 'completed' : '')}"></div>
          `).join('')}
        </div>

        <!-- Step Hero Card -->
        <div class="step-guide-card">
          <div class="step-badge-number">Step ${this.currentStep + 1}</div>
          <h3 class="step-title">${stepData.title}</h3>
          <p class="step-description">${stepData.text}</p>
        </div>

        <!-- Tip / Mascot Box -->
        <div class="step-mascot-tip">
          <div class="tip-mascot-avatar">
            ${window.RobotMascot.getSVG('thinking', 54, false)}
          </div>
          <div class="tip-content">
            <span class="tip-badge">💡 Lab Assistant Tip:</span>
            <p>${stepData.tip}</p>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="step-actions-row">
          <button class="btn-secondary-fun" id="btn-prev-step" ${this.currentStep === 0 ? 'disabled' : ''}>
            <span style="display:inline-flex; align-items:center; gap:4px;">${window.BACK_ICON_SVG} Previous</span>
          </button>
          <button class="btn-primary-fun" id="btn-next-step">
            <span style="display:inline-flex; align-items:center; gap:4px;">${this.currentStep === totalSteps - 1 ? 'Finish & See Results 🎉' : `Next Step ${window.CHEVRON_RIGHT_SVG}`}</span>
          </button>
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-safety');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('experiment_safety');
    };

    const prevBtn = container.querySelector('#btn-prev-step');
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (this.currentStep > 0) {
          window.soundEngine.click();
          this.currentStep--;
          this.renderSteps(container);
        }
      };
    }

    const nextBtn = container.querySelector('#btn-next-step');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (this.currentStep < totalSteps - 1) {
          window.soundEngine.click();
          this.currentStep++;
          this.renderSteps(container);
        } else {
          // Completed!
          this.completeExperimentWorkflow(exp);
        }
      };
    }
  }

  completeExperimentWorkflow(exp) {
    window.soundEngine.fanfare();
    // Complete in storage
    const result = window.storageManager.completeExperiment(exp.id, exp.result.xp);
    this.app.lastExperimentResult = { exp, xpEarned: exp.result.xp, firstTime: result.firstTime };
    this.app.navigate('experiment_result');

    // Check if new badge unlocked
    if (result.newBadges && result.newBadges.length > 0) {
      setTimeout(() => {
        this.app.showNewBadgeModal(result.newBadges[0]);
      }, 800);
    } else if (result.levelUp) {
      setTimeout(() => {
        this.app.showLevelUpModal(result.newLevel);
      }, 800);
    }
  }

  // 6. Result & Explanation Screen
  renderResult(container) {
    const exp = (this.app.lastExperimentResult && this.app.lastExperimentResult.exp) || 
      window.EXPERIMENTS_DATA.find(e => e.id === this.app.selectedExperimentId) || 
      window.EXPERIMENTS_DATA[0];
    const res = exp.result;

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-result-back" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Experiment Complete!</h2>
          <span class="header-step-pill">⭐ +${res.xp} XP</span>
        </div>

        <!-- Celebratory Mascot Banner -->
        <div class="result-hero-celebration">
          <div class="celebration-mascot">
            ${window.RobotMascot.getSVG('celebrate', 100, true)}
          </div>
          <h3>${res.headline}</h3>
          <p class="celebration-sub">Outstanding job, Young Scientist!</p>
        </div>

        <!-- What Happened -->
        <div class="result-section-card">
          <div class="result-card-header">
            <span>🔍</span>
            <h4>What Happened</h4>
          </div>
          <p>${res.whatHappened}</p>
        </div>

        <!-- Scientific Explanation -->
        <div class="result-section-card bg-highlight">
          <div class="result-card-header">
            <span>💡</span>
            <h4>Why It Happens</h4>
          </div>
          <p>${res.scienceExplanation}</p>
        </div>

        <!-- Action Buttons -->
        <div class="result-actions-grid">
          <button class="btn-secondary-fun" id="btn-result-retry">🔄 Try Again</button>
          <button class="btn-primary-fun" id="btn-result-more">Explore More Experiments 🚀</button>
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-result-back');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('experiments');
    };

    const retryBtn = container.querySelector('#btn-result-retry');
    if (retryBtn) retryBtn.onclick = () => {
      window.soundEngine.click();
      this.currentStep = 0;
      this.app.navigate('experiment_steps');
    };

    const moreBtn = container.querySelector('#btn-result-more');
    if (moreBtn) moreBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('experiments');
    };
  }
}

window.ExperimentsView = ExperimentsView;
