// Three.js сцена
let scene, camera, renderer;
let planets = [];
let stars;
let controls = { x: 0, y: 0 };
let isDragging = false;
let textureLoader = new THREE.TextureLoader();

// Размеры и текстуры планет - локальные пути
const planetData = [
    { 
        name: 'Меркурий', 
        size: 0.38, 
        distance: 6, 
        texture: 'textures/mercury.jpg',
        speed: 0.04 
    },
    { 
        name: 'Венера', 
        size: 0.95, 
        distance: 9, 
        texture: 'textures/venus.jpg',
        speed: 0.015 
    },
    { 
        name: 'Земля', 
        size: 1, 
        distance: 0, 
        texture: 'textures/earth.jpg',
        speed: 0.01 
    },
    { 
        name: 'Марс', 
        size: 0.53, 
        distance: 12, 
        texture: 'textures/mars.jpg',
        speed: 0.008 
    },
    { 
        name: 'Юпитер', 
        size: 2.5, 
        distance: 18, 
        texture: 'textures/jupiter.jpg',
        speed: 0.002 
    },
    { 
        name: 'Сатурн', 
        size: 2.1, 
        distance: 24, 
        texture: 'textures/saturn.jpg',
        speed: 0.0009 
    },
    { 
        name: 'Уран', 
        size: 1.5, 
        distance: 30, 
        texture: 'textures/uranus.jpg',
        speed: 0.0004 
    },
    { 
        name: 'Нептун', 
        size: 1.46, 
        distance: 36, 
        texture: 'textures/neptune.jpg',
        speed: 0.0001 
    }
];

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

    // Свечение солнца
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

function createPlanets() {
    planetData.forEach((data) => {
        const geometry = new THREE.SphereGeometry(data.size, 128, 128);
        
        // Загружаем локальную текстуру
        textureLoader.load(
            data.texture,
            function(texture) {
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    metalness: 0.1,
                    roughness: 0.8
                });
                planet.material = material;
            },
            undefined,
            function(error) {
                console.error('Ошибка загрузки текстуры для ' + data.name, error);
                const fallbackMaterial = new THREE.MeshStandardMaterial({
                    color: 0x888888,
                    metalness: 0.1,
                    roughness: 0.8
                });
                planet.material = fallbackMaterial;
            }
        );

        const tempMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.1,
            roughness: 0.8
        });

        const planet = new THREE.Mesh(geometry, tempMaterial);
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
        if (data.name === 'Сатурн') {
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