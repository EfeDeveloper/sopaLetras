import { PuzzleGenerator } from './PuzzleGenerator.js';

const DEFAULT_SIZE = 15;
const HINT_DURATION = 3000;
const COMPLETE_DELAY = 500;

export class WordFindGame {
  constructor(words, puzzleSelector, wordsSelector, options = {}) {
    this.originalWords = words.map(w => w.trim());
    this.words = words.map(w => w.toUpperCase().replace(/\s+/g, '').trim());
    
    this.wordMap = {};
    this.words.forEach((normalized, index) => {
      this.wordMap[normalized] = this.originalWords[index];
    });
    
    this.puzzleEl = document.querySelector(puzzleSelector);
    this.wordsEl = document.querySelector(wordsSelector);
    this.options = options;
    this.size = options.size || DEFAULT_SIZE;
    
    this.generator = new PuzzleGenerator();
    this.puzzle = null;
    this.puzzleData = null;
    this.solved = [];
    this.selectedSquares = [];
    this.currentWord = '';
    this.isSelecting = false;
    this.touchDevice = 'ontouchstart' in window;
    
    this.eventHandlers = {
      wordFound: [],
      complete: [],
      selectionChange: []
    };

    if (!this.puzzleEl || !this.wordsEl) {
      throw new Error('Elementos del puzzle o palabras no encontrados');
    }

    this.init();
  }

  init() {
    try {
      this.puzzleData = this.generator.generate(this.words, this.size);
      this.puzzle = this.puzzleData.grid;

      this.drawPuzzle();
      this.drawWords();
      this.attachEvents();
    } catch (error) {
      console.error('Error al inicializar el juego:', error);
      throw error;
    }
  }

  drawPuzzle() {
    const puzzleContainer = document.createElement('div');
    puzzleContainer.className = 'puzzle-container';
    puzzleContainer.style.display = 'grid';
    puzzleContainer.style.gridTemplateColumns = `repeat(${this.puzzle.length}, 1fr)`;
    puzzleContainer.style.gap = '1px';
    puzzleContainer.style.maxWidth = '100%';
    puzzleContainer.style.margin = '0 auto';
    puzzleContainer.style.justifyContent = 'center';

    const VALID_LETTERS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    const letterRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]$/;

    for (let i = 0; i < this.puzzle.length; i++) {
      for (let j = 0; j < this.puzzle[i].length; j++) {
        let letter = this.puzzle[i][j];
        
        if (!letterRegex.test(letter)) {
          letter = VALID_LETTERS[Math.floor(Math.random() * VALID_LETTERS.length)];
        }
        
        const square = document.createElement('div');
        
        square.className = 'puzzle-square';
        square.textContent = letter.toUpperCase();
        square.dataset.row = i;
        square.dataset.col = j;
        square.dataset.letter = letter.toUpperCase();
        
        puzzleContainer.appendChild(square);
      }
    }

