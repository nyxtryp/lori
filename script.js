// Three.js сцена
let scene, camera, renderer;
let planets = [];
let stars;
let controls = { x: 0, y: 0 };
let isDragging = false;

// Размеры планет
const planetData = [
    { name: 'Меркурий', size: 0.38, distance: 4, color: 0x8c7853, speed: 0.04 },
    { name: 'Венера', size: 0.95, distance: 6, color: 0xffc649, speed: 0.015 },
    { name: 'Земля', size: 1, distance: 0, color: 0x2e7d32, speed: 0.01 },
    { name: 'Марс', size: 0.53, distance: 8, color: 0xe27b58, speed: 0.008 },
    { name: 'Юпитер', size: 11.2, distance: 12, color: 0xc88b3a, speed: 0.002 },
    { name: 'Сатурн', size: 9.4, distance: 15, color: 0xfad5a5, speed: 0.0009 },
    { name: 'Уран', size: 4, distance: 18, color: 0x4fd0e7, speed: 0.0004 },
    { name: 'Нептун', size: 3.88, distance: 20, color: 0x4166f5, speed: 0.0001 }
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
    camera.position.z = 30;

    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Освещение
    const light = new THREE.PointLight(0xffffff, 2, 500);
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
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i + 1] = (Math.random() - 0.5) * 200;
        positions[i + 2] = (Math.random() - 0.5) * 200;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        sizeAttenuation: true
    });

    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

function createPlanets() {
    planetData.forEach((data, index) => {
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.2,
            metalness: 0.3,
            roughness: 0.7
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
            const ringGeometry = new THREE.TorusGeometry(data.size * 1.5, data.size * 0.5, 32, 100);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xb8860b,
                metalness: 0.4,
                roughness: 0.6,
                emissive: 0xb8860b,
                emissiveIntensity: 0.1
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 4;
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
        planet.rotation.y += 0.005;
    });

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