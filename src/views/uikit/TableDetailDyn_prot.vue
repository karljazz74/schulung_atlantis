<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { fetchPosts, fetchImageFromDirectus } from '@/service/directusClient2';
import { setLanguage } from '@/service/languageState'; // Adjust the path according to your project structure
// Reactive property to handle images
const responsiveOptions = ref([]); // Define it, even if it's just an empty array
// Define a new reactive property for storing images
// Assuming each image object should have 'itemImageSrc' and 'alt' properties
const galleriaImages = ref([]);
console.log('Initial galleriaImages:', galleriaImages.value); // this is line 15

const { locale, t } = useI18n({
    inheritLocale: true,
    useScope: 'global',
});

const selectedLanguage = ref({ name: 'English', code: 'US', lang: 'en-US' }); // default language

const languages = computed(() => [
    { name: t('language.german'), code: 'DE', lang: 'de-DE' },
    { name: t('language.english'), code: 'US', lang: 'en-US' },
    { name: t('language.spanish'), code: 'ES', lang: 'es-ES' },
    // ... other languages
]);

// added for language change, when language changes in the dropdown
function onLanguageChange(newLangCode) {
    const foundLang = languages.value.find((lang) => lang.code === newLangCode.code);
    if (foundLang) {
        selectedLanguage.value = foundLang;
        setLanguage(selectedLanguage.value);
        locale.value = selectedLanguage.value.lang;
        fetchAndUpdatePosts(recordId.value, selectedLanguage.value.lang);
        console.log('value until here:', fetchAndUpdatePosts);
    } else {
        console.error('No data returned from GraphQL query');
    }
}

// Modified loadImages function

const route = useRoute();
const recordId = ref(route.params.id); // Initialize with route param
const totalPosts = ref(null);

// Define the function to fetch and update posts
async function fetchAndUpdatePosts(id, langCode = 'en-US') {
    console.log('fetchAndUpdatePosts called with id:', id, 'and langCode:', langCode);
    try {
        console.log('Fetching posts for:', id, langCode); // Log at start
        const rawData = await fetchPosts(id, langCode);
        console.log('Raw data received:', rawData); // Log after fetching
        console.log('Fetched post data:', rawData); // Log the fetched data

        if (rawData.fk_files_images) {
            galleriaImages.value = []; // Temporary array to store new images
            for (const imageData of rawData.fk_files_images) {
                const imageUrl = await fetchImageFromDirectus(imageData.directus_files_id.id, 'bild-med');
                if (imageUrl) {
                    galleriaImages.value.push({
                        itemImageSrc: imageUrl,
                        alt: imageData.directus_files_id.translations[0]?.figure_caption_name || 'Default Alt',
                    });
                }
            }

            console.log('Processed galleriaImages:', galleriaImages.value);
        }

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

            // new section

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
        console.error('Error in fetchAndUpdatePosts:', error); // Log errors
    }
}

// Define windowWidth as a reactive reference
const windowWidth = ref(window.innerWidth);

const handleResize = () => {
    windowWidth.value = window.innerWidth;
    console.log('Updated window width:', windowWidth.value);
};

// Cleanup on component unmount
onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
});

// Watching route changes

