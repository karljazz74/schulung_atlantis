<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, watchEffect } from 'vue';
import Dropdown from 'primevue/dropdown';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { fetchPosts, fetchImageFromDirectus } from '@/service/directusClient3';
import { useImageHeights, responsiveOptions, hImgFactor, hFactor } from '@/service/galleriaSettings';
import { setLanguage, getStoredLanguage } from '@/service/languageState';
import useThemeToggle from '@/layout/composables/useThemeToggle';

// added for dynamic theme toggle (lettering)
const { colorScheme } = useThemeToggle();

// State declarations
const selectedImageIndex = ref(0);
const windowWidth = ref(window.innerWidth);
const { imageHeight, imageMaxWidth, canvasHeight } = useImageHeights(windowWidth, hImgFactor, hFactor);
const galleriaImageURLs = ref([]);
// const galleriaTextualContent = ref([]);
const { locale, t } = useI18n({ inheritLocale: true, useScope: 'global' });
console.log('Extracted Locale String:', locale.value.lang);
const selectedLanguage = ref(); // This will hold the selected language

const defaultLanguage = { name: 'English', code: 'US', lang: 'en-US' };
const languages = computed(() => [
    { name: t('language.german'), code: 'DE', lang: 'de-DE' },
    { name: t('language.english'), code: 'US', lang: 'en-US' },
    { name: t('language.spanish'), code: 'ES', lang: 'es-ES' },
    // ... other languages
]);

// Initialize selectedLanguage with defaultLanguage
selectedLanguage.value = defaultLanguage; // Initialization
console.log('Initial selectedLanguage set to:', selectedLanguage.value);

const route = useRoute();
const recordId = ref(route.params.id);
const totalPosts = ref({
    translations_records: [], // Ensure this is an array
    // other properties...
});

const showIndicators = computed(() => {
    // Define the breakpoint below which indicators should be hidden
    const breakpoint = 450; // Example breakpoint in pixels

    // Check if the current window width is below the breakpoint
    return windowWidth.value > breakpoint;
});

