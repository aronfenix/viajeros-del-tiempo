// extras.js — Feature modules: Progress, Search, Quiz, Timeline, Connections, Compare
// Proyecto "Viajeros del Tiempo" · 6º Primaria

const ViajerosExtras = (() => {
  'use strict';

  const STORAGE_KEY = 'viajeros_del_tiempo';
  const PERSONAJES = window.PERSONAJES || [];
  const CATEGORIAS = window.CATEGORIAS || {};

  // ============================================================
  //  PROGRESS — localStorage persistence
  // ============================================================
  const Progress = {
    data: null,

    load() {
      try {
        this.data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || this.defaults();
      } catch { this.data = this.defaults(); }
    },

    defaults() {
      return { viewed: [], favorites: [], quizHighScore: 0, darkMode: false };
    },

    save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); } catch {}
    },

    markViewed(id) {
      id = Number(id);
      if (!this.data.viewed.includes(id)) {
        this.data.viewed.push(id);
        this.save();
      }
    },

    toggleFavorite(id) {
      id = Number(id);
      const idx = this.data.favorites.indexOf(id);
      if (idx === -1) { this.data.favorites.push(id); }
      else { this.data.favorites.splice(idx, 1); }
      this.save();
      return idx === -1;
    },

    isFavorite(id) { return this.data.favorites.includes(Number(id)); },
    isViewed(id) { return this.data.viewed.includes(Number(id)); },

    getProgress() {
      return { viewed: this.data.viewed.length, total: PERSONAJES.length };
    },

    setDarkMode(on) { this.data.darkMode = !!on; this.save(); },
    getDarkMode() { return !!this.data.darkMode; },

    setQuizHighScore(score) {
      if (score > (this.data.quizHighScore || 0)) {
        this.data.quizHighScore = score;
        this.save();
      }
    },
    getQuizHighScore() { return this.data.quizHighScore || 0; }
  };

  // ============================================================
  //  SEARCH — accent-normalized text search
  // ============================================================
  const Search = {
    normalize(str) {
      return String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },

    search(query) {
      if (!query || query.trim().length < 2) return null;
      const q = this.normalize(query.trim());
      return PERSONAJES.filter(p => {
        const haystack = [
          p.nombre, p.frase, p.quien, p.importancia, p.contexto,
          ...(p.datosCuriosos || []), ...(p.ideasExposicion || [])
        ].join(' ');
        return this.normalize(haystack).includes(q);
      });
    }
  };

  // ============================================================
  //  CONNECTIONS — contemporaries
  // ============================================================
  const Connections = {
    findContemporaries(personaje) {
      if (!personaje || !personaje.nacimiento) return [];
      const b = personaje.nacimiento, d = personaje.muerte;
      return PERSONAJES
        .filter(p => p.id !== personaje.id && p.nacimiento && p.nacimiento <= d && p.muerte >= b)
        .map(p => ({
          id: p.id,
          nombre: p.nombre,
          emoji: p.emoji,
          categoria: p.categoria,
          fechas: p.fechas,
          overlapYears: Math.min(d, p.muerte) - Math.max(b, p.nacimiento)
        }))
        .sort((a, b) => b.overlapYears - a.overlapYears)
        .slice(0, 6);
    }
  };

  // ============================================================
  //  QUIZ — "¿Quién soy?" game
  // ============================================================
  const Quiz = {
    state: null,

    start(numRounds) {
      numRounds = Math.min(numRounds || 10, PERSONAJES.length);
      const shuffled = [...PERSONAJES].sort(() => Math.random() - 0.5);
      this.state = {
        rounds: shuffled.slice(0, numRounds),
        currentRound: 0,
        currentClue: 0,
        score: 0,
        maxScore: numRounds * 4,
        answers: [],
        finished: false
      };
      return this.state;
    },

    getCurrentRound() {
      if (!this.state || this.state.finished) return null;
      const personaje = this.state.rounds[this.state.currentRound];
      if (!personaje) return null;
      return {
        roundNum: this.state.currentRound + 1,
        totalRounds: this.state.rounds.length,
        clueNum: this.state.currentClue,
        clue: this._getClue(personaje, this.state.currentClue),
        options: this._getOptions(personaje),
        score: this.state.score,
        maxPossible: this.state.maxScore,
        personajeId: personaje.id
      };
    },

    _getClue(personaje, idx) {
      const clues = [];
      // Clue 0 (hardest): random dato curioso
      const curiosos = personaje.datosCuriosos || [];
      clues.push(curiosos[Math.floor(Math.random() * curiosos.length)] || personaje.importancia);
      // Clue 1: first sentence of importancia
      clues.push((personaje.importancia || '').split('.')[0] + '.');
      // Clue 2: first sentence of quien
      clues.push((personaje.quien || '').split('.')[0] + '.');
      // Clue 3 (easiest): context + category + dates
      const catLabel = (CATEGORIAS[personaje.categoria] || {}).label || personaje.categoria;
      clues.push(`Pertenece al grupo de ${catLabel}. Vivió en ${personaje.contexto}. Fechas: ${personaje.fechas}.`);

      return clues[Math.min(idx, 3)] || clues[0];
    },

    _getOptions(correct) {
      // Get distractors: prefer same category, fallback to same era
      const sameCat = PERSONAJES.filter(p => p.id !== correct.id && p.categoria === correct.categoria);
      const sameEra = PERSONAJES.filter(p => {
        if (p.id === correct.id) return false;
        if (!p.nacimiento || !correct.nacimiento) return false;
        return Math.abs(p.nacimiento - correct.nacimiento) < 80;
      });

      const pool = [...new Set([...sameCat, ...sameEra])].filter(p => p.id !== correct.id);
      const shuffledPool = pool.sort(() => Math.random() - 0.5);
      const distractors = shuffledPool.slice(0, 3);

      // If not enough distractors, add random
      while (distractors.length < 3) {
        const random = PERSONAJES[Math.floor(Math.random() * PERSONAJES.length)];
        if (random.id !== correct.id && !distractors.find(d => d.id === random.id)) {
          distractors.push(random);
        }
      }

      const options = [
        { id: correct.id, nombre: correct.nombre, correct: true },
        ...distractors.map(d => ({ id: d.id, nombre: d.nombre, correct: false }))
      ];

      return options.sort(() => Math.random() - 0.5);
    },

    answer(selectedId) {
      if (!this.state || this.state.finished) return null;
      const personaje = this.state.rounds[this.state.currentRound];
      const isCorrect = Number(selectedId) === Number(personaje.id);
      const points = isCorrect ? (4 - this.state.currentClue) : 0;
      this.state.score += points;

      const result = {
        correct: isCorrect,
        correctId: personaje.id,
        correctName: personaje.nombre,
        points,
        cluesUsed: this.state.currentClue + 1
      };

      this.state.answers.push(result);
      this.state.currentRound++;
      this.state.currentClue = 0;

      if (this.state.currentRound >= this.state.rounds.length) {
        this.state.finished = true;
        Progress.setQuizHighScore(this.state.score);
      }

      return result;
    },

    nextClue() {
      if (!this.state || this.state.finished) return false;
      if (this.state.currentClue < 3) {
        this.state.currentClue++;
        return true;
      }
      return false;
    },

    getResults() {
      if (!this.state) return null;
      const s = this.state;
      let message = '';
      const pct = s.score / s.maxScore;
      if (pct >= 0.9) message = '¡Increíble! Eres un auténtico viajero del tiempo.';
      else if (pct >= 0.7) message = '¡Muy bien! Conoces a muchos personajes de la Edad Moderna.';
      else if (pct >= 0.5) message = '¡Buen trabajo! Sigue explorando para mejorar.';
      else if (pct >= 0.3) message = 'No está mal, pero puedes aprender más. ¡Visita las fichas!';
      else message = '¡Ánimo! Lee algunas fichas y vuelve a intentarlo.';

      return {
        score: s.score,
        maxScore: s.maxScore,
        percentage: Math.round(pct * 100),
        highScore: Progress.getQuizHighScore(),
        message,
        answers: s.answers,
        finished: s.finished
      };
    }
  };

  // ============================================================
  //  TIMELINE — data preparation
  // ============================================================
  const Timeline = {
    YEAR_START: 1390,
    YEAR_END: 1840,

    getTimelineData(category) {
      let list = PERSONAJES.filter(p => p.nacimiento && p.muerte);
      if (category && category !== 'todos') {
        list = list.filter(p => p.categoria === category);
      }
      return list.sort((a, b) => a.nacimiento - b.nacimiento);
    },

    getYearMarkers() {
      const markers = [];
      for (let y = 1400; y <= 1830; y += 50) {
        markers.push(y);
      }
      return markers;
    },

    getYearPosition(year) {
      return ((year - this.YEAR_START) / (this.YEAR_END - this.YEAR_START)) * 100;
    },

    getBarHeight(birth, death) {
      return ((death - birth) / (this.YEAR_END - this.YEAR_START)) * 100;
    }
  };

  // ============================================================
  //  COMPARE — side-by-side character comparison
  // ============================================================
  const Compare = {
    getComparisonData(id1, id2) {
      const p1 = PERSONAJES.find(p => Number(p.id) === Number(id1));
      const p2 = PERSONAJES.find(p => Number(p.id) === Number(id2));
      if (!p1 || !p2) return null;

      const overlap = (p1.nacimiento && p2.nacimiento)
        ? Math.max(0, Math.min(p1.muerte, p2.muerte) - Math.max(p1.nacimiento, p2.nacimiento))
        : 0;

      return {
        p1: this._extract(p1),
        p2: this._extract(p2),
        wereContemporaries: overlap > 0,
        overlapYears: overlap
      };
    },

    _extract(p) {
      const catInfo = CATEGORIAS[p.categoria] || {};
      return {
        id: p.id,
        nombre: p.nombre,
        emoji: p.emoji,
        fechas: p.fechas,
        contexto: p.contexto,
        categoria: catInfo.label || p.categoria,
        categoriaKey: p.categoria,
        frase: p.frase,
        anosVividos: (p.muerte && p.nacimiento) ? (p.muerte - p.nacimiento) : '?',
        logro: (p.importancia || '').split('.')[0] + '.'
      };
    },

    getAllForSelect() {
      return PERSONAJES.map(p => ({ id: p.id, nombre: p.nombre }));
    }
  };

  // ============================================================
  //  SURPRISE — random unvisited character
  // ============================================================
  function getRandomUnvisited() {
    const unvisited = PERSONAJES.filter(p => !Progress.isViewed(p.id));
    if (unvisited.length === 0) {
      return PERSONAJES[Math.floor(Math.random() * PERSONAJES.length)];
    }
    return unvisited[Math.floor(Math.random() * unvisited.length)];
  }

  // ============================================================
  //  INIT
  // ============================================================
  Progress.load();

  return {
    Progress,
    Search,
    Connections,
    Quiz,
    Timeline,
    Compare,
    getRandomUnvisited
  };
})();

window.ViajerosExtras = ViajerosExtras;
