<script setup>
import { ref, onMounted } from 'vue';
import { fetchData, fetchImageFromDirectus } from '@/service/dataService2';
import { FilterMatchMode, FilterOperator } from 'primevue/api';

const recordsData = ref([]);
const filters1 = ref(null);
const loading1 = ref(null);
// const loading2 = ref(null);
// const idFrozen = ref(false);
// const products = ref(null);
// const expandedRows = ref([]);

// Fetch data
async function loadData() {
    try {
        const response = await fetchData();
        console.log('Response Object:', response);

        // Clear existing data
        recordsData.value = [];

        // Check and transform records if they exist
        if (response?.length > 0) {
            const transformedRecords = response.map((record) => {
                console.log('Before transformation:', record);

                // Define the transformed record
                const transformed = {
                    id_record: record.id_record,
                    find_location: record.find_location,
                    date_documented: record.date_documented,
                    obj_designation: record.obj_designation,
                    // ... other transformations
                    image_ids: record.fk_files_images.map((image) => image.directus_files_id.id),
                };

                console.log('After transformation:', transformed); // Moved this line up, before the return
                return transformed; // Return the transformed record
            });
            recordsData.value = transformedRecords; // Populate the ref
            console.log('recordsData Value XYZ:', recordsData.value[10].obj_designation);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Add this new function
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

// Load data initially
onMounted(async () => {
    console.log('onMounted triggered');
    await loadData();
    await loadImages();
});

const initFilters1 = () => {
    filters1.value = {
        id_record: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        obj_designation: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        date_documented: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
        find_location: { value: [0, 50], matchMode: FilterMatchMode.BETWEEN },
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
                    :rows="10"
                    dataKey="id_record"
                    :rowHover="true"
                    v-model:filters="filters1"
                    filterDisplay="menu"
                    :loading="loading1"
                    :filters="filters1"
                    responsiveLayout="scroll"
                    :globalFilterFields="['title', 'description', 'comment', 'share', 'date', 'author']"
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined mb-2" @click="clearFilter1()" />
                            <!--<span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="filters1['global'].value" placeholder="Keyword Search" style="width: 100%" />
                            </span>-->
                        </div>
                    </template>
                    <template #empty> No records found. </template>
                    <template #loading> Loading customers data. Please wait. </template>
                    <!-- Image Column added here -->
                    <Column header="Images" style="max-width: 24rem">
                        <template #body="{ data }">
                            <Carousel :value="data.galleriaImages" :numVisible="1" :numScroll="1" :responsiveOptions="responsiveOptions">
                                <template #item="slotProps">
                                    <div class="border-1 surface-border border-round m-2 text-center py-1 px-1 carousel-container">
                                        <div class="mb-3">
                                            <img :src="slotProps.data.itemImageSrc" :alt="slotProps.data.alt" class="w-6 shadow-2" />
                                        </div>
                                    </div>
                                </template>
                            </Carousel>
                        </template>
                    </Column>
                    <!-- Rest of the fields -->
                    <Column field="id_record" header="ID Record" style="min-width: 8rem">
                        <template #body="{ data }">
                            {{ data.id_record }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by ID" />
                        </template>
                    </Column>
                    <Column field="find_location" header="Find Loc." style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.find_location }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by Find Loc." />
                        </template>
                    </Column>
                    <Column header="Date" filterField="date_documented" dataType="text" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.date_documented }}
                        </template>
                        <template #filter="{ filterModel }">
                            <Calendar v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" />
                        </template>
                    </Column>
                    <Column header="Designation" filterField="obj_designation" dataType="numeric" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.obj_designation }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by Obj. Designation" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
    <!-- this Div comes from opening element all the way up (obergeordnete div)-->
    <div class="col-12">
        <div class="card">
            <h5>Frozen Columns</h5>
            <ToggleButton v-model="idFrozen" onIcon="pi pi-lock" offIcon="pi pi-lock-open" onLabel="Unfreeze Id" offLabel="Freeze Id" style="width: 10rem" />

            <DataTable :value="recordsData" :scrollable="true" scrollHeight="400px" :loading="loading2" scrollDirection="both" class="mt-3">
                <Column field="id_record" header="Id Record" :style="{ width: '100px' }" frozen></Column>
                <Column field="find_location" header="Find Loc." :style="{ width: '100px' }" :frozen="idFrozen"></Column>
                <Column field="date_documented" header="Date" :style="{ width: '200px' }"></Column>
                <Column field="obj_designation" header="Company" :style="{ width: '200px' }">{{ data.obj_designation }}</Column>
            </DataTable>
        </div>
    </div>
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
