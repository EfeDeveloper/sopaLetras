# 🎮 Sopa de Letras 2.0

Juego moderno de sopa de letras (word search) con interfaz renovada, múltiples niveles de dificultad y sistema de puntuación.

> **Versión 2.0** - Completamente reescrito con Tailwind CSS y Vanilla JavaScript (sin jQuery/Bootstrap)

## ✨ Características

### 🎯 Funcionalidades Principales
- **Palabras Aleatorias**: Obtención dinámica de palabras desde API externa con fallback local
- **Múltiples Categorías**: Naturaleza, Tecnología, Animales, Alimentos, Deportes
- **3 Niveles de Dificultad**: Fácil (3-6 letras), Medio (7-10 letras), Difícil (11+ letras)
- **Sistema de Puntuación**: Basado en tiempo, dificultad y palabras encontradas
- **Cronómetro**: Seguimiento de tiempo en cada partida
- **Modo Oscuro**: Toggle entre tema claro y oscuro con persistencia
- **Historial de Partidas**: Almacenamiento local de estadísticas y mejores puntajes
- **Responsive Design**: Optimizado para desktop, tablet y móviles

### 🎨 Interfaz
- Diseño moderno con **Tailwind CSS 3.4**
- Animaciones suaves y transiciones fluidas
- Soporte para touch gestures en dispositivos móviles
- Modal de completado con estadísticas detalladas
- Feedback visual al encontrar palabras

### 🏗️ Arquitectura
- **Vanilla JavaScript (ES6 Modules)**: Sin dependencias de jQuery o Bootstrap
- **Modular**: Código organizado en módulos independientes
- **Mantenible**: Separación clara de concerns (UI, lógica, datos)

## 📁 Estructura del Proyecto

```
sopaLetras/
├── src/
│   ├── js/
│   │   ├── app.js              # Aplicación principal
│   │   ├── WordAPI.js          # Gestión de palabras (API + fallback)
│   │   ├── WordFindGame.js     # Motor del juego (Vanilla JS)
│   │   ├── PuzzleGenerator.js  # Motor propio de generación de puzzles
│   │   ├── Timer.js            # Sistema de cronómetro
│   │   ├── ScoreSystem.js      # Sistema de puntuación
│   │   ├── Storage.js          # LocalStorage para historial
│   │   └── DarkMode.js         # Modo oscuro
│   ├── data/
│   │   └── words.json          # Palabras de fallback por categoría
│   └── input.css               # Estilos base de Tailwind
├── public/
│   ├── game.html               # Página del juego
│   └── output.css              # CSS compilado de Tailwind
├── image/
│   └── Browser.ico             # Favicon
├── index.html                  # Página de inicio
├── package.json                # Dependencias y scripts
├── tailwind.config.js          # Configuración de Tailwind
└── README.md                   # Este archivo
```

## 🚀 Instalación y Uso

### Pre-requisitos 📋
- Node.js (v14 o superior)
- npm (v6 o superior)
- Navegador web moderno

### Instalación 🔧

1. Clonar o descargar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Compilar Tailwind CSS:
```bash
npm run build
```

### Desarrollo

Para desarrollo con recarga automática de estilos:
```bash
npm run dev
```

### Uso

Simplemente abre `index.html` en tu navegador web favorito.

## 🎮 Cómo Jugar

1. **Selecciona la Configuración**:
   - Elige una categoría (o todas)
   - Selecciona el nivel de dificultad
   - Haz clic en "Nuevo Juego"

2. **Busca las Palabras**:
   - Selecciona las letras con el mouse o dedo en dispositivos táctiles
   - Las palabras pueden estar en cualquier dirección: horizontal, vertical o diagonal
   - Pueden leerse de izquierda a derecha o al revés

3. **Completa el Puzzle**:
   - Encuentra todas las palabras de la lista
   - Observa tu tiempo y puntaje
   - Al completar, verás tus estadísticas finales

## 🔧 Tecnologías

### Construido con 🛠️
- **HTML5**: Estructura semántica
- **Tailwind CSS 3.4**: Framework de utilidades CSS
- **JavaScript ES6+**: Módulos, clases, async/await
- **Font: Poppins**: Tipografía moderna de Google Fonts

### APIs Externas (con Fallback)
- Random Word API: `https://random-word-api.herokuapp.com`
- Greenborn API: `https://clientes.api.greenborn.com.ar`
- Fallback: Archivo JSON local con 100+ palabras

### Almacenamiento
- **LocalStorage**: Configuraciones y historial
- **SessionStorage**: Caché temporal de palabras de API

## 📊 Sistema de Puntuación

