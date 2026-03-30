// ============================================
// Lenny's Podcast Knowledge Base — App Logic
// ============================================

(() => {
  'use strict';

  // ── State ──
  let currentView = 'home'; // 'home' | 'category' | 'detail'
  let currentCategory = null;
  let searchQuery = '';

  // ── DOM Refs ──
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const categoryGrid = $('#categoryGrid');
  const cardsSection = $('#cardsSection');
  const breadcrumb = $('#breadcrumb');
  const detailOverlay = $('#detailOverlay');
  const detailPanel = $('#detailPanel');
  const searchInput = $('#searchInput');
  const hero = $('#hero');

  // ── Init ──
  function init() {
    renderCategoryGrid();
    bindSearchEvents();
    bindDetailOverlayClose();
    bindKeyboard();
  }

  // ── Get initials ──
  function getInitials(name) {
    const cleaned = name.replace(/\s*\d+\.\d+\s*$/, '').replace(/\s*2\.0\s*$/, '').replace(/\s*3\.0\s*$/, '').replace(/\s*4\.0\s*$/, '');
    const parts = cleaned.split(/[\s+&]/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return cleaned.substring(0, 2).toUpperCase();
  }

  // ── Render avatar (photo or initials fallback) ──
  function renderAvatar(name, gradient, size = 'small') {
    const photoUrl = (typeof GUEST_PHOTOS !== 'undefined') ? GUEST_PHOTOS[name] : null;
    const initials = getInitials(name);
    const sizeClass = size === 'large' ? 'detail-avatar' : 'guest-avatar';
    const imgClass = size === 'large' ? 'detail-avatar-img' : 'guest-avatar-img';

    if (photoUrl) {
      return `<div class="${sizeClass}" style="background: ${gradient}; padding: 0; overflow: hidden;">
                <img src="${photoUrl}" alt="${name}" class="${imgClass}" onerror="this.parentElement.innerHTML='${initials}'; this.parentElement.style.padding='';">
            </div>`;
    }
    return `<div class="${sizeClass}" style="background: ${gradient};">${initials}</div>`;
  }

  // ── CATEGORY GRID ──
  function renderCategoryGrid(filter = '') {
    const filtered = CATEGORIES.filter(cat => {
      if (!filter) return true;
      const q = filter.toLowerCase();
      if (cat.name.toLowerCase().includes(q)) return true;
      if (cat.description.toLowerCase().includes(q)) return true;
      if (cat.guests.some(g => g.name.toLowerCase().includes(q) || g.topic.toLowerCase().includes(q))) return true;
      return false;
    });

    if (filtered.length === 0) {
      categoryGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h3>No categories match your search</h3>
          <p>Try different keywords or clear your search</p>
        </div>`;
      return;
    }

    categoryGrid.innerHTML = filtered.map((cat, i) => `
      <div class="category-panel stagger-${i + 1}" data-category-id="${cat.id}" onclick="window.__openCategory('${cat.id}')">
        <div class="panel-glow" style="background: ${cat.gradient}; opacity: 0; position: absolute; inset: -1px; border-radius: 20px; z-index: -1; filter: blur(20px); transition: opacity 0.4s;"></div>
        <span class="panel-icon">${cat.icon}</span>
        <div class="panel-name">${cat.name}</div>
        <div class="panel-description">${cat.description}</div>
        <div class="panel-footer">
          <div class="panel-count"><strong>${cat.guests.length}</strong> episodes</div>
          <div class="panel-arrow">→</div>
        </div>
        <div style="position:absolute;top:0;left:0;right:0;height:3px;border-radius:20px 20px 0 0;background:${cat.gradient};opacity:0;transition:opacity 0.4s;"></div>
      </div>
    `).join('');

    // Add hover glow effect
    categoryGrid.querySelectorAll('.category-panel').forEach(panel => {
      panel.addEventListener('mouseenter', () => {
        const glow = panel.querySelector('.panel-glow');
        const bar = panel.querySelector('[style*="height:3px"]');
        if (glow) glow.style.opacity = '0.15';
        if (bar) bar.style.opacity = '1';
      });
      panel.addEventListener('mouseleave', () => {
        const glow = panel.querySelector('.panel-glow');
        const bar = panel.querySelector('[style*="height:3px"]');
        if (glow) glow.style.opacity = '0';
        if (bar) bar.style.opacity = '0';
      });
    });
  }

  // ── OPEN CATEGORY ──
  window.__openCategory = function (categoryId) {
    const cat = CATEGORIES.find(c => c.id === categoryId);
    if (!cat) return;

    currentCategory = cat;
    currentView = 'category';

    // Hide grid, show cards
    categoryGrid.style.display = 'none';
    hero.style.display = 'none';
    cardsSection.style.display = 'block';
    breadcrumb.style.display = 'flex';

    renderBreadcrumb(cat);
    renderGuestCards(cat);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── RENDER BREADCRUMB ──
  function renderBreadcrumb(cat) {
    breadcrumb.innerHTML = `
      <div class="breadcrumb-item" onclick="window.__goHome()">🏠 Home</div>
      <span class="breadcrumb-sep">›</span>
      <div class="breadcrumb-item active">${cat.icon} ${cat.name}</div>
    `;
  }

  // ── RENDER GUEST CARDS ──
  function renderGuestCards(cat, filter = '') {
    let guests = cat.guests;
    if (filter) {
      const q = filter.toLowerCase();
      guests = guests.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.topic.toLowerCase().includes(q) ||
        g.tags.some(t => TAG_NAMES[t]?.toLowerCase().includes(q))
      );
    }

    let cardsHTML = `
      <button class="back-btn" onclick="window.__goHome()">← Back to Categories</button>
      <div class="cards-header">
        <div class="cards-header-icon" style="background: ${cat.gradient};">${cat.icon}</div>
        <div class="cards-header-info">
          <h2>${cat.name}</h2>
          <p>${cat.guests.length} episodes · ${cat.description}</p>
        </div>
      </div>
      <div class="search-container" style="margin-bottom: 24px;">
        <span class="search-icon">🔍</span>
        <input type="text" class="search-input" id="cardSearchInput" placeholder="Search guests in ${cat.name}..." value="${filter}">
      </div>
    `;

    if (guests.length === 0) {
      cardsHTML += `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No guests match your search</h3>
          <p>Try different keywords</p>
        </div>`;
    } else {
      cardsHTML += `<div class="cards-grid">`;
      cardsHTML += guests.map((guest, i) => {
        const initials = getInitials(guest.name);
        const delay = Math.min(i * 0.04, 0.8);
        return `
          <div class="guest-card" style="animation-delay: ${delay}s;" onclick="window.__openDetail('${cat.id}', ${cat.guests.indexOf(guest)})">
            ${renderAvatar(guest.name, cat.gradient, 'small')}
            <div class="guest-name">${highlightMatch(guest.name, filter)}</div>
            <div class="guest-topic">${highlightMatch(guest.topic, filter)}</div>
            <div class="guest-tags">
              <span class="tag" style="color: ${cat.color}; border-color: ${cat.color}33;">${cat.code}</span>
              ${guest.tags.map(t => `<span class="tag" style="color: ${TAG_COLORS[t]}; border-color: ${TAG_COLORS[t]}33;">${TAG_NAMES[t]}</span>`).join('')}
            </div>
            <div style="position:absolute;top:0;left:0;width:3px;height:100%;border-radius:3px 0 0 3px;background:${cat.gradient};opacity:0;transition:opacity 0.4s;"></div>
          </div>`;
      }).join('');
      cardsHTML += `</div>`;
    }

    cardsSection.innerHTML = cardsHTML;

    // Bind card search
    const cardSearch = document.getElementById('cardSearchInput');
    if (cardSearch) {
      cardSearch.addEventListener('input', (e) => {
        renderGuestCards(cat, e.target.value);
        // Re-focus and set cursor
        const newInput = document.getElementById('cardSearchInput');
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(e.target.value.length, e.target.value.length);
        }
      });
    }

    // Hover side-bar effect
    cardsSection.querySelectorAll('.guest-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        const bar = card.querySelector('[style*="width:3px"]');
        if (bar) bar.style.opacity = '1';
      });
      card.addEventListener('mouseleave', () => {
        const bar = card.querySelector('[style*="width:3px"]');
        if (bar) bar.style.opacity = '0';
      });
    });
  }

  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark style="background:rgba(108,92,231,0.3);color:#fff;border-radius:2px;padding:0 2px;">$1</mark>');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ── OPEN DETAIL ──
  window.__openDetail = function (categoryId, guestIndex) {
    const cat = CATEGORIES.find(c => c.id === categoryId);
    if (!cat) return;
    const guest = cat.guests[guestIndex];
    if (!guest) return;

    const initials = getInitials(guest.name);

    // Look up real summary data
    const summaryData = lookupGuestSummary(guest.name);
    const summaryHTML = renderSummarySection(summaryData, guest, cat);
    const keyPointsHTML = renderKeyPoints(summaryData, guest, cat);
    const quotesHTML = renderQuotes(summaryData, guest, cat);

    detailPanel.innerHTML = `
      <div class="detail-close">
        <button class="detail-close-btn" onclick="window.__closeDetail()">✕</button>
      </div>
      <div class="detail-content">
        ${renderAvatar(guest.name, cat.gradient, 'large')}
        <div class="detail-category-label">${cat.icon} ${cat.name}</div>
        <div class="detail-name">${guest.name}</div>
        <div class="detail-topic">${guest.topic}</div>
        <div class="detail-tags">
          <span class="detail-tag" style="color: ${cat.color}; border-color: ${cat.color}44;">${cat.code} · ${cat.name}</span>
          ${guest.tags.map(t => `<span class="detail-tag" style="color: ${TAG_COLORS[t]}; border-color: ${TAG_COLORS[t]}44;">${TAG_NAMES[t]}</span>`).join('')}
        </div>

        <div class="detail-divider"></div>

        <div class="detail-section-title">📋 Episode Overview</div>
        <div class="detail-info-grid">
          <div class="detail-info-item">
            <div class="detail-info-label">Category</div>
            <div class="detail-info-value">${cat.icon} ${cat.name}</div>
          </div>
          <div class="detail-info-item">
            <div class="detail-info-label">Also Tagged</div>
            <div class="detail-info-value">${guest.tags.map(t => TAG_NAMES[t]).join(', ') || 'None'}</div>
          </div>
          <div class="detail-info-item">
            <div class="detail-info-label">Guest</div>
            <div class="detail-info-value">${guest.name.replace(/ 2\.0$/, '').replace(/ 3\.0$/, '').replace(/ 4\.0$/, '')}</div>
          </div>
          <div class="detail-info-item">
            <div class="detail-info-label">Host</div>
            <div class="detail-info-value">Lenny Rachitsky</div>
          </div>
        </div>

        <div class="detail-section-title">🎙️ Episode Summary</div>
        <div class="detail-transcript">
          ${summaryHTML}
        </div>

        ${keyPointsHTML}

        ${quotesHTML}
      </div>
    `;

    detailOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // ── SUMMARY LOOKUP ──
  function lookupGuestSummary(guestName) {
    if (typeof GUEST_SUMMARIES === 'undefined') return null;
    // Try exact match
    if (GUEST_SUMMARIES[guestName]) return GUEST_SUMMARIES[guestName];
    // Try base name (strip version suffix like "2.0", "3.0")
    const baseName = guestName.replace(/ \d+\.0$/, '');
    if (GUEST_SUMMARIES[baseName]) return GUEST_SUMMARIES[baseName];
    // Try with trailing underscore removed
    if (GUEST_SUMMARIES[guestName.replace(/_$/, '')]) return GUEST_SUMMARIES[guestName.replace(/_$/, '')];
    return null;
  }

  function renderSummarySection(data, guest, cat) {
    if (data && data.summary && data.summary.length > 30) {
      let summary = data.summary;
      // Clean up: remove "Welcome to Lenny's Podcast..." prefix
      summary = summary.replace(/^Welcome to Lenny's Podcast[^.]*\.\s*/i, '');
      summary = summary.replace(/^I'm Lenny[^.]*\.\s*/i, '');
      // Remove timestamps
      summary = summary.replace(/\(\d{2}:\d{2}:\d{2}\):\s*/g, '');
      return '<p style="line-height:1.8; color: var(--text-secondary);">' + summary + '</p>';
    }
    // Fallback
    const name = guest.name.replace(/ \d+\.0$/, '');
    return '<p style="line-height:1.8; color: var(--text-secondary);">In this episode, Lenny sits down with <strong>' + name + '</strong> to discuss <strong>' + guest.topic + '</strong> — exploring insights and lessons from their experience in ' + cat.name.toLowerCase() + '.</p>';
  }

  function renderKeyPoints(data, guest, cat) {
    if (!data || !data.keyPoints || data.keyPoints.length === 0) return '';
    const points = data.keyPoints.slice(0, 5).map(function (point) {
      let p = point.replace(/\(\d{2}:\d{2}:\d{2}\):\s*/g, '');
      p = p.charAt(0).toUpperCase() + p.slice(1);
      return '<li style="margin-bottom: 10px; line-height: 1.7; color: var(--text-secondary);">' + p + '</li>';
    }).join('');
    return '<div class="detail-section-title">\u{1F4A1} Key Takeaways</div><ul style="padding-left: 20px; margin: 0;">' + points + '</ul>';
  }

  function renderQuotes(data, guest, cat) {
    if (!data || !data.quotes || data.quotes.length === 0) return '';
    const quotes = data.quotes.slice(0, 2).map(function (q) {
      const text = q.text.replace(/\(\d{2}:\d{2}:\d{2}\):\s*/g, '');
      return '<div style="margin-bottom: 18px; padding: 16px 20px; background: rgba(0,0,0,0.02); border-left: 3px solid ' + cat.color + '; border-radius: 0 10px 10px 0;">' +
        '<p style="margin: 0 0 8px; line-height: 1.7; color: var(--text-secondary); font-style: italic;">\u201C' + text + '\u201D</p>' +
        '<p style="margin: 0; font-size: 12px; color: ' + cat.color + '; font-weight: 600;">\u2014 ' + q.speaker + '</p>' +
        '</div>';
    }).join('');
    return '<div class="detail-section-title">\u{1F4AC} Notable Quotes</div>' + quotes;
  }

  // ── CLOSE DETAIL ──
  window.__closeDetail = function () {
    detailOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  // ── GO HOME ──
  window.__goHome = function () {
    currentView = 'home';
    currentCategory = null;

    categoryGrid.style.display = 'grid';
    hero.style.display = '';
    cardsSection.style.display = 'none';
    breadcrumb.style.display = 'none';

    // Re-render if search is active
    renderCategoryGrid(searchInput.value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── SEARCH ──
  function bindSearchEvents() {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCategoryGrid(searchQuery);
    });
  }

  // ── DETAIL CLOSE ON OVERLAY CLICK ──
  function bindDetailOverlayClose() {
    detailOverlay.addEventListener('click', (e) => {
      if (e.target === detailOverlay) {
        window.__closeDetail();
      }
    });
  }

  // ── KEYBOARD SHORTCUTS ──
  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (detailOverlay.classList.contains('active')) {
          window.__closeDetail();
        } else if (currentView === 'category') {
          window.__goHome();
        }
      }
      // Focus search on /
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const active = document.activeElement;
        if (active.tagName !== 'INPUT') {
          e.preventDefault();
          if (currentView === 'home') searchInput.focus();
          else {
            const cardSearch = document.getElementById('cardSearchInput');
            if (cardSearch) cardSearch.focus();
          }
        }
      }
    });
  }

  // ── Ripple Effect on Cards ──
  document.addEventListener('mousedown', (e) => {
    const card = e.target.closest('.category-panel, .guest-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const ripple = document.createElement('div');
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    Object.assign(ripple.style, {
      position: 'absolute',
      left: x - size / 2 + 'px',
      top: y - size / 2 + 'px',
      width: size + 'px',
      height: size + 'px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.06)',
      transform: 'scale(0)',
      transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
      pointerEvents: 'none',
      zIndex: '1'
    });

    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.appendChild(ripple);

    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(1)';
      ripple.style.opacity = '0';
    });

    setTimeout(() => ripple.remove(), 600);
  });

  // ── Tilt Effect on Category Panels ──
  document.addEventListener('mousemove', (e) => {
    const panel = e.target.closest('.category-panel');
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    panel.style.transform = `translateY(-6px) scale(1.01) perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  });

  document.addEventListener('mouseleave', (e) => {
    const panel = e.target.closest?.('.category-panel');
    if (panel) {
      panel.style.transform = '';
    }
  }, true);

  // Reset tilt when mouse leaves panel
  categoryGrid?.addEventListener('mouseleave', () => {
    categoryGrid.querySelectorAll('.category-panel').forEach(p => {
      p.style.transform = '';
    });
  });

  // ── Boot ──
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();
