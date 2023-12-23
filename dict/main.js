import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader';


// Create the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Enable shadow mapping in the renderer
renderer.shadowMap.enabled = true;

// Set shadow map type (optional, depending on your needs)
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.autoRotateSpeed = 5;

controls.keys = {
    LEFT: 'ArrowLeft', //left arrow
    UP: 'ArrowUp', // up arrow
    RIGHT: 'ArrowRight', // right arrow
    BOTTOM: 'ArrowDown' // down arrow
}

controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
}

controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
}

// Set the limits for vertical rotation (polar angle)
controls.minPolarAngle = 0; // Minimum angle (looking straight up)
controls.maxPolarAngle = Math.PI / 2; // Maximum angle (looking down at a right angle)

// Set the limit speed for rotation
controls.rotateSpeed = 0.1;

// Set limits for middle-click (zooming)
controls.maxDistance = 50;
controls.minDistance = 1;


// Update the controls when the user interacts
controls.addEventListener('change', () => {
    // Check if the camera position is below y = 0 and reset it if needed
    if (camera.position.y < 0) {
        camera.position.y = 0; // Or set it to another desired value
        // controls.target.y = 0; // Adjust the target accordingly
        controls.update(); // Make sure to update the controls after modifying the camera position
    }
});

// Camera
camera.position.set(0, 30, 30);

// Set the limits for camera position
const minCameraPosition = new THREE.Vector3(-40, 5, -40);
const maxCameraPosition = new THREE.Vector3(40, 30, 40);

// Update the controls when the user interacts
controls.addEventListener('change', () => {
    // Limit the camera position within the specified range
    camera.position.clamp(minCameraPosition, maxCameraPosition);
    controls.target.clamp(minCameraPosition, maxCameraPosition);
});

// Create ambient light
var ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

// Create directional light
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 750, 1).normalize();
directionalLight.castShadow = true; // Enable shadow casting for the light
scene.add(directionalLight);

//Create hemisphere light
var hemisphereLight = new THREE.HemisphereLight(0x000000, 0x000000, 0.5);
scene.add(hemisphereLight);


// Create a Skybox
var create_skybox = function () {
    // create a box geometry
    var geometry = new THREE.BoxGeometry(10000, 10000, 10000);

    var front_texture = new THREE.TextureLoader().load("skybox-winter-stylized/textures/skybox_snow.png");
    var back_texture = new THREE.TextureLoader().load("skybox-winter-stylized/textures/skybox_snow.png");
    var up_texture = new THREE.TextureLoader().load("skybox-winter-stylized/textures/skybox_snow.png");
    var down_texture = new THREE.TextureLoader().load("skybox-winter-stylized/textures/skybox_snow.png");
    var right_texture = new THREE.TextureLoader().load("skybox-winter-stylized/textures/skybox_snow.png");
    var left_texture = new THREE.TextureLoader().load("skybox-winter-stylized/textures/skybox_snow.png");

    // add textures to a material array in the correct order (front-back-up-down-right-left)
    var materials = [
        new THREE.MeshBasicMaterial({ map: front_texture, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: back_texture, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: up_texture, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: down_texture, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: right_texture, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: left_texture, side: THREE.BackSide })
    ];

    // create skybox
    var skybox = new THREE.Mesh(geometry, materials);
    skybox.position.y = 1500;
    scene.add(skybox);
}

// Call the function to create the skybox
create_skybox();

//Create the surface
var groundGeometry = new THREE.CircleGeometry(1000, 50);
var groundMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
var ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.y = -1.8;
ground.rotation.x = -Math.PI / 2;
scene.add(ground);



// Create axes helper
const axesHelper = new THREE.AxesHelper(100); // The parameter specifies the size of the axes
scene.add(axesHelper);


// SNOW
let particles;
let positions = [], velocities = [];

const numSnowFlakes = 15000;

const maxRange = 1000, minRange = maxRange / 2;
const minHeight = 150;

const geometry = new THREE.BufferGeometry();


// Random Snowflake Texture
function getRandomSnowflakeTexture() {
    // Generate a random number between 0 and 1
    const randomValue = Math.random();

    // Set the ratio for the textures (9:1)
    const ratio = 0.9;

    // Choose the texture based on the ratio
    const selectedTexture = randomValue < ratio ? "snowflake/snowflake_2.png" : "snowflake/snowflake_1.png";

    // Load and return the selected texture
    return new THREE.TextureLoader().load(selectedTexture);
}

