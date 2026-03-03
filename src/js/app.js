import { WordAPI } from './WordAPI.js';
import { WordFindGame } from './WordFindGame.js';
import { Timer } from './Timer.js';
import { ScoreSystem } from './ScoreSystem.js';
import { Storage } from './Storage.js';
import { DarkMode } from './DarkMode.js';

(function forceCleanLocalStorage() {
  try {
    const cleanFlag = sessionStorage.getItem('storageCleanedOnce');
    
    if (!cleanFlag) {
      localStorage.clear();
      sessionStorage.setItem('storageCleanedOnce', 'true');
      return;
    }
    
    const keys = ['wordSearchSettings', 'wordSearchHistory', 'darkModeEnabled'];
    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          if (/[\uD800-\uDFFF\uFFFD]/.test(value)) {
            localStorage.removeItem(key);
            return;
          }
          if (key !== 'darkModeEnabled') {
            JSON.parse(value);
          } else if (value !== 'true' && value !== 'false') {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error crítico en limpieza de storage:', error);
    try {
      localStorage.clear();
    } catch (e) {
      console.error('No se puede acceder a localStorage');
    }
  }
})();

class WordSearchApp {
  constructor() {
    this.wordAPI = new WordAPI();
    this.timer = new Timer();
    this.storage = new Storage();
    this.darkMode = new DarkMode();
    this.scoreSystem = null;
    this.game = null;
    
    this.currentWords = [];
    this.isGameActive = false;
    
    this.elements = {
      difficultySelect: document.getElementById('difficulty'),
      newGameBtn: document.getElementById('newGame'),
      hintBtn: document.getElementById('hint'),
      solveBtn: document.getElementById('solve'),
      darkModeToggle: document.getElementById('darkModeToggle'),
      
      puzzleContainer: document.getElementById('puzzle'),
      wordsContainer: document.getElementById('words'),
      
      timerDisplay: document.getElementById('timer'),
      scoreDisplay: document.getElementById('score'),
      progressText: document.getElementById('progressText'),
      progressBar: document.getElementById('progressBar'),
      
      completionModal: document.getElementById('completionModal'),
      modalContent: document.getElementById('modalContent'),
      modalTitle: document.getElementById('modalTitle'),
      modalMessage: document.getElementById('modalMessage'),
      modalTime: document.getElementById('modalTime'),
      modalScore: document.getElementById('modalScore'),
      modalRating: document.getElementById('modalRating'),
      modalIcon: document.getElementById('modalIcon'),
      modalNewGameBtn: document.getElementById('modalNewGame'),
      
      loadingOverlay: document.getElementById('loadingOverlay')
    };

    this.init();
  }

  async init() {
    try {
      const missingElements = [];
      if (!this.elements.difficultySelect) missingElements.push('difficultySelect');
      if (!this.elements.newGameBtn) missingElements.push('newGameBtn');
      if (!this.elements.puzzleContainer) missingElements.push('puzzleContainer');
      if (!this.elements.wordsContainer) missingElements.push('wordsContainer');
      
      if (missingElements.length > 0) {
        throw new Error(`Elementos críticos no encontrados: ${missingElements.join(', ')}`);
      }
      
      this.darkMode.init();
      this.loadSettings();
      this.attachEventListeners();
      this.setupTimer();
      await this.startNewGame();
      
    } catch (error) {
      console.error('❌ Error al inicializar:', error);
      console.error('Stack:', error.stack);
      
      // Ocultar loading overlay para mostrar el error
      if (this.elements.loadingOverlay) {
        this.elements.loadingOverlay.classList.add('hidden');
      }
      
      // Intento de recuperación automática
      const shouldClear = confirm(
        'Error al inicializar el juego.\\n\\n' +
        'Error: ' + error.message + '\\n\\n' +
        '¿Deseas limpiar el caché completamente y reintentar?'
      );
      
      if (shouldClear) {
        try {
          console.log('🧹 Limpiando localStorage y sessionStorage...');
          localStorage.clear();
          sessionStorage.clear();
          console.log('✅ Caché limpiado, recargando...');
          window.location.reload();
        } catch (e) {
          console.error('❌ Error al limpiar:', e);
          alert('No se pudo limpiar el caché. Por favor, cierra esta pestaña y abre una nueva ventana en modo incógnito.');
        }
      }
    }
  }

  clearAllCache() {
    try {
      this.storage.clearSettings();
      this.storage.clearHistory();
      this.darkMode.disable();
      
      alert('✅ Caché limpiado exitosamente. Recargando la página...');
      window.location.reload();
    } catch (error) {
      console.error('Error al limpiar caché:', error);
      alert('❌ Error al limpiar el caché. Intenta de nuevo.');
    }
  }

  loadSettings() {
    try {
      if (!this.elements.difficultySelect) {
        return;
      }

      const settings = this.storage.getSettings();
      
      if (settings && settings.difficulty) {
        this.elements.difficultySelect.value = settings.difficulty;
      }
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
    }
  }

  saveSettings() {
    this.storage.saveSettings({
      difficulty: this.elements.difficultySelect.value
    });
  }

  attachEventListeners() {
    this.elements.newGameBtn.addEventListener('click', () => {
      this.startNewGame();
    });

    this.elements.hintBtn.addEventListener('click', () => {
      if (this.game && this.isGameActive) {
        const state = this.game.getState();
        if (state.remaining === 0) {
          this.showError('¡Ya encontraste todas las palabras!');
          return;
        }
        
        const hint = this.game.getHint();
        if (hint) {
          this.scoreSystem.addPenalty(50);
          this.updateScore();
          this.showHintAnimation(hint);
        } else {
          this.showError('No se pudo obtener una pista. Intenta de nuevo.');
        }
      }
    });

    this.elements.solveBtn.addEventListener('click', () => {
      if (this.game && this.isGameActive) {
        if (confirm('¿Estás seguro? Esto te costará 500 puntos y completará el puzzle automáticamente.')) {
          this.scoreSystem.addPenalty(500);
          this.updateScore();
          this.game.solve();
          
          const resolveMsg = document.createElement('div');
          resolveMsg.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-8 py-4 rounded-lg shadow-2xl text-xl font-bold z-50 animate-pulse';
          resolveMsg.innerHTML = '🔍 Resolviendo puzzle... (-500 pts)';
          document.body.appendChild(resolveMsg);
          
          setTimeout(() => {
            resolveMsg.remove();
          }, 2000);
        }
      }
    });

    this.elements.darkModeToggle.addEventListener('click', () => {
      this.darkMode.toggle();
    });

    this.elements.modalNewGameBtn.addEventListener('click', () => {
      this.hideCompletionModal();
      this.startNewGame();
    });

    this.elements.completionModal.addEventListener('click', (e) => {
      if (e.target === this.elements.completionModal) {
        this.hideCompletionModal();
      }
    });

    this.elements.difficultySelect.addEventListener('change', () => {
      this.saveSettings();
    });
  }

  setupTimer() {
    this.timer.onChange((timeData) => {
      this.elements.timerDisplay.textContent = timeData.formatted;
      
      if (this.isGameActive) {
        this.updateScore();
      }
    });
  }

  getGridSize(difficulty) {
    switch (difficulty) {
      case 'easy':
        return 12;
      case 'medium':
        return 15;
      case 'hard':
        return 17;
      default:
        return 15;
    }
  }

  async startNewGame() {
    try {
      this.showLoading();
      
      const difficulty = this.elements.difficultySelect.value;
      const gridSize = this.getGridSize(difficulty);
      
      if (this.game) {
        this.game.destroy();
      }
      
      this.timer.reset();
      this.scoreSystem = new ScoreSystem(difficulty);
      
      this.currentWords = await this.wordAPI.fetchWords(14, 'es', {
        difficulty
      });

      if (!this.currentWords || this.currentWords.length === 0) {
        throw new Error('No se pudieron obtener palabras');
      }

      this.game = new WordFindGame(
        this.currentWords,
        '#puzzle',
        '#words',
        { size: gridSize }
      );

      this.scoreSystem.setTotalWords(this.currentWords.length);
      
      this.game.on('wordFound', (data) => {
        this.onWordFound(data);
      });

      this.game.on('complete', (data) => {
        this.onGameComplete(data);
      });

      this.game.on('selectionChange', (data) => {});

      this.timer.start();
      this.isGameActive = true;
      
      this.updateProgress();
      this.updateScore();
      
      this.hideLoading();
      
    } catch (error) {
      console.error('Error al iniciar nuevo juego:', error);
      this.hideLoading();
      this.showError('Error al cargar el juego. Intentando con palabras locales...');
      
      setTimeout(() => {
        this.startNewGame();
      }, 2000);
    }
  }

  onWordFound(data) {
    const points = this.scoreSystem.addWord(data.word);
    this.updateScore();
    this.updateProgress();
    
    this.showWordFoundAnimation(data.word, points);
  }

  /**
   * Maneja cuando el juego se completa
   */
  onGameComplete(data) {
    this.timer.stop();
    this.isGameActive = false;
    
    const timeInSeconds = this.timer.getElapsedSeconds();
    const finalScore = this.scoreSystem.getTotalScore(timeInSeconds);
    const rating = this.scoreSystem.getRating();
    
    // Guardar juego en historial
    this.storage.saveGame({
      score: finalScore,
      difficulty: this.elements.difficultySelect.value,
      timeInSeconds: timeInSeconds,
      wordsFound: data.words,
      wordsTotal: data.total,
      completed: true,
      usedSolve: data.solved || false
    });

    // Mostrar modal de completado
    setTimeout(() => {
      this.showCompletionModal(timeInSeconds, finalScore, rating, data.solved);
    }, 1000);
  }

  /**
   * Actualiza el progreso
   */
  updateProgress() {
    const state = this.game.getState();
    const percentage = state.words.length > 0 
      ? (state.solved.length / state.words.length) * 100 
      : 0;
    
    this.elements.progressText.textContent = `${state.solved.length}/${state.words.length}`;
    this.elements.progressBar.style.width = `${percentage}%`;
  }

  /**
   * Actualiza el puntaje
   */
  updateScore() {
    const timeInSeconds = this.timer.getElapsedSeconds();
    const score = this.scoreSystem.getTotalScore(timeInSeconds);
    this.elements.scoreDisplay.textContent = score.toLocaleString();
  }

  /**
   * Muestra el modal de juego completado
   */
  showCompletionModal(time, score, rating, wasSolved) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Configurar contenido del modal
    if (wasSolved) {
      this.elements.modalIcon.textContent = '🤔';
      this.elements.modalTitle.textContent = 'Puzzle Resuelto';
      this.elements.modalMessage.textContent = 'Usaste la ayuda para resolver el puzzle';
    } else {
      this.elements.modalIcon.textContent = '🎉';
      this.elements.modalTitle.textContent = '¡Felicitaciones!';
      this.elements.modalMessage.textContent = 'Has completado el puzzle exitosamente';
    }
    
    this.elements.modalTime.textContent = timeStr;
    this.elements.modalScore.textContent = score.toLocaleString();
    this.elements.modalRating.textContent = '⭐'.repeat(rating.stars);
    
    // Mostrar modal con animación
    this.elements.completionModal.classList.remove('hidden');
    this.elements.completionModal.classList.add('flex');
    
    setTimeout(() => {
      this.elements.modalContent.style.transform = 'scale(1)';
      this.elements.modalContent.style.opacity = '1';
    }, 10);
  }

  /**
   * Oculta el modal de completado
   */
  hideCompletionModal() {
    this.elements.modalContent.style.transform = 'scale(0.95)';
    this.elements.modalContent.style.opacity = '0';
    
    setTimeout(() => {
      this.elements.completionModal.classList.add('hidden');
      this.elements.completionModal.classList.remove('flex');
    }, 300);
  }

  /**
   * Muestra el overlay de carga
   */
  showLoading() {
    this.elements.loadingOverlay.classList.remove('hidden');
    this.elements.loadingOverlay.classList.add('flex');
  }

  /**
   * Oculta el overlay de carga
   */
  hideLoading() {
    this.elements.loadingOverlay.classList.add('hidden');
    this.elements.loadingOverlay.classList.remove('flex');
  }

  /**
   * Muestra un error
   */
  showError(message) {
    // Implementación simple - se puede mejorar con un toast o notificación
    alert(message);
  }

  /**
   * Animación cuando se encuentra una palabra
   */
  showWordFoundAnimation(word, points) {
    // Crear elemento de animación
    const animation = document.createElement('div');
    animation.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl text-xl font-bold z-50 animate-bounce';
    animation.textContent = `+${points} pts`;
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
      animation.remove();
    }, 1000);
  }

  /**
   * Animación cuando se usa una pista
   */
  showHintAnimation(hint) {
    // Crear un pequeño toast discreto en lugar de modal invasivo
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg shadow-lg text-sm font-semibold z-50 flex items-center gap-2';
    toast.innerHTML = `
      <span>💡</span>
      <span>-50 pts</span>
    `;
    
    document.body.appendChild(toast);
    
    // Desvanecer después de 2 segundos
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    window.wordSearchApp = new WordSearchApp();
  } catch (error) {
    console.error('Error crítico al iniciar la aplicación:', error);
    
    alert(
      'Error crítico al cargar la aplicación.\\n\\n' +
      'Error: ' + error.message + '\\n\\n' +
      'Por favor, abre la consola (F12) y comparte la información.'
    );
  }
});

export default WordSearchApp;
