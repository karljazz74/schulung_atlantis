<script setup>
import { ref, onMounted, computed, watch, watchEffect } from 'vue';
import Dropdown from 'primevue/dropdown';
import Carousel from 'primevue/carousel';
import { useI18n } from 'vue-i18n';
import { fetchData, fetchImageFromDirectus } from '@/service/dataServiceUMG_dyn2';
import { selectedLanguage, setLanguage, getStoredLanguage } from '@/service/languageState'; // Adjust path as needed

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
                         <div class="col-12">
        <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
            <Carousel :value="slotProps.data.galleriaImages" :numVisible="1" :numScroll="1">
            <template #item="slotProps">
                <div class="border-1 surface-border border-round m-2 text-center py-1 px-1 carousel-container">
                    <img :src="slotProps.data?.itemImageSrc" :alt="slotProps.data?.alt" class="w-6 shadow-2" />
                </div>
            </template>
        </Carousel>
    <div class="flex-1 flex flex-column align-items-center text-center md:text-left">
                                    <div class="font-bold text-2xl">{{ slotProps.data.name }}</div>
                                    <div class="mb-2">{{ slotProps.data.description }}</div>
                                    <div class="flex align-items-center mt-1">
                                        <i class="pi pi-filter mr-2"></i>
                                        <span class="font-semibold">{{ slotProps.data.category }}</span>
                                    </div>
                                </div>
                                <div class="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
                                    <span class="text-2xl font-semibold mb-2 align-self-center md:align-self-end">${{ slotProps.data.price }}</span>
                                    <Button icon="pi pi-eye" class="p-button-rounded" @click="navigateToDetail(data.id_record)" />
                                    <Badge :severity="getBadgeSeverity(slotProps.data.inventoryStatus)">{{ slotProps.data.inventoryStatus }}</Badge>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #grid="slotProps">
                        <div class="col-12 md:col-4">
                            <div class="card m-3 border-1 surface-border">
                                <div class="flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
                                    <div class="flex align-items-center">
                                        <i class="pi pi-filter mr-2"></i>
                                        <span class="font-semibold">{{ slotProps.data.obj_categories }}</span>
                                    </div>
                                    <Badge :severity="getBadgeSeverity(slotProps.data.inventoryStatus)">{{ slotProps.data.inventoryStatus }}</Badge>
                                </div>
                                <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                    <Carousel :value="slotProps.data.galleriaImages" :numVisible="1" :numScroll="1">
    <template #item="slotProps">
        <div class="border-1 surface-border border-round m-2 text-center py-1 px-1 carousel-container">
            <img :src="slotProps.data?.itemImageSrc" :alt="slotProps.data?.alt" class="w-6 shadow-2" /> <!-- Used optional chaining here -->
        </div>
    </template>
</Carousel>
    <div class="flex-1 flex flex-column align-items-center text-center md:text-left">
                                    <div class="text-2xl font-bold">{{ slotProps.data.tr_obj_label }}</div>
                                    <div class="mb-3">{{ slotProps.data.informe_designation }}</div>
                                </div>
                                <div class="flex align-items-center justify-content-between">
                                    <span class="text-2xl font-semibold">${{ slotProps.data.lote_number }}</span>
                                    <span class="text-2xl font-semibold">/{{ slotProps.data.obj_designation}}</span>
                                    <Button icon="pi pi-eye" class="p-button-rounded" @click="navigateToDetail(data.id_record)" />
                                </div>
                            </div>
                        </div>
                        </div>
                    </template>
                </DataView>
            </div>
        </div>
    </div>
</template>
