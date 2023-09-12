<script setup>
import { useLayout } from '@/layout/composables/layout';

const { layoutConfig } = useLayout();
</script>
<template>
    <div :class="'login-body flex min-h-screen ' + (layoutConfig.colorScheme.value === 'light' ? 'layout-light' : 'layout-dark')">
        <div class="login-image w-6 h-screen hidden md:block" style="max-width: 490px">
            <img :src="'/layout/images/pages/login-' + (layoutConfig.colorScheme.value === 'dark' ? 'ondark' : 'onlight') + '.png'" alt="atlantis" class="h-screen w-full" />
        </div>
        <div class="login-panel w-full" style="background: var(--surface-ground)">
            <div
                class="p-fluid min-h-screen bg-auto md:bg-contain bg-no-repeat text-center w-full flex align-items-center md:align-items-start justify-content-center flex-column bg-auto md:bg-contain bg-no-repeat"
                style="padding: 20% 10% 20% 10%; background: var(--exception-pages-image)"
            >
                <div class="flex flex-column">
                    <div class="flex align-items-center mb-6 logo-container">
                        <img :src="'/layout/images/logo/logo-' + (layoutConfig.colorScheme.value === 'light' ? 'dark' : 'light') + '.png'" class="login-logo" style="width: 45px" />
                        <img :src="'/layout/images/logo/appname-' + (layoutConfig.colorScheme.value === 'light' ? 'dark' : 'light') + '.png'" class="login-appname ml-3" style="width: 100px" />
                    </div>
                    <div class="form-container">
                        <span class="p-input-icon-left">
                            <i class="pi pi-envelope"></i>
                            <inputText type="text" autocomplete="off" placeholder="Email" class="block mb-3" style="max-width: 320px; min-width: 270px" />
                        </span>
                        <span class="p-input-icon-left">
                            <i class="pi pi-key"></i>
                            <inputText type="password" autocomplete="off" placeholder="Password" class="block mb-3" style="max-width: 320px; min-width: 270px" />
                        </span>
                        <a href="#" class="flex text-color-secondary mb-4 text-sm">Forgot your password?</a>
                    </div>
                    <div class="button-container">
                        <Button type="button" @click="$router.push('/')" class="block" style="max-width: 320px; margin-bottom: 32px">Login</Button>
                        <span class="flex text-sm text-color-secondary">Don’t have an account?<a class="cursor-pointer ml-1">Sign-up here</a></span>
                    </div>
                </div>

                <div class="login-footer flex align-items-center absolute" style="bottom: 75px">
                    <div class="flex align-items-center login-footer-logo-container pr-4 mr-4 border-right-1 surface-border">
                        <img src="/layout/images/logo/logo-gray.png" class="login-footer-logo" style="width: 22px" />
                        <img src="/layout/images/logo/appname-gray.png" class="login-footer-appname ml-2" style="width: 45px" />
                    </div>
                    <span class="text-sm text-color-secondary mr-3">Copyright 2023</span>
                </div>
            </div>
        </div>
    </div>
</template>
