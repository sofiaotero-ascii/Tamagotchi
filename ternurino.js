// =============================================
// ESTADO DEL JUEGO
// =============================================
// Objeto que almacena todo el estado actual del juego
const gameState = {
    petName: '',         // Nombre de la mascota
    petType: 'normal',   // Tipo de mascota (normal, yellow, blue)
    hunger: 70,          // Nivel de hambre (0-100)
    happiness: 70,       // Nivel de felicidad (0-100)
    cleanliness: 70,     // Nivel de limpieza (0-100)
    interval: null,      // Referencia al intervalo del juego
    state: 'normal',     // Estado actual (normal, eating, playing, etc.)
    level: 1,            // Nivel actual de la mascota
    canLevelUp: true     // Controla si puede subir de nivel
};

// =============================================
// RECURSOS DE IMAGENES
// =============================================
// Objeto con las rutas de todas las imágenes/animationes del juego
const petImages = {
    normal: './assets/sprites/gatonormal.gif',   // Estado normal
    eating: './assets/sprites/comida.gif',       // Animación comiendo
    playing: './assets/sprites/futbol.gif',      // Animación jugando
    cleaning: './assets/sprites/clean.gif',      // Animación limpiando
    sad: './assets/sprites/sad.gif',             // Estado triste
    dead: './assets/sprites/dead.gif',           // Estado muerto
    levelup: './assets/sprites/levelup.gif'      // Animación subida de nivel
};

// =============================================
// ELEMENTOS DEL DOM
// =============================================
// Objeto que almacena referencias a elementos HTML importantes
const dom = {
    screens: document.querySelectorAll('.screen'),           // Todas las pantallas
    petNameInput: document.getElementById('pet-name'),       // Input del nombre
    petNameDisplay: document.getElementById('pet-name-display'), // Display nombre
    petImage: document.getElementById('pet-face'),           // Imagen de la mascota
    petMood: document.getElementById('pet-mood'),            // Texto de estado
    hungerBar: document.getElementById('hunger-bar'),        // Barra de hambre
    happinessBar: document.getElementById('happiness-bar'),  // Barra de felicidad
    cleanlinessBar: document.getElementById('energy-bar'),   // Barra de limpieza
    levelDisplay: document.createElement('div'),             // Display de nivel
    musicToggle: document.createElement('button')            // Botón de música
};

// =============================================
// CONFIGURACIONES DEL JUEGO
// =============================================
// Valores de incremento al realizar acciones
const INCREMENTS = { 
    feed: 30,   // Puntos que aumenta al alimentar
    play: 30,   // Puntos que aumenta al jugar
    clean: 30   // Puntos que aumenta al limpiar
};

// Valores de decremento automático
const DECREMENTS = { 
    hunger: 1.3,      // Puntos que disminuye el hambre cada intervalo
    happiness: 1.3,   // Puntos que disminuye la felicidad cada intervalo
    cleanliness: 1.3  // Puntos que disminuye la limpieza cada intervalo
};

// =============================================
// SONIDOS DEL JUEGO
// =============================================
// Objeto con todos los efectos de sonido
const sounds = {
    background: new Audio('./assets/audio/game-music-loop-6-144641.mp3'),  // Música de fondo
    action: new Audio('./assets/audio/click-buttons-ui-menu-sounds-effects-button-7-203601.mp3'), // Sonido acción
    death: new Audio('./assets/audio/dead-8bit-41400.mp3'),                // Sonido muerte
    levelup: new Audio('./assets/audio/level-up-191997.mp3')               // Sonido subir nivel
};

// =============================================
// FUNCIÓN DE INICIALIZACIÓN
// =============================================
// Función principal que se ejecuta al cargar la página
function init() {
    setupMusic();            // Configura la música
    setupLevelDisplay();     // Prepara el display de nivel
    preloadImages();         // Precarga las imágenes
    setupEventListeners();   // Configura los event listeners
    
    // Selecciona por defecto la mascota "normal"
    document.querySelector('.pet-option').classList.add('selected');
    updatePetPreview();      // Actualiza la vista previa
}

// =============================================
// CONFIGURACIÓN DE MÚSICA
// =============================================
function setupMusic() {
    sounds.background.loop = true;       // Repetir música infinitamente
    sounds.background.volume = 0.3;      // Volumen al 30%
    
    // Intenta reproducir la música
    sounds.background.play().catch(() => {
        createMusicButton();  // Si falla, muestra botón de activación
    });
}

