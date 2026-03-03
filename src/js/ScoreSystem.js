const TIME_BONUS_MAX = 500;
const TARGET_TIME_SECONDS = 180;

export class ScoreSystem {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.wordsFound = 0;
    this.totalWords = 0;
    this.timeBonus = 0;
    this.penaltyPoints = 0;
    this.difficultyMultipliers = {
      easy: 1.0,
      medium: 1.5,
      hard: 2.0
    };
  }

  setTotalWords(total) {
    this.totalWords = total;
  }

  addWord(word) {
    this.wordsFound++;
    const basePoints = word.length * 10;
    return basePoints * this.getDifficultyMultiplier();
  }

  calculateTimeBonus(timeInSeconds) {
    if (timeInSeconds <= TARGET_TIME_SECONDS) {
      const bonus = TIME_BONUS_MAX * ((TARGET_TIME_SECONDS - timeInSeconds) / TARGET_TIME_SECONDS);
      this.timeBonus = Math.floor(bonus * this.getDifficultyMultiplier());
    } else {
      this.timeBonus = 0;
    }
    
    return this.timeBonus;
  }

  addPenalty(points = 100) {
    this.penaltyPoints += points;
  }

  getDifficultyMultiplier() {
    return this.difficultyMultipliers[this.difficulty] || 1.0;
  }

  getTotalScore(timeInSeconds = 0) {
    const wordPoints = this.wordsFound * 100 * this.getDifficultyMultiplier();
    const timeBonus = this.calculateTimeBonus(timeInSeconds);
    const total = Math.max(0, wordPoints + timeBonus - this.penaltyPoints);
    
    return Math.floor(total);
  }

  getScoreBreakdown(timeInSeconds = 0) {
    return {
      wordsFound: this.wordsFound,
      totalWords: this.totalWords,
      wordPoints: Math.floor(this.wordsFound * 100 * this.getDifficultyMultiplier()),
      timeBonus: this.calculateTimeBonus(timeInSeconds),
      penalties: this.penaltyPoints,
      totalScore: this.getTotalScore(timeInSeconds),
      difficulty: this.difficulty,
      multiplier: this.getDifficultyMultiplier()
    };
  }

  getCompletionPercentage() {
    if (this.totalWords === 0) return 0;
    return Math.floor((this.wordsFound / this.totalWords) * 100);
  }

  reset(difficulty = null) {
    if (difficulty) {
      this.difficulty = difficulty;
    }
    this.wordsFound = 0;
    this.totalWords = 0;
    this.timeBonus = 0;
    this.penaltyPoints = 0;
  }

  getRating() {
    const completion = this.getCompletionPercentage();
    
    if (completion === 100) {
      if (this.penaltyPoints === 0) {
        return { stars: 5, label: '¡Perfecto!' };
      } else {
        return { stars: 4, label: '¡Excelente!' };
      }
    } else if (completion >= 80) {
      return { stars: 3, label: '¡Muy bien!' };
    } else if (completion >= 60) {
      return { stars: 2, label: 'Bien' };
    } else if (completion >= 40) {
      return { stars: 1, label: 'Necesitas practicar' };
    } else {
      return { stars: 0, label: 'Sigue intentando' };
    }
  }
}
