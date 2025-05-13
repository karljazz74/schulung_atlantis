<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, watchEffect } from 'vue';
import Dropdown from 'primevue/dropdown';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { fetchPosts, fetchImageFromDirectus } from '@/service/directusClient2';
import { useImageHeights, responsiveOptions, hImgFactor, hFactor } from '@/service/galleriaSettings';
import { selectedLanguage, setLanguage, getStoredLanguage } from '@/service/languageState';

// State declarations
const selectedImageIndex = ref(0);
const windowWidth = ref(window.innerWidth);
const { imageHeight, imageMaxWidth, canvasHeight } = useImageHeights(windowWidth, hImgFactor, hFactor);
const galleriaImageURLs = ref([]);
// const galleriaTextualContent = ref([]);
const { locale, t } = useI18n({ inheritLocale: true, useScope: 'global' });

const defaultLanguage = { name: 'English', code: 'US', lang: 'en-US' };
const languages = computed(() => [
    { name: t('language.german'), code: 'DE', lang: 'de-DE' },
    { name: t('language.english'), code: 'US', lang: 'en-US' },
    { name: t('language.spanish'), code: 'ES', lang: 'es-ES' },
    // ... other languages
]);
const route = useRoute();
const recordId = ref(route.params.id);
const totalPosts = ref({
    translations_records: [], // Ensure this is an array
    // other properties...
});

// added variable
// const isDebugMode = ref(true); // Set to true for debugging

// responsive Galleria options
const showIndicators = computed(() => {
    // Define the breakpoint below which indicators should be hidden
    const breakpoint = 450; // Example breakpoint in pixels

    // Check if the current window width is below the breakpoint
    return windowWidth.value > breakpoint;
});

// Update window width function
const updateWindowWidth = () => (windowWidth.value = window.innerWidth);

// Load images and textual content
async function loadImages(id, langCode) {
    const rawData = await fetchPosts(id, langCode);
    if (rawData && rawData.fk_files_images) {
        console.log('Fetched rawData:', rawData);
        const galleriaData = []; // Combined array of images and textual content

        for (const imageData of rawData.fk_files_images) {
            const imageUrl = await fetchImageFromDirectus(imageData.directus_files_id.id, 'key=bild-galleria');
            const thumbnailUrl = await fetchImageFromDirectus(imageData.directus_files_id.id, 'key=bild-thumbs');
            const translation = imageData.directus_files_id.translations.find((t) => t.languages_code.code === langCode) || {};

            // Combine image URL and textual content
            if (imageUrl && thumbnailUrl) {
                galleriaData.push({
                    itemImageSrc: imageUrl,
                    thumbnailImageSrc: thumbnailUrl,
                    ...translation, // Spread operator to include all translation fields
                });
            }
        }

        galleriaImageURLs.value = galleriaData; // Assign the combined data to galleriaImageURLs
        console.log('Galleria data:', galleriaImageURLs.value);
    }
}

// Load data function
async function loadData(langCode) {
    await loadImages(recordId.value, langCode);
    // Fetch and process post data
    const rawData = await fetchPosts(recordId.value, langCode);
    let avatarUrl = '';
    if (rawData && rawData.fk_users && rawData.fk_users.avatar && rawData.fk_users.avatar.id) {
        avatarUrl = await fetchImageFromDirectus(rawData.fk_users.avatar.id, 'key=bild-thumbs');
    }
    console.log('Avatar URL:', avatarUrl); // Add this line to debug

    if (rawData) {
        totalPosts.value = {
            id_record: rawData.id_record,
            find_location: rawData.find_location,
            lote_number: rawData.lote_number,
            translations_records: rawData.translations_records?.[0] || {},
            fk_category: rawData.fk_category?.TranslationCat?.[0] || {},
            obj_designation: rawData.obj_designation,
            date_documented_clean_new: rawData.date_documented_clean_new,
            fk_files_images: galleriaImageURLs.value, // Linking Galleria images
            author_firstname: rawData.fk_users?.first_name || {},
            author_lastname: rawData.fk_users?.last_name || {},
            author_avatar: avatarUrl,
        };
    }
    totalPosts.value.author_avatar = avatarUrl;
    console.log('Total Posts after setting:', totalPosts.value);
}