// added variable
// const isDebugMode = ref(true); // Set to true for debugging
// format timestamp
const formattedTimestamp = computed(() => {
    if (!totalPosts.value.set_timestamp) return '';

    // Extract the current locale
    let currentLocale = locale.value.split('-')[0]; // Get the language part (e.g., 'en' from 'en-US')

    // Log the current locale and timestamp for debugging
    console.log('Current locale:', currentLocale);
    console.log('Timestamp:', totalPosts.value.set_timestamp);

    // Validate locale and use a default if necessary
    const supportedLocales = ['en', 'de', 'es']; // Add more as needed
    if (!supportedLocales.includes(currentLocale)) {
        console.warn(`Locale '${currentLocale}' not supported, defaulting to 'en'`);
        currentLocale = 'en'; // Fallback to English
    }

    // Create a new date object from the timestamp
    const date = new Date(totalPosts.value.set_timestamp);

    // Try-catch block for safer execution
    try {
        // Format the date based on the current locale
        return new Intl.DateTimeFormat(currentLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return ''; // Return an empty string in case of error
    }
});

// Debug the locale value
console.log('Locale value:', locale.value);

// Update window width function
const updateWindowWidth = () => (windowWidth.value = window.innerWidth);

// Load images and textual content
async function loadImages(id, langCode) {
    const rawData = await fetchPosts(id, langCode);
    if (rawData && rawData.fk_files_images) {
        console.log('Fetched rawData:', rawData);
        // mapping galleria
        const galleriaData = []; // Combined array of images and textual content

        for (const imageData of rawData.fk_files_images) {
            const imageUrl = await fetchImageFromDirectus(imageData.directus_files_id.id, 'key=bild-galleria');
            const thumbnailUrl = await fetchImageFromDirectus(imageData.directus_files_id.id, 'key=bild-thumbs');
            const imageNum = imageData.directus_files_id.image_number;
            const translation = imageData.directus_files_id.translations.find((t) => t.languages_code.code === langCode) || {};
            // Ensure these properties exist or are mocked for testing
            const metaObject = translation.meta_object || 'Test Object'; // Mock if necessary
            const metaCaption = translation.meta_caption || 'Test Caption'; // Mock if necessary
            const metaAuthor = translation.meta_author || 'Test Author'; // Mock if necessary

            // Combine image URL and textual content
            if (imageUrl && thumbnailUrl) {
                galleriaData.push({
                    itemImageSrc: imageUrl,
                    itemImageNum: imageNum,
                    thumbnailImageSrc: thumbnailUrl,
                    thumbnailImageSrc: thumbnailUrl,
                    meta_object: metaObject, // Ensure this is correctly assigned
                    meta_caption: metaCaption, // Ensure this is correctly assigned
                    meta_author: metaAuthor, // Ensure this is correctly assigned
                    ...translation, // Spread operator to include all translation fields
                });
            }
        }

        galleriaImageURLs.value = galleriaData; // Assign the combined data to galleriaImageURLs
        console.log('Galleria data:', galleriaImageURLs.value);
    }
}

// Load data function
// Load data function
async function loadData(langCode) {
    await loadImages(recordId.value, langCode);
    // Fetch and process post data
    const rawData = await fetchPosts(recordId.value, langCode);
    let avatarUrl = '';
    let sketchfabEmbedCode = ''; // Added: Placeholder for the SketchFab embed code

    if (rawData && rawData.fk_users && rawData.fk_users.avatar && rawData.fk_users.avatar.id) {
        avatarUrl = await fetchImageFromDirectus(rawData.fk_users.avatar.id, 'key=bild-thumbs');
    }

    // Assuming rawData directly contains a sketchfab field. If it's part of an array or nested, adjust the access path accordingly.
    if (rawData && rawData.sketchfab) {
        sketchfabEmbedCode = rawData.sketchfab; // Assign the SketchFab embed code
    }

    if (rawData) {
        const formattedDate = processDate(rawData.date_documented_clean_new, langCode);
        totalPosts.value = {
            ...rawData, // Spread all the fetched data
            date_documented_clean_new: formattedDate, // Use the processed date
            id_record: rawData.id_record,
            find_location: rawData.find_location,
            lote_number: rawData.lote_number,
            translations_records: rawData.translations_records?.[0] || {},
            fk_category: rawData.fk_category?.TranslationCat?.[0] || {},
            obj_designation: rawData.obj_designation,
            set_timestamp: rawData.set_timestamp,
            fk_files_images: galleriaImageURLs.value, // Linking Galleria images
            author_firstname: rawData.fk_users?.first_name || {},
            author_lastname: rawData.fk_users?.last_name || {},
            author_avatar: avatarUrl,
            sketchfab: sketchfabEmbedCode, // Added: Store the SketchFab embed code
            sketchfab_source: rawData.sketchfab_source,
        };
    }
    console.log('Total Posts after setting:', totalPosts.value);
    console.log('Sketchfab HTML:', totalPosts.value.sketchfab)
    
}


// Helper function to process the date
// Helper function to process the date
function processDate(dateStr, langCode) {
    if (!dateStr) return '';

    // Logic to format the date based on the langCode
    const dates = dateStr.split('|').map((part) => {
        const [day, month, year] = part.trim().split('.').map(Number);
        const dateObj = new Date(year, month - 1, day);
        if (!isNaN(dateObj.getTime())) {
            try {
                // Use the langCode directly, ensuring it's in a format like 'en-US', 'de-DE', etc.
                return new Intl.DateTimeFormat(langCode, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }).format(dateObj);
            } catch (error) {
                console.error('Error formatting date:', error);
                return null;
            }
        }
        return null;
    });

    return dates.filter(Boolean).join(' | ');
}

