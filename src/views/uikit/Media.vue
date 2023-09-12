<script setup>
import { ProductService } from '@/service/ProductService';
import { PhotoServiceSchulung } from '@/service/PhotoServiceSchulung';
import { ref, onMounted } from 'vue';

const products = ref([]);
const images = ref([]);
const galleriaResponsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 5,
    },
    {
        breakpoint: '960px',
        numVisible: 4,
    },
    {
        breakpoint: '768px',
        numVisible: 3,
    },
    {
        breakpoint: '560px',
        numVisible: 1,
    },
]);
const carouselResponsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3,
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2,
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1,
    },
]);

const productService = new ProductService();
const photoServiceSchulung = new PhotoServiceSchulung();

onMounted(() => {
    productService.getProductsSmall().then((data) => (products.value = data));
    photoServiceSchulung.getImages().then((data) => (images.value = data));
});
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
    <div class="grid p-fluid">
        <div class="col-12 flex justify-content-center">
            <div class="card">
                <h5>Ausgewählte Bilder für das Open Museum "Directus" Schulung 2023 </h5>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <h5>Image</h5>
                <div class="flex justify-content-center">
                    <Image :src="'demo/images/galleria2/picture02.jpg'" alt="Image" width="250" preview />
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <h5>Galleria</h5>
                <Galleria :value="images" :responsiveOptions="galleriaResponsiveOptions" :numVisible="7" :circular="true" containerStyle="max-width: 800px; margin: auto">
                    <template #item="slotProps">
                        <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" style="object-fit: contain; height: 50%; width: 50%;"/>
                    </template>
                    <template #thumbnail="slotProps">
                        <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" style="object-fit: contain; height: 100%; width: 100%;"/>
                    </template>
                </Galleria>
            </div>
        </div>
    </div>
</template>
