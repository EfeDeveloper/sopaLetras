const UPDATE_INTERVAL_MS = 100;

export class Timer {
  constructor() {
    this.startTime = null;
    this.elapsedTime = 0;
    this.interval = null;
    this.isRunning = false;
    this.callbacks = [];
  }

  start() {
    if (this.isRunning) return;

    this.startTime = Date.now() - this.elapsedTime;
    this.isRunning = true;

    this.interval = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
      this.notifyCallbacks();
    }, UPDATE_INTERVAL_MS);
  }

  pause() {
    if (!this.isRunning) return;

    clearInterval(this.interval);
    this.isRunning = false;
    this.elapsedTime = Date.now() - this.startTime;
  }

  stop() {
    this.pause();
  }

  reset() {
    this.stop();
    this.elapsedTime = 0;
    this.startTime = null;
    this.notifyCallbacks();
  }

  getElapsedMs() {
    return this.elapsedTime;
  }

  getElapsedSeconds() {
    return Math.floor(this.elapsedTime / 1000);
  }

  getFormattedTime() {
    const totalSeconds = this.getElapsedSeconds();
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  onChange(callback) {
    this.callbacks.push(callback);
  }

  notifyCallbacks() {
    this.callbacks.forEach(callback => {
      callback({
        ms: this.elapsedTime,
        seconds: this.getElapsedSeconds(),
        formatted: this.getFormattedTime()
      });
    });
  }

  running() {
    return this.isRunning;
  }
}
