<script setup>
import { ref } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import AppSidebar from './AppSidebar.vue';
const { onMenuToggle, showConfigSidebar, showSidebar } = useLayout();
const searchInput = ref(null);
const searchActive = ref(false);

const onMenuButtonClick = () => {
    onMenuToggle();
};

const activateSearch = () => {
    searchActive.value = true;
    setTimeout(() => {
        searchInput.value.$el.focus();
    }, 100);
};
const deactivateSearch = () => {
    searchActive.value = false;
};
const onConfigButtonClick = () => {
    showConfigSidebar();
};
const onSidebarButtonClick = () => {
    showSidebar();
};
</script>
<template>
    <div class="layout-topbar">
        <div class="topbar-start">
            <Button ref="menubutton" type="button" class="topbar-menubutton p-link p-trigger" @click="onMenuButtonClick()">
                <i class="pi pi-bars"></i>
            </Button>
        </div>
        <div class="layout-topbar-menu-section">
            <AppSidebar />
        </div>
        <div class="topbar-end">
            <ul class="topbar-menu">
                <li class="hidden lg:block">
                    <div class="topbar-search" :class="{ 'topbar-search-active': searchActive }">
                        <Button icon="pi pi-search" class="topbar-searchbutton p-button-text p-button-secondary text-color-secondary p-button-rounded flex-shrink-0" type="button" @click="activateSearch()"></Button>
                        <div class="search-input-wrapper">
                            <span class="p-input-icon-right">
                                <InputText ref="searchInput" type="text" placeholder="Search" @blur="deactivateSearch()" @keydown.escape="deactivateSearch()" />
                                <i class="pi pi-search"></i>
                            </span>
                        </div>
                    </div>
                </li>

                <li class="profile-item topbar-item">
                    <Button type="button" icon="pi pi-bell" class="p-button-text p-button-secondary text-color-secondary p-button-rounded flex-shrink-0"></Button>
                </li>

                <li class="profile-item topbar-item">
                    <Button type="button" icon="pi pi-comment" class="p-button-text p-button-secondary relative text-color-secondary p-button-rounded flex-shrink-0"></Button>
                </li>

                <li class="ml-3">
                    <Button type="button" icon="pi pi-cog" class="p-button-text p-button-secondary text-color-secondary p-button-rounded flex-shrink-0" @click="onConfigButtonClick()"></Button>
                </li>

                <li ref="profile" class="profile-item topbar-item">
                    <a v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'px-scalein', leaveToClass: 'hidden', leaveActiveClass: 'px-fadeout', hideOnOutsideClick: true }" pRipple class="cursor-pointer">
                        <img class="border-circle" src="/layout/images/avatar/avatar-m-1.jpg" />
                    </a>

                    <ul class="topbar-menu active-topbar-menu p-4 w-15rem z-5 hidden border-round">
                        <li role="menuitem" class="m-0 mb-3">
                            <a
                                href="#"
                                class="flex align-items-center hover:text-primary-500 transition-duration-200"
                                v-styleclass="{ selector: '@grandparent', enterClass: 'hidden', enterActiveClass: 'px-scalein', leaveToClass: 'hidden', leaveActiveClass: 'px-fadeout', hideOnOutsideClick: true }"
                            >
                                <i class="pi pi-fw pi-lock mr-2"></i>
                                <span>Privacy</span>
                            </a>
                        </li>

                        <li role="menuitem" class="m-0 mb-3">
                            <a
                                href="#"
                                class="flex align-items-center hover:text-primary-500 transition-duration-200"
                                v-styleclass="{ selector: '@grandparent', enterClass: 'hidden', enterActiveClass: 'px-scalein', leaveToClass: 'hidden', leaveActiveClass: 'px-fadeout', hideOnOutsideClick: true }"
                            >
                                <i class="pi pi-fw pi-cog mr-2"></i>
                                <span>Settings</span>
                            </a>
                        </li>
                        <li role="menuitem" class="m-0">
                            <a
                                href="#"
                                class="flex align-items-center hover:text-primary-500 transition-duration-200"
                                v-styleclass="{ selector: '@grandparent', enterClass: 'hidden', enterActiveClass: 'px-scalein', leaveToClass: 'hidden', leaveActiveClass: 'px-fadeout', hideOnOutsideClick: true }"
                            >
                                <i class="pi pi-fw pi-sign-out mr-2"></i>
                                <span>Logout</span>
                            </a>
                        </li>
                    </ul>
                </li>

                <li class="right-panel-button relative hidden lg:block">
                    <Button type="button" label="Today" style="width: 5.7rem" icon="pi pi-bookmark" class="layout-rightmenu-button hidden md:block font-normal" @click="onSidebarButtonClick()"></Button>
                    <Button type="button" icon="pi pi-bookmark" class="layout-rightmenu-button block md:hidden font-normal" @click="onSidebarButtonClick()"></Button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped>
::v-deep(.layout-megamenu) {
    background: none;
    .p-megamenu-root-list {
        .p-menuitem-link:not(.p-submenu-list .p-menuitem-link) {
            .p-menuitem-text,
            .p-menuitem-icon,
            .p-submenu-icon {
                color: var(--topbar-item-text-color) !important;
            }
            .layout-megamenu:not(.p-disabled):hover {
                background: var(--topbar-item-hover-bg);
                transition: background-color var(--transition-duration);
            }
        }
    }
}
</style>