function addSnowFlake() {
    for (let i = 0; i < numSnowFlakes; i++) {
        positions.push(
            Math.floor(Math.random() * maxRange - minRange), // x -500 to 500
            Math.floor(Math.random() * minRange + minHeight), // y 250 to 750
            Math.floor(Math.random() * maxRange - minRange) // z -500 to 500
        );

        velocities.push(
            Math.floor(Math.random() * 6 - 3) * 0.1, // x -0.3 to 0.3
            Math.floor(Math.random() * 5 + 0.12) * 0.18, // y 0.02 to 0.92
            Math.floor(Math.random() * 6 - 3) * 0.1 // z -0.3 to 0.3
        )
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));


    // Create snowflake material
    const flakeMaterial = new THREE.PointsMaterial({
        size: 4,
        map: getRandomSnowflakeTexture(),
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        opacity: 0.7,
    });

    particles = new THREE.Points(geometry, flakeMaterial);
    scene.add(particles);
}

// Update Particle's Postion with Velocity
function upadateParticles() {

    for (let i = 0; i < numSnowFlakes * 3; i += 3) {
        particles.geometry.attributes.position.array[i] -= particles.geometry.attributes.velocity.array[i];
        particles.geometry.attributes.position.array[i + 1] -= particles.geometry.attributes.velocity.array[i + 1];
        particles.geometry.attributes.position.array[i + 2] -= particles.geometry.attributes.velocity.array[i + 2];

        if (particles.geometry.attributes.position.array[i + 1] < 0) {
            particles.geometry.attributes.position.array[i] = Math.floor(Math.random() * maxRange - minRange);
            particles.geometry.attributes.position.array[i + 1] = Math.floor(Math.random() * minRange + minHeight);
            particles.geometry.attributes.position.array[i + 2] = Math.floor(Math.random() * maxRange - minRange);
        }
    }

    particles.geometry.attributes.position.needsUpdate = true;
}

addSnowFlake();



const textureLoader = new THREE.TextureLoader();

/////////// CHRISTMATSTREE /////////////////


// Function to load OBJ model with texture
function loadChristmasTree(objPath, texturePath) {

    // Load the texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath);

    // Load the OBJ model
    const objLoader = new OBJLoader();
    objLoader.load(objPath, (object) => {
        // Apply the texture to the model
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material.map = texture;
            }
        });
        const scale = 5;
        // Set the scale of the model
        object.scale.set(scale, scale, scale);

        // Add the model to the scene
        scene.add(object);
    });
}

loadChristmasTree('model/Christmas Tree/obj/treeBark.obj', 'model/texture/BarkBake.png');
loadChristmasTree('model/Christmas Tree/obj/leaves.obj', 'model/texture/LeaveBake.png');





/////// GLOWING STAR /////////

// Create material with emissions
const glMaterial = new THREE.MeshPhongMaterial({
    color: 0xfcfe9a,
    emissive: 0xffff00, // Yellow emissive color
    emissiveIntensity: 0.5, // Emissive intensity
});

const loader = new OBJLoader();
// Load the OBJ file
loader.load('model/GlowingStar/star.obj', (object) => {
    // Set the material for each mesh in the loaded object
    object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            // Apply your desired material properties here
            child.material = glMaterial;
        }
    });

    object.position.set(0, 23.5, -0.25);
    const scale = 1.5
    // Set the scale of the model
    object.scale.set(scale, scale, scale);

    // Add the loaded object to the scene
    scene.add(object);
});






//////// PRESENT BOXES ////////////////


// Array of texture paths
var boxPBTextures = [
    'model/texture/BlueBoxBake.png',
    'model/texture/GrayBoxBake.png',
    'model/texture/OrangeBoxBake.png',
    'model/texture/RedBoxBake.png'
];

var stringPBTextures = [
    'model/texture/GreenBowBake_String.png',
    'model/texture/RedBowBake_String.png',
    'model/texture/VioletBowBake_String.png',
    'model/texture/YellowBowBake_String.png'
];

