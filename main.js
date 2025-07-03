const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

let cube = null;

// 1. 用 STLLoader 加载模型
const loader = new STLLoader();
loader.load('model/FinalProject_zhezhou.stl', function (geometry) {
    geometry.computeVertexNormals(); // 保证有法线
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    // 可选：自动居中和缩放
    const box = new THREE.Box3().setFromObject(cube);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 2;
});

camera.position.z = 5;

function animate() {
    if (cube) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
}
