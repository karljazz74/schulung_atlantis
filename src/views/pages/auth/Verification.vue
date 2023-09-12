<script setup>
import { ref } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';

const { layoutConfig } = useLayout();
const router = useRouter();

const value1 = ref(null);
const value2 = ref(null);
const value3 = ref(null);
const value4 = ref(null);
const verify = ref(false);

const goHome = () => {
    router.push('/');
};

const focus = (event) => {
    const regexNum = /^\d+$/;
    const isValid = regexNum.test(event.key);
    const nextElementInputRef = event.currentTarget.nextElementSibling.children[0];

    isValid && nextElementInputRef.focus();
};
</script>

<template>
    <div :class="'login-body flex min-h-screen  ' + (layoutConfig.colorScheme.value === 'light' ? 'layout-light' : 'layout-dark')">
        <div class="login-image w-6 h-screen hidden md:block" style="max-width: 490px">
            <img :src="'/layout/images/pages/verification-' + (layoutConfig.colorScheme.value === 'dark' ? 'ondark' : 'onlight') + '.png'" alt="atlantis" class="h-screen w-full" />
        </div>
        <div class="w-full" style="background: var(--surface-ground)">
            <div
                class="p-fluid min-h-screen bg-auto md:bg-contain bg-no-repeat text-center w-full flex align-items-center md:align-items-start justify-content-center flex-column bg-auto md:bg-contain bg-no-repeat"
                style="padding: 20% 10% 20% 10%; background: var(--exception-pages-image)"
            >
                <div class="flex flex-column">
                    <div class="flex align-items-center mb-6 logo-container">
                        <img :src="'/layout/images/logo/logo-' + (layoutConfig.colorScheme.value === 'light' ? 'dark' : 'light') + '.png'" class="login-logo" style="width: 45px" />
                        <img :src="'/layout/images/logo/appname-' + (layoutConfig.colorScheme.value === 'light' ? 'dark' : 'light') + '.png'" class="login-appname ml-3" style="width: 100px" />
                    </div>
                    <div class="form-container text-left" style="max-width: 320px; min-width: 270px">
                        <h4 class="text-900 font-bold mb-2">Verification</h4>
                        <span class="text-600 font-medium">We have sent code to you email:</span>
                        <div class="flex align-items-center mt-1 mb-4">
                            <i class="pi pi-envelope text-600"></i>
                            <span class="text-900 font-bold ml-2">dm**@gmail.com</span>
                        </div>
                        <div class="flex justify-content-between w-full align-items-center gap-3">
                            <InputNumber inputId="val1" v-model="value1" inputClass="w-3rem text-center" :max="9" @keyup="focus($event)"></InputNumber>
                            <InputNumber inputId="val2" v-model="value2" inputClass="w-3rem text-center" :max="9" @keyup="focus($event)"></InputNumber>
                            <InputNumber inputId="val3" v-model="value3" inputClass="w-3rem text-center" :max="9" @keyup="focus($event)"></InputNumber>
                            <InputNumber inputId="val4" v-model="value4" inputClass="w-3rem text-center" :max="9"></InputNumber>
                        </div>
                    </div>
                    <div class="button-container mt-4 text-left" style="max-width: 320px; min-width: 270px">
                        <div class="buttons flex align-items-center gap-3">
                            <Button @click="goHome" class="block p-button-danger p-button-outlined" style="max-width: 320px; margin-bottom: 32px">Cancel</Button>
                            <Button @click="verify" class="block" style="max-width: 320px; margin-bottom: 32px">Verify</Button>
                        </div>
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
