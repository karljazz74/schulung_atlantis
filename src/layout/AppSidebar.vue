<script setup>
import { ref, onMounted } from 'vue';
import AppMenu from './AppMenu.vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
// import { createDirectus, graphql } from '@directus/sdk';

// const client = createDirectus('https://graphql.openmuseum.uni-bonn.de/graphql').with(graphql());

const lightLogo = ref('');
const darkLogo = ref('');

const { layoutState, layoutConfig } = useLayout();
const router = useRouter();

let timeout = null;

// Step 3
onMounted(async () => {
    // Fetch your images from Directus API here and set them to the refs.
    // For demonstration, using static IDs, replace with dynamic IDs if needed.
    lightLogo.value = `https://directus.uxulmassgrave.uni-bonn.de/assets/38dcfd3b-1b7b-42dc-a4b9-c28bae208537?key=bild-med`;
    darkLogo.value = `https://directus.uxulmassgrave.uni-bonn.de/assets/176b3ff4-113f-423f-b6e8-f323ecc2334e.p?key=bild-med`;
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
                    <div class="app-logo-small h-6rem">
                        <img :src="layoutConfig.colorScheme.value === 'light' ? lightLogo : darkLogo" />
                    </div>
                    <div class="app-logo-normal">
                        <img class="h-6rem" :src="layoutConfig.colorScheme.value === 'light' ? lightLogo : darkLogo" />
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

<style lang="scss" scoped>
.layout-sidebar {
    position: fixed;
    height: 100%;
    top: 0;
    left: 0;
    width: 12rem;
    display: flex;
    flex-direction: column;
    border-radius: 0px 40px 40px 0px;
}
</style>
