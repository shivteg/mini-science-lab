// Mini Science Lab - Quiz View Controller (Catalogue, Question Player, Validation & Results)

class QuizView {
  constructor(app) {
    this.app = app;
    this.currentQuiz = null;
    this.questionIndex = 0;
    this.userAnswers = []; // array of { question, selected, correct, isCorrect, explanation }
    this.score = 0;
  }

  // 1. Quizzes Catalogue
  renderCatalogue(container) {
    const history = window.storageManager.state.completedQuizzes;

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-back-home" aria-label="Back">${window.BACK_ICON_SVG}</button>
          <h2>Science Quizzes</h2>
          <span class="header-step-pill">🧠 6 Topics</span>
        </div>

        <div class="screen-instructions-box">
          <p>Challenge your mind, test your science intuition, and earn badges & XP points!</p>
        </div>

        <!-- Quizzes Grid -->
        <div class="quiz-grid">
          ${window.QUIZZES_DATA.map(quiz => {
            const attempts = history.filter(h => h.id === quiz.id);
            const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : null;

            return `
              <div class="quiz-category-card" data-quiz-id="${quiz.id}">
                <div class="quiz-card-top">
                  <div class="quiz-icon-avatar" style="background:${quiz.color}22; border-color:${quiz.color};">
                    ${quiz.icon}
                  </div>
                  <span class="quiz-q-count">10 Questions</span>
                </div>
                <h4>${quiz.title}</h4>
                <p class="quiz-card-desc">${quiz.description}</p>
                <div class="quiz-card-footer">
                  ${bestScore !== null ? `
                    <span class="quiz-best-score">🏆 Best: ${bestScore}%</span>
                  ` : `
                    <span class="quiz-not-taken">⚡ Ready to Play</span>
                  `}
                  <button class="btn-sm btn-primary-fun">Play 🚀</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#btn-back-home');
    if (backBtn) backBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('home');
    };

    const cards = container.querySelectorAll('.quiz-category-card');
    cards.forEach(card => {
      card.onclick = () => {
        window.soundEngine.click();
        const qid = card.dataset.quizId;
        this.startQuiz(qid);
      };
    });
  }

  startQuiz(quizId) {
    this.currentQuiz = window.QUIZZES_DATA.find(q => q.id === quizId) || window.QUIZZES_DATA[0];
    this.questionIndex = 0;
    this.userAnswers = [];
    this.score = 0;
    this.app.navigate('quiz_question');
  }

  // 2. Quiz Question Screen
  renderQuestion(container) {
    const quiz = this.currentQuiz;
    const questions = quiz.questions;
    const q = questions[this.questionIndex];
    const totalQ = questions.length;
    const progressPercent = Math.round(((this.questionIndex + 1) / totalQ) * 100);

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-quiz-exit" aria-label="Exit">${window.BACK_ICON_SVG}</button>
          <h2>${quiz.title}</h2>
          <span class="header-step-pill">${this.questionIndex + 1} / ${totalQ}</span>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar-track">
          <div class="progress-bar-fill bg-sky" style="width: ${progressPercent}%;"></div>
        </div>

        <!-- Question Card -->
        <div class="quiz-question-box">
          <div class="q-number-tag">Question ${this.questionIndex + 1}</div>
          <h3 class="q-text">${q.question}</h3>
        </div>

        <!-- 4 Multiple Choice Options -->
        <div class="quiz-options-list">
          ${q.options.map((opt, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            return `
              <button class="quiz-option-btn" data-idx="${idx}">
                <span class="option-letter">${letter}</span>
                <span class="option-text">${opt}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Mascot Encouragement at bottom -->
        <div class="quiz-mascot-row">
          <div class="quiz-mascot-tiny">
            ${window.RobotMascot.getSVG('thinking', 46, false)}
          </div>
          <p class="quiz-mascot-speech">Take your time! Choose the best answer above.</p>
        </div>
      </div>
    `;

    const exitBtn = container.querySelector('#btn-quiz-exit');
    if (exitBtn) exitBtn.onclick = () => {
      window.soundEngine.click();
      if (confirm('Leave quiz? Your current quiz progress will be lost.')) {
        this.app.navigate('quizzes');
      }
    };

    const optionBtns = container.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach(btn => {
      btn.onclick = () => {
        const selectedIdx = parseInt(btn.dataset.idx, 10);
        this.handleAnswerSelected(selectedIdx, container);
      };
    });
  }

  handleAnswerSelected(selectedIdx, container) {
    const q = this.currentQuiz.questions[this.questionIndex];
    const isCorrect = selectedIdx === q.correctIndex;

    this.userAnswers.push({
      question: q.question,
      options: q.options,
      selected: selectedIdx,
      correct: q.correctIndex,
      isCorrect: isCorrect,
      explanation: q.explanation
    });

    if (isCorrect) {
      this.score++;
      window.soundEngine.correct();
      this.showFeedbackModal(true, q, container);
    } else {
      window.soundEngine.wrong();
      this.showFeedbackModal(false, q, container);
    }
  }

  showFeedbackModal(isCorrect, q, container) {
    const modal = document.createElement('div');
    modal.className = 'quiz-feedback-overlay';

    modal.innerHTML = `
      <div class="quiz-feedback-card ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="feedback-mascot">
          ${window.RobotMascot.getSVG(isCorrect ? 'celebrate' : 'oops', 80, true)}
        </div>
        <h3>${isCorrect ? 'Correct! Well Done! 🎉' : 'Oops! Almost Got It! 🌱'}</h3>
        <p class="feedback-sub">${isCorrect ? '+10 XP earned!' : 'Keep learning!'}</p>

        <div class="feedback-explanation-box">
          <strong>💡 Why:</strong>
          <p>${q.explanation}</p>
        </div>

        <button class="btn-primary-fun btn-block" id="btn-feedback-next">
          ${this.questionIndex === this.currentQuiz.questions.length - 1 ? 'See Quiz Results 🏆' : 'Next Question ➔'}
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    const nextBtn = modal.querySelector('#btn-feedback-next');
    nextBtn.onclick = () => {
      window.soundEngine.click();
      document.body.removeChild(modal);

      if (this.questionIndex < this.currentQuiz.questions.length - 1) {
        this.questionIndex++;
        this.renderQuestion(container);
      } else {
        this.finishQuiz();
      }
    };
  }

  finishQuiz() {
    window.soundEngine.fanfare();
    const total = this.currentQuiz.questions.length;
    const xpEarned = this.score * 10 + (this.score >= 8 ? 50 : 20);

    const xpResult = window.storageManager.recordQuizResult({
      id: this.currentQuiz.id,
      title: this.currentQuiz.title,
      score: this.score,
      total: total,
      xpEarned: xpEarned
    });

    this.app.lastQuizResult = {
      quiz: this.currentQuiz,
      score: this.score,
      total: total,
      percentage: Math.round((this.score / total) * 100),
      xpEarned: xpEarned,
      userAnswers: [...this.userAnswers]
    };

    this.app.navigate('quiz_result');

    // Check badges
    if (xpResult.newBadges && xpResult.newBadges.length > 0) {
      setTimeout(() => {
        this.app.showNewBadgeModal(xpResult.newBadges[0]);
      }, 700);
    } else if (xpResult.levelUp) {
      setTimeout(() => {
        this.app.showLevelUpModal(xpResult.newLevel);
      }, 700);
    }
  }

  // 3. Quiz Result Screen
  renderResult(container) {
    const res = this.app.lastQuizResult;
    if (!res) {
      this.app.navigate('quizzes');
      return;
    }

    const pct = res.percentage;
    let cheerTitle = 'Science Superstar!';
    if (pct < 50) cheerTitle = 'Good Effort!';
    else if (pct < 80) cheerTitle = 'Great Job!';

    container.innerHTML = `
      <div class="page-content">
        <!-- Top App Header -->
        <div class="page-header-bar">
          <button class="btn-header-back" id="btn-result-close" aria-label="Close">${window.BACK_ICON_SVG}</button>
          <h2>Quiz Completed!</h2>
          <span class="header-step-pill">⭐ +${res.xpEarned} XP</span>
        </div>

        <!-- Trophy Celebration Hero -->
        <div class="quiz-result-trophy-card">
          <div class="trophy-emoji">🏆</div>
          <h3>${cheerTitle}</h3>
          <p class="quiz-name-subtitle">${res.quiz.title}</p>

          <div class="score-display-box">
            <span class="score-fraction">${res.score} / ${res.total}</span>
            <span class="score-percent">(${res.percentage}%)</span>
          </div>

          <p class="score-encouragement">
            ${pct >= 80 ? 'Incredible! You have mastered this scientific topic!' : 'Nice work! Practice makes you an unstoppable scientist.'}
          </p>
        </div>

        <!-- Actions -->
        <div class="result-actions-grid">
          <button class="btn-secondary-fun" id="btn-review-answers">
            📝 Review Answers
          </button>
          <button class="btn-primary-fun" id="btn-retry-quiz">
            🔄 Try Again
          </button>
        </div>

        <button class="btn-subtle btn-block" id="btn-more-quizzes" style="margin-top:10px;">
          Choose Another Quiz 🧠
        </button>
      </div>
    `;

    const closeBtn = container.querySelector('#btn-result-close');
    if (closeBtn) closeBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('quizzes');
    };

    const reviewBtn = container.querySelector('#btn-review-answers');
    if (reviewBtn) reviewBtn.onclick = () => {
      window.soundEngine.click();
      this.showAnswerReviewModal();
    };

    const retryBtn = container.querySelector('#btn-retry-quiz');
    if (retryBtn) retryBtn.onclick = () => {
      window.soundEngine.click();
      this.startQuiz(res.quiz.id);
    };

    const moreBtn = container.querySelector('#btn-more-quizzes');
    if (moreBtn) moreBtn.onclick = () => {
      window.soundEngine.click();
      this.app.navigate('quizzes');
    };
  }

  showAnswerReviewModal() {
    const res = this.app.lastQuizResult;
    const modal = document.createElement('div');
    modal.className = 'quiz-review-overlay';

    modal.innerHTML = `
      <div class="quiz-review-dialog">
        <div class="review-dialog-header">
          <h3>Review Answers</h3>
          <button class="btn-close-dialog" id="btn-close-review">✖</button>
        </div>
        <div class="review-questions-list">
          ${res.userAnswers.map((item, idx) => `
            <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
              <div class="review-q-title">
                <span>${item.isCorrect ? '✅' : '❌'}</span>
                <strong>Q${idx + 1}: ${item.question}</strong>
              </div>
              <p class="review-user-ans">
                <strong>Your Answer:</strong> ${item.options[item.selected]}
              </p>
              ${!item.isCorrect ? `
                <p class="review-correct-ans">
                  <strong>Correct Answer:</strong> ${item.options[item.correct]}
                </p>
              ` : ''}
              <p class="review-expl">
                <em>💡 ${item.explanation}</em>
              </p>
            </div>
          `).join('')}
        </div>
        <button class="btn-primary-fun btn-block" id="btn-done-review">Close Review</button>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => {
      window.soundEngine.click();
      document.body.removeChild(modal);
    };

    modal.querySelector('#btn-close-review').onclick = close;
    modal.querySelector('#btn-done-review').onclick = close;
  }
}

window.QuizView = QuizView;
