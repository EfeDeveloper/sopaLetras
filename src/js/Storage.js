const MAX_HISTORY_ITEMS = 50;

export class Storage {
  constructor() {
    this.historyKey = 'wordSearchHistory';
    this.settingsKey = 'wordSearchSettings';
    this.maxHistoryItems = MAX_HISTORY_ITEMS;
  }

  saveGame(gameData) {
    try {
      const history = this.getHistory();
      
      const game = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        score: gameData.score || 0,
        difficulty: gameData.difficulty || 'medium',
        category: gameData.category || 'general',
        timeInSeconds: gameData.timeInSeconds || 0,
        wordsFound: gameData.wordsFound || 0,
        wordsTotal: gameData.wordsTotal || 0,
        completed: gameData.completed || false,
        usedHints: gameData.usedHints || false,
        usedSolve: gameData.usedSolve || false
      };

      history.unshift(game);

      if (history.length > this.maxHistoryItems) {
        history.splice(this.maxHistoryItems);
      }

      localStorage.setItem(this.historyKey, JSON.stringify(history));
      return game;
    } catch (error) {
      console.error('Error al guardar juego:', error);
      return null;
    }
  }

  getHistory() {
    try {
      const history = localStorage.getItem(this.historyKey);
      if (!history) {
        return [];
      }
      return JSON.parse(history);
    } catch (error) {
      console.error('Error al leer historial, limpiando...', error);
      this.clearHistory();
      return [];
    }
  }

  getBestScore(difficulty = null) {
    const history = this.getHistory();
    
    let filtered = history;
    if (difficulty) {
      filtered = history.filter(game => game.difficulty === difficulty);
    }

    if (filtered.length === 0) return 0;

    return Math.max(...filtered.map(game => game.score));
  }

  getBestTime(difficulty = null) {
    const history = this.getHistory();
    
    let filtered = history.filter(game => game.completed);
    if (difficulty) {
      filtered = filtered.filter(game => game.difficulty === difficulty);
    }

    if (filtered.length === 0) return null;

    return Math.min(...filtered.map(game => game.timeInSeconds));
  }

  getTotalGamesPlayed(difficulty = null) {
    const history = this.getHistory();
    
    if (difficulty) {
      return history.filter(game => game.difficulty === difficulty).length;
    }
    
    return history.length;
  }

  getTotalGamesCompleted(difficulty = null) {
    const history = this.getHistory();
    
    let filtered = history.filter(game => game.completed);
    if (difficulty) {
      filtered = filtered.filter(game => game.difficulty === difficulty);
    }
    
    return filtered.length;
  }

  getAverageTime(difficulty = null) {
    const history = this.getHistory();
    
    let filtered = history.filter(game => game.completed);
    if (difficulty) {
      filtered = filtered.filter(game => game.difficulty === difficulty);
    }

    if (filtered.length === 0) return 0;

    const totalTime = filtered.reduce((sum, game) => sum + game.timeInSeconds, 0);
    return Math.floor(totalTime / filtered.length);
  }

  getStatistics() {
    const history = this.getHistory();
    
    if (history.length === 0) {
      return {
        totalGames: 0,
        totalCompleted: 0,
        bestScores: { easy: 0, medium: 0, hard: 0 },
        bestTimes: { easy: null, medium: null, hard: null },
        averageTimes: { easy: 0, medium: 0, hard: 0 },
        completionRate: 0
      };
    }

    return {
      totalGames: this.getTotalGamesPlayed(),
      totalCompleted: this.getTotalGamesCompleted(),
      bestScores: {
        easy: this.getBestScore('easy'),
        medium: this.getBestScore('medium'),
        hard: this.getBestScore('hard')
      },
      bestTimes: {
        easy: this.getBestTime('easy'),
        medium: this.getBestTime('medium'),
        hard: this.getBestTime('hard')
      },
      averageTimes: {
        easy: this.getAverageTime('easy'),
        medium: this.getAverageTime('medium'),
        hard: this.getAverageTime('hard')
      },
      completionRate: Math.floor(
        (this.getTotalGamesCompleted() / this.getTotalGamesPlayed()) * 100
      )
    };
  }

  /**
   * Guarda configuraciones del usuario
   */
  saveSettings(settings) {
    try {
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      localStorage.setItem(this.settingsKey, JSON.stringify(newSettings));
      return newSettings;
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
      return null;
    }
  }

  /**
   * Obtiene configuraciones del usuario
   */
  getSettings() {
    try {
      const settings = localStorage.getItem(this.settingsKey);
      if (!settings) {
        return this.getDefaultSettings();
      }
      
      const parsed = JSON.parse(settings);
      // Asegurar que todas las propiedades existan
      return {
        ...this.getDefaultSettings(),
        ...parsed
      };
    } catch (error) {
      console.error('❌ Error al leer configuraciones, reiniciando...', error);
      // Si hay error de parsing, limpiar y devolver default
      this.clearSettings();
      return this.getDefaultSettings();
    }
  }

  /**
   * Obtiene configuraciones por defecto
   */
  getDefaultSettings() {
    return {
      darkMode: false,
      soundEnabled: true,
      difficulty: 'medium',
      category: 'general',
      language: 'es'
    };
  }

  /**
   * Limpia las configuraciones
   */
  clearSettings() {
    try {
      localStorage.removeItem(this.settingsKey);
      return true;
    } catch (error) {
      console.error('Error al limpiar configuraciones:', error);
      return false;
    }
  }

  /**
   * Limpia el historial
   */
  clearHistory() {
    try {
      localStorage.removeItem(this.historyKey);
      return true;
    } catch (error) {
      console.error('Error al limpiar historial:', error);
      return false;
    }
  }

  /**
   * Limpia las configuraciones
   */
  clearSettings() {
    try {
      localStorage.removeItem(this.settingsKey);
      return true;
    } catch (error) {
      console.error('Error al limpiar configuraciones:', error);
      return false;
    }
  }

  /**
   * Limpia todo el almacenamientolocal
   */
  clearAll() {
    return this.clearHistory() && this.clearSettings();
  }

  /**
   * Exporta datos (para backup)
   */
  exportData() {
    return {
      history: this.getHistory(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Importa datos (desde backup)
   */
  importData(data) {
    try {
      if (data.history) {
        localStorage.setItem(this.historyKey, JSON.stringify(data.history));
      }
      if (data.settings) {
        localStorage.setItem(this.settingsKey, JSON.stringify(data.settings));
      }
      return true;
    } catch (error) {
      console.error('Error al importar datos:', error);
      return false;
    }
  }
}
