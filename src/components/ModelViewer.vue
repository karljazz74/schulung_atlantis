<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const props = defineProps({
    modelPath: String
});

const canvasRef = ref(null);
let scene, camera, renderer, controls;

// Function to initialize and load the 3D model
const initThreeJS = (canvas) => {
    scene = new THREE.Scene();

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 0.2, 10);

    renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(canvasWidth, canvasHeight);

    const ambientLight = new THREE.AmbientLight(0x404040, 15);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    controls = new OrbitControls(camera, renderer.domElement);

    loadModel(props.modelPath);
};

const loadModel = (modelPath) => {
    const loader = new GLTFLoader();
    loader.load(modelPath, function (gltf) {
        gltf.scene.scale.set(0.5, 0.5, 0.5);
        gltf.scene.position.set(0, -0.5, 0);
        gltf.scene.rotation.y = Math.PI / -2;

        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }

        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    });
};

const animate = () => {
    requestAnimationFrame(animate);

    if (scene.children.length > 0) {
        const model = scene.children.find(child => child.type === "Group");
        if (model) {
            model.rotation.y += 0.01;
        }
    }

    if (scene && camera) {
        renderer.render(scene, camera);
    }
    controls.update();
};

onMounted(() => {
    if (canvasRef.value) {
        initThreeJS(canvasRef.value);
        animate();
    }
});

const onWindowResize = () => {
    if (camera && renderer && canvasRef.value) {
        camera.aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight);
    }
};

window.addEventListener('resize', onWindowResize, false);

onBeforeUnmount(() => {
    if (renderer) {
        renderer.dispose();
    }
    window.removeEventListener('resize', onWindowResize);
});
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>

<style scoped>
canvas {
  width: 100%; /* or your preferred width */
  height: 150px; /* or your preferred height */
}
</style>
