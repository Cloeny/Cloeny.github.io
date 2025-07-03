window.THREE = THREE; // ShaderFrog 运行时依赖

import { STLLoader } from 'https://esm.sh/three@0.155.0/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'https://esm.sh/three@0.155.0/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://esm.sh/lil-gui';

// 初始化场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xeeeeee);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('container').appendChild(renderer.domElement);

// 添加光照
scene.add(new THREE.AmbientLight(0x404040, 2));
const spotlight = new THREE.SpotLight(0xffffff, 5);
spotlight.position.set(5, 10, 5);
spotlight.angle = Math.PI / 6;
spotlight.penumbra = 0.3;
spotlight.castShadow = true;
spotlight.shadow.mapSize.width = 2048;
spotlight.shadow.mapSize.height = 2048;
scene.add(spotlight);

// 加载 STL 模型
let carMesh;
const loader = new STLLoader();
const modelParams = { x: 0, y: 0.5, z: 0, rotateY: 0, rotateX: 0, rotateZ: 0, rotating: false };

loader.load('model/FinalProject_zhezhou.stl', function (geometry) {
    geometry.computeBoundingBox();
    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    const scaleFactor = 2 / Math.max(size.x, size.y, size.z);
    const center = geometry.boundingBox.getCenter(new THREE.Vector3());

    // 用 ShaderFrogRuntime 加载 shader
    var runtime = new window.ShaderFrogRuntime();
    runtime.load(['shader/Shader_zhezhou.json'], function (shaders) {
        var material = runtime.get(shaders[0].name);
        material.transparent = true;

        // uniforms 设置
        if (material.uniforms.color) material.uniforms.color.value = new THREE.Color(1.0, 0.1, 0.1);
        if (material.uniforms.glowColor) material.uniforms.glowColor.value = new THREE.Color(1.0, 0.8, 0.3);
        if (material.uniforms.glowStrength) material.uniforms.glowStrength.value = 0.5;
        if (material.uniforms.bulbPos) material.uniforms.bulbPos.value = new THREE.Vector3(0, 0, 0);
        if (material.uniforms.redAlpha) material.uniforms.redAlpha.value = 0.5;

        carMesh = new THREE.Mesh(geometry, material);
        carMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        carMesh.position.set(-center.x * scaleFactor, 0.5, -center.z * scaleFactor);
        carMesh.castShadow = true;
        scene.add(carMesh);

        updateModelTransform();
    });
});

// 天空盒
const skyGeometry = new THREE.BoxGeometry(50, 50, 50);
const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });
const skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(skyBox);

// GUI 控制
const gui = new GUI();
const lightFolder = gui.addFolder('聚光灯');
lightFolder.add(spotlight.position, 'x', -20, 20).name("光源 X");
lightFolder.add(spotlight.position, 'y', 0, 30).name("光源 Y");
lightFolder.add(spotlight.position, 'z', -20, 20).name("光源 Z");
lightFolder.add(spotlight, 'intensity', 0, 10).name("光照强度");
lightFolder.add(spotlight, 'angle', 0.1, Math.PI / 2).name("光束角度").onChange(() => spotlight.updateMatrix());
lightFolder.add(spotlight, 'penumbra', 0, 1).name("半影强度");
lightFolder.open();

const carFolder = gui.addFolder('STL 模型');
carFolder.add(modelParams, 'rotating').name('旋转模型');
carFolder.add(modelParams, 'x', -5, 5).name('模型 X').onChange(updateModelTransform);
carFolder.add(modelParams, 'y', 0, 5).name('模型 Y').onChange(updateModelTransform);
carFolder.add(modelParams, 'z', -5, 5).name('模型 Z').onChange(updateModelTransform);
carFolder.add(modelParams, 'rotateX', -Math.PI, Math.PI).name('旋转 X').onChange(updateModelTransform);
carFolder.add(modelParams, 'rotateY', -Math.PI, Math.PI).name('旋转 Y').onChange(updateModelTransform);
carFolder.add(modelParams, 'rotateZ', -Math.PI, Math.PI).name('旋转 Z').onChange(updateModelTransform);
carFolder.open();

function updateModelTransform() {
    if (carMesh) {
        carMesh.position.set(modelParams.x, modelParams.y, modelParams.z);
        carMesh.rotation.set(modelParams.rotateX, modelParams.rotateY, modelParams.rotateZ);
    }
}

// 交互
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 监听窗口大小变化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    if (carMesh && modelParams.rotating) {
        carMesh.rotation.y += 0.01;
    }
    controls.update();
    renderer.render(scene, camera);
}
animate();
