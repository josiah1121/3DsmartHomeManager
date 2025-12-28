import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(renderer.devicePixelRatio);
document.body.appendChild(renderer.domElement);

camera.position.set(45, 45, 45);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const COLORS = { wall: 0x00d4ff, floor: 0x001122, grid: 0x002233, text: '#00ffff', door: 0xffffff };
scene.add(new THREE.GridHelper(100, 100, COLORS.grid, COLORS.grid));

// --- PRECISION COORDINATES (1 unit = 1 foot) ---
const walls = [
    // SCREENED PORCH (22'7" x 10'7")
    [-11.3, -10.6, 11.3, -10.6], [-11.3, -10.6, -11.3, 0], [11.3, -10.6, 11.3, 0],

    // NORTH EXTERIOR LINE
    [-24.2, 0, -11.3, 0], [11.3, 0, 28.1, 0], 

    // PRIMARY BEDROOM (12'11" x 12'0")
    [-24.2, 0, -24.2, 12],     
    [-24.2, 12, -11.3, 12],    
    [-11.3, 0, -11.3, 12],     

    // BATH 1 (5'10" x 9'1")
    [-11.3, 9.1, -5.5, 9.1],   
    [-5.5, 9.1, -5.5, 0],      
    [-5.5, 0, -11.3, 0],       

    // BEDROOM 2 (13'11" x 10'4")
    [-24.2, 12, -24.2, 22.4], 
    [-24.2, 22.4, -11.3, 22.4], 
    [-11.3, 22.4, -11.3, 12],  

    // BATH 2 (4'11" x 10'4")
    [-11.3, 13.5, -5.5, 13.5], 
    [-5.5, 13.5, -5.5, 22.4],  
    [-11.3, 22.4, -5.5, 22.4], 

    // CENTRAL LIVING & DINING (Open Hallway)
    [-5.5, 0, 6.6, 0],         
    [6.6, 0, 6.6, 22.4],       
    [-5.5, 22.4, 6.6, 22.4],   

    // KITCHEN & UTILITY
    [6.6, 8.7, 23.4, 8.7], [23.4, 0, 23.4, 14.8], [6.6, 14.8, 23.4, 14.8],
    [11.1, 8.7, 11.1, 14.8], 
    
    // GARAGE
    [6.6, 14.8, 6.6, 32], [6.6, 32, 20, 32], [20, 32, 20, 14.8]
];

// REFINED DOOR PLACEMENT
const doors = [
    { x: -11.3, z: 4.5, rot: 1.57 },  // Primary to Bath 1
    { x: -15, z: 12, rot: 0 },        // Primary to Hall
    { x: -11.3, z: 15.5, rot: 1.57 }, // Bedroom 2 to Hall
    { x: -11.3, z: 19.5, rot: 1.57 }  // BATH 2 DOOR: Located in hall, aligned with the wall
];

function createWall(x1, z1, x2, z2) {
    const len = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(z2-z1, 2));
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(len, 4, 0.4), new THREE.MeshPhongMaterial({ color: COLORS.wall, transparent: true, opacity: 0.25 }));
    mesh.position.set((x1+x2)/2, 2, (z1+z2)/2);
    mesh.rotation.y = -Math.atan2(z2-z1, x2-x1);
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: COLORS.wall, opacity: 0.8, transparent: true })));
    scene.add(mesh);
}

function createDoor(x, z, rot) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.5, 2.8), new THREE.MeshBasicMaterial({ color: COLORS.door, wireframe: true, transparent: true, opacity: 0.5 }));
    door.position.set(x, 1.75, z);
    door.rotation.y = rot;
    scene.add(door);
}

function createLabel(text, x, z) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512; canvas.height = 128;
    ctx.font = 'Bold 40px Courier New'; ctx.fillStyle = COLORS.text; ctx.textAlign = 'center';
    ctx.fillText(text, 256, 64);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
    sprite.position.set(x, 6, z); sprite.scale.set(10, 2.5, 1);
    scene.add(sprite);
}

walls.forEach(w => createWall(w[0], w[1], w[2], w[3]));
doors.forEach(d => createDoor(d.x, d.z, d.rot));

const labels = [
    { n: "PRIMARY BED", x: -17, z: 6 }, { n: "BATH 1", x: -8.4, z: 4.5 },
    { n: "BEDROOM 2", x: -17, z: 17.5 }, { n: "BATH 2", x: -8.4, z: 18.5 },
    { n: "HALL", x: -8.4, z: 12.5 }, { n: "LIVING", x: 0, z: 15 }
];
labels.forEach(l => createLabel(l.n, l.x, l.z));

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.PointLight(0x00d4ff, 150); light.position.set(0, 30, 0); scene.add(light);

function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
animate();