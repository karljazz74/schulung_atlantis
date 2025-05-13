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
const { imageHeight, canvasHeight } = useImageHeights(windowWidth, hImgFactor, hFactor);
const galleriaImageURLs = ref([]);
const galleriaTextualContent = ref([]);
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
const totalPosts = ref(null);

// added variable
const isDebugMode = ref(true); // Set to true for debugging

// Update window width function
const updateWindowWidth = () => (windowWidth.value = window.innerWidth);

// Load images and textual content
async function loadImages(id, langCode) {
    const rawData = await fetchPosts(id, langCode);
    if (rawData && rawData.fk_files_images) {
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
        };
    }
}

// Language change handler
function onLanguageChange(newLangCode) {
    const foundLang = languages.value.find((lang) => lang.code === newLangCode.code);
    console.log('Language changed to:', newLangCode);
    if (foundLang) {
        selectedLanguage.value = foundLang;
        setLanguage(selectedLanguage.value);
        locale.value = selectedLanguage.value.lang;
        loadData(selectedLanguage.value.lang);
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
    <Dropdown v-model="selectedLanguage" :options="languages" @change="onLanguageChange" optionLabel="name" :placeholder="t('menu.selectLanguage')">
        <template #value="slotProps">
            <div v-if="slotProps.value" class="flex align-items-center">
                <div :class="`mr-2 flag flag-${slotProps.value && slotProps.value.code ? slotProps.value.code.toLowerCase() : ''}`" style="width: 18px; height: 12px"></div>
                <div>{{ slotProps.value.name }}</div>
            </div>
            <span v-else>{{ slotProps.placeholder }}</span>
        </template>
    </Dropdown>

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
                    :showIndicators="true"
                    :showItemNavigators="true"
                    :changeItemOnIndicatorHover="true"
                    :indicatorsPosition="inside"
                    containerStyle="max-width: 640px"
                    :circular="true"
                    :autoPlay="false"
                    :transitionInterval="1700"
                >
                    <template #item="slotProps">
                        <img :src="slotProps.item.itemImageSrc" :alt="galleriaTextualContent[slotProps.index]?.meta_caption" :style="{ height: imageHeight }" />
                    </template>
                    <template #thumbnail="slotProps">
                        <img :src="slotProps.item.thumbnailImageSrc" :alt="galleriaTextualContent[slotProps.index]?.meta_caption" style="max-height: 3.2rem; max-width: 3.2rem; display: block" />
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

    <div>Index: {{ selectedImageIndex }}</div>
    <div v-if="isDebugMode">
        <pre>{{ galleriaTextualContent }}</pre>
    </div>

    <!-- Render other details -->
    <div v-if="totalPosts && totalPosts.id_record" class="flex flex-col md:flex-row justify-between items-center mb-4">
        <div class="flex flex-wrap justify-content-center md:justify-content-start gap-3">
            <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round" style="height: 3rem; align-items: center">
                <i class="pi pi-key text-primary mr-2"></i>
                <span class="text-900"><b>Record ID:</b>&emsp;{{ totalPosts.id_record }}</span>
            </span>
            <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round" style="height: 3rem; align-items: center">
                <i class="pi pi-map-marker text-primary mr-2"></i>
                <span class="text-900"><b>Lote Number:</b> &emsp;{{ totalPosts.lote_number }}</span>
            </span>
            <div v-if="totalPosts && totalPosts.translations_records" class="flex flex-wrap justify-content-center md:justify-content-start gap-3">
                <div class="w-full">
                    <!-- Wrap each section in a div with full width -->
                    <h3>{{ totalPosts.translations_records.tr_obj_name }}</h3>
                </div>
                <div v-if="galleriaImageURLs.length > 0">
                    <h3 v-for="(image, selectedImageIndex) in galleriaImageURLs" :key="selectedImageIndex">
                        {{ image.itemImageSrc }}
                    </h3>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
@import './detailStyles.css';
</style>
