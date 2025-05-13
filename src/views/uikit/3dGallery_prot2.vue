<script setup>
import { ref, onMounted, computed, watch, watchEffect } from 'vue';
import Dropdown from 'primevue/dropdown';
import Carousel from 'primevue/carousel';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { fetchData, fetchImageFromDirectus } from '@/service/dataServiceUMG_dyn';
import { selectedLanguage, setLanguage, getStoredLanguage } from '@/service/languageState'; // Adjust path as needed

const router = useRouter();

const recordsData = ref([]);
// added i18n
const { locale, t } = useI18n({
    inheritLocale: true,
    useScope: 'global',
});

const galleriaImages = ref([]); // Initialize galleriaImages as an empty array

// Update the countries array
const languages = computed(() => [
    { name: t('language.german'), code: 'DE', lang: 'de-DE' },
    { name: t('language.english'), code: 'US', lang: 'en-US' },
    { name: t('language.spanish'), code: 'MX', lang: 'es-ES' },
    // ... other languages
]);

// Replace selectedCountry with centralized selectedLanguage
function onLanguageChange(newLangCode) {
    const foundLang = languages.value.find((lang) => lang.code === newLangCode.code);
    if (foundLang) {
        setLanguage(foundLang); // Update the centralized language state
        locale.value = foundLang.lang; // Update i18n locale
        loadData(foundLang.lang); // Fetch posts with new language
    }
}

// This function will iterate through each record, fetch images from Directus and store them in the 'galleriaImages' property of the record.
async function loadImages() {
    if (Array.isArray(recordsData.value)) {
        for (const record of recordsData.value) {
            const galleriaImages = [];
            for (const id of record.image_ids) {
                const imageUrl = await fetchImageFromDirectus(id);
                const thumbnailUrl = await fetchImageFromDirectus(id, 'bild-small');
                if (imageUrl && thumbnailUrl) {
                    galleriaImages.push({
                        itemImageSrc: imageUrl,
                        thumbnailImageSrc: thumbnailUrl,
                        alt: 'Description', // Modify as needed
                    });
                }
            }
            console.log('Loaded images for record:', record.id_record, galleriaImages); // Place the log here
            // Update images for each record reactively
            record.galleriaImages = galleriaImages;
        }
    }
}

// Define the transformData function
function transformData(rawData) {
  return rawData.map((record) => {
    // Transform each item as needed
    const transformed = {
      id_record: Number(record.id_record),
      find_location: record.find_location,
      date_documented_clean: record.date_documented_clean
        ? new Date(record.date_documented_clean)
        : null,
      obj_designation: record.obj_designation,
      tr_obj_name: record.translations_records?.[0]?.tr_obj_name,
      tr_obj_label: record.translations_records?.[0]?.tr_obj_label,
      tr_informe_designation: record.translations_records?.[0]?.tr_informe_designation,
      tr_description: record.translations_records?.[0]?.tr_description,
      obj_categories: record.fk_category?.TranslationCat?.length
        ? record.fk_category.TranslationCat[0].obj_categories
        : null,
      obj_description: record.fk_category?.TranslationCat?.length
        ? record.fk_category.TranslationCat[0].obj_description
        : null,

      // ... other transformations
      image_ids: Array.isArray(record.fk_files_images) ? record.fk_files_images.flatMap((image) => (image.directus_files_id ? [image.directus_files_id.id] : [])) : [],
                };
                return {
                    ...transformed,
                    galleriaImages: [], // Initialize galleriaImages as an empty array
                };
  });
}

// watchEffect to load images reactively
watchEffect(async () => {
    if (recordsData.value.length > 0) {
        const firstRecord = recordsData.value[0];
        if (firstRecord && firstRecord.image_ids) {
            await loadImages(firstRecord);
        }
    }
});





watch(selectedLanguage, async (newLang) => {
    locale.value = newLang.lang;
    localStorage.setItem('selectedLanguage', JSON.stringify(newLang));
    await loadData(newLang.lang);
});


