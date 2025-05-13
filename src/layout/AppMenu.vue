<script setup>
import AppMenuItem from './AppMenuItem.vue';
import { ref } from 'vue';
const model = ref([
{
        label: 'HOME MENÜ',
        icon: 'pi pi-fw pi-download',
        items: [
            {
                label: 'Startseite',
                icon: 'pi pi-fw pi-home',
                click: () => window.location.href = 'https://openmuseum.uni-bonn.de'
            },
        ],
    },
    { separator: true },
    {
        label: 'SAMMLUNGEN',
        icon: 'pi pi-th-large',
        items: [
            {
                label: 'BASA Sammlung',
                icon: 'pi pi-fw pi-map',
                items: [
                    {
                        label: 'Highlights',
                        icon: 'pi pi-fw pi-image',
                        to: '/basa_collection/highlights',
                    },
                    {
                        label: 'Highlights Detail',
                        icon: 'pi pi-fw pi-sitemap',
                        to: '/basa_collection/detail',
                    },
                    {
                        label: 'Objects Browse',
                        icon: 'pi pi-fw pi-sitemap',
                        to: '/basa_collection/detail',
                    },
                    {
                        label: 'Directus CMS',
                        icon: 'pi pi-fw pi-database',
                        to: '/basa_collection/detail',
                    },
                    {
                        label: 'PG Admin interface',
                        icon: 'pi pi-fw pi-server',
                        to: '/basa_collection/detail',
                    },
                ],
            },
            {
                label: 'Ägyptisches Museum Sammlung',
                icon: 'pi pi-fw pi-map',
                items: [
                    {
                        label: 'Highlights',
                        icon: 'pi pi-fw pi-image',
                        to: '/apps/learn/list',
                    },
                    {
                        label: 'Objects Browse',
                        icon: 'pi pi-fw pi-sitemap',
                        to: '/apps/learn/detail',
                    },
                    {
                        label: 'Directus CMS',
                        icon: 'pi pi-fw pi-database',
                        to: '/apps/learn/edit',
                    },
                    {
                        label: 'PG Admin interface',
                        icon: 'pi pi-fw pi-server',
                        to: '/apps/learn/edit',
                    },
                ],
            },
            {
                label: 'AKM Sammlung',
                icon: 'pi pi-fw pi-map',
                items: [
                    {
                        label: 'Highlights',
                        icon: 'pi pi-fw pi-image',
                        to: '/apps/learn/list',
                    },
                    {
                        label: 'Objects Browse',
                        icon: 'pi pi-fw pi-sitemap',
                        to: '/apps/learn/detail',
                    },
                    {
                        label: 'Directus CMS',
                        icon: 'pi pi-fw pi-database',
                        to: '/apps/learn/edit',
                    },
                    {
                        label: 'PG Admin interface',
                        icon: 'pi pi-fw pi-server',
                        to: '/apps/learn/edit',
                    },
                ],
            }
            
        ],
    },
    {
        label: 'Apps',
        icon: 'pi pi-th-large',
        items: [
            {
                label: 'Learning',
                icon: 'pi pi-fw pi-comment',
                items: [
                    {
                        label: 'List',
                        icon: 'pi pi-fw pi-list',
                        to: '/apps/learn/list',
                    },
                    {
                        label: 'Detail',
                        icon: 'pi pi-fw pi-image',
                        to: '/apps/learn/detail',
                    },
                    {
                        label: 'Sammlunghighlight',
                        icon: 'pi pi-fw pi-image',
                        to: '/apps/learn/highlight',
                    },
                    {
                    label: 'AR Viewer',
                    icon: 'pi pi-fw pi-image',
                    to: '/ar-viewer',
                },
                ],
            },
            {
                label: 'Blog',
                icon: 'pi pi-fw pi-comment',
                items: [
                    {
                        label: 'List',
                        icon: 'pi pi-fw pi-image',
                        to: '/apps/blog/list',
                    },
                    {
                        label: 'Detail',
                        icon: 'pi pi-fw pi-list',
                        to: '/apps/blog/detail',
                    },
                    {
                        label: 'Edit',
                        icon: 'pi pi-fw pi-pencil',
                        to: '/apps/blog/edit',
                    },
                ],
            },
            
        ],
    },
    { separator: true },
    {
        label: 'UI Kit',
        icon: 'pi pi-fw pi-star-fill',
        items: [
            {
                label: 'Table',
                icon: 'pi pi-fw pi-table',
                to: '/uikit/table',
            },
            {
                label: 'List',
                icon: 'pi pi-fw pi-list',
                to: '/uikit/list',
            },
            {
                label: 'Tree',
                icon: 'pi pi-fw pi-share-alt',
                to: '/uikit/tree',
            },
            {
                label: 'Media',
                icon: 'pi pi-fw pi-image',
                to: '/uikit/media',
            },
            {
                label: 'Menu',
                icon: 'pi pi-fw pi-bars',
                to: '/uikit/menu',
            },
            {
                label: 'File',
                icon: 'pi pi-fw pi-file',
                to: '/uikit/file',
            },
        ],
    },
    { separator: true },
    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        items: [ 
            {
                label: 'Auth',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Login',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/auth/login',
                    },
                    {
                        label: 'Error',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/auth/error',
                    },
                    {
                        label: 'Access Denied',
                        icon: 'pi pi-fw pi-lock',
                        to: '/auth/access',
                    },
                    {
                        label: 'Register',
                        icon: 'pi pi-fw pi-user-plus',
                        to: '/auth/register',
                    },
                    {
                        label: 'Forgot Password',
                        icon: 'pi pi-fw pi-question',
                        to: '/auth/forgotpassword',
                    },
                    {
                        label: 'New Password',
                        icon: 'pi pi-fw pi-cog',
                        to: '/auth/newpassword',
                    },
                    {
                        label: 'Verification',
                        icon: 'pi pi-fw pi-envelope',
                        to: '/auth/verification',
                    },
                    {
                        label: 'Lock Screen',
                        icon: 'pi pi-fw pi-eye-slash',
                        to: '/auth/lockscreen',
                    },
                ],
            },

            
            {
                label: 'About Us',
                icon: 'pi pi-fw pi-user',
                to: '/pages/aboutus',
            },
            {
                label: 'Help',
                icon: 'pi pi-fw pi-question-circle',
                to: '/pages/help',
            },
            
            {
                label: 'FAQ',
                icon: 'pi pi-fw pi-question',
                to: '/pages/faq',
            },
            {
                label: 'Contact Us',
                icon: 'pi pi-fw pi-phone',
                to: '/pages/contact',
            },
        ],
    },
    { separator: true },
    {
        label: 'User Management',
        icon: 'pi pi-fw pi-user',
        items: [
            {
                label: 'List',
                icon: 'pi pi-fw pi-list',
                to: '/profile/list',
            },
            {
                label: 'Create',
                icon: 'pi pi-fw pi-plus',
                to: '/profile/create',
            },
        ],
    },
    { separator: true },
    {
        label: 'Hierarchy',
        icon: 'pi pi-fw pi-align-left',
        items: [
            {
                label: 'Submenu 1',
                icon: 'pi pi-fw pi-align-left',
                items: [
                    {
                        label: 'Submenu 1.1',
                        icon: 'pi pi-fw pi-align-left',
                        items: [
                            {
                                label: 'Submenu 1.1.1',
                                icon: 'pi pi-fw pi-align-left',
                            },
                            {
                                label: 'Submenu 1.1.2',
                                icon: 'pi pi-fw pi-align-left',
                            },
                            {
                                label: 'Submenu 1.1.3',
                                icon: 'pi pi-fw pi-align-left',
                            },
                        ],
                    },
                    {
                        label: 'Submenu 1.2',
                        icon: 'pi pi-fw pi-align-left',
                        items: [
                            {
                                label: 'Submenu 1.2.1',
                                icon: 'pi pi-fw pi-align-left',
                            },
                        ],
                    },
                ],
            },
            {
                label: 'Submenu 2',
                icon: 'pi pi-fw pi-align-left',
                items: [
                    {
                        label: 'Submenu 2.1',
                        icon: 'pi pi-fw pi-align-left',
                        items: [
                            {
                                label: 'Submenu 2.1.1',
                                icon: 'pi pi-fw pi-align-left',
                            },
                            {
                                label: 'Submenu 2.1.2',
                                icon: 'pi pi-fw pi-align-left',
                            },
                        ],
                    },
                    {
                        label: 'Submenu 2.2',
                        icon: 'pi pi-fw pi-align-left',
                        items: [
                            {
                                label: 'Submenu 2.2.1',
                                icon: 'pi pi-fw pi-align-left',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    { separator: true },
    {
        label: 'Start',
        icon: 'pi pi-fw pi-download',
        items: [
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-info-circle',
                to: '/documentation',
            },
        ],
    },
]);

const { item, root, index } = defineProps();

const handleClick = () => {
    if (item.click) {
        item.click();
    } else if (item.to) {
        // Existing navigation logic
    }
};
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <AppMenuItem v-if="!item.separator" :item="item" root :index="i" />

            <li v-else class="menu-separator"></li>
        </template>
    </ul>
</template>