// Language change handler
function onLanguageChange(newLangCode) {
    const foundLang = languages.value.find((lang) => lang.code === newLangCode.code);
    if (foundLang) {
        setLanguage(foundLang); // Update the centralized language state
        locale.value = foundLang.lang; // Update i18n locale
        loadData(foundLang.lang); // Fetch posts with new language
    }
}

// Watchers
watch(
    recordId,
    (newId) => {
        if (newId) loadData(selectedLanguage.value.lang);
    },
    { immediate: true }
);

watch(selectedLanguage, (newLang) => {
    if (newLang) loadData(newLang.lang);
});

onMounted(() => {
    window.addEventListener('resize', () => {
        windowWidth.value = window.innerWidth;
    });
});

// Lifecycle hooks
onMounted(() => {
    const storedLanguageCode = getStoredLanguage();
    selectedLanguage.value = languages.value.find((lang) => lang.lang === storedLanguageCode) || defaultLanguage;
    if (storedLanguageCode) locale.value = storedLanguageCode;
    loadData(selectedLanguage.value.lang);
    window.addEventListener('resize', updateWindowWidth);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateWindowWidth);
});
watchEffect(() => {
    console.log('Current index:', selectedImageIndex.value);
});
</script>
<template>
    <div v-if="totalPosts && totalPosts.id_record">
        <Dropdown v-model="selectedLanguage" :options="languages" @change="onLanguageChange" optionLabel="name" :placeholder="t('menu.selectLanguage')">
            <template #value="slotProps">
                <div v-if="slotProps.value" class="flex align-items-center">
                    <div :class="`mr-2 flag flag-${slotProps.value && slotProps.value.code ? slotProps.value.code.toLowerCase() : ''}`" style="width: 18px; height: 12px"></div>
                    <div>{{ slotProps.value.name }}</div>
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
            </template>
        </Dropdown>
        <div class="flex flex-col md:flex-row justify-between items-center mb-4">
            <!-- Title -->
            <div class="text-xxl text-primary text-900 mb-4 mt-4 md:mt-0 text-center md:text-left font-semibold md:pr-4">
                {{ totalPosts.translations_records.tr_obj_name }}
            </div>
            <div class="flex flex-wrap justify-content-center md:justify-content-start gap-3">
                <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round" style="height: 3rem; align-items: center">
                    <i class="pi pi-clock text-primary mr-2"></i>
                    <span class="text-900">{{ totalPosts.date_documented_clean_new }}</span>
                </span>
                <div class="flex flex-nowrap">
                    <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round" style="height: 3rem; align-items: center">
                        <i class="pi pi-comments text-primary mr-2"></i>
                        <span class="text-900"><b>ID:</b> &emsp;{{ totalPosts.id_record }}</span>
                    </span>
                    <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round" style="height: 3rem; align-items: center">
                        <i class="pi pi-eye text-primary mr-2"></i>
                        <span class="text-900"><b>Lote Number:</b> &emsp;{{ totalPosts.lote_number }}</span>
                    </span>
                </div>
            </div>
            <!-- Avatars and Authors -->
            <div class="flex flex-col md:flex-row justify-center md:justify-end items-center gap-4">
                <div v-if="totalPosts.author_avatar" class="flex flex-col items-center">
                    <Avatar :image="totalPosts.author_avatar" shape="circle" class="cardImage flex w-4rem h-4rem" alt="Avatar"></Avatar>
                    <span class="mt-3 font-bold text-700 text-center white-space-nowrap">&emsp;{{ totalPosts.author_firstname + totalPosts.author_lastname }}</span>
                </div>
            </div>
        </div>
        <!-- Div for Video and Multimedia HTML5 frame element -->
        <Card class="galleria-card">
            <template #content>
                <div class="card-galleria md:flex md:justify-content-center" :style="{ height: canvasHeight }">
                    <Galleria
                        v-if="galleriaImageURLs.length"
                        :value="galleriaImageURLs"
                        v-model:activeIndex="selectedImageIndex"
                        :responsiveOptions="responsiveOptions"
                        :numVisible="4"
                        :showThumbnails="true"
                        :showIndicators="showIndicators"
                        :showItemNavigators="true"
                        :changeItemOnIndicatorHover="true"
                        :indicatorsPosition="inside"
                        containerStyle="max-width: 640px"
                        :circular="true"
                        :autoPlay="false"
                        :transitionInterval="1700"
                    >
                        <template #item="slotProps">
                            <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.meta_object ?? 'No Object'" :style="{ height: imageHeight, maxWidth: imageMaxWidth, objectFit: 'contain', width: '100%' }" />
                        </template>
                        <template #thumbnail="slotProps">
                            <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.meta_object ?? 'No Object'" :style="{ height: '3.2rem', maxWidth: '3rem', display: 'block' }" />
                        </template>
                        <template #caption="slotProps">
                            <div class="text-md-l mb-2 font-bold">
                                {{ slotProps.item.meta_object ?? 'No Object' }}
                                {{ '\u2003' }}
                                {{ slotProps.item.meta_caption ?? 'No Caption' }}
                            </div>
                            <div class="text-md-sm mb-2 font-bold">
                                {{ slotProps.item.meta_author ?? 'No Author' }}
                            </div>
                        </template>
                    </Galleria>
                </div>
            </template>
        </Card>
        <!-- Debugging: Add console log to inspect the data
        <pre>{{ JSON.stringify(totalPosts.translations_records, null, 2) }}</pre>  -->
        <!-- display the filteredTranslation values for "title", "description" and "textarea" here -->
        <div v-if="totalPosts.translations_records">
            <div @change="onLanguageChange" class="text-3xl text-primary text-1100 mb-4 font-semibold">{{ t('recordHeaders.description') }} {{ totalPosts.translations_records.tr_obj_name }}</div>
            <div class="text-2xl text-500 text-primary custom-transparency mb-4 font-semibold">
                {{ totalPosts.translations_records.tr_obj_label }}
            </div>
            <p class="line-height-3 mb-0 my-3" v-html="totalPosts.translations_records.tr_informe_designation"></p>
            <div class="text-2xl text-500 text-primary custom-transparency mb-4 font-semibold">{{ totalPosts.translations_records.tr_informe_designation }}</div>
            <p class="line-height-3 mb-0 my-3" v-html="totalPosts.translations_records.tr_description"></p>
        </div>

        <div class="flex align-items-center mb-4 font-bold">
            <span class="text-xl text-900 mr-4">Comments</span>
            <span class="inline-flex align-items-center justify-content-center w-2rem h-2rem border-1 surface-border border-round">{{ totalPosts.comment }}</span>
        </div>

        <ul class="list-none p-0 m-0">
            <li v-for="(comment, i) in totalPosts.fk_comments" :key="comment.id" class="flex p-3 mb-3 border-1 surface-border border-round">
                <img :src="comment.image ? generateDirectusImage(comment.image.id) : null" class="w-3rem h-3rem mr-3 flex-shrink-0" :alt="'Image' + i" />

                <div>
                    <span class="font-semibold text-900">{{ comment.name }}</span>
                    <p class="font-semibold text-600 m-0 text-sm">{{ comment.date }}</p>
                    <p class="line-height-3 mb-0 my-3" v-html="comment.description"></p>
                </div>
            </li>
        </ul>

        <div class="text-xl text-900 mb-4 font-bold mt-8">Post a Comment</div>

        <div class="mb-3 p-fluid">
            <span class="p-input-icon-left">
                <i class="pi pi-user"></i>
                <InputText type="text" placeholder="Name" />
            </span>
        </div>
        <div class="mb-3 p-fluid">
            <span class="p-input-icon-left">
                <i class="pi pi-envelope"></i>
                <InputText type="text" placeholder="Email" />
            </span>
        </div>
        <div class="mb-3 p-fluid">
            <Textarea :rows="6" placeholder="Your comment"></Textarea>
        </div>
        <div class="flex justify-content-end">
            <Button label="Post Comment"></Button>
        </div>
    </div>
    <div v-else>
        <!-- Add a loading or error state here -->
        <p>Loading...</p>
    </div>
</template>
<style scoped>
@import './detailStyles.css';
</style>