// Language change handler
function onLanguageChange(newLangCode) {
    const foundLang = languages.value.find((lang) => lang.code === newLangCode.code);

    if (foundLang) {
        selectedLanguage.value = foundLang;
        setLanguage(foundLang); // Update the centralized language state
        locale.value = foundLang.lang; // Ensure this is reactive
        console.log('Locale Changed to:', locale.value);
        loadData(foundLang.lang); // Reload or refresh data
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

watch(
    () => locale.value,
    (newLocale) => {
        console.log('Locale changed to:', newLocale);
        // Perform actions that need to be updated when locale changes
    }
);

watch(selectedLanguage, (newLang) => {
    if (newLang && newLang.lang) {
        locale.value = newLang.lang; // Update i18n locale
        loadData(newLang.lang); // Fetch data with new language
    }
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
                    <span class="mt-3 font-bold text-700 text-center white-space-nowrap">&emsp;{{ `${totalPosts.author_firstname} ${totalPosts.author_lastname}` }}</span>
                </div>
            </div>
        </div>
        <!-- Div for Video and Multimedia HTML5 frame element -->
        <Card class="galleria-card">
            <template #content>
           <!-- Sketchfab iFrame Embed -->
           <div class="sketchfab-embed-wrapper"> <iframe 
      title="3D Model" 
      class="large-sketchfab" 
      frameborder="0" 
      allowfullscreen 
      mozallowfullscreen="true" 
      webkitallowfullscreen="true" 
      allow="autoplay; fullscreen; xr-spatial-tracking" 
      xr-spatial-tracking 
      execution-while-out-of-viewport 
      execution-while-not-rendered 
      web-share 
      :src="totalPosts.sketchfab_source">
    </iframe></div>

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
                            <div :class="['text-md-l mb-2 font-bold', colorScheme.value === 'dark' ? 'text-light' : 'text-dark']">
                                {{ slotProps.item.itemImageNum ?? 'No Image Num.' }} {{ '\u2003' }}
                                {{ slotProps.item.meta_object ?? 'No Object' }}
                                {{ '\u2003' }}
                                {{ slotProps.item.meta_caption ?? 'No Caption' }}
                            </div>
                            <div :class="['text-md-sm mb-2 font-bold', colorScheme.value === 'dark' ? 'text-light' : 'text-dark']">
                                {{ slotProps.item.meta_author ?? 'No Author' }}
                            </div>
                        </template>
                    </Galleria>
                </div>
            </template>
        </Card>
        <!-- Debugging: Add console log to inspect the data-->
        <pre>{{ formattedDate }}</pre>
        <!-- display the filteredTranslation values for "title", "description" and "textarea" here -->
        <div v-if="totalPosts.translations_records">
            <div class="text-3xl mb-4 font-semibold">
                <span class="text-primary">{{ t('recordHeaders.name') }}:</span>
                &emsp;{{ totalPosts.translations_records.tr_obj_name }}
            </div>

            <div class="text-2xl text-500 custom-transparency mb-4 font-semibold">
                <span class="text-primary">{{ t('recordHeaders.record_id') }}:</span><span>&emsp;{{ totalPosts.id_record }}</span> <span class="text-primary">&emsp;{{ t('recordHeaders.label') }}:</span
                ><span>&emsp;{{ totalPosts.translations_records.tr_obj_label }}</span>
            </div>
            <div class="text-2xl text-500 custom-transparency mb-4 font-semibold">
                <span class="text-primary">{{ t('recordHeaders.obj_designation') }}:</span> &emsp;{{ totalPosts.obj_designation }} &emsp;<span class="text-primary">{{ t('recordHeaders.informe_designation') }}:</span> &emsp;{{
                    totalPosts.translations_records.tr_informe_designation
                }}
            </div>
            <div class="text-2xl text-500 custom-transparency mb-4 justify-content-between font-semibold" style="text-align: justify; word-spacing: normal">
                <span class="text-primary">{{ t('recordHeaders.description') }}:</span> &emsp;{{ totalPosts.translations_records.tr_description }}
            </div>
            <div class="text-2xl text-500 custom-transparency mb-4 justify-content-between font-semibold" style="text-align: justify; word-spacing: normal">
                            <span class="text-primary"> Sketchfab iFrame:</span> &emsp;{{ totalPosts.sketchfab }}
            </div>
            <div class="text-2xl text-500 custom-transparency mb-4 font-semibold">
                <span class="text-primary">{{ t('recordHeaders.location') }}:</span> &emsp;{{ totalPosts.find_location }}
            </div>
            <div class="text-2xl text-500 custom-transparency mb-4 font-semibold">
                <span class="text-primary">{{ t('recordHeaders.date_documented') }}:</span> &emsp;{{ totalPosts.date_documented_clean_new }}
            </div>
            <div class="text-2xl text-500 custom-transparency mb-4 font-semibold">
                <span class="text-primary">{{ t('recordHeaders.category_num') }}:</span> &emsp;{{ totalPosts.fk_category.obj_categories }} <span class="text-primary">&emsp;{{ t('recordHeaders.category_name') }}:</span> &emsp;{{
                    totalPosts.fk_category.obj_description
                }}
            </div>
            <div class="text-2xl text-500 custom-transparency mb-4 font-semibold">
                <span class="text-primary">{{ t('recordHeaders.author') }}:</span><span>&emsp;{{ `${totalPosts.author_firstname} ${totalPosts.author_lastname}` }}</span>
                <span class="text-primary">&emsp;{{ t('recordHeaders.record_created') }}:</span> &emsp;{{ formattedTimestamp }}
            </div>
        </div>

        <div class="flex align-items-center mb-4 font-bold">
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

.sketchfab-embed-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

.sketchfab-embed-wrapper iframe {
    height: 32.5rem; /* Adjusted from 65rem to make it 50% smaller */
    width: 50%; /* Adjust width to 50% of its container */
    max-width: 50%; /* Ensure it doesn't overflow its container */
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .sketchfab-embed-wrapper {
        height: auto; /* Adjust the height on smaller screens */
        aspect-ratio: 16 / 9; /* Maintain a reasonable aspect ratio for smaller screens */
    }
    .sketchfab-embed-wrapper iframe {
        height: auto !important; /* Let the height adjust automatically */
        width: 100% !important; /* Reset to full width on smaller screens for better visibility */
        max-width: 100%; /* Ensure it doesn't exceed its container */
    }
}
</style>