### Cálculo de Puntaje
- **Puntos Base**: `palabras_encontradas × 100 × multiplicador_dificultad`
- **Bonus de Tiempo**: Hasta 500 puntos por completar rápido
- **Multiplicadores**:
  - Fácil: x1.0
  - Medio: x1.5
  - Difícil: x2.0
- **Penalizaciones**:
  - Usar "Resolver": -500 puntos

### Calificación
- ⭐⭐⭐⭐⭐ (5 estrellas): 100% sin ayuda
- ⭐⭐⭐⭐ (4 estrellas): 100% con ayuda
- ⭐⭐⭐ (3 estrellas): 80-99%
- ⭐⭐ (2 estrellas): 60-79%
- ⭐ (1 estrella): 40-59%

## 🎨 Personalización

### Colores del Tema
Edita `tailwind.config.js`:
```javascript
colors: {
  'puzzle-primary': '#8c0a35',      // Color principal
  'puzzle-completed': '#1e90ff',    // Puzzle completado
  'puzzle-found': '#ff9f43',        // Palabra encontrada
  'puzzle-selected': '#04cdff',     // Selección actual
  'puzzle-solved': '#2ed573',       // Resuelto con ayuda
}
```

### Agregar Más Categorías
Edita `src/data/words.json`:
```json
{
  "categories": {
    "tu_categoria": ["palabra1", "palabra2", ...]
  }
}
```

## 🐛 Resolución de Problemas

### El juego no carga
- Verifica que hayas compilado Tailwind: `npm run build`
- Asegúrate de que `public/output.css` existe
- Abre la consola del navegador para ver errores

### Las palabras no se cargan
- Verifica tu conexión a internet (para las APIs)
- El fallback local debería funcionar automáticamente
- Verifica que `src/data/words.json` existe

### Los estilos no se aplican
- Recompila Tailwind: `npm run build`
- Limpia el caché del navegador

## 📝 Cambios de la Versión 2.0

### Removido ❌
- jQuery (85KB eliminados)
- Bootstrap (dependencia eliminada)
- Font Awesome (no utilizado)
- CSS custom (~300 líneas → reemplazadas con Tailwind)
- plugins/wordfindgame.js (reescrito en vanilla JS)
- plugins/wordfind.js (reemplazado con motor propio)

### Agregado ✅
- **PuzzleGenerator.js**: Motor propio de generación de puzzles (más confiable y moderno)
- Tailwind CSS 3.4 con diseño mejorado
- Grilla con efectos visuales modernos (gradientes, sombras, animaciones)
- Sistema de palabras aleatorias con API
- Modo oscuro con persistencia
- Timer y sistema de puntuación
- Categorías y niveles de dificultad
- LocalStorage para historial
- Soporte touch para móviles
- Arquitectura modular ES6

### Mejorado 🔄
- **Grilla del puzzle**: Diseño más atractivo con efectos hover, sombras y gradientes
- **Responsividad**: Mejor adaptación a todos los tamaños de pantalla
- **Selección de palabras**: Algoritmo mejorado sin límites artificiales
- Interfaz completamente rediseñada
- Rendimiento optimizado
- Accesibilidad mejorada
- Código más mantenible

## 🤝 Contribuyendo

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📌 Versionado

- **v1.0**: Versión original con jQuery y Bootstrap
- **v2.0**: Reescritura completa con Tailwind CSS y Vanilla JS

## ✒️ Autores

- **Edwin Ferney Villa Taborda** - _Trabajo Inicial_ - [EfeDeveloper](https://github.com/EfeDeveloper)
- **Versión 2.0** - Modernización y reescritura completa (2026)

También puedes mirar la lista de todos los [contribuyentes](https://github.com/EfeDeveloper/sopaLetras/contributors) quíenes han participado en este proyecto.

## 📄 Licencia

Este proyecto está bajo la Licencia BSD 3-Clause - mira el archivo [LICENSE](LICENSE) para detalles

## 🙏 Expresiones de Gratitud

- **wordfind.js**: Gracias a [bunkat](https://github.com/bunkat/wordfind) por el generador de puzzles
- **Tailwind CSS**: Por el increíble framework de utilidades
- A toda la comunidad de desarrolladores que hace proyectos como este posibles

---

Desarrollado con ❤️ - Versión 2.0 (2026)


- Comenta a otros sobre este proyecto 📢
- Invita una cerveza 🍺 o un café ☕ a alguien del equipo.
- Da las gracias públicamente 🤓.
- etc.

---

Plantilla para Readme gracias a: **[Villanuevand](https://github.com/Villanuevand)** 😊
