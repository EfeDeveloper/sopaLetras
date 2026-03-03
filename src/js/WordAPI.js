const CACHE_DURATION_MS = 3600000;

export class WordAPI {
  constructor() {
    this.wordsData = null;
    this.cacheKey = 'wordsCache';
    this.cacheDuration = CACHE_DURATION_MS;
  }

  async fetchWords(count = 15, language = 'es', options = {}) {
    const { difficulty } = options;

    try {
      const words = await this._fetchFromAPI(count * 3, language);
      
      if (words && words.length > 0) {
        const filtered = difficulty 
          ? this._filterByDifficulty(words, difficulty, count)
          : words.slice(0, count);
        
        if (filtered.length >= count) {
          return filtered;
        }
      }
    } catch (error) {
      console.warn('API fallback:', error.message);
    }

    return await this._fetchFromLocal(count, { difficulty });
  }

  async _fetchFromAPI(count, language) {
    const cached = this._getFromSessionCache();
    if (cached) {
      return this._shuffleArray(cached).slice(0, count);
    }

    try {
      const response = await fetch(
        `https://random-word-api.herokuapp.com/word?lang=${language}&number=${count * 2}`
      );
      
      if (!response.ok) throw new Error('API primaria no disponible');
      
      const words = await response.json();
      
      if (words && words.length > 0) {
        this._saveToSessionCache(words);
        return words;
      }
    } catch (error) {
      console.warn('API primaria falló:', error.message);
    }

    try {
      const response = await fetch(
        `https://clientes.api.greenborn.com.ar/public-random-word?cant=${count * 2}&l=${language}`
      );
      
      if (!response.ok) throw new Error('API secundaria no disponible');
      
      const data = await response.json();
      const words = Array.isArray(data) ? data : data.words || [];
      
      if (words.length > 0) {
        this._saveToSessionCache(words);
        return words;
      }
    } catch (error) {
      console.warn('API secundaria falló:', error.message);
    }

    throw new Error('Todas las APIs fallaron');
  }

  async _fetchFromLocal(count, options = {}) {
    const { difficulty } = options;

    if (!this.wordsData) {
      try {
        const response = await fetch('../src/data/words.json');
        this.wordsData = await response.json();
      } catch (error) {
        console.error('Error al cargar palabras locales:', error);
        return this._getEmergencyWords(count);
      }
    }

    let words = [];

    if (difficulty && this.wordsData.difficulty && this.wordsData.difficulty[difficulty]) {
      words = this.wordsData.difficulty[difficulty];
    } else {
      const allWords = Object.values(this.wordsData.categories).flat();
      words = difficulty 
        ? this._filterByDifficulty(allWords, difficulty, count * 2)
        : allWords;
    }

    return this._shuffleArray(words).slice(0, count);
  }

  _filterByDifficulty(words, difficulty, count) {
    let filtered = [];

    switch (difficulty) {
      case 'easy':
        filtered = words.filter(w => w.length >= 3 && w.length <= 6);
        break;
      case 'medium':
        filtered = words.filter(w => w.length >= 7 && w.length <= 10);
        break;
      case 'hard':
        filtered = words.filter(w => w.length >= 11);
        break;
      default:
        filtered = words;
    }

    return this._shuffleArray(filtered).slice(0, count);
  }

  _shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  _getFromSessionCache() {
    try {
      const cached = sessionStorage.getItem(this.cacheKey);
      if (cached) {
        const { words, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        if (now - timestamp < this.cacheDuration) {
          return words;
        }
      }
    } catch (error) {
      console.warn('Error al leer caché:', error);
    }
    return null;
  }

  _saveToSessionCache(words) {
    try {
      const data = {
        words,
        timestamp: Date.now()
      };
      sessionStorage.setItem(this.cacheKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Error al guardar caché:', error);
    }
  }

  _getEmergencyWords(count) {
    const emergency = [
      'sol', 'luna', 'estrella', 'mar', 'río',
      'casa', 'árbol', 'flor', 'montaña', 'cielo',
      'agua', 'fuego', 'tierra', 'aire', 'viento',
      'nube', 'lluvia', 'nieve', 'día', 'noche'
    ];
    return this._shuffleArray(emergency).slice(0, count);
  }

  async getCategories() {
    if (!this.wordsData) {
      await this._fetchFromLocal(1);
    }
    return Object.keys(this.wordsData?.categories || {});
  }

  getDifficultyLevels() {
    return [
      { value: 'easy', label: 'Fácil (3-6 letras)', description: 'Palabras cortas y sencillas' },
      { value: 'medium', label: 'Medio (7-10 letras)', description: 'Palabras de longitud moderada' },
      { value: 'hard', label: 'Difícil (11+ letras)', description: 'Palabras largas y complejas' }
    ];
  }

  clearCache() {
    try {
      sessionStorage.removeItem(this.cacheKey);
    } catch (error) {
      console.warn('Error al limpiar caché:', error);
    }
  }
}
