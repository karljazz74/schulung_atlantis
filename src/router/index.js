import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const routes = [
    {
        path: '/',
        component: AppLayout,
        children: [
            {
                path: '/',
                name: 'learning',
                meta: {
                    breadcrumb: ['LEARN'],
                },
                component: () => import('@/views/apps/learn/List.vue'),
            },
        {
            path: '/apps/learn/list',
            component: () => import('@/views/apps/learn/List.vue'),
        },
        {
            path: '/apps/learn/detail',
            component: () => import('@/views/apps/learn/Detail.vue'),
        },
        {
            path: '/apps/learn/edit',
            name: 'learn-edit',
            component: () => import('@/views/apps/learn/Edit.vue'),
        },            
        {
            path: '/apps/blog/list',
            component: () => import('@/views/apps/blog/List.vue'),
        },
        {
            path: '/apps/blog/detail',
            component: () => import('@/views/apps/blog/Detail.vue'),
        },
        {
            path: '/apps/blog/edit',
            name: 'blog-edit',
            component: () => import('@/views/apps/blog/Edit.vue'),
        },
        {
            path: '/apps/files',
            name: 'files',
            component: () => import('@/views/apps/Files.vue'),
        },
        {
        path: '/uikit/formlayout',
        name: 'formlayout',
        meta: {
            breadcrumb: ['UI Kit', 'Form Layout'],
        },
        component: () => import('@/views/uikit/FormLayout.vue'),
        },
        {
            path: '/forms',
            name: 'forms',
            component: () => import('@/views/Forms.vue'),
        },
        {
            path: '/uikit/table',
            name: 'table',
            meta: {
                breadcrumb: ['UI Kit', 'Table'],
            },
            component: () => import('@/views/uikit/Table.vue'),
        },
        {
            path: '/uikit/list',
            name: 'list',
            meta: {
                breadcrumb: ['UI Kit', 'List'],
            },
            component: () => import('@/views/uikit/List.vue'),
        },
        {
            path: '/uikit/file',
            name: 'file',
            meta: {
                breadcrumb: ['UI Kit', 'File'],
            },
            component: () => import('@/views/uikit/File.vue'),
        },
        {
            path: '/uikit/media',
            name: 'media',
            meta: {
                breadcrumb: ['UI Kit', 'Media'],
            },
            component: () => import('@/views/uikit/Media.vue'),
        },
        {
            path: '/utilities/colors',
            name: 'colors',
            component: () => import('@/views/utilities/Colors.vue'),
        },
        {
            path: '/utilities/icons',
            name: 'icons',
            component: () => import('@/views/utilities/Icons.vue'),
        },
    
       {
            path: '/documentation',
            name: 'documentation',
            component: () => import('@/views/utilities/Documentation.vue'),
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/AccessDenied.vue'),
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue'),
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue'),
        },
        {
            path: '/auth/forgotpassword',
            name: 'forgotpassword',
            component: () => import('@/views/pages/auth/ForgotPassword.vue'),
        },
        {
            path: '/auth/newpassword',
            name: 'newpassword',
            component: () => import('@/views/pages/auth/NewPassword.vue'),
        },
        {
            path: '/auth/verification',
            name: 'verification',
            component: () => import('@/views/pages/auth/Verification.vue'),
        },
        {
            path: '/auth/lockscreen',
            name: 'lockscreen',
            component: () => import('@/views/pages/auth/LockScreen.vue'),
        },
    ]
},
]

    const router = createRouter({
        history: createWebHashHistory(),
        routes,
        scrollBehavior() {
            return { left: 0, top: 0 };
        },
});

export default router;
