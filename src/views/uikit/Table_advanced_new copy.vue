<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchData, fetchImageFromDirectus } from '@/service/dataServiceUMG';
import { FilterMatchMode, FilterOperator } from 'primevue/api';

const formatDate = (value) => {
    if (!value) return null;
    return value.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const recordsData = ref([]);
const loading1 = ref(null);
const filters1 = ref(null);

const globalFilterValue = computed({
    // Step 2: Insert this block below filters1 declaration
    get: () => filters1.value?.global?.value ?? '',
    set: (newValue) => {
        if (!filters1.value.global) {
            filters1.value.global = { value: null, matchMode: FilterMatchMode.CONTAINS };
        }
        filters1.value.global.value = newValue;
    },
});

// Fetch data
async function loadData() {
    try {
        const response = await fetchData();
        console.log('Response Object:', response);

        // Flatten the nested array
        const flattenedResponse = response.flat(Infinity);

        // Clear existing data
        recordsData.value = [];

        // Check and transform records if they exist
        if (flattenedResponse?.length > 0) {
            const transformedRecords = flattenedResponse.map((record) => {
                console.log('Before transformation:', record);

                // Define the transformed record
                const transformed = {
                    id_record: Number(record.id_record),
                    find_location: record.find_location,
                    date_documented_clean: record.date_documented_clean ? new Date(record.date_documented_clean) : null, // Changed this line
                    obj_designation: record.obj_designation,
                    tr_obj_name: record.translations_records?.[0]?.tr_obj_name,
                    tr_obj_label: record.translations_records?.[0]?.tr_obj_label,
                    tr_informe_designation: record.translations_records?.[0]?.tr_informe_designation,
                    tr_description: record.translations_records?.[0]?.tr_description,
                    obj_categories: record.fk_category?.TranslationCat?.length ? record.fk_category.TranslationCat[0].obj_categories : null,
                    obj_description: record.fk_category?.TranslationCat?.length ? record.fk_category.TranslationCat[0].obj_description : null,

                    // ... other transformations
                    image_ids: Array.isArray(record.fk_files_images) ? record.fk_files_images.flatMap((image) => (image.directus_files_id ? [image.directus_files_id.id] : [])) : [],
                };
                console.log('Date documented:', record.date_documented_clean);
                console.log('After transformation:', transformed); // Moved this line up, before the return
                return transformed; // Return the transformed record
            });
            recordsData.value = transformedRecords; // Populate the ref
            console.log('recordsData Value Y:', recordsData.value);
            console.log('recordsData Value XYZ:', recordsData.value[10].find_location);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// New Function: loadImages
// This function will iterate through each record, fetch images from Directus and store them in the 'galleriaImages' property of the record.
async function loadImages() {
    const records = recordsData.value;
    for (const record of records) {
        const galleriaImages = [];
        for (const id of record.image_ids) {
            const imageUrl = await fetchImageFromDirectus(id);
            const thumbnailUrl = await fetchImageFromDirectus(id, 'preset1');
            if (imageUrl && thumbnailUrl) {
                galleriaImages.push({
                    itemImageSrc: imageUrl,
                    thumbnailImageSrc: thumbnailUrl,
                    alt: 'Description', // Modify as needed
                });
            }
        }
        record.galleriaImages = galleriaImages;
    }
}
/// Modified: onMounted
// Now also awaiting the 'loadImages' function to fetch and associate images with each record.
onMounted(async () => {
    console.log('onMounted triggered');
    await loadData();
    await loadImages(); // New Line
    initFilters1();
});

const initFilters1 = () => {
    filters1.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        id_record: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        find_location: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        date_documented_clean: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
        },
        obj_designation: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        tr_obj_name: {
            operator: FilterOperator.AND,
            constraints: [
                { value: null, matchMode: 'startsWith' },
                { value: null, matchMode: 'endsWith' },
                { value: null, matchMode: 'contains' },
                { value: null, matchMode: 'notContains' },
            ],
        },
        tr_obj_label: {
            operator: FilterOperator.AND,
            constraints: [
                { value: null, matchMode: 'startsWith' },
                { value: null, matchMode: 'endsWith' },
                { value: null, matchMode: 'contains' },
                { value: null, matchMode: 'notContains' },
            ],
        },
        tr_description: {
            operator: FilterOperator.AND,
            constraints: [
                { value: null, matchMode: 'startsWith' },
                { value: null, matchMode: 'endsWith' },
                { value: null, matchMode: 'contains' },
                { value: null, matchMode: 'notContains' },
            ],
        },
        obj_categories: {
            operator: FilterOperator.AND,
            constraints: [
                { value: null, matchMode: 'contains' },
                { value: null, matchMode: 'notContains' },
            ],
        },
        obj_description: {
            operator: FilterOperator.AND,
            constraints: [
                { value: null, matchMode: 'contains' },
                { value: null, matchMode: 'notContains' },
            ],
        },
    };
};

const clearFilter1 = () => {
    initFilters1();
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Filter Menu</h5>
                <DataTable
                    :value="recordsData"
                    :paginator="true"
                    class="p-datatable-gridlines"
                    :rows="15"
                    dataKey="id_record"
                    :rowHover="true"
                    v-model:filters="filters1"
                    filterDisplay="menu"
                    :loading="loading1"
                    :filters="filters1"
                    responsiveLayout="scroll"
                    :globalFilterFields="['find_location', 'date_documented_clean', 'obj_designation', 'tr_obj_name', 'tr_obj_label', 'tr_informe_designation', 'tr_description', 'obj_categories', 'obj_description']"
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined mb-2" @click="clearFilter1()" />
                            <span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="globalFilterValue" placeholder="Keyword Search" style="width: 100%" />
                            </span>
                        </div>
                    </template>
                    <template #empty> No records found. </template>
                    <template #loading> Loading customers data. Please wait. </template>
                    <Column field="id_record" header="ID" style="max-width: 1.5rem">
                        <template #body="{ data }">
                            {{ data.id_record }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by ID" />
                        </template>
                    </Column>
                    <!-- Image Column added here -->
                    <div v-if="galleriaImages.length > 0">
                        <Column header="Images" style="max-width: 8rem">
                            <Carousel :value="galleriaImages.value" :numVisible="1" :numScroll="1" :responsiveOptions="responsiveOptions">
                                <template #item="slotProps">
                                    <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" />
                                </template>
                            </Carousel>
                        </Column>
                    </div>
                    <!-- Rest of the fields -->
                    <Column field="obj_designation" header="Designation" style="max-width: 4rem">
                        <template #body="{ data }">
                            {{ data.obj_designation }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by Obj. Design." />
                        </template>
                    </Column>
                    <!--- newly added columns Nov. 2023-->
                    <Column field="tr_obj_name" header="Obj. Name" style="max-width: 4rem">
                        <template #body="{ data }">
                            {{ data.tr_obj_name }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by Obj. Name." />
                        </template>
                    </Column>
                    <Column field="tr_obj_label" header="Obj. Label" style="max-width: 4rem">
                        <template #body="{ data }">
                            {{ data.tr_obj_label }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by Obj. Label." />
                        </template>
                    </Column>
                    <Column field="obj_categories" header="Category" style="max-width: 4rem">
                        <template #body="{ data }">
                            {{ data.obj_categories }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by Obj. Category." />
                        </template>
                    </Column>
                    <Column field="obj_description" header="Cat. Name" style="max-width: 4rem">
                        <template #body="{ data }">
                            {{ data.obj_description }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by Obj. Label." />
                        </template>
                    </Column>
                    <Column header="Date" filterField="date_documented_clean" dataType="date" style="max-width: 4rem">
                        <template #body="{ data }">
                            {{ formatDate(data.date_documented_clean) }}
                            <!-- Convert to string here -->
                        </template>
                        <template #filter="{ filterModel }">
                            <Calendar v-model="filterModel.value" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :showIcon="true" />
                        </template>
                    </Column>
                    <Column field="find_location" header="Find Location(s)" style="max-width: 6rem">
                        <template #body="{ data }">
                            {{ data.find_location }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by Find Loc." />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
    <!-- this Div comes from opening element all the way up (obergeordnete div)-->
</template>

<style scoped lang="scss">
::deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

::deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}

.mb-3 {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin-bottom: -2rem;
}

.carousel-items-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin-bottom: 0.2rem;
}
.p-carousel .p-carousel-indicators {
    padding: 0rem;
    margin-top: -2rem; /* Adjust this value to position the indicators closer or farther */
}
.p-component .w-6 {
    width: 100% !important;
    max-height: 18vh;
    object-fit: contain;
}
</style>