    this.puzzleEl.innerHTML = '';
    this.puzzleEl.appendChild(puzzleContainer);
  }

  drawWords() {
    const wordsList = document.createElement('div');
    wordsList.className = 'words-list columns-2 gap-4';

    this.originalWords.forEach((originalWord, index) => {
      const wordItem = document.createElement('div');
      wordItem.className = 'word-item';
      wordItem.textContent = originalWord;
      wordItem.dataset.word = this.words[index];
      wordItem.dataset.original = originalWord;
      wordsList.appendChild(wordItem);
    });

    this.wordsEl.innerHTML = '';
    this.wordsEl.appendChild(wordsList);
  }

  attachEvents() {
    const squares = this.puzzleEl.querySelectorAll('.puzzle-square');

    if (this.touchDevice) {
      squares.forEach(square => {
        square.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      });
      document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    } else {
      squares.forEach(square => {
        square.addEventListener('mousedown', this.handleMouseDown.bind(this));
        square.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
      });
      document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
  }

  handleMouseDown(event) {
    event.preventDefault();
    this.isSelecting = true;
    this.clearSelection();
    this.selectSquare(event.target);
  }

  handleMouseEnter(event) {
    if (this.isSelecting) {
      this.selectSquare(event.target);
    }
  }

  handleMouseUp(event) {
    if (this.isSelecting) {
      this.isSelecting = false;
      this.checkWord();
    }
  }

  handleTouchStart(event) {
    event.preventDefault();
    this.isSelecting = true;
    this.clearSelection();
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('puzzle-square')) {
      this.selectSquare(element);
    }
  }

  /**
   * Maneja el evento touchmove
   */
  handleTouchMove(event) {
    event.preventDefault();
    if (this.isSelecting) {
      const touch = event.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element && element.classList.contains('puzzle-square')) {
        this.selectSquare(element);
      }
    }
  }

  /**
   * Maneja el evento touchend
   */
  handleTouchEnd(event) {
    if (this.isSelecting) {
      this.isSelecting = false;
      this.checkWord();
    }
  }

  /**
   * Selecciona un cuadrado
   */
  selectSquare(square) {
    if (!square || square.classList.contains('found')) {
      return;
    }

    // Verificar que la selección sea válida (línea recta)
    if (this.selectedSquares.length > 0 && !this.isValidSelection(square)) {
      return;
    }

    // Evitar seleccionar el mismo cuadrado dos veces seguidas
    const lastSquare = this.selectedSquares[this.selectedSquares.length - 1];
    if (lastSquare === square) {
      return;
    }

    square.classList.add('selected');
    this.selectedSquares.push(square);
    this.currentWord += square.dataset.letter;

    this.emit('selectionChange', {
      word: this.currentWord,
      squares: this.selectedSquares.length
    });
  }

  /**
   * Verifica si la selección es válida (línea recta)
   */
  isValidSelection(square) {
    if (this.selectedSquares.length === 0) return true;
    if (this.selectedSquares.length === 1) return true;

    const first = this.selectedSquares[0];
    const last = this.selectedSquares[this.selectedSquares.length - 1];
    const current = square;

    const firstRow = parseInt(first.dataset.row);
    const firstCol = parseInt(first.dataset.col);
    const lastRow = parseInt(last.dataset.row);
    const lastCol = parseInt(last.dataset.col);
    const currentRow = parseInt(current.dataset.row);
    const currentCol = parseInt(current.dataset.col);

    // Calcular dirección inicial
    const rowDiff = lastRow - firstRow;
    const colDiff = lastCol - firstCol;
    
    // Normalizar la dirección para obtener el vector unitario
    const dirRow = rowDiff === 0 ? 0 : (rowDiff > 0 ? 1 : -1);
    const dirCol = colDiff === 0 ? 0 : (colDiff > 0 ? 1 : -1);

    // Verificar que el cuadrado actual esté adyacente al último en la misma dirección
    const rowDiffToLast = currentRow - lastRow;
    const colDiffToLast = currentCol - lastCol;

    return rowDiffToLast === dirRow && colDiffToLast === dirCol;
  }

  /**
   * Limpia la selección actual
   */
  clearSelection() {
    this.selectedSquares.forEach(square => {
      if (!square.classList.contains('found')) {
        square.classList.remove('selected');
      }
    });
    this.selectedSquares = [];
    this.currentWord = '';
  }

  checkWord() {
    const selectedWord = this.currentWord.toLowerCase();
    const reversedWord = this.currentWord.split('').reverse().join('').toLowerCase();

    const foundNormalizedWord = this.words.find(word => {
      const w = word.toLowerCase();
      return w === selectedWord || w === reversedWord;
    });

    if (foundNormalizedWord && !this.solved.includes(foundNormalizedWord)) {
      this.markWordAsFound(foundNormalizedWord);
      this.emit('wordFound', { word: this.wordMap[foundNormalizedWord] || foundNormalizedWord });

      if (this.solved.length === this.words.length) {
        setTimeout(() => {
          this.markComplete();
          this.emit('complete', {
            words: this.solved.length,
            total: this.words.length
          });
        }, COMPLETE_DELAY);
      }
    } else {
      this.clearSelection();
    }
  }

  markWordAsFound(word) {
    this.solved.push(word);

    this.selectedSquares.forEach(square => {
      square.classList.remove('selected');
      square.classList.add('found');
    });

    const wordItem = this.wordsEl.querySelector(`[data-word="${word}"]`);
    if (wordItem) {
      wordItem.classList.add('found');
    }

    this.selectedSquares = [];
    this.currentWord = '';
  }

  markComplete() {}

  solve() {
    try {
      const solutions = this.generator.solve(this.puzzle, this.words);

      if (!solutions || !solutions.found || solutions.found.length === 0) {
        console.error('No se pudieron obtener soluciones');
        return;
      }

      solutions.found.forEach(item => {
        const word = item.word;
        if (!this.solved.includes(word)) {
          // Seleccionar los cuadrados de la solución
          this.selectedSquares = [];
          this.currentWord = '';

          // Verificar que item.path existe y es un array
          if (item.path && Array.isArray(item.path)) {
            item.path.forEach(pos => {
              const square = this.puzzleEl.querySelector(
                `[data-row="${pos.y}"][data-col="${pos.x}"]`
              );
              if (square) {
                square.classList.add('solved');
                this.selectedSquares.push(square);
                this.currentWord += square.dataset.letter;
              }
            });
          }

          this.markWordAsFound(word);
        }
      });

      // Emitir evento de completado sin modificar visuales
      setTimeout(() => {
        this.emit('complete', {
          words: this.solved.length,
          total: this.words.length,
          solved: true
        });
      }, 500);
    } catch (error) {
      console.error('❌ Error al resolver el puzzle:', error);
    }
  }

  getHint() {
    const remainingWords = this.words.filter(word => !this.solved.includes(word));
    
    if (remainingWords.length === 0) {
      return null;
    }

    const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    
    try {
      const solutions = this.generator.solve(this.puzzle, [randomWord]);
      
      if (solutions && solutions.found && solutions.found.length > 0) {
        const wordSolution = solutions.found[0];
        const firstPos = wordSolution.path[0];
        const firstSquare = this.puzzleEl.querySelector(
          `[data-row="${firstPos.y}"][data-col="${firstPos.x}"]`
        );
        
        if (firstSquare) {
          firstSquare.classList.add('!bg-yellow-400', '!text-gray-900', '!border-yellow-500', 'animate-pulse', 'scale-110', 'shadow-2xl', 'z-10', 'relative');
          
          setTimeout(() => {
            firstSquare.classList.remove('!bg-yellow-400', '!text-gray-900', '!border-yellow-500', 'animate-pulse', 'scale-110', 'shadow-2xl', 'z-10', 'relative');
          }, HINT_DURATION);
        }
        
        const originalWord = this.wordMap[randomWord] || randomWord;
        
        return {
          word: originalWord,
          firstLetter: randomWord.charAt(0),
          position: firstPos
        };
      }
    } catch (error) {
      console.error('Error al obtener pista:', error);
    }
    
    return null;
  }

  on(event, callback) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(callback => callback(data));
    }
  }

  getState() {
    return {
      words: this.words,
      solved: this.solved,
      remaining: this.words.length - this.solved.length,
      isComplete: this.solved.length === this.words.length
    };
  }

  reset(newWords) {
    if (newWords) {
      this.words = newWords;
    }
    
    this.solved = [];
    this.selectedSquares = [];
    this.currentWord = '';
    this.isSelecting = false;

    this.init();
  }

  destroy() {
    const squares = this.puzzleEl.querySelectorAll('.puzzle-square');
    
    squares.forEach(square => {
      square.replaceWith(square.cloneNode(true));
    });

    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);

    this.puzzleEl.innerHTML = '';
    this.wordsEl.innerHTML = '';
  }
}
