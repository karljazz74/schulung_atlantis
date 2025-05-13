<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { fetchPosts, fetchImageFromDirectus } from '@/service/directusClient2';
import { useImageHeights, galleriaImages, responsiveOptions, hImgFactor, hFactor } from '@/service/galleriaSettings';
import { setLanguage, setImageMetadata, getImageMetadata } from '@/service/languageState'; // Adjust the path according to your project structure

const selectedImageIndex = ref(0);

// Reactive property for window width
const windowWidth = ref(window.innerWidth);
const { imageHeight, canvasHeight } = useImageHeights(windowWidth, hImgFactor, hFactor);

// added to re-render galleriaImages upon LanguageChange and Galleria image changes
const shouldRenderGalleria = ref(true);

// Resize function
const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth;
    console.log('Updated window width:', windowWidth.value);
};

console.log('Initial galleriaImages:', galleriaImages.value); // this is line 15

const { locale, t } = useI18n({
    inheritLocale: true,
    useScope: 'global',
});

const defaultLanguage = { name: 'English', code: 'US', lang: 'en-US' };
const selectedLanguage = ref(defaultLanguage);

const languages = computed(() => [
    { name: t('language.german'), code: 'DE', lang: 'de-DE' },
    { name: t('language.english'), code: 'US', lang: 'en-US' },
    { name: t('language.spanish'), code: 'ES', lang: 'es-ES' },
    // ... other languages
]);

// When the component mounts or recordId changes
async function loadData() {
    await loadImages(recordId.value);
    await fetchAndUpdatePosts(recordId.value, selectedLanguage.value.lang);
}

// When the language changes
function onLanguageChange(newLangCode) {
    const foundLang = languages.value.find((lang) => lang.code === newLangCode.code);
    if (foundLang) {
        selectedLanguage.value = foundLang;
        setLanguage(selectedLanguage.value);
        locale.value = selectedLanguage.value.lang;

        const storedMetadata = getImageMetadata();
        console.log('Updated getImageMetadata:', getImageMetadata.value);
        if (storedMetadata.length > 0) {
            galleriaImages.value = storedMetadata;
            // Reset selected image index if images change
            selectedImageIndex.value = 0;
        }

        fetchAndUpdatePosts(recordId.value, selectedLanguage.value.lang);
    } else {
        console.error('No data returned from GraphQL query');
    }
}

// Modified loadImages function

const route = useRoute();
const recordId = ref(route.params.id); // Initialize with route param
const totalPosts = ref(null);

// separate function for loading images
// New function to fetch and update images
async function loadImages(id) {
    // Fetch the images based on the record ID
    const rawData = await fetchPosts(id);
    if (rawData.fk_files_images) {
        let newImages = [];
        if (JSON.stringify(newImages) !== JSON.stringify(galleriaImages.value)) {
            galleriaImages.value = newImages;
            setImageMetadata(newImages);
        }
        galleriaImages.value = newImages;
    }
}

function imageExists(imageUrl) {
    return galleriaImages.value.some((image) => image.itemImageSrc === imageUrl);
}

// Define the function to fetch and update posts
async function fetchAndUpdatePosts(id, langCode) {
    console.log('fetchAndUpdatePosts called with id:', id, 'and langCode:', langCode);
    try {
        console.log('Fetching posts for:', id, langCode); // Log at start
        await loadImages(id); // Fetch and format the imag
        const rawData = await fetchPosts(id, langCode);
        console.log('Fetched post data:', rawData); // Log the fetched data

        // Handle the case where rawData doesn't have the expected structure
        if (!rawData || !rawData.fk_files_images) {
            console.error('Invalid rawData structure:', rawData);
            return;
        }

        // Add new images based on the updated rawData
        // Modified loop to fetch and push both medium and small images
        for (const imageData of rawData.fk_files_images) {
            const imageUrl = await fetchImageFromDirectus(imageData.directus_files_id.id, 'key=bild-galleria');
            const thumbnailUrl = await fetchImageFromDirectus(imageData.directus_files_id.id, 'key=bild-thumbs');

            if (imageUrl && thumbnailUrl && !imageExists(imageUrl)) {
                galleriaImages.value.push({
                    itemImageSrc: imageUrl,
                    thumbnailImageSrc: thumbnailUrl,
                    alt: imageData.directus_files_id.translations[0]?.meta_caption || 'Default Alt',
                    title: imageData.directus_files_id.translations[0]?.figure_caption_name || 'Default Title',
                    meta_object: imageData.directus_files_id.translations[0]?.meta_object || 'Default MetaObject',
                    meta_caption: imageData.directus_files_id.translations[0]?.meta_caption || 'Defaul MetaCaption',
                    meta_author: imageData.directus_files_id.translations[0]?.meta_author || 'Default Author',
                });
            }
        }

        setImageMetadata(galleriaImages.value); // <-- Insert this line here

        if (rawData) {
            let formattedDate = null;
            if (rawData.date_documented_clean_new) {
                // Splitting the date if it contains '|' and converting each part
                const dates = rawData.date_documented_clean_new.split('|').map((dateStr) => {
                    const parts = dateStr.trim().split('.'); // Trim to remove any leading/trailing spaces
                    if (parts.length === 3) {
                        const [day, month, year] = parts;
                        const dateObj = new Date(`${year}-${month}-${day}`);
                        return !isNaN(dateObj.getTime())
                            ? new Intl.DateTimeFormat('en-US', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                              }).format(dateObj)
                            : null;
                    }
                    return null;
                });

                // Join back the dates with ' | ' if it's multiple dates, else single date
                formattedDate = dates.filter((date) => date !== null).join(' | ');
            }

            // Setting the values
            totalPosts.value = {
                id_record: rawData.id_record,
                find_location: rawData.find_location,
                lote_number: rawData.lote_number,
                translations_records: rawData.translations_records?.[0] || {},
                fk_category: rawData.fk_category?.TranslationCat?.[0] || {},
                obj_designation: rawData.obj_designation,
                date_documented_clean_new: formattedDate,
                fk_files_images: galleriaImages, // Assign the transformed images array here
            };
            console.log('Updated totalPosts:', totalPosts.value);
        }
    } catch (error) {
        // Error handling
        console.error('Error in fetchAndUpdatePosts:', error);
        // Additional logging for debugging
        if (error.response) {
            console.error('Error Response:', error.response);
        }
        if (error.request) {
            console.error('Error Request:', error.request);
        }
        console.error('Error Message:', error.message);
    }
}

