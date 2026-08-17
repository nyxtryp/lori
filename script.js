// Three.js сцена
let scene, camera, renderer;
let planets = [];
let stars;
let controls = { x: 0, y: 0 };
let isDragging = false;

// Размеры и цвета планет (реалистичные)
const planetData = [
    { 
        name: 'Меркурий', 
        size: 0.38, 
        distance: 6, 
        color: 0x8c7853,
        emissive: 0x444444,
        speed: 0.04 
    },
    { 
        name: 'Венера', 
        size: 0.95, 
        distance: 9, 
        color: 0xffc649,
        emissive: 0x664400,
        speed: 0.015 
    },
    { 
        name: 'Земля', 
        size: 1, 
        distance: 0, 
        color: 0x2e7d32,
        emissive: 0x1a4d1a,
        speed: 0.01 
    },
    { 
        name: 'Марс', 
        size: 0.53, 
        distance: 12, 
        color: 0xe27b58,
        emissive: 0x8b4513,
        speed: 0.008 
    },
    { 
        name: 'Юпитер', 
        size: 2.5, 
        distance: 18, 
        color: 0xc88b3a,
        emissive: 0x8b6914,
        speed: 0.002 
    },
    { 
        name: 'Сатурн', 
        size: 2.1, 
        distance: 24, 
        color: 0xfad5a5,
        emissive: 0xb8860b,
        speed: 0.0009 
    },
    { 
        name: 'Уран', 
        size: 1.5, 
        distance: 30, 
        color: 0x4fd0e7,
        emissive: 0x1e90ff,
        speed: 0.0004 
    },
    { 
        name: 'Нептун', 
        size: 1.46, 
        distance: 36, 
        color: 0x4166f5,
        emissive: 0x0000cd,
        speed: 0.0001 
    }
];

function init() {
    // Сцена
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Камера
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    camera.position.z = 50;

    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Освещение
    const light = new THREE.PointLight(0xffffff, 2, 1000);
    light.position.set(0, 0, 0);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Звёзды
    createStars();

    // Планеты
    createPlanets();

    // События мыши и касания
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);

    // Адаптивность
    window.addEventListener('resize', onWindowResize);

    // Запуск анимации
    animate();
}

function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 400;
        positions[i + 1] = (Math.random() - 0.5) * 400;
        positions[i + 2] = (Math.random() - 0.5) * 400;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        sizeAttenuation: true
    });

    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Функция для создания текстуры планеты (с шумом)
function createPlanetTexture(color, pattern = 'default') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Базовый цвет
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Добавляем детали в зависимости от типа планеты
    if (pattern === 'earth') {
        // Земля - континенты и океаны
        ctx.fillStyle = '#1a4d1a';
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 50 + 20,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    } else if (pattern === 'jupiter') {
        // Юпитер - полосы
        ctx.fillStyle = 'rgba(100, 60, 0, 0.3)';
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.fillRect(0, i, canvas.width, 20);
        }
    } else if (pattern === 'mars') {
        // Марс - кратеры
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 30 + 5,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    } else if (pattern === 'saturn') {
        // Сатурн - волны
        ctx.fillStyle = 'rgba(139, 105, 20, 0.3)';
        for (let i = 0; i < canvas.height; i += 30) {
            ctx.fillRect(0, i, canvas.width, 10);
        }
    } else {
        // Остальные планеты - просто шум
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < 100; i++) {
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 20,
                Math.random() * 20
            );
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createPlanets() {
    planetData.forEach((data) => {
        const geometry = new THREE.SphereGeometry(data.size, 64, 64);
        
        // Создаём текстуру для каждой планеты
        let pattern = 'default';
        if (data.name === 'Земля') pattern = 'earth';
        else if (data.name === 'Юпитер') pattern = 'jupiter';
        else if (data.name === 'Марс') pattern = 'mars';
        else if (data.name === 'Сатурн') pattern = 'saturn';

        const texture = createPlanetTexture(data.color, pattern);

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            color: data.color,
            emissive: data.emissive,
            emissiveIntensity: 0.3,
            metalness: 0.2,
            roughness: 0.8
        });

        const planet = new THREE.Mesh(geometry, material);

        // Земля в центре
        if (data.distance === 0) {
            planet.position.set(0, 0, 0);
        } else {
            planet.position.set(data.distance, 0, 0);
        }

        planet.userData = {
            name: data.name,
            distance: data.distance,
            angle: Math.random() * Math.PI * 2,
            speed: data.speed,
            size: data.size
        };

        // Кольцо для Сатурна
        if (data.name === 'Сатурн') {
            const ringGeometry = new THREE.TorusGeometry(data.size * 1.8, data.size * 0.6, 32, 100);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xb8860b,
                metalness: 0.3,
                roughness: 0.7
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 3;
            planet.add(ring);
        }

        scene.add(planet);
        planets.push(planet);
    });
}

function animate() {
    requestAnimationFrame(animate);

    // Вращение планет вокруг Земли
    planets.forEach((planet) => {
        if (planet.userData.distance > 0) {
            planet.userData.angle += planet.userData.speed;
            planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
            planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
        }

        // Вращение самих планет
        planet.rotation.y += 0.003;
    });

    // Вращение звёзд вместе со сценой (эффект космоса)
    stars.rotation.x += controls.y * 0.0005;
    stars.rotation.y += controls.x * 0.0005;

    // Вращение сцены по движениям мыши
    scene.rotation.x += (controls.y - scene.rotation.x) * 0.05;
    scene.rotation.y += (controls.x - scene.rotation.y) * 0.05;

    renderer.render(scene, camera);
}

// Управление мышкой
function onMouseDown() {
    isDragging = true;
}

function onMouseMove(event) {
    if (isDragging) {
        controls.x = (event.clientX / window.innerWidth) * 2 - 1;
        controls.y = (event.clientY / window.innerHeight) * 2 - 1;
    }
}

function onMouseUp() {
    isDragging = false;
}

// Управление касанием
function onTouchStart() {
    isDragging = true;
}

function onTouchMove(event) {
    if (isDragging && event.touches.length > 0) {
        const touch = event.touches[0];
        controls.x = (touch.clientX / window.innerWidth) * 2 - 1;
        controls.y = (touch.clientY / window.innerHeight) * 2 - 1;
    }
}

function onTouchEnd() {
    isDragging = false;
}

// Адаптивность окна
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Запуск
init();