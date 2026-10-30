// Mini Science Lab - Cloud Push & Notification Receiver
// Connects to Cloud Push Hub at https://os.shivteg.com for real-time science alerts

class NotificationService {
  constructor() {
    this.serverUrl = 'https://os.shivteg.com';
    this.storageKey = 'science_lab_notifications';
    this.unreadKey = 'science_lab_unread_notifs_count';
    this.eventSource = null;
    this.pollInterval = null;
    this.isConnected = false;
    this.isNative = !!(window.AndroidBridge && window.AndroidBridge.isNativeApp && window.AndroidBridge.isNativeApp());
    this.init();
  }

  init() {
    // 1. Setup global receiver for native Android bridge
    window.handleIncomingNotification = (title, body, id) => {
      this.onNotificationReceived({
        id: id || ('notif_' + Date.now()),
        title: title || '🔬 Mini Science Lab',
        body: body || '',
        timestamp: Date.now()
      }, false); // false = already posted by Java to Android status bar
    };

    // 2. Connect to Server-Sent Events (SSE) stream for instant real-time pushes
    this.connectSSE();

    // 3. Fallback sync polling every 20 seconds
    this.startPolling();

    // 4. Try browser WebPush subscription if in browser/PWA environment
    if (!this.isNative && 'serviceWorker' in navigator && 'PushManager' in window) {
      this.initWebPush();
    }
  }

