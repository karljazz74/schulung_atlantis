<script setup>
import { ref, onMounted } from 'vue';
import AppMenu from './AppMenu.vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { createDirectus, graphql } from '@directus/sdk';

const client = createDirectus('https://graphql.openmuseum.uni-bonn.de/graphql').with(graphql());

const lightLogo = ref('');
const darkLogo = ref('');

const { layoutState, layoutConfig } = useLayout();
const router = useRouter();

let timeout = null;

// Step 3
onMounted(async () => {
  // Fetch your images from Directus API here and set them to the refs.
  // For demonstration, using static IDs, replace with dynamic IDs if needed.
  lightLogo.value = `https://graphql.openmuseum.uni-bonn.de/assets/dff6296d-858b-43f2-b2f6-2689226efea2?key=preset-1`;
  darkLogo.value = `https://graphql.openmuseum.uni-bonn.de/assets/dff6296d-858b-43f2-b2f6-2689226efea2?key=preset-1`;
});


const onMouseEnter = () => {
    if (!layoutState.anchored.value) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        layoutState.sidebarActive.value = true;
    }
};

const onMouseLeave = () => {
    if (!layoutState.anchored.value) {
        if (!timeout) {
            timeout = setTimeout(() => (layoutState.sidebarActive.value = false), 300);
        }
    }
};

const anchor = () => {
    layoutState.anchored.value = !layoutState.anchored.value;
};
const navigateToHome = () => {
    router.push('/');
};
</script>

<template>
    <div class="layout-sidebar" @mouseenter="onMouseEnter()" @mouseleave="onMouseLeave()">
        <div class="sidebar-header">
          
                <div class="card"> 
            <a @click="navigateToHome" class="app-logo" style="cursor: pointer">
                <div class="app-logo-small h-7rem">
                    <img :src="layoutConfig.colorScheme.value === 'light' ? lightLogo : darkLogo" />
                  </div>
                  <div class="app-logo-normal">
                    <img class="h-7rem" :src="layoutConfig.colorScheme.value === 'light' ? lightLogo : darkLogo" />
                  </div>
            </a>
            </div>
        
            <Button class="layout-sidebar-anchor p-link z-2" type="button" @click="anchor()"></Button>
        </div>

        <div class="layout-menu-container">
            <AppMenu />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
