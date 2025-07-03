const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(800, 600); // 设置固定尺寸
renderer.setAnimationLoop(animate);
document.getElementById('container').appendChild(renderer.domElement);

// 启用透明度
renderer.setClearColor(0x000000, 0);

let cube; // 声明为全局变量，以便在加载完成后使用

// 加载shader配置
async function loadShaderConfig() {
    try {
        const response = await fetch('shader/Shader_zhezhou.json');
        const shaderConfig = await response.json();
        return shaderConfig;
    } catch (error) {
        console.error('加载shader配置失败:', error);
        return null;
    }
}

// 创建自定义材质
function createCustomMaterial(shaderConfig) {
    const uniforms = {
        time: { value: 0 },
        color: { value: new THREE.Color(0xff0000) }, // 红色
        glowColor: { value: new THREE.Color(0xffff00) }, // 黄色
        glowStrength: { value: 2.0 },
        bulbPos: { value: new THREE.Vector3(0, 0, 0) },
        redAlpha: { value: 0.5 }
    };

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shaderConfig.vertex,
        fragmentShader: shaderConfig.fragment,
        transparent: true,
        side: THREE.DoubleSide
    });

    return material;
}

// 加载STL模型
function loadSTLModel(material) {
    const loader = new STLLoader();
    
    loader.load(
        'model/FinalProject_zhezhou.stl',
        function (geometry) {
            // 计算法向量
            geometry.computeVertexNormals();
            
            // 创建网格
            cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            
            // 调整相机位置以适应模型
            const box = new THREE.Box3().setFromObject(cube);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.z = maxDim * 2;
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('加载STL模型失败:', error);
            // 如果加载失败，使用默认几何体
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
        }
    );
}

// 初始化场景
async function init() {
    const shaderConfig = await loadShaderConfig();
    if (shaderConfig) {
        const material = createCustomMaterial(shaderConfig);
        loadSTLModel(material);
    } else {
        // 如果shader加载失败，使用默认材质
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
    }
}

camera.position.z = 5;

function animate() {
    if (cube) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        
        // 更新shader uniforms
        if (cube.material.uniforms && cube.material.uniforms.time) {
            cube.material.uniforms.time.value += 0.01;
        }
    }

    renderer.render(scene, camera);
}

// 启动应用
init();