watch(
    () => route.params.id,
    async (newId) => {
        console.log('Route parameter id:', newId); // Log the new ID

        if (newId) {
            recordId.value = newId;
            await fetchAndUpdatePosts(newId);
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
onMounted(async () => {
    const storedLanguageStr = localStorage.getItem('selectedLanguage');
    const storedLanguage = storedLanguageStr ? JSON.parse(storedLanguageStr) : null;
    if (storedLanguage) {
        selectedLanguage.value = storedLanguage;
        locale.value = storedLanguage.lang;
    } else {
        // Handle the case where no language is stored
        // e.g., set a default language or leave it as is
    }
    if (recordId.value) {
        await fetchAndUpdatePosts(recordId.value, selectedLanguage.value.lang);
    }
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
                <span v-else>
                    {{ slotProps.placeholder }}
                </span>
            </template>
        </Dropdown>
        <div class="flex flex-col md:flex-row justify-between items-center mb-4">
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
                    <!-- Image Column added here -->
                    <div v-if="galleriaImages.length > 0">
                        <Column header="Images" style="max-width: 8rem">
                            <Carousel :value="galleriaImages" :numVisible="1" :numScroll="1" :responsiveOptions="responsiveOptions">
                                <template #item="slotProps">
                                    <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" />
                                </template>
                            </Carousel>
                        </Column>
                    </div>
                    <!-- Rest of the fields -->
                    <div class="w-full">
                        <div class="description-wrapper">
                            <div class="description-header">
                                <i class="pi pi-info-circle text-primary"></i><b>{{ t('recordHeaders.description') }}</b>
                            </div>
                            <div class="description-content">&emsp;{{ totalPosts.translations_records.tr_description }}</div>
                        </div>
                        <br />
                        <div class="designation-wrapper">
                            <div class="designation-header"><i class="pi pi-hashtag text-primary"></i><b> Designation:</b></div>
                            <div class="designation-content">&emsp;{{ totalPosts.translations_records.tr_informe_designation }}</div>
                        </div>
                    </div>
                </div>
                <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round" style="height: 3rem; align-items: center">
                    <i class="pi pi-calendar-times text-primary mr-2"></i>
                    <span class="text-900">Date(s) Documented: {{ totalPosts.date_documented_clean_new }}</span>
                </span>
            </div>
        </div>

        <!-- display the filteredTranslation values for "title", "description" and "textarea" here -->
        <div v-if="totalPosts.translations">
            <div class="text-3xl text-1100 mb-4 font-semibold">{{ totalPosts.TranslationCat[0]?.title }}</div>
            <div class="text-2xl text-500 text-primary custom-transparency mb-4 font-semibold">{{ totalPosts.TranslationCat[0]?.obj_categories }}</div>
            <p class="line-height-3 mb-0 my-3" v-html="totalPosts.translations[0]?.textarea"></p>
            <div class="text-2xl text-500 text-primary custom-transparency mb-4 font-semibold">{{ totalPosts.TranslationCat[0]?.obj_description }}</div>
            <p class="line-height-3 mb-0 my-3" v-html="totalPosts.translations[0]?.textarea2"></p>
        </div>

        <div class="text-xl text-900 text-primary mb-4 font-bold mt-8">Post a Comment</div>

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
.text-600 {
    color: #1caad9cc !important;
}

.custom-transparency {
    color: rgba(var(--text-primary-color), 0.5); /* 0.5 is the alpha value for 50% transparency */
}

.link-color {
    color: #ff5733 !important; /* Color for light theme */
    text-decoration: underline !important; /* Remove underline if desired */
}
.text-xxl {
    font-size: 1.75rem !important;
}

/* video settings */

.my-1.video-container .middle-size {
    width: 100rem;
}
.large-sketchfab {
    width: 60rem; /* Adjust as needed */
    height: 45rem; /* Adjust as needed */
}

.description-wrapper {
    text-align: justify;
    text-justify: inter-word; /* Improves spacing between words */
    margin-left: 1rem; /* Optional: Adjust for left margin */
    margin-right: 1rem; /* Optional: Adjust for right margin */
}
.designation-wrapper {
    display: flex;
    align-items: start; /* Align items to the top */
    gap: 0.5rem; /* Adjust the gap as needed */
    margin-left: 1rem; /* Optional: Adjust for left margin */
    margin-right: 1rem; /* Optional: Adjust for right margin */
}

.description-header {
    display: flex;
    align-items: center;
    gap: 0.5rem; /* Adjust gap as necessary */
}
.designation-header {
    font-weight: bold; /* Only headers are bold */
}

.description-content,
.designation-content {
    font-weight: normal; /* Regular font weight for content */
}

@media (max-width: 1420px) {
    .my-1.video-container .middle-size {
        width: 75rem;
    }
}

@media (max-width: 1280px) {
    .my-1.video-container .middle-size {
        width: 65rem;
    }
}

@media (max-width: 1024px) {
    .my-1.video-container .middle-size {
        width: 60rem;
    }
}

@media (max-width: 860px) {
    .my-1.video-container .middle-size {
        width: 50rem;
    }
    .large-sketchfab {
        width: 50rem; /* Adjust as needed */
        height: 37.5rem; /* Adjust as needed */
    }
}

@media (max-width: 770px) {
    .my-1.video-container .middle-size {
        width: 47rem;
    }
    .large-sketchfab {
        width: 40rem; /* Adjust as needed */
        height: 30rem; /* Adjust as needed */
    }
}

@media (max-width: 560px) {
    .my-1.video-container .middle-size {
        width: 35rem;
    }
    .large-sketchfab {
        width: 30rem;
        height: 22.5rem;
    }
}

@media (max-width: 370px) {
    .my-1.video-container .middle-size {
        width: 25rem;
    }
    .large-sketchfab {
        width: 23rem;
        height: 17.25rem;
    }
}

@media (max-width: 300px) {
    .my-1.video-container .middle-size {
        width: 12rem;
    }
    .large-sketchfab {
        width: 12rem;
        height: 9rem;
    }
}

@media (max-width: 200px) {
    .my-1.video-container .middle-size {
        width: 5rem;
    }
    .large-sketchfab {
        width: 5rem;
        height: 3.75rem;
    }
}

@media (max-width: 100px) {
    .my-1.video-container .middle-size {
        width: 2.5rem;
    }
    .large-sketchfab {
        width: 2.5rem;
        height: 1.875rem;
    }
}
/* ...and so on for other breakpoints */

/* In your CSS file or in a <style> block */
</style>
