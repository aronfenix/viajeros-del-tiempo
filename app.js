(() => {
  'use strict';

  const PERSONAJES = Array.isArray(window.PERSONAJES)
    ? [...window.PERSONAJES].sort((a, b) => Number(a.id) - Number(b.id))
    : [];

  const CATEGORIAS = window.CATEGORIAS && typeof window.CATEGORIAS === 'object'
    ? window.CATEGORIAS
    : {};

  const Extras = window.ViajerosExtras || {};
  const Portraits = window.PortraitGenerator || null;

  const state = {
    activeView: 'home',
    activeCategory: 'todos',
    activePersonajeId: PERSONAJES[0] ? PERSONAJES[0].id : null,
    searchQuery: ''
  };

  // ============================================================
  //  DOM Refs
  // ============================================================
  const refs = {
    views: {
      home: document.getElementById('view-home'),
      personajes: document.getElementById('view-personajes'),
      personaje: document.getElementById('view-personaje'),
      instrucciones: document.getElementById('view-instrucciones'),
      consejos: document.getElementById('view-consejos'),
      quiz: document.getElementById('view-quiz'),
      timeline: document.getElementById('view-timeline'),
      comparar: document.getElementById('view-comparar')
    },
    btnHome: document.getElementById('btn-home'),
    navCards: Array.from(document.querySelectorAll('.nav-card[data-goto]')),
    filterBar: document.getElementById('filter-bar'),
    grid: document.getElementById('personajes-grid'),
    detail: document.getElementById('personaje-detail'),
    btnBackPersonajes: document.getElementById('btn-back-personajes'),
    btnBackPersonaje: document.getElementById('btn-back-personaje'),
    btnBackInstrucciones: document.getElementById('btn-back-instrucciones'),
    btnBackConsejos: document.getElementById('btn-back-consejos'),
    btnBackQuiz: document.getElementById('btn-back-quiz'),
    btnBackTimeline: document.getElementById('btn-back-timeline'),
    btnBackComparar: document.getElementById('btn-back-comparar'),
    btnPrevPersonaje: document.getElementById('btn-prev-personaje'),
    btnNextPersonaje: document.getElementById('btn-next-personaje'),
    btnListPersonaje: document.getElementById('btn-list-personaje'),
    btnTheme: document.getElementById('btn-theme'),
    btnSurprise: document.getElementById('btn-surprise'),
    searchInput: document.getElementById('search-input'),
    searchClear: document.getElementById('search-clear'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    progressHomeFill: document.getElementById('progress-home-fill'),
    progressHomeText: document.getElementById('progress-home-text'),
    // Quiz
    quizContainer: document.getElementById('quiz-container'),
    quizStart: document.getElementById('quiz-start'),
    quizPlay: document.getElementById('quiz-play'),
    quizFeedback: document.getElementById('quiz-feedback'),
    quizResults: document.getElementById('quiz-results'),
    btnQuizStart: document.getElementById('btn-quiz-start'),
    quizHighscore: document.getElementById('quiz-highscore'),
    quizRound: document.getElementById('quiz-round'),
    quizScore: document.getElementById('quiz-score'),
    quizClueLabel: document.getElementById('quiz-clue-label'),
    quizClueText: document.getElementById('quiz-clue-text'),
    btnQuizClue: document.getElementById('btn-quiz-clue'),
    quizOptions: document.getElementById('quiz-options'),
    // Timeline
    timelineFilterBar: document.getElementById('timeline-filter-bar'),
    timelineWrapper: document.getElementById('timeline-wrapper'),
    // Compare
    compareLeft: document.getElementById('compare-left'),
    compareRight: document.getElementById('compare-right'),
    compareTable: document.getElementById('compare-table')
  };

  if (!refs.views.home || !refs.grid || !refs.detail) return;

  // ============================================================
  //  Utilities
  // ============================================================
  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function getCategoryInfo(categoria) {
    const info = CATEGORIAS[categoria] || {};
    return {
      label: info.label || categoria,
      emoji: info.emoji || '•',
      colorVar: `var(--clr-cat-${categoria}, var(--clr-primary))`
    };
  }

  function getPortrait(personaje, size) {
    if (Portraits) return Portraits.getPortraitURL(personaje, size);
    return '';
  }

  // ============================================================
  //  Progress & Dark Mode
  // ============================================================
  function updateProgressUI() {
    if (!Extras.Progress) return;
    const p = Extras.Progress.getProgress();
    const pct = p.total ? Math.round((p.viewed / p.total) * 100) : 0;

    if (refs.progressFill) refs.progressFill.setAttribute('stroke-dasharray', `${pct}, 100`);
    if (refs.progressText) refs.progressText.textContent = p.viewed;
    if (refs.progressHomeFill) refs.progressHomeFill.style.width = pct + '%';
    if (refs.progressHomeText) refs.progressHomeText.textContent = `${p.viewed} de ${p.total} personajes explorados`;
  }

  function applyDarkMode(on) {
    document.documentElement.dataset.theme = on ? 'dark' : '';
    if (refs.btnTheme) refs.btnTheme.textContent = on ? '☀️' : '🌙';
    if (Extras.Progress) Extras.Progress.setDarkMode(on);
  }

  // ============================================================
  //  View Switching
  // ============================================================
  function showView(viewKey) {
    if (!refs.views[viewKey]) return;
    Object.entries(refs.views).forEach(([key, el]) => {
      if (el) el.classList.toggle('active', key === viewKey);
    });
    state.activeView = viewKey;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ============================================================
  //  Filters
  // ============================================================
  function getFilteredPersonajes() {
    let list = PERSONAJES;

    // Search filter
    if (state.searchQuery && Extras.Search) {
      const searchResult = Extras.Search.search(state.searchQuery);
      if (searchResult !== null) list = searchResult;
    }

    // Category filter
    if (state.activeCategory === 'favoritos') {
      list = list.filter(p => Extras.Progress && Extras.Progress.isFavorite(p.id));
    } else if (state.activeCategory !== 'todos') {
      list = list.filter(p => p.categoria === state.activeCategory);
    }

    return list;
  }

  function renderFilters() {
    if (!refs.filterBar) return;
    refs.filterBar.querySelectorAll('[data-generated="true"]').forEach(el => el.remove());

    const cats = [...new Set(PERSONAJES.map(p => p.categoria).filter(Boolean))];
    cats.forEach(cat => {
      const info = getCategoryInfo(cat);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn';
      btn.dataset.cat = cat;
      btn.dataset.generated = 'true';
      btn.textContent = `${info.emoji} ${info.label}`;
      refs.filterBar.appendChild(btn);
    });

    // Favorites filter
    if (Extras.Progress) {
      const favBtn = document.createElement('button');
      favBtn.type = 'button';
      favBtn.className = 'filter-btn';
      favBtn.dataset.cat = 'favoritos';
      favBtn.dataset.generated = 'true';
      favBtn.textContent = '❤️ Favoritos';
      refs.filterBar.appendChild(favBtn);
    }

    updateActiveFilterButton();
  }

  function updateActiveFilterButton() {
    if (!refs.filterBar) return;
    refs.filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === state.activeCategory);
    });
  }

  // ============================================================
  //  Personajes Grid
  // ============================================================
  function renderPersonajesGrid() {
    const personajes = getFilteredPersonajes();
    if (!personajes.length) {
      refs.grid.innerHTML = '<p class="section-intro">No se encontraron personajes.</p>';
      return;
    }

    refs.grid.innerHTML = personajes.map(p => {
      const info = getCategoryInfo(p.categoria);
      const isFav = Extras.Progress && Extras.Progress.isFavorite(p.id);
      const isViewed = Extras.Progress && Extras.Progress.isViewed(p.id);
      const portraitUrl = getPortrait(p, 72);
      const avatarHtml = portraitUrl
        ? `<div class="personaje-card-avatar"><img src="${portraitUrl}" alt="" width="72" height="72" loading="lazy"></div>`
        : `<div class="personaje-card-emoji" style="font-size:2rem">${escapeHtml(p.emoji || '📘')}</div>`;

      return `
        <article class="personaje-card" data-personaje-id="${escapeHtml(p.id)}" data-cat="${escapeHtml(p.categoria)}"
          role="button" tabindex="0" style="--card-color: ${info.colorVar};"
          aria-label="Abrir ficha de ${escapeHtml(p.nombre)}">
          ${avatarHtml}
          ${p.adaptado ? '<span class="card-adaptado" title="Ficha adaptada">📘</span>' : ''}
          <h3 class="personaje-card-name">${escapeHtml(p.nombre)}</h3>
          <p class="personaje-card-dates">${escapeHtml(p.fechas)}</p>
          <p class="personaje-card-context">${escapeHtml(p.contexto)}</p>
          <p class="personaje-card-frase">${escapeHtml(p.frase)}</p>
          <div class="personaje-card-bottom">
            <span class="personaje-card-tag">${escapeHtml(info.label)}</span>
            <span class="personaje-card-icons">
              ${isViewed ? '<span class="card-viewed" title="Ya visitado">✓</span>' : ''}
              <button class="card-fav-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${p.id}" title="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}">${isFav ? '❤️' : '🤍'}</button>
            </span>
          </div>
        </article>`;
    }).join('');
  }

  // ============================================================
  //  Personaje Detail
  // ============================================================
  function getPersonajeById(id) {
    return PERSONAJES.find(p => Number(p.id) === Number(id)) || null;
  }

  function renderList(items) {
    if (!Array.isArray(items) || items.length === 0) return '<li>No hay información disponible.</li>';
    return items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function renderPersonajeDetail(id) {
    const p = getPersonajeById(id) || PERSONAJES[0] || null;
    if (!p) {
      refs.detail.innerHTML = '<p class="section-intro">No hay datos para mostrar.</p>';
      return;
    }

    state.activePersonajeId = p.id;
    if (Extras.Progress) Extras.Progress.markViewed(p.id);
    updateProgressUI();

    const isFav = Extras.Progress && Extras.Progress.isFavorite(p.id);
    const portraitUrl = getPortrait(p, 120);
    const portraitHtml = portraitUrl
      ? `<div class="personaje-hero-avatar"><img src="${portraitUrl}" alt="Retrato de ${escapeHtml(p.nombre)}" width="120" height="120"></div>`
      : `<div class="personaje-hero-emoji" style="font-size:3.5rem">${escapeHtml(p.emoji || '📘')}</div>`;

    // Life bar calculation
    const TL = Extras.Timeline || { YEAR_START: 1390, YEAR_END: 1840 };
    const lifeLeft = p.nacimiento ? ((p.nacimiento - TL.YEAR_START) / (TL.YEAR_END - TL.YEAR_START) * 100) : 0;
    const lifeWidth = (p.nacimiento && p.muerte) ? ((p.muerte - p.nacimiento) / (TL.YEAR_END - TL.YEAR_START) * 100) : 0;

    // Contemporaries
    let contempHtml = '';
    if (Extras.Connections) {
      const contemps = Extras.Connections.findContemporaries(p);
      if (contemps.length > 0) {
        contempHtml = `
          <section class="personaje-section contemporaneos revealed" style="--stripe-color: #0ea5e9">
            <div class="personaje-section-header">
              <span>🤝</span>
              <h3>Contemporáneos</h3>
            </div>
            <div class="personaje-section-body">
              <p>Estos personajes vivieron al mismo tiempo que ${escapeHtml(p.nombre)}:</p>
              <div>
                ${contemps.map(c => `
                  <span class="contemporaneo-item" data-personaje-id="${c.id}" role="button" tabindex="0">
                    <span>${escapeHtml(c.emoji)}</span>
                    <strong>${escapeHtml(c.nombre)}</strong>
                    <span class="contemp-years">${c.overlapYears} años coincidiendo</span>
                  </span>`).join('')}
              </div>
            </div>
          </section>`;
      }
    }

    refs.detail.innerHTML = `
      <header class="personaje-hero">
        ${portraitHtml}
        <h2>${escapeHtml(p.nombre)}</h2>
        <div class="personaje-hero-meta">
          <span>${escapeHtml(p.fechas)}</span>
          <span>${escapeHtml(p.contexto)}</span>
        </div>
        ${(p.nacimiento && p.muerte) ? `
        <div class="personaje-lifebar">
          <div class="personaje-lifebar-track">
            <div class="personaje-lifebar-fill" style="left:${lifeLeft}%;width:${lifeWidth}%;background:var(--clr-cat-${p.categoria},var(--clr-primary))"></div>
          </div>
          <div class="personaje-lifebar-labels">
            <span>${p.nacimiento}</span>
            <span>${p.muerte - p.nacimiento} años</span>
            <span>${p.muerte}</span>
          </div>
        </div>` : ''}
        <p class="personaje-hero-frase">${escapeHtml(p.frase)}</p>
        <div>
          <button class="personaje-hero-fav ${isFav ? 'is-fav' : ''}" id="detail-fav-btn" data-fav-id="${p.id}">
            ${isFav ? '❤️ Favorito' : '🤍 Añadir a favoritos'}
          </button>
          <button class="btn-print" id="btn-print" title="Imprimir ficha">🖨️ Imprimir</button>
        </div>
      </header>

      <section class="personaje-section" style="--stripe-color: var(--clr-stripe-1)">
        <div class="personaje-section-header"><span>🧑</span><h3>Quién fue</h3></div>
        <div class="personaje-section-body"><p>${escapeHtml(p.quien)}</p></div>
      </section>

      <section class="personaje-section" style="--stripe-color: var(--clr-stripe-2)">
        <div class="personaje-section-header"><span>🏛️</span><h3>Por qué es importante en la Edad Moderna</h3></div>
        <div class="personaje-section-body"><p>${escapeHtml(p.importancia)}</p></div>
      </section>

      <section class="personaje-section curiosidades">
        <div class="personaje-section-header"><span>🔎</span><h3>Datos curiosos</h3></div>
        <div class="personaje-section-body"><ul>${renderList(p.datosCuriosos)}</ul></div>
      </section>

      <section class="personaje-section ideas">
        <div class="personaje-section-header"><span>💬</span><h3>Ideas para tu exposición</h3></div>
        <div class="personaje-section-body"><ul>${renderList(p.ideasExposicion)}</ul></div>
      </section>

      ${p.adaptado ? `
      <div class="adaptado-badge">📘 Ficha adaptada — con ayuda extra para tu trabajo</div>

      <section class="personaje-section" style="--stripe-color: #3b82f6">
        <div class="personaje-section-header"><span>📝</span><h3>Vocabulario clave</h3></div>
        <div class="personaje-section-body"><ul>${renderList(p.vocabularioClave)}</ul></div>
      </section>

      <section class="personaje-section" style="--stripe-color: #10b981">
        <div class="personaje-section-header"><span>💬</span><h3>Frases para empezar tu biografía</h3></div>
        <div class="personaje-section-body"><ul>${renderList(p.frasesInicio)}</ul></div>
      </section>

      <section class="personaje-section" style="--stripe-color: #8b5cf6">
        <div class="personaje-section-header"><span>📋</span><h3>Esquema para tu texto</h3></div>
        <div class="personaje-section-body"><ul>${renderList(p.esquema)}</ul></div>
      </section>
      ` : ''}

      ${contempHtml}

      <div class="print-notes">
        <h4>✏️ Mis notas sobre ${escapeHtml(p.nombre)}:</h4>
        <div class="print-lines">
          <div class="print-line"></div><div class="print-line"></div><div class="print-line"></div>
          <div class="print-line"></div><div class="print-line"></div>
        </div>
      </div>
    `;

    // Reveal sections with IntersectionObserver
    const sections = refs.detail.querySelectorAll('.personaje-section:not(.revealed)');
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.1 });
      sections.forEach(s => obs.observe(s));
    } else {
      sections.forEach(s => s.classList.add('revealed'));
    }

    updatePersonajeNav();

    // Detail event listeners
    const favBtn = document.getElementById('detail-fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        if (!Extras.Progress) return;
        const nowFav = Extras.Progress.toggleFavorite(p.id);
        favBtn.classList.toggle('is-fav', nowFav);
        favBtn.innerHTML = nowFav ? '❤️ Favorito' : '🤍 Añadir a favoritos';
        renderPersonajesGrid();
      });
    }

    const printBtn = document.getElementById('btn-print');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    // Contemporary links
    refs.detail.querySelectorAll('.contemporaneo-item[data-personaje-id]').forEach(el => {
      el.addEventListener('click', () => openPersonaje(el.dataset.personajeId));
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPersonaje(el.dataset.personajeId); }
      });
    });
  }

  function updatePersonajeNav() {
    const index = PERSONAJES.findIndex(p => Number(p.id) === Number(state.activePersonajeId));
    if (refs.btnPrevPersonaje) refs.btnPrevPersonaje.disabled = index <= 0;
    if (refs.btnNextPersonaje) refs.btnNextPersonaje.disabled = index === -1 || index >= PERSONAJES.length - 1;
  }

  function openPersonaje(id) {
    renderPersonajeDetail(id);
    showView('personaje');
  }

  // ============================================================
  //  Quiz
  // ============================================================
  function initQuizView() {
    const hs = Extras.Quiz ? Extras.Progress.getQuizHighScore() : 0;
    if (refs.quizHighscore && hs > 0) {
      refs.quizHighscore.textContent = `Tu récord: ${hs} puntos`;
    }
  }

  function startQuiz() {
    if (!Extras.Quiz) return;
    Extras.Quiz.start(10);
    if (refs.quizStart) refs.quizStart.hidden = true;
    if (refs.quizPlay) refs.quizPlay.hidden = false;
    if (refs.quizFeedback) refs.quizFeedback.hidden = true;
    if (refs.quizResults) refs.quizResults.hidden = true;
    renderQuizRound();
  }

  function renderQuizRound() {
    const round = Extras.Quiz.getCurrentRound();
    if (!round) { showQuizResults(); return; }

    if (refs.quizRound) refs.quizRound.textContent = `Ronda ${round.roundNum}/${round.totalRounds}`;
    if (refs.quizScore) refs.quizScore.textContent = `Puntos: ${round.score}`;

    const clueLabels = ['Pista 1 (4 pts)', 'Pista 2 (3 pts)', 'Pista 3 (2 pts)', 'Pista 4 (1 pt)'];
    if (refs.quizClueLabel) refs.quizClueLabel.textContent = clueLabels[round.clueNum] || 'Pista';
    if (refs.quizClueText) refs.quizClueText.textContent = round.clue;
    if (refs.btnQuizClue) refs.btnQuizClue.hidden = round.clueNum >= 3;

    if (refs.quizPlay) refs.quizPlay.hidden = false;
    if (refs.quizFeedback) refs.quizFeedback.hidden = true;

    if (refs.quizOptions) {
      refs.quizOptions.innerHTML = round.options.map(opt =>
        `<button class="quiz-option-btn" data-opt-id="${opt.id}">${escapeHtml(opt.nombre)}</button>`
      ).join('');
    }
  }

  function handleQuizAnswer(selectedId) {
    const result = Extras.Quiz.answer(selectedId);
    if (!result) return;

    // Highlight correct/wrong
    if (refs.quizOptions) {
      refs.quizOptions.querySelectorAll('.quiz-option-btn').forEach(btn => {
        btn.disabled = true;
        if (Number(btn.dataset.optId) === result.correctId) btn.classList.add('correct');
        if (Number(btn.dataset.optId) === Number(selectedId) && !result.correct) btn.classList.add('wrong');
      });
    }

    // Show feedback after brief delay
    setTimeout(() => {
      if (refs.quizPlay) refs.quizPlay.hidden = true;
      if (refs.quizFeedback) {
        refs.quizFeedback.hidden = false;
        refs.quizFeedback.innerHTML = `
          <div class="quiz-feedback-icon">${result.correct ? '✅' : '❌'}</div>
          <div class="quiz-feedback-text" style="color:${result.correct ? '#10b981' : '#ef4444'}">
            ${result.correct ? `¡Correcto! +${result.points} puntos` : 'Incorrecto'}
          </div>
          <p class="quiz-feedback-detail">Era: <strong>${escapeHtml(result.correctName)}</strong> (${result.cluesUsed} pista${result.cluesUsed > 1 ? 's' : ''} usada${result.cluesUsed > 1 ? 's' : ''})</p>
          <button class="btn-quiz-next" id="btn-quiz-next">${Extras.Quiz.state.finished ? 'Ver resultados' : 'Siguiente →'}</button>
        `;
        document.getElementById('btn-quiz-next').addEventListener('click', () => {
          if (Extras.Quiz.state.finished) showQuizResults();
          else renderQuizRound();
        });
      }
    }, 800);
  }

  function showQuizResults() {
    const results = Extras.Quiz.getResults();
    if (!results) return;

    if (refs.quizPlay) refs.quizPlay.hidden = true;
    if (refs.quizFeedback) refs.quizFeedback.hidden = true;
    if (refs.quizResults) {
      refs.quizResults.hidden = false;
      refs.quizResults.innerHTML = `
        <div class="quiz-results-score">${results.score} / ${results.maxScore}</div>
        <p class="quiz-results-message">${escapeHtml(results.message)}</p>
        ${results.score > 0 && results.highScore === results.score ? '<p style="color:var(--clr-accent);font-weight:700">🏆 ¡Nuevo récord!</p>' : ''}
        <button class="btn-quiz-restart" id="btn-quiz-restart">Jugar otra vez</button>
      `;
      document.getElementById('btn-quiz-restart').addEventListener('click', startQuiz);
    }
  }

  // ============================================================
  //  Timeline
  // ============================================================
  function renderTimeline(category) {
    if (!refs.timelineWrapper || !Extras.Timeline) return;
    category = category || 'todos';

    const data = Extras.Timeline.getTimelineData(category);
    const markers = Extras.Timeline.getYearMarkers();
    const totalHeight = 700;

    let html = `<div class="timeline-axis" style="height:${totalHeight}px"></div>`;

    // Year markers
    markers.forEach(year => {
      const top = (Extras.Timeline.getYearPosition(year) / 100) * totalHeight;
      html += `<div class="timeline-marker" style="top:${top}px">${year}</div>`;
    });

    // Bars - stack overlapping bars
    const lanes = [];
    data.forEach(p => {
      const top = (Extras.Timeline.getYearPosition(p.nacimiento) / 100) * totalHeight;
      const height = Math.max(24, (Extras.Timeline.getBarHeight(p.nacimiento, p.muerte) / 100) * totalHeight);
      const info = getCategoryInfo(p.categoria);
      const barEnd = top + height;

      // Find first free lane
      let lane = 0;
      while (lanes[lane] && lanes[lane] > top - 2) lane++;
      lanes[lane] = barEnd;

      const left = 95 + lane * 155;
      const width = 145;

      html += `
        <div class="timeline-bar" data-personaje-id="${p.id}"
          style="top:${top}px;height:${height}px;left:${left}px;width:${width}px;background:${info.colorVar}"
          title="${escapeHtml(p.nombre)} (${p.nacimiento}–${p.muerte})">
          <span class="timeline-bar-name">${escapeHtml(p.nombre)}</span>
        </div>`;
    });

    refs.timelineWrapper.style.height = totalHeight + 'px';
    refs.timelineWrapper.style.position = 'relative';
    refs.timelineWrapper.innerHTML = html;
  }

  function renderTimelineFilters() {
    if (!refs.timelineFilterBar) return;
    refs.timelineFilterBar.querySelectorAll('[data-generated="true"]').forEach(el => el.remove());

    const cats = [...new Set(PERSONAJES.map(p => p.categoria).filter(Boolean))];
    cats.forEach(cat => {
      const info = getCategoryInfo(cat);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn';
      btn.dataset.tlCat = cat;
      btn.dataset.generated = 'true';
      btn.textContent = `${info.emoji} ${info.label}`;
      refs.timelineFilterBar.appendChild(btn);
    });
  }

  // ============================================================
  //  Compare
  // ============================================================
  function initCompare() {
    if (!refs.compareLeft || !refs.compareRight || !Extras.Compare) return;
    const options = Extras.Compare.getAllForSelect();

    [refs.compareLeft, refs.compareRight].forEach((sel, idx) => {
      sel.innerHTML = '<option value="">Elige personaje...</option>';
      options.forEach(o => {
        sel.innerHTML += `<option value="${o.id}">${escapeHtml(o.nombre)}</option>`;
      });
      if (options[idx]) sel.value = options[idx].id;
    });

    renderComparison();
  }

  function renderComparison() {
    if (!refs.compareTable || !Extras.Compare) return;
    const id1 = refs.compareLeft?.value;
    const id2 = refs.compareRight?.value;

    if (!id1 || !id2 || id1 === id2) {
      refs.compareTable.innerHTML = '<p class="section-intro">Selecciona dos personajes diferentes para compararlos.</p>';
      return;
    }

    const data = Extras.Compare.getComparisonData(id1, id2);
    if (!data) return;

    const p1 = data.p1, p2 = data.p2;
    const img1 = getPortrait(getPersonajeById(id1), 64);
    const img2 = getPortrait(getPersonajeById(id2), 64);

    refs.compareTable.innerHTML = `
      <div class="compare-grid">
        <div class="compare-row">
          <div class="compare-cell">${img1 ? `<div class="compare-avatar"><img src="${img1}" alt="" width="64" height="64"></div>` : ''}</div>
          <div class="compare-label">Retrato</div>
          <div class="compare-cell">${img2 ? `<div class="compare-avatar"><img src="${img2}" alt="" width="64" height="64"></div>` : ''}</div>
        </div>
        <div class="compare-row">
          <div class="compare-cell"><span class="compare-name">${escapeHtml(p1.nombre)}</span></div>
          <div class="compare-label">Nombre</div>
          <div class="compare-cell"><span class="compare-name">${escapeHtml(p2.nombre)}</span></div>
        </div>
        <div class="compare-row">
          <div class="compare-cell"><span class="compare-value">${escapeHtml(p1.fechas)}</span></div>
          <div class="compare-label">Fechas</div>
          <div class="compare-cell"><span class="compare-value">${escapeHtml(p2.fechas)}</span></div>
        </div>
        <div class="compare-row">
          <div class="compare-cell"><span class="compare-value">${escapeHtml(p1.categoria)}</span></div>
          <div class="compare-label">Categoría</div>
          <div class="compare-cell"><span class="compare-value">${escapeHtml(p2.categoria)}</span></div>
        </div>
        <div class="compare-row">
          <div class="compare-cell"><span class="compare-value">${escapeHtml(p1.contexto)}</span></div>
          <div class="compare-label">País</div>
          <div class="compare-cell"><span class="compare-value">${escapeHtml(p2.contexto)}</span></div>
        </div>
        <div class="compare-row">
          <div class="compare-cell"><span class="compare-value">${p1.anosVividos} años</span></div>
          <div class="compare-label">Vida</div>
          <div class="compare-cell"><span class="compare-value">${p2.anosVividos} años</span></div>
        </div>
        <div class="compare-row">
          <div class="compare-cell"><span class="compare-value" style="font-style:italic">${escapeHtml(p1.frase)}</span></div>
          <div class="compare-label">Frase</div>
          <div class="compare-cell"><span class="compare-value" style="font-style:italic">${escapeHtml(p2.frase)}</span></div>
        </div>
        <div class="compare-row">
          <div class="compare-cell"><span class="compare-value">${escapeHtml(p1.logro)}</span></div>
          <div class="compare-label">Logro</div>
          <div class="compare-cell"><span class="compare-value">${escapeHtml(p2.logro)}</span></div>
        </div>
        <div class="compare-contemp">
          ${data.wereContemporaries
            ? `🤝 ¡Fueron contemporáneos! Coincidieron ${data.overlapYears} años.`
            : '📅 No fueron contemporáneos.'}
        </div>
      </div>
    `;
  }

  // ============================================================
  //  Search
  // ============================================================
  let searchTimeout = null;
  function handleSearch() {
    const query = refs.searchInput?.value || '';
    state.searchQuery = query;
    if (refs.searchClear) refs.searchClear.hidden = !query;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => renderPersonajesGrid(), 200);
  }

  // ============================================================
  //  Events
  // ============================================================
  function setupEvents() {
    // Navigation
    refs.navCards.forEach(card => {
      card.addEventListener('click', () => {
        const dest = card.dataset.goto;
        if (dest === 'quiz') { initQuizView(); }
        if (dest === 'timeline') { renderTimeline(); }
        if (dest === 'comparar') { initCompare(); }
        showView(dest);
      });
    });

    refs.btnHome?.addEventListener('click', () => showView('home'));
    refs.btnBackPersonajes?.addEventListener('click', () => showView('home'));
    refs.btnBackPersonaje?.addEventListener('click', () => showView('personajes'));
    refs.btnBackInstrucciones?.addEventListener('click', () => showView('home'));
    refs.btnBackConsejos?.addEventListener('click', () => showView('home'));
    refs.btnBackQuiz?.addEventListener('click', () => showView('home'));
    refs.btnBackTimeline?.addEventListener('click', () => showView('home'));
    refs.btnBackComparar?.addEventListener('click', () => showView('home'));
    refs.btnListPersonaje?.addEventListener('click', () => showView('personajes'));

    // Theme toggle
    refs.btnTheme?.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      applyDarkMode(!isDark);
    });

    // Surprise
    refs.btnSurprise?.addEventListener('click', () => {
      if (!Extras.getRandomUnvisited) return;
      const p = Extras.getRandomUnvisited();
      if (p) openPersonaje(p.id);
    });

    // Search
    refs.searchInput?.addEventListener('input', handleSearch);
    refs.searchClear?.addEventListener('click', () => {
      if (refs.searchInput) refs.searchInput.value = '';
      state.searchQuery = '';
      if (refs.searchClear) refs.searchClear.hidden = true;
      renderPersonajesGrid();
    });

    // Filter bar
    refs.filterBar?.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      state.activeCategory = btn.dataset.cat || 'todos';
      updateActiveFilterButton();
      renderPersonajesGrid();
    });

    // Grid clicks (cards + fav buttons)
    refs.grid?.addEventListener('click', e => {
      // Fav button
      const favBtn = e.target.closest('.card-fav-btn');
      if (favBtn && Extras.Progress) {
        e.stopPropagation();
        const id = favBtn.dataset.favId;
        Extras.Progress.toggleFavorite(id);
        renderPersonajesGrid();
        return;
      }
      // Card click
      const card = e.target.closest('[data-personaje-id]');
      if (card) openPersonaje(card.getAttribute('data-personaje-id'));
    });

    refs.grid?.addEventListener('keydown', e => {
      const card = e.target.closest('[data-personaje-id]');
      if (!card) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPersonaje(card.getAttribute('data-personaje-id'));
      }
    });

    // Prev/Next
    refs.btnPrevPersonaje?.addEventListener('click', () => {
      const idx = PERSONAJES.findIndex(p => Number(p.id) === Number(state.activePersonajeId));
      if (idx > 0) openPersonaje(PERSONAJES[idx - 1].id);
    });
    refs.btnNextPersonaje?.addEventListener('click', () => {
      const idx = PERSONAJES.findIndex(p => Number(p.id) === Number(state.activePersonajeId));
      if (idx >= 0 && idx < PERSONAJES.length - 1) openPersonaje(PERSONAJES[idx + 1].id);
    });

    // Quiz events
    refs.btnQuizStart?.addEventListener('click', startQuiz);
    refs.btnQuizClue?.addEventListener('click', () => {
      if (Extras.Quiz && Extras.Quiz.nextClue()) renderQuizRound();
    });
    refs.quizOptions?.addEventListener('click', e => {
      const btn = e.target.closest('.quiz-option-btn');
      if (btn && !btn.disabled) handleQuizAnswer(btn.dataset.optId);
    });

    // Timeline filter
    refs.timelineFilterBar?.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      refs.timelineFilterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTimeline(btn.dataset.tlCat || 'todos');
    });

    // Timeline bar clicks
    refs.timelineWrapper?.addEventListener('click', e => {
      const bar = e.target.closest('[data-personaje-id]');
      if (bar) openPersonaje(bar.dataset.personajeId);
    });

    // Compare selects
    refs.compareLeft?.addEventListener('change', renderComparison);
    refs.compareRight?.addEventListener('change', renderComparison);
  }

  // ============================================================
  //  Hero Animation
  // ============================================================
  function animateHeroWords() {
    const words = Array.from(document.querySelectorAll('#hero-title .word-anim'));
    words.forEach((word, i) => { word.style.animationDelay = `${i * 90}ms`; });
  }

  // ============================================================
  //  Init
  // ============================================================
  function init() {
    // Apply saved dark mode
    if (Extras.Progress && Extras.Progress.getDarkMode()) applyDarkMode(true);

    renderFilters();
    renderTimelineFilters();
    renderPersonajesGrid();
    updateProgressUI();

    if (PERSONAJES[0]) renderPersonajeDetail(PERSONAJES[0].id);

    animateHeroWords();
    setupEvents();
    showView('home');
  }

  init();
})();