  async connectSSE() {
    if (this.eventSource) {
      try { this.eventSource.close(); } catch (e) {}
    }

    try {
      this.eventSource = new EventSource(`${this.serverUrl}/api/notifications/stream`);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        console.log('📡 [MiniScience] Connected to Cloud Notification Hub at os.shivteg.com');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type !== 'connected') {
            this.onNotificationReceived(data, true);
          }
        } catch (e) {
          console.error('[MiniScience] Error parsing notification:', e);
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        // EventSource auto reconnects automatically
      };
    } catch (e) {
      console.log('[MiniScience] SSE connection error:', e.message);
    }
  }

  startPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      this.syncRecentNotifications();
    }, 20000);
    // Initial sync
    setTimeout(() => this.syncRecentNotifications(), 1500);
  }

  async syncRecentNotifications() {
    try {
      const lastSeen = this.getLastSeenTimestamp();
      const res = await fetch(`${this.serverUrl}/api/notifications/poll?since=${lastSeen}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success && Array.isArray(data.notifications)) {
        data.notifications.forEach(n => {
          this.onNotificationReceived(n, true);
        });
      }
    } catch (e) {
      // Offline mode - silent fail
    }
  }

  onNotificationReceived(notif, shouldPostToSystem) {
    if (!notif || !notif.body) return;

    // Check duplicate
    const history = this.getNotifications();
    if (history.some(item => item.id === notif.id)) {
      return;
    }

    // Save to local storage
    history.unshift(notif);
    if (history.length > 50) history.pop();
    this.saveNotifications(history);

    // Increment unread count
    const unread = this.getUnreadCount() + 1;
    this.setUnreadCount(unread);
    this.updateNotificationBadge();

    // Trigger Native Android system status-bar notification if requested & running in APK
    if (shouldPostToSystem && this.isNative && window.AndroidBridge && window.AndroidBridge.showSystemNotification) {
      try {
        window.AndroidBridge.showSystemNotification(notif.title, notif.body, notif.id);
      } catch (e) {}
    }

    // Play tactile notification chime
    if (window.soundEngine) {
      if (typeof window.soundEngine.notification === 'function') {
        window.soundEngine.notification();
      } else if (typeof window.soundEngine.correct === 'function') {
        window.soundEngine.correct();
      }
    }

    // Trigger In-App Animated Banner
    this.showInAppBanner(notif);

    // Dispatch event for any active view
    window.dispatchEvent(new CustomEvent('science-notification', { detail: notif }));
  }

  showInAppBanner(notif) {
    let banner = document.getElementById('in-app-notification-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'in-app-notification-banner';
      banner.className = 'in-app-notification-banner';
      document.body.appendChild(banner);
    }

    banner.innerHTML = `
      <div class="notif-banner-card">
        <div class="notif-banner-icon">🚀</div>
        <div class="notif-banner-content">
          <div class="notif-banner-title">${this.escapeHtml(notif.title || '🔬 Mini Science Lab')}</div>
          <div class="notif-banner-body">${this.escapeHtml(notif.body)}</div>
        </div>
        <button class="notif-banner-close" aria-label="Dismiss">&times;</button>
      </div>
    `;

    // Force reflow
    void banner.offsetWidth;
    banner.classList.add('visible');

    const closeBtn = banner.querySelector('.notif-banner-close');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        banner.classList.remove('visible');
      };
    }

    banner.onclick = () => {
      banner.classList.remove('visible');
      this.openNotificationCenter();
    };

    if (this._bannerTimer) clearTimeout(this._bannerTimer);
    this._bannerTimer = setTimeout(() => {
      banner.classList.remove('visible');
    }, 7000);
  }

  openNotificationCenter() {
    this.setUnreadCount(0);
    this.updateNotificationBadge();

    const notifs = this.getNotifications();
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop-custom fade-in';
    modal.id = 'notif-center-modal';

    const itemsHtml = notifs.length === 0
      ? '<div class="notif-empty-state"><span style="font-size:36px; display:block; margin-bottom:8px;">📡</span><p>No science alerts yet! Check back soon for daily experiments, quizzes, and missions.</p></div>'
      : notifs.map(n => `
          <div class="notif-center-item">
            <div class="notif-item-header">
              <span class="notif-item-title">${this.escapeHtml(n.title)}</span>
              <span class="notif-item-time">${n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>
            <div class="notif-item-body">${this.escapeHtml(n.body)}</div>
          </div>
        `).join('');

    modal.innerHTML = `
      <div class="modal-card-custom notif-center-card bounce-in">
        <div class="notif-center-header">
          <div class="notif-center-title-group">
            <span style="font-size: 26px;">🔔</span>
            <div>
              <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0;">Science Mission Alerts</h3>
              <p style="font-size: 11.5px; color: #64748b; margin: 2px 0 0 0;">Live push notifications from your cloud teacher</p>
            </div>
          </div>
          <button class="modal-close-btn" id="close-notif-center">&times;</button>
        </div>
        <div class="notif-center-list">
          ${itemsHtml}
        </div>
        <button class="primary-btn mt-3 w-full" id="btn-done-notif">Got it!</button>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => {
      modal.classList.add('fade-out');
      setTimeout(() => modal.remove(), 200);
    };

    modal.querySelector('#close-notif-center').onclick = close;
    modal.querySelector('#btn-done-notif').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
  }

  updateNotificationBadge() {
    const count = this.getUnreadCount();
    const badges = document.querySelectorAll('.notif-badge-counter');
    badges.forEach(b => {
      if (count > 0) {
        b.innerText = count > 9 ? '9+' : count;
        b.style.display = 'flex';
      } else {
        b.style.display = 'none';
      }
    });
  }

  getNotifications() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  saveNotifications(list) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(list));
      if (list.length > 0) {
        localStorage.setItem(this.storageKey + '_last_seen', String(list[0].timestamp || Date.now()));
      }
    } catch (e) {}
  }

  getLastSeenTimestamp() {
    return parseInt(localStorage.getItem(this.storageKey + '_last_seen') || '0', 10);
  }

  getUnreadCount() {
    return parseInt(localStorage.getItem(this.unreadKey) || '0', 10);
  }

  setUnreadCount(val) {
    try {
      localStorage.setItem(this.unreadKey, String(val));
    } catch (e) {}
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async initWebPush() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        // Can subscribe if user enabled in Settings
      }
    } catch (e) {}
  }
}

window.notificationService = new NotificationService();
