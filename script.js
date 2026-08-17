// Three.js сцена
let scene, camera, renderer;
let planets = [];
let stars;
let controls = { x: 0, y: 0 };
let isDragging = false;

// Размеры и детали планет
const planetData = [
    { 
        name: 'Меркурий', 
        size: 0.38, 
        distance: 6, 
        speed: 0.04,
        rings: false,
        bumpScale: 0.5
    },
    { 
        name: 'Венера', 
        size: 0.95, 
        distance: 9, 
        speed: 0.015,
        rings: false,
        bumpScale: 0.3
    },
    { 
        name: 'Земля', 
        size: 1, 
        distance: 0, 
        speed: 0.01,
        rings: false,
        bumpScale: 0.4
    },
    { 
        name: 'Марс', 
        size: 0.53, 
        distance: 12, 
        speed: 0.008,
        rings: false,
        bumpScale: 0.6
    },
    { 
        name: 'Юпитер', 
        size: 2.5, 
        distance: 18, 
        speed: 0.002,
        rings: false,
        bumpScale: 0.4
    },
    { 
        name: 'Сатурн', 
        size: 2.1, 
        distance: 24, 
        speed: 0.0009,
        rings: true,
        bumpScale: 0.3
    },
    { 
        name: 'Уран', 
        size: 1.5, 
        distance: 30, 
        speed: 0.0004,
        rings: false,
        bumpScale: 0.2
    },
    { 
        name: 'Нептун', 
        size: 1.46, 
        distance: 36, 
        speed: 0.0001,
        rings: false,
        bumpScale: 0.2
    }
];

// Цвета планет реалистичные
const planetColors = {
    'Меркурий': { main: 0x8c7853, detail: 0x5a5a5a },
    'Венера': { main: 0xffc649, detail: 0xe6a837 },
    'Земля': { main: 0x4a90e2, detail: 0x2e7d32 },
    'Марс': { main: 0xe27b58, detail: 0xa04000 },
    'Юпитер': { main: 0xc88b3a, detail: 0x8b6914 },
    'Сатурн': { main: 0xfad5a5, detail: 0xdaa520 },
    'Уран': { main: 0x4fd0e7, detail: 0x1e90ff },
    'Нептун': { main: 0x4166f5, detail: 0x0000cd }
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Освещение
    const sunLight = new THREE.PointLight(0xffffff, 3, 2000);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    // Солнце в центре
    const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfdb813 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Добавляем свечение к солнцу
    const glowGeometry = new THREE.SphereGeometry(1.6, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xfdb813,
        transparent: true,
        opacity: 0.1
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    createStars();
    createPlanets();

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);

    window.addEventListener('resize', onWindowResize);

    animate();
}

function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 500;
        positions[i + 1] = (Math.random() - 0.5) * 500;
        positions[i + 2] = (Math.random() - 0.5) * 500;
        sizes[i / 3] = Math.random() * 0.5;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        sizeAttenuation: true
    });

    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Создаём Canvas текстуру с деталями
function createDetailedTexture(planetName, mainColor, detailColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Основной цвет
    ctx.fillStyle = '#' + mainColor.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#' + detailColor.toString(16).padStart(6, '0');

    if (planetName === 'Земля') {
        // Континенты Земли
        for (let i = 0; i < 25; i++) {
            ctx.beginPath();
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 80 + 30;
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        // Облака
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 15; i++) {
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 100 + 50,
                Math.random() * 30 + 10
            );
        }
    } else if (planetName === 'Юпитер') {
        // Полосы Юпитера
        ctx.fillStyle = 'rgba(100, 60, 0, 0.4)';
        for (let i = 0; i < canvas.height; i += 50) {
            ctx.fillRect(0, i, canvas.width, 25);
        }
        // Пятна
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.3, canvas.height * 0.5, 60, 40, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (planetName === 'Марс') {
        // Кратеры Марса
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 40 + 10;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    } else if (planetName === 'Сатурн') {
        // Волны на Сатурне
        ctx.fillStyle = 'rgba(139, 105, 20, 0.3)';
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.fillRect(0, i, canvas.width, 15);
        }
    } else if (planetName === 'Уран') {
        // Атмосфера Урана
        ctx.fillStyle = 'rgba(70, 130, 180, 0.3)';
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.arc(
                canvas.width / 2,
                canvas.height / 2,
                (canvas.height / 2) * (1 - i * 0.1),
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
    } else if (planetName === 'Нептун') {
        // Шторм на Нептуне
        ctx.fillStyle = 'rgba(100, 149, 237, 0.3)';
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
    } else {
        // Для остальных - просто рельеф
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 100; i++) {
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 30 + 5,
                Math.random() * 30 + 5
            );
        }
    }

    return new THREE.CanvasTexture(canvas);
}

function createPlanets() {
    planetData.forEach((data) => {
        const colors = planetColors[data.name];
        const texture = createDetailedTexture(data.name, colors.main, colors.detail);

        const geometry = new THREE.SphereGeometry(data.size, 128, 128);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: 0.3,
            roughness: 0.7,
            emissive: colors.detail,
            emissiveIntensity: 0.1
        });

        const planet = new THREE.Mesh(geometry, material);
        planet.castShadow = true;
        planet.receiveShadow = true;

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

        // Кольца для Сатурна
        if (data.rings) {
            const ringGeometry = new THREE.TorusGeometry(data.size * 2.2, data.size * 0.8, 32, 200);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xb8860b,
                metalness: 0.4,
                roughness: 0.6,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 3.5;
            ring.castShadow = true;
            ring.receiveShadow = true;
            planet.add(ring);
        }

        scene.add(planet);
        planets.push(planet);
    });
}

function animate() {
    requestAnimationFrame(animate);

    planets.forEach((planet) => {
        if (planet.userData.distance > 0) {
            planet.userData.angle += planet.userData.speed;
            planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
            planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
        }

        planet.rotation.y += 0.002;
    });

    stars.rotation.x += controls.y * 0.0001;
    stars.rotation.y += controls.x * 0.0001;

    scene.rotation.x += (controls.y - scene.rotation.x) * 0.03;
    scene.rotation.y += (controls.x - scene.rotation.y) * 0.03;

    renderer.render(scene, camera);
}

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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();