// Define the loadData function
async function loadData(langCode) {
  try {
    const rawData = await fetchData(langCode);
    // Transform rawData using transformData function
    const transformedData = transformData(rawData); // Use a local variable instead
    recordsData.value = transformedData; // Directly update the shared reactive reference
            console.log('recordsData Value Y:', recordsData.value);
            console.log('recordsData Value XYZ:', recordsData.value[10].find_location);

            // Call loadImages after setting recordsData
            await loadImages();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Initialize reactive variables
const dataviewValue = ref(null);
const layout = ref('grid');
const globalFilterValue = ref('');
const filteredValue = ref(null);
const sortKey = ref(null);
const sortOrder = ref(null);
const sortField = ref(null);
const sortOptions = ref([
    { label: 'Price High to Low', value: '!price' },
    { label: 'Price Low to High', value: 'price' },
]);

// Call loadData function onMounted
onMounted(async () => {
    await loadData(selectedLanguage.value);
});

onMounted(async () => {
    const storedLanguageCode = getStoredLanguage(); // Retrieve stored language
    selectedLanguage.value = languages.value.find((lang) => lang.lang === storedLanguageCode) || { name: 'English', code: 'US', lang: 'en-US' };
    locale.value = selectedLanguage.value.lang;
    await loadData(selectedLanguage.value.lang); // Load data based on stored language
});

const onSortChange = (event) => {
    const value = event.value.value;
    const sortValue = event.value;

    if (value.indexOf('!') === 0) {
        sortOrder.value = -1;
        sortField.value = value.substring(1, value.length);
        sortKey.value = sortValue;
    } else {
        sortOrder.value = 1;
        sortField.value = value;
        sortKey.value = sortValue;
    }
};

const onFilter = (e) => {
    const value = e.target.value;
    globalFilterValue.value = value;
    if (value.length === 0) {
        filteredValue.value = null;
    } else {
        const filtered = dataviewValue.value.filter((product) => {
            return product.name.toLowerCase().includes(value.toLowerCase());
        });
        filteredValue.value = filtered;
    }
};
const getBadgeSeverity = (status) => {
    const stockStatus = {
        OUTOFSTOCK: 'danger',
        LOWSTOCK: 'warning',
        INSTOCK: 'success',
    };

    return stockStatus[status];
};
const responsiveOptions = ref([
  {
    breakpoint: '1024px',
    numVisible: 3,
    numScroll: 3,
  },
  {
    breakpoint: '600px',
    numVisible: 2,
    numScroll: 2,
  },
  {
    breakpoint: '480px',
    numVisible: 1,
    numScroll: 1,
  },
]);
// Added CPG for Details View GPT 04.12
const navigateToDetail = (id_record) => {
  console.log('Navigating to detail with ID:', id_record);
  router.push({ name: 'DetailView', params: { id: id_record } });
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
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
            <div class="card">
                <h5>DataView</h5>
                <!--<pre>{{ JSON.stringify(filteredValue || recordsData, null, 2) }}</pre>-->
                <DataView :value="filteredValue || recordsData" :layout="layout" :paginator="true" :rows="9" :sortOrder="sortOrder" :sortField="sortField">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between gap-2">
                            <div>
                                <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By Price" @change="onSortChange($event)" />
                            </div>
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="globalFilterValue" @input="onFilter" placeholder="Search by Name" />
                            </span>
                            <div>
                                <DataViewLayoutOptions v-model="layout" />
                            </div>
                        </div>
                    </template>
                    <template #list="slotProps">
                        <div class="list-item-container">
                            <div class="carousel-container list-carousel">
                                <Carousel :value="slotProps.data.galleriaImages" :numVisible="1" :numScroll="1">
                                    <template #item="slotProps">
                                        <img class="img-list" :src="slotProps.data.itemImageSrc" :alt="slotProps.data.alt" />
                                    </template>
                                </Carousel>
                            </div>
                            <div class="textual-content-container">
                                <div class="textual-content">
                                    <div class="flex flex-nowrap" style="margin-bottom: 1rem;">
                                         <Button class="p-button-rounded" icon="pi pi-eye" @click="navigateToDetail(slotProps.data.id_record)" />
                                         <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round" style="height: 3rem; align-items: center">
                                         <i class="pi pi-filter mr-2"></i>
                                         <span class="font-semibold">{{ slotProps.data.obj_categories }}</span>
                                         &emsp; &emsp;<i class="pi pi-key text-primary mr-2"></i>
                                             <span class="text-900"><b>ID:</b> &emsp;{{ slotProps.data.id_record }}</span>
                                         </span>
                                         &emsp; &emsp;<div class="text-2xl font-semibold">{{ slotProps.data.tr_informe_designation }}</div>
                                     </div>
                                     <div class="text-2xl font-semibold" style="margin-bottom: 1rem;">{{ slotProps.data.tr_obj_name }}</div>
                                    <div class="description justify-content-between" style="text-align: justify; word-spacing: normal">{{ slotProps.data.tr_description }}</div>
                                </div>
                            </div>
                        </div>
                    </template>
                    <!-- GRID VIEW -->
                    <template #grid="slotProps">
                        <div class="col-12 md:col-4">
                            <div class="card m-3 border-1 surface-border">
                                <div class="flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
                                    <div class="flex align-items-center">
                                        <div class="carousel-container grid-carousel flex flex-nowrap">
                    <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round" style="height: 3rem; align-items: center">
                    <i class="pi pi-filter mr-2"></i>
                    <span class="font-semibold">{{ slotProps.data.obj_categories }}</span>
                    &emsp; &emsp;<i class="pi pi-key text-primary mr-2"></i>
                        <span class="text-900"><b>ID:</b> &emsp;{{ slotProps.data.id_record }}</span>
                    </span>
                </div>
                                        
                                    </div>
                                    <!--<Badge :severity="getBadgeSeverity(slotProps.data.inventoryStatus)">{{ slotProps.data.inventoryStatus }}</Badge>-->
                                    <span class="text-1xl font-semibold">/{{ slotProps.data.obj_designation}}</span>
                                </div>
                                <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                    <Carousel :value="slotProps.data.galleriaImages" :numVisible="1" :numScroll="1" class="custom-carousel">
  <template #item="slotProps">
    <div class="carousel-container grid-carousel">
      <img :src="slotProps.data.itemImageSrc" :alt="slotProps.data.alt" class="w-6" />
    </div>
  </template>
</Carousel>
</div>
    <div class="flex-1 flex flex-column align-items-center text-center md:text-left">
                                    <div class="mb-9 font-bold">{{ slotProps.data.tr_obj_name }}</div>
                                    <div class="mb-3">{{ slotProps.data.tr_informe_designation }}</div>
                                </div>
                                <div class="flex align-items-center justify-content-between">
                                    <i class="pi pi-eye text-primary mr-2"></i>
                                    <span class="text-2xl font-semibold">{{ slotProps.data.lote_number }}</span>
                                    <Button icon="pi pi-eye" class="p-button-rounded" @click="navigateToDetail(slotProps.data.id_record)" />
                                
                            </div>
                        </div>
                        </div>
                    </template>
                </DataView>
            </div>
        </div>
    </div>
</template>
<style scoped>
/* General carousel and container adjustments */
.carousel-container {
    width: 100%; /* Ensures carousel takes full width of its parent */
}

.list-item-container {
    display: flex;
    align-items: flex-start; /* Align items at the top */
    gap: 1rem; /* Space between carousel and textual content */
}

/* List carousel specific styles */
.list-carousel {
    max-width: 40%; /* Limit carousel width to 40% of its container */
    position: relative; /* For positioning indicators correctly */
}

.list-carousel .p-carousel .p-carousel-content .p-carousel-item img {
    max-height: 15rem;
    object-fit: cover; /* Ensures images cover the area without distortion */
    width: 100%; /* Ensures image takes full width of carousel */
}


/* Textual content container to align next to the carousel */
.textual-content-container {
    flex: 1; /* Takes remaining space */
    display: flex;
    flex-direction: column;
    justify-content: center; /* Center content vertically */
}

/* Styles specific to the grid view carousel */
.carousel-container.grid-carousel[data-v-b46d1946] {
    width: 100%; /* Ensures the container takes the full width */
    display: flex; /* Enables flexbox layout */
    justify-content: center; /* Centers the child elements (images) horizontally */
    align-items: center; /* Centers the child elements (images) vertically */
}

/* Targeting images within the carousel in the grid block */
.carousel-container.grid-carousel .p-carousel .p-carousel-content .p-carousel-item img[data-v-b46d1946] {
    width: 150%!important; /* Increases the image size by 150% */
    height: auto; /* Maintains the aspect ratio */
    object-fit: contain; /* Ensures the image is fully visible without being cropped */
    margin: auto; /* Center the image within its container */
}


/* Responsive adjustments */
@media (max-width: 768px) {
    .carousel-container.grid-carousel .p-carousel .p-carousel-content .p-carousel-item img[data-v-b46d1946] {
        width: 100%!important; /* Adjusts image width on smaller screens for better fit */
    }


    .list-item-container {
        flex-direction: column;
    }

    .list-carousel, .grid-carousel {
        max-width: 100%; /* Full width for both list and grid views */
    }



    .carousel-container.list-carousel, .textual-content-container {
        max-width: 100%; /* Ensures full width utilization on smaller screens */
    }
}

/* Additional adjustments as needed */
.detail, .description, .category, .price {
    margin-bottom: 1rem; /* Consistent spacing between textual elements */
}

.w-6, .carousel-container .p-carousel .p-carousel-content .p-carousel-item img {
    object-fit: contain; /* Adjust if you want to ensure images fit without cropping */
}
</style>
