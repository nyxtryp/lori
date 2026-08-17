// Three.js сцена
let scene, camera, renderer;
let planets = [];
let stars;
let controls = { x: 0, y: 0 };
let isDragging = false;
let textureLoader = new THREE.TextureLoader();

// Размеры и текстуры планет
const planetData = [
    { 
        name: 'Меркурий', 
        size: 0.38, 
        distance: 6, 
        texture: 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
        speed: 0.04 
    },
    { 
        name: 'Венера', 
        size: 0.95, 
        distance: 9, 
        texture: 'https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
        speed: 0.015 
    },
    { 
        name: 'Земля', 
        size: 1, 
        distance: 0, 
        texture: 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
        speed: 0.01 
    },
    { 
        name: 'Марс', 
        size: 0.53, 
        distance: 12, 
        texture: 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
        speed: 0.008 
    },
    { 
        name: 'Юпитер', 
        size: 2.5, 
        distance: 18, 
        texture: 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
        speed: 0.002 
    },
    { 
        name: 'Сатурн', 
        size: 2.1, 
        distance: 24, 
        texture: 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
        speed: 0.0009 
    },
    { 
        name: 'Уран', 
        size: 1.5, 
        distance: 30, 
        texture: 'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg',
        speed: 0.0004 
    },
    { 
        name: 'Нептун', 
        size: 1.46, 
        distance: 36, 
        texture: 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg',
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

function createPlanets() {
    planetData.forEach((data, index) => {
        const geometry = new THREE.SphereGeometry(data.size, 64, 64);
        
        // Загружаем текстуру
        let material;
        textureLoader.load(data.texture, 
            function(texture) {
                material = new THREE.MeshStandardMaterial({
                    map: texture,
                    metalness: 0.3,
                    roughness: 0.7
                });
                planet.material = material;
            },
            undefined,
            function(error) {
                // Если текстура не загрузилась, используем цвет
                console.log('Текстура не загрузилась, используем цвет');
                material = new THREE.MeshStandardMaterial({
                    color: 0x888888,
                    metalness: 0.3,
                    roughness: 0.7
                });
                planet.material = material;
            }
        );

        material = new THREE.MeshStandardMaterial({
            color: 0x888888,
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
            const ringGeometry = new THREE.TorusGeometry(data.size * 1.8, data.size * 0.6, 32, 100);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xb8860b,
                metalness: 0.4,
                roughness: 0.6
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