// Watching route changes

watch(
    recordId,
    (newId) => {
        if (newId) {
            loadImages(newId).then(() => {
                fetchAndUpdatePosts(newId, selectedLanguage.value.lang);
            });
        }
    },
    { immediate: true }
);

// added for language selection
watch(selectedLanguage, async (newLang) => {
    if (newLang) {
        locale.value = newLang.lang;
        // Fetch data with the new language
        await fetchAndUpdatePosts(recordId.value, newLang.lang);
    }
});

// You can also call this in onMounted if needed
onMounted(() => {
    const storedLanguageStr = localStorage.getItem('selectedLanguage');
    const storedLanguage = storedLanguageStr ? JSON.parse(storedLanguageStr) : null;

    if (storedLanguage) {
        selectedLanguage.value = storedLanguage;
        locale.value = storedLanguage.lang;
    }

    if (recordId.value) {
        loadImages(recordId.value).then(() => {
            fetchAndUpdatePosts(recordId.value, selectedLanguage.value.lang);
        });
    }
    loadData();
    window.addEventListener('resize', updateWindowWidth);
});

onBeforeUnmount(() => {
    // Remove event listener before component is unmounted
    window.removeEventListener('resize', updateWindowWidth);
});
</script>
<template>
    <!-- Language Selector (Dropdown) -->
    <Dropdown v-model="selectedLanguage" :options="languages" @change="onLanguageChange" optionLabel="name" :placeholder="t('menu.selectLanguage')">
        <template #value="slotProps">
            <div v-if="slotProps.value" class="flex align-items-center">
                <div :class="`mr-2 flag flag-${slotProps.value && slotProps.value.code ? slotProps.value.code.toLowerCase() : ''}`" style="width: 18px; height: 12px"></div>
                <div>{{ slotProps.value.name }}</div>
            </div>
            <span v-else>
                {{ slotProps.placeholder }}
            </span>
        </template>
    </Dropdown>
    <Card class="galleria-card">
        <!-- You can set the title if required -->
        <template #content>
            <div class="card-galleria md:flex md:justify-content-center" :style="{ height: canvasHeight }" :activeIndex="selectedImageIndex">
                <Galleria
                    v-if="shouldRenderGalleria"
                    class="galleria-contents"
                    :value="galleriaImages"
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
                        <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" :style="{ height: imageHeight }" />
                    </template>
                    <template #thumbnail="slotProps">
                        <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" style="max-height: 3.2rem; max-width: 3.2rem; display: block" />
                    </template>
                    <template #caption="slotProps">
                        <div class="text-md-l mb-2 font-bold">{{ slotProps.item.meta_object + '\u2003' + slotProps.item.meta_caption }}</div>
                        <div class="text-md-sm mb-2 font-bold">{{ slotProps.item.meta_author }}</div>
                    </template>
                </Galleria>
            </div>
        </template>
    </Card>
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
            <div class="flex flex-wrap justify-content-center md:justify-content-start gap-3" v-if="totalPosts.translations_records">
                <div class="w-full">
                    <!-- Wrap each section in a div with full width -->
                    <h3>{{ totalPosts.translations_records.tr_obj_name }}</h3>
                </div>
                <div v-if="galleriaImages.length > 0">
                    <h3 v-for="(image, selectedImageIndex) in galleriaImages" :key="selectedImageIndex">
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
