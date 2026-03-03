export class DarkMode {
  constructor() {
    this.storageKey = 'darkModeEnabled';
    this.darkClass = 'dark';
    this.isEnabled = false;
  }

  init() {
    const savedPreference = this.getSavedPreference();
    
    if (savedPreference !== null) {
      this.isEnabled = savedPreference;
    } else {
      this.isEnabled = this.getSystemPreference();
    }

    if (this.isEnabled) {
      this.enable();
    }

    this.watchSystemPreference();
  }

  enable() {
    document.documentElement.classList.add(this.darkClass);
    this.isEnabled = true;
    this.savePreference(true);
    this.updateToggleButton();
  }

  disable() {
    document.documentElement.classList.remove(this.darkClass);
    this.isEnabled = false;
    this.savePreference(false);
    this.updateToggleButton();
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.isEnabled;
  }

  getSavedPreference() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved !== null ? saved === 'true' : null;
    } catch (error) {
      console.warn('Error al leer preferencia de modo oscuro:', error);
      return null;
    }
  }

  savePreference(enabled) {
    try {
      localStorage.setItem(this.storageKey, enabled.toString());
    } catch (error) {
      console.warn('Error al guardar preferencia de modo oscuro:', error);
    }
  }

  getSystemPreference() {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  /**
   * Escucha cambios en la preferencia del sistema
   */
  watchSystemPreference() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Usar el método correcto según disponibilidad
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', (e) => {
          // Solo aplicar si no hay preferencia guardada
          if (this.getSavedPreference() === null) {
            if (e.matches) {
              this.enable();
            } else {
              this.disable();
            }
          }
        });
      } else if (mediaQuery.addListener) {
        // Fallback para navegadores antiguos
        mediaQuery.addListener((e) => {
          if (this.getSavedPreference() === null) {
            if (e.matches) {
              this.enable();
            } else {
              this.disable();
            }
          }
        });
      }
    }
  }

  /**
   * Actualiza el botón de toggle (si existe)
   */
  updateToggleButton() {
    const toggleButton = document.getElementById('darkModeToggle');
    if (toggleButton) {
      const moonIcon = toggleButton.querySelector('.dark\\:hidden');
      const sunIcon = toggleButton.querySelector('.hidden.dark\\:inline');
      
      if (this.isEnabled) {
        toggleButton.setAttribute('aria-label', 'Activar modo claro');
        toggleButton.setAttribute('title', 'Modo claro');
      } else {
        toggleButton.setAttribute('aria-label', 'Activar modo oscuro');
        toggleButton.setAttribute('title', 'Modo oscuro');
      }
    }
  }

  /**
   * Crea y adjunta el botón de toggle
   */
  createToggleButton(container = document.body) {
    const button = document.createElement('button');
    button.id = 'darkModeToggle';
    button.className = 'fixed top-4 right-4 z-50 p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110';
    button.setAttribute('aria-label', 'Alternar modo oscuro');
    button.innerHTML = `
      <span class="dark:hidden text-xl">🌙</span>
      <span class="hidden dark:inline text-xl">☀️</span>
    `;
    
    button.addEventListener('click', () => {
      this.toggle();
    });

    container.appendChild(button);
    this.updateToggleButton();
    
    return button;
  }

  /**
   * Verifica si el modo oscuro está habilitado
   */
  enabled() {
    return this.isEnabled;
  }

  /**
   * Limpia la preferencia guardada (vuelve a usar preferencia del sistema)
   */
  clearPreference() {
    try {
      localStorage.removeItem(this.storageKey);
      // Aplicar preferencia del sistema
      if (this.getSystemPreference()) {
        this.enable();
      } else {
        this.disable();
      }
    } catch (error) {
      console.warn('Error al limpiar preferencia:', error);
    }
  }
}
