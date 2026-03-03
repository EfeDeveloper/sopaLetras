const CACHE_DURATION_MS = 3600000;

export class WordAPI {
  constructor() {
    this.wordsData = null;
    this.cacheKey = 'wordsCache';
    this.cacheDuration = CACHE_DURATION_MS;
  }

  async fetchWords(count = 14, language = 'es', options = {}) {
    const { difficulty } = options;

    try {
      const words = await this._fetchFromAPI(count, language, difficulty);
      
      if (words && words.length >= count) {
        return words.slice(0, count);
      }
    } catch (error) {
      console.warn('API fallback:', error.message);
    }

    return await this._fetchFromLocal(count, { difficulty });
  }

  async _fetchFromAPI(count, language, difficulty) {
    const lengthRange = this._getLengthRange(difficulty);
    const allWords = [];

    for (let length = lengthRange.min; length <= lengthRange.max; length++) {
      try {
        const response = await fetch(
          `https://random-word-api.herokuapp.com/word?lang=${language}&length=${length}&number=5`
        );
        
        if (response.ok) {
          const words = await response.json();
          if (words && words.length > 0) {
            allWords.push(...words);
          }
        }
      } catch (error) {
        console.warn(`API falló para longitud ${length}:`, error.message);
      }
      
      if (allWords.length >= count) break;
    }

    if (allWords.length > 0) {
      return this._shuffleArray(allWords);
    }

    throw new Error('El llamado a la API falló');
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

  _getLengthRange(difficulty) {
    switch (difficulty) {
      case 'easy':
        return { min: 3, max: 6 };
      case 'medium':
        return { min: 6, max: 9 };
      case 'hard':
        return { min: 9, max: 12 };
      default:
        return { min: 4, max: 8 };
    }
  }

  _filterByDifficulty(words, difficulty, count) {
    const range = this._getLengthRange(difficulty);
    const filtered = words.filter(w => w.length >= range.min && w.length <= range.max);
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
