<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ProductService } from '@/service/modelService.js';
import ModelViewer from '@/components/ModelViewer.vue'; // Import the ModelViewer component

const props = defineProps({
    modelPath: String
});

const picklistValue = ref([
    [
        { name: 'San Francisco', code: 'SF' },
        { name: 'London', code: 'LDN' },
        { name: 'Paris', code: 'PRS' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Berlin', code: 'BRL' },
        { name: 'Barcelona', code: 'BRC' },
        { name: 'Rome', code: 'RM' },
    ],
    [],
]);

const orderlistValue = ref([
    { name: 'San Francisco', code: 'SF' },
    { name: 'London', code: 'LDN' },
    { name: 'Paris', code: 'PRS' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Berlin', code: 'BRL' },
    { name: 'Barcelona', code: 'BRC' },
    { name: 'Rome', code: 'RM' },
]);

const dataviewValue = ref(null);
const layout = ref('grid');
const globalFilterValue = ref('');
const filteredValue = ref(null);
const sortKey = ref(null);
const sortOrder = ref(null);
const sortField = ref(null);
const sortOptions = ref([
    { label: 'Price High to Low', value: '!price' },
    { label: 'Price Low to High', value: 'price' },
]);

const productService = new ProductService();

const onSortChange = (event) => {
        const value = event.value.value;
        const sortValue = event.value;

        if (value.indexOf('!') === 0) {
            sortOrder.value = -1;
            sortField.value = value.substring(1, value.length);
            sortKey.value = sortValue;
        } else {
            sortOrder.value = 1;
            sortField.value = value;
            sortKey.value = sortValue;
        }
    };

    const onFilter = (e) => {
        const value = e.target.value;
        globalFilterValue.value = value;
        if (value.length === 0) {
            filteredValue.value = null;
        } else {
            const filtered = dataviewValue.value.filter((product) => {
                return product.name.toLowerCase().includes(value.toLowerCase());
            });
            filteredValue.value = filtered;
        }
    };

    const getBadgeSeverity = (status) => {
        const stockStatus = {
            OUTOFSTOCK: 'danger',
            LOWSTOCK: 'warning',
            INSTOCK: 'success',
        };

        return stockStatus[status];
    };

const threeCanvasContainer = ref(null);

// Function to initialize and load the 3D model
let scene, camera, renderer, controls;

const initThreeJS = () => {
  console.log("threeCanvasContainer:", threeCanvasContainer.value);

  if (!threeCanvasContainer.value) {
    console.error("threeCanvasContainer is null");
    return;
  }

  // Scene setup
  scene = new THREE.Scene();
  console.log(threeCanvasContainer.value); // Log to check if the ref is set
const canvasWidth = threeCanvasContainer.value.clientWidth;
const canvasHeight = threeCanvasContainer.value.clientHeight;

  // Camera setup
  camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
  camera.position.set(0, 0.2, 10);

  // Renderer setup
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(canvasWidth, canvasHeight);
  threeCanvasContainer.value.appendChild(renderer.domElement);

  // Lighting setup
  const ambientLight = new THREE.AmbientLight(0x404040, 15);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  // OrbitControls initialization
  controls = new OrbitControls(camera, renderer.domElement);

// Function to load the model
const loadModel = (modelPath) => {
    const loader = new GLTFLoader();
    loader.load(modelPath, function(gltf) {
        scene.add(gltf.scene);

        // Adjust the model as needed
        gltf.scene.scale.set(0.5, 0.5, 0.5);
        gltf.scene.position.set(0, -0.5, 0);
        gltf.scene.rotation.y = Math.PI / -2;
    }, undefined, function(error) {
        console.error('An error happened while loading the model:', error);
    });
};



const animate = () => {
  requestAnimationFrame(animate);

  // Update model rotation or other animations
  if (scene.children.length > 0) {
    const model = scene.children.find(child => child.type === "Group");
    if (model) {
      model.rotation.y += 0.01;
    }
  }

  // Render the scene
  if (scene && camera) {
    renderer.render(scene, camera);
  }
  controls.update();
};


onMounted(() => {
  productService.getProductsSmall().then(data => {
    dataviewValue.value = data;
    // For each product, initialize and load the 3D model
    data.forEach(product => {
    
      loadModel(product.modelPath);
      animate()
    });
  });
  // Other initializations...
});


    // added CPG
    // added for 3D
  window.addEventListener('resize', onWindowResize, false);
  
  // Define onWindowResize function only once
  function onWindowResize() {
      if (camera && renderer) {
        const width = threeCanvasContainer.value.clientWidth;
        const height = threeCanvasContainer.value.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    }
};
  
    onBeforeUnmount(() => {
      if (renderer) {
        renderer.dispose();
      }
      window.removeEventListener('resize', onWindowResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    });
    watch(threeCanvasContainer, (newVal, oldVal) => {
  if (newVal !== null && oldVal === null) {
    initThreeJS();
  }
}, { immediate: true });
   // line 210
</script>    

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>DataView</h5>
                <DataView :value="filteredValue || dataviewValue" :layout="layout" :paginator="true" :rows="9" :sortOrder="sortOrder" :sortField="sortField">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between gap-2">
                            <div>
                                <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By Price" @change="onSortChange($event)" />
                            </div>
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="globalFilterValue" @input="onFilter" placeholder="Search by Name" />
                            </span>
                            <div>
                                <DataViewLayoutOptions v-model="layout" />
                            </div>
                        </div>
                    </template>
                    <template #list="slotProps">
                        <div class="col-12">
                            <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                <div ref="threeCanvasContainer" class="three-canvas-container">
              <!-- 3D models will be rendered here -->
              <ModelViewer v-for="item in dataviewValue" :key="item.id" :modelPath="item.modelPath" />
            </div>
            <div class="flex-1 flex flex-column align-items-center text-center md:text-left">
                                    <div class="font-bold text-2xl">{{ slotProps.data.name }}</div>
                                    <div class="mb-2">{{ slotProps.data.description }}</div>
                                    <Rating :modelValue="slotProps.data.rating" :readonly="true" :cancel="false" class="mb-2"></Rating>
                                    <div class="flex align-items-center mt-1">
                                        <i class="pi pi-tag mr-2"></i>
                                        <span class="font-semibold">{{ slotProps.data.category }}</span>
                                    </div>
                                </div>
                                <div class="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
                                    <span class="text-2xl font-semibold mb-2 align-self-center md:align-self-end">${{ slotProps.data.price }}</span>
                                    <Button icon="pi pi-shopping-cart" label="Add to Cart" :disabled="slotProps.data.inventoryStatus === 'OUTOFSTOCK'" class="mb-2 p-button-sm"></Button>
                                    <Badge :severity="getBadgeSeverity(slotProps.data.inventoryStatus)">{{ slotProps.data.inventoryStatus }}</Badge>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #grid="slotProps">
                        <div class="col-12 md:col-4">
                            <div class="card m-3 border-1 surface-border">
                                <div class="flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
                                    <div class="flex align-items-center">
                                        <i class="pi pi-tag mr-2"></i>
                                        <span class="font-semibold">{{ slotProps.data.category }}</span>
                                    </div>
                                    <Badge :severity="getBadgeSeverity(slotProps.data.inventoryStatus)">{{ slotProps.data.inventoryStatus }}</Badge>
                                </div>
                                <div class="text-center flex align-items-center flex-column -mb-3">
                                    <pre>modelPath for item {{ item.id }}: {{ item.modelPath }}</pre>
                                      <!-- Use ModelViewer component to display 3D models -->
                                      <div ref="threeCanvasContainer" class="three-canvas-container">
              <!-- 3D models will be rendered here -->
              <ModelViewer v-for="item in dataviewValue" :key="item.id" :modelPath="item.modelPath" />
            </div>
                    <div class="text-2xl font-bold">{{ slotProps.data.name }}</div>
                                    <div class="mb-3">{{ slotProps.data.description }}</div>
                                    <Rating :modelValue="slotProps.data.rating" :readonly="true" :cancel="false"></Rating>
                                </div>
                                <div class="flex align-items-center justify-content-between">
                                    <span class="text-2xl font-semibold">${{ slotProps.data.price }}</span>
                                    <Button icon="pi pi-shopping-cart" :disabled="slotProps.data.inventoryStatus === 'OUTOFSTOCK'"></Button>
                                </div>
                            </div>
                        </div>
                    </template>
                </DataView>
            </div>
        </div>

        <div class="col-12 xl:col-8">
            <div class="card">
                <h5>PickList</h5>
                <PickList v-model="picklistValue" listStyle="height:250px" dataKey="code">
                    <template #sourceheader> From </template>
                    <template #targetheader> To </template>
                    <template #item="slotProps">
                        <div>{{ slotProps.item.name }}</div>
                    </template>
                </PickList>
            </div>
        </div>

        <div class="col-12 xl:col-4">
            <div class="card">
                <h5>OrderList</h5>
                <OrderList v-model="orderlistValue" listStyle="height:250px" dataKey="code" :rows="10">
                    <template #header> Cities </template>
                    <template #item="slotProps">
                        <div>{{ slotProps.item.name }}</div>
                    </template>
                </OrderList>
            </div>
        </div>
    </div>
</template>
<style scoped>
.three-canvas-container {
  width: 180px;
  height: 150px;
  /* Additional styles */
}
</style>