// Crea botón para activar música cuando el autoplay está bloqueado
function createMusicButton() {
    dom.musicToggle.textContent = '🔈 Activar Música';
    dom.musicToggle.className = 'pixel-btn music-toggle';
    dom.musicToggle.style.position = 'absolute';
    dom.musicToggle.style.top = '10px';
    dom.musicToggle.style.left = '10px';
    dom.musicToggle.style.zIndex = '1000';
    document.body.appendChild(dom.musicToggle);
    
    // Al hacer clic, intenta reproducir la música
    dom.musicToggle.addEventListener('click', () => {
        sounds.background.play();
        dom.musicToggle.remove();  // Elimina el botón si funciona
    });
}

// =============================================
// CONFIGURACIÓN DE INTERFAZ
// =============================================
// Prepara el display que muestra el nivel actual
function setupLevelDisplay() {
    dom.levelDisplay.id = 'level-display';
    dom.levelDisplay.textContent = `Nivel ${gameState.level}`;
    document.querySelector('.container').appendChild(dom.levelDisplay);
}

// =============================================
// MANEJADORES DE EVENTOS
// =============================================
// Configura todos los event listeners del juego
function setupEventListeners() {
    // Navegación entre pantallas
    document.getElementById('yes-btn').addEventListener('click', () => showScreen('1-5'));
    document.getElementById('what-btn').addEventListener('click', () => showScreen('1-5'));
    document.getElementById('next-to-name-btn').addEventListener('click', () => showScreen(2));
    document.getElementById('name-next-btn').addEventListener('click', setPetName);
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    
    // Selección de tipo de mascota
    document.querySelectorAll('.pet-option').forEach(option => {
        option.addEventListener('click', function() {
            gameState.petType = this.dataset.type;  // Actualiza el tipo
            
            // Deselecciona otras opciones
            document.querySelectorAll('.pet-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            this.classList.add('selected');  // Selecciona la actual
            updatePetPreview();              // Actualiza la vista previa
        });
    });
    
    // Botones de acciones
    document.getElementById('feed-btn').addEventListener('click', () => actions.feed());
    document.getElementById('play-btn').addEventListener('click', () => actions.play());
    document.getElementById('clean-btn').addEventListener('click', () => actions.clean());
}

// =============================================
// CARGA DE RECURSOS
// =============================================
// Precarga todas las imágenes para evitar delays
function preloadImages() {
    Object.values(petImages).forEach(path => {
        const img = new Image();
        img.src = path;
    });
}

// Actualiza la vista previa de la mascota
function updatePetPreview() {
    const preview = document.getElementById('pet-preview-large');
    if (!preview) return;
    preview.src = petImages.normal;
    preview.className = 'pet-preview-large ' + gameState.petType + '-filter';
}

// =============================================
// MANEJO DE PANTALLAS
// =============================================
// Cambia entre las diferentes pantallas del juego
function showScreen(screenNumber) {
    // Oculta todas las pantallas
    dom.screens.forEach(screen => screen.classList.remove('active'));
    
    // Muestra la pantalla solicitada
    document.getElementById(`screen${screenNumber}`).classList.add('active');
}

// =============================================
// LÓGICA DEL JUEGO
// =============================================
// Establece el nombre de la mascota
function setPetName() {
    const name = dom.petNameInput.value.trim();
    if (!name) return alert('¡Necesitas un nombre!');
    gameState.petName = name;
    showScreen(3);  // Va a la siguiente pantalla
}

// Inicia el juego principal
function startGame() {
    dom.petNameDisplay.textContent = gameState.petName;  // Muestra el nombre
    showScreen(4);  // Muestra pantalla de juego
    
    // Aplica el filtro de color según el tipo
    dom.petImage.className = 'pet-gif ' + gameState.petType + '-filter';
    
    // Inicia el bucle principal del juego (se ejecuta cada 3 segundos)
    gameState.interval = setInterval(updateGame, 3000);
}

// Actualiza el estado del juego
function updateGame() {
    // Reduce las estadísticas (con mínimo 0)
    gameState.hunger = Math.max(0, gameState.hunger - DECREMENTS.hunger);
    gameState.happiness = Math.max(0, gameState.happiness - DECREMENTS.happiness);
    gameState.cleanliness = Math.max(0, gameState.cleanliness - DECREMENTS.cleanliness);

    updateBars();       // Actualiza las barras visuales
    updatePetState();   // Actualiza el estado de la mascota
    checkLevelUp();     // Verifica si debe subir de nivel
}

// Verifica si la mascota puede subir de nivel
function checkLevelUp() {
    // Si todas las estadísticas están al máximo y no está en cooldown
    if (!gameState.levelCooldown && 
        gameState.hunger >= 100 && 
        gameState.happiness >= 100 && 
        gameState.cleanliness >= 100) {
        levelUp();
    } 
    // Si alguna estadística baja del máximo, reinicia el cooldown
    else if (gameState.hunger < 100 || 
             gameState.happiness < 100 || 
             gameState.cleanliness < 100) {
        gameState.levelCooldown = false;
    }
}

// Maneja la subida de nivel
function levelUp() {
    gameState.level++;           // Aumenta el nivel
    gameState.levelCooldown = true;  // Activa cooldown
    
    // Guarda el estado previo para restaurarlo después
    const prevState = gameState.state;
    const prevMood = dom.petMood.textContent;
    
    // Muestra animación de nivel
    setPetState('levelup', `¡Nivel ${gameState.level}!`);
    sounds.levelup.play();  // Sonido de nivel
    
    // Actualiza el display del nivel
    dom.levelDisplay.textContent = `Nivel ${gameState.level}`;
    
    // Restaura el estado después de 2 segundos
    setTimeout(() => {
        setPetState(prevState, prevMood);
    }, 2000);
}

// =============================================
// ACTUALIZACIÓN DE INTERFAZ
// =============================================
// Actualiza las barras de estadísticas
function updateBars() {
    dom.hungerBar.style.width = `${gameState.hunger}%`;
    dom.happinessBar.style.width = `${gameState.happiness}%`;
    dom.cleanlinessBar.style.width = `${gameState.cleanliness}%`;
}

// Actualiza el estado visual de la mascota
function updatePetState() {
    // Verifica si la mascota murió
    if (gameState.hunger <= 0 || gameState.happiness <= 0 || gameState.cleanliness <= 0) {
        sounds.death.play();
        setPetState('dead', '¡Tu mascota ha muerto!');
        clearInterval(gameState.interval);  // Detiene el juego
        disableButtons();                   // Desactiva los botones
        return;
    }

    // Verifica si está en estado crítico
    if (gameState.hunger <= 20 || gameState.happiness <= 20 || gameState.cleanliness <= 20) {
        const message = gameState.hunger <= 20 ? 'Tengo hambre...' :
                       gameState.happiness <= 20 ? 'Estoy aburrido...' : '¡Estoy sucio!';
        setPetState('sad', message);
    } 
    // Verifica si está en estado perfecto
    else if (gameState.hunger >= 80 && gameState.happiness >= 80 && gameState.cleanliness >= 80) {
        setPetState('normal', '¡Estoy super feliz!');
    } 
    // Estado normal
    else {
        setPetState('normal', '');
    }
}

// Cambia el estado visual de la mascota
function setPetState(state, message) {
    gameState.state = state;
    dom.petImage.src = petImages[state];  // Cambia la imagen
    dom.petImage.className = 'pet-gif ' + gameState.petType + '-filter';  // Aplica filtro
    dom.petMood.textContent = message;    // Actualiza el mensaje
}

// =============================================
// ACCIONES DEL JUGADOR
// =============================================
const actions = {
    // Alimentar a la mascota
    feed: () => {
        gameState.hunger = Math.min(100, gameState.hunger + INCREMENTS.feed);
        animateAction('eating');  // Muestra animación
        sounds.action.play();     // Reproduce sonido
        updateBars();             // Actualiza barras
        checkLevelUp();           // Verifica nivel
    },
    
    // Jugar con la mascota
    play: () => {
        gameState.happiness = Math.min(100, gameState.happiness + INCREMENTS.play);
        animateAction('playing');
        sounds.action.play();
        updateBars();
        checkLevelUp();
    },
    
    // Limpiar a la mascota
    clean: () => {
        gameState.cleanliness = Math.min(100, gameState.cleanliness + INCREMENTS.clean);
        animateAction('cleaning');
        sounds.action.play();
        updateBars();
        checkLevelUp();
    }
};

// Muestra animación temporal de una acción
function animateAction(action) {
    const prevState = gameState.state;  // Guarda estado actual
    setPetState(action, '');           // Muestra animación
    
    // Restaura el estado después de 1 segundo
    setTimeout(() => {
        setPetState(prevState, '');
        updateBars();
        updatePetState();
    }, 1000);
}

// Desactiva los botones cuando la mascota muere
function disableButtons() {
    document.getElementById('feed-btn').disabled = true;
    document.getElementById('play-btn').disabled = true;
    document.getElementById('clean-btn').disabled = true;
}

// =============================================
// INICIO DEL JUEGO
// =============================================
// Inicia el juego cuando se carga la página
window.onload = init;