var bowPBTextures = [
    'model/texture/GreenBowBake_Bow.png',
    'model/texture/RedBowBake_Bow.png',
    'model/texture/VioletBowBake_Bow.png',
    'model/texture/YellowBowBake_Bow.png'
];

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to load the models and create a present box with random parameters
function loadRandomPresentBox() {
    var boxPosition = {
        x: Math.random() < 0.5 ? // Randomly choose between two ranges
            Math.random() * (4 - 1.25) + 1.25 : // [1.25 to 4]
            Math.random() * (1.25 - (-4)) - 4,  // [-4 to -1.25]
        y: 0,
        z: Math.random() < 0.5 ?
            Math.random() * (4 - 1.25) + 1.25 :
            Math.random() * (1.25 - (-4)) - 4,
    };

    var boxScale = {
        x: Math.random() * 1 + 0.5, // Random scale in the range [0.5, 1.5]
        y: Math.random() * 1 + 0.5,
        z: Math.random() * 1 + 0.5
    };

    var boxRotation = {
        x: 0,
        y: Math.random() * Math.PI * 2, // Random rotation in the range [0, 2π]
        z: 0
    };

    // Shuffle the arrays to avoid color matching
    shuffleArray(boxPBTextures);
    shuffleArray(stringPBTextures);
    shuffleArray(bowPBTextures);

    var randomBoxTexturePath = boxPBTextures[Math.floor(Math.random() * boxPBTextures.length)];
    var randomStringTexturePath = stringPBTextures[Math.floor(Math.random() * stringPBTextures.length)];
    var randomBowTexturePath = bowPBTextures[Math.floor(Math.random() * bowPBTextures.length)];

    loader.load('model/Present Box/box.obj', function (box) {

        loader.load('model/Present Box/string.obj', function (string) {

            loader.load('model/Present Box/bow.obj', function (bow) {

                // Combine the models into a present box
                var presentBox = new THREE.Group();
                presentBox.add(box);
                presentBox.add(string);
                presentBox.add(bow);

                // Set positions, scales, rotations, and textures as needed
                presentBox.position.set(boxPosition.x, boxPosition.y, boxPosition.z);
                presentBox.scale.set(boxScale.x, boxScale.y, boxScale.z);
                presentBox.rotation.set(boxRotation.x, boxRotation.y, boxRotation.z);

                // Set random textures for each model
                var randomBoxTexture = textureLoader.load(randomBoxTexturePath);
                var randomStringTexture = textureLoader.load(randomStringTexturePath);
                var randomBowTexture = textureLoader.load(randomBowTexturePath);

                box.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material.map = randomBoxTexture;
                    }
                });

                string.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material.map = randomStringTexture;
                    }
                });

                bow.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material.map = randomBowTexture;
                    }
                });

                // Add the present box to the scene
                scene.add(presentBox);

                // Render the scene
                renderer.render(scene, camera);
            });
        });
    });
}


// Specify the number of present boxes to generate
var numberOfBoxes = 10;

// Call the loadRandomPresentBox function multiple times to generate the specified number of boxes
for (var i = 0; i < numberOfBoxes; i++) {
    loadRandomPresentBox();
}

loadRandomPresentBox();







//////////// CHIMNEY ///////////////////////

// Load Chimney
loader.load('model/Chimney/chimney.obj', function (chimney) {

    var chimenyTexture = textureLoader.load('model/texture/Chimney.png');
    chimney.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.map = chimenyTexture;
        }
    });

    chimney.position.set(46, 0, 15);
    chimney.rotation.y = Math.PI / 2;
    // Add the present box to the scene
    scene.add(chimney);
});

// Load wood
loader.load('model/Chimney/wood.obj', function (wood) {

    var woodTexture = textureLoader.load('model/texture/Wood.png');
    wood.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.map = woodTexture;
        }
    });

    wood.position.set(46, 0, 15);
    wood.rotation.y = Math.PI / 2;
    // Add the present box to the scene
    scene.add(wood);
});

// Load smoke and fire
// var gltfLoader = new GLTFLoader();
// var gltf;

// gltfLoader.load('model/Chimney/fire_smoke.glb', function (loadedGltf) {
//     gltf = loadedGltf;
//     scene.add(gltf.scene);

//     // Set position
//     gltf.scene.position.set(20, 0, 15);

//     // Set rotation (around the y-axis by pi/2 radians)
//     gltf.scene.rotation.set(0, Math.PI / 2, 0);
// });





/////////////// ROOM ///////////////


// Load Wall
loader.load('model/Room/wall.obj', function (room) {

    var roomTexture = textureLoader.load('model/texture/Wall.png');
    room.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.map = roomTexture;
        }
    });

    room.position.set(0, 0, 0);
    room.scale.set(50, 30, 50);

    // Add the present box to the scene
    scene.add(room);
});


// Load ground
loader.load('model/Room/ground.obj', function (ground) {

    var groundTexture = textureLoader.load('model/texture/Ground.png');
    ground.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.map = groundTexture;
        }
    });

    ground.position.set(0, 0, 0);
    ground.scale.set(50, 30, 50);

    // Add the present box to the scene
    scene.add(ground);
});


// Load Floor
loader.load('model/Room/ground.obj', function (floor) {

    var floorTexture = textureLoader.load('model/texture/Ground.png');
    floor.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.map = floorTexture;
        }
    });

    floor.position.set(0, 0, 0);
    floor.scale.set(50, 30, 50);

    // Add the present box to the scene
    scene.add(floor);
});

// Load Roof
loader.load('model/Room/roof.obj', function (roof) {

    var roofTexture = textureLoader.load('model/texture/Roof.png');
    roof.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.map = roofTexture;
        }
    });

    roof.position.set(0, 10, 0);
    roof.scale.set(50, 30, 50);

    // Add the present box to the scene
    scene.add(roof);
});

// Load Glass
loader.load('model/Room/glass.obj', function (glass) {

    glassMaterial = 
    roof.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.map = roofTexture;
        }
    });

    glass.position.set(0, 0, 0);
    glass.scale.set(50, 30, 50);
    glass.rotaion.x = Math.PI * 2;

    // Add the present box to the scene
    scene.add(roof);
});


// Animation

function animate() {
    requestAnimationFrame(animate);

    upadateParticles();

    controls.update();

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
});

