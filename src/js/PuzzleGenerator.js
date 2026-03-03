const MAX_PLACEMENT_ATTEMPTS = 100;
const DEFAULT_GRID_SIZE = 15;

export class PuzzleGenerator {
  constructor() {
    this.directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 }
    ];
    this.letters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  }

  generate(words, size = DEFAULT_GRID_SIZE) {
    if (!words || words.length === 0) {
      throw new Error('Se requieren palabras para generar el puzzle');
    }

    const normalizedWords = words.map(w => w.toUpperCase().trim());
    const grid = Array(size).fill(null).map(() => Array(size).fill(''));
    const placements = [];
    const shuffledWords = this.shuffleArray([...normalizedWords]);
    
    for (const word of shuffledWords) {
      const placement = this.placeWord(grid, word, size);
      if (placement) {
        placements.push(placement);
      }
    }

    this.fillEmptySpaces(grid);

    return {
      grid,
      words: normalizedWords,
      placements,
      size
    };
  }

  placeWord(grid, word, size) {
    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const direction = this.directions[Math.floor(Math.random() * this.directions.length)];
      
      if (this.canPlaceWord(grid, word, row, col, direction, size)) {
        const path = [];
        for (let i = 0; i < word.length; i++) {
          const r = row + (direction.x * i);
          const c = col + (direction.y * i);
          grid[r][c] = word[i];
          path.push({ x: c, y: r, letter: word[i] });
        }
        
        return {
          word,
          startRow: row,
          startCol: col,
          direction,
          path
        };
      }
    }
    
    return null;
  }

  canPlaceWord(grid, word, row, col, direction, size) {
    for (let i = 0; i < word.length; i++) {
      const r = row + (direction.x * i);
      const c = col + (direction.y * i);
      
      if (r < 0 || r >= size || c < 0 || c >= size) {
        return false;
      }
      
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
        return false;
      }
    }
    
    return true;
  }

  fillEmptySpaces(grid) {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] === '') {
          grid[i][j] = this.letters[Math.floor(Math.random() * this.letters.length)];
        }
      }
    }
  }

  solve(grid, words) {
    const found = [];
    const notFound = [];
    const size = grid.length;

    for (const word of words) {
      const wordUpper = word.toUpperCase();
      let wasFound = false;

      for (let row = 0; row < size && !wasFound; row++) {
        for (let col = 0; col < size && !wasFound; col++) {
          for (const direction of this.directions) {
            const result = this.findWordAt(grid, wordUpper, row, col, direction, size);
            if (result) {
              found.push({
                word,
                path: result.path,
                startRow: row,
                startCol: col,
                direction
              });
              wasFound = true;
              break;
            }
          }
        }
      }

      if (!wasFound) {
        notFound.push(word);
      }
    }

    return { found, notFound };
  }

  findWordAt(grid, word, row, col, direction, size) {
    const path = [];
    
    for (let i = 0; i < word.length; i++) {
      const r = row + (direction.x * i);
      const c = col + (direction.y * i);
      
      if (r < 0 || r >= size || c < 0 || c >= size) {
        return null;
      }
      
      if (grid[r][c] !== word[i]) {
        return null;
      }
      
      path.push({ x: c, y: r, letter: grid[r][c] });
    }
    
    return { path };
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  normalizeWord(word) {
    return word
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

export default PuzzleGenerator;
