import { ref, computed } from 'vue';

export const hImgFactor = ref(2.5); // Example definition

export const hFactor = ref(2); // Example definition

export const galleriaImages = ref([]);

export const responsiveOptions = ref([
    {
        breakpoint: '4000px', // For screens larger than 1024px
        numVisible: 8,
        showThumbnails: true,
        showIndicators: true,
    },
    {
        breakpoint: '2000px', // For screens larger than 1024px
        numVisible: 8,
        showThumbnails: true,
        showIndicators: true,
    },
    {
        breakpoint: '1800px', // For screens larger than 1024px
        numVisible: 8,
        showThumbnails: true,
        showIndicators: true,
    },
    {
        breakpoint: '1520px', // For screens larger than 1024px
        numVisible: 7,
        showThumbnails: true,
        showIndicators: true,
    },
    {
        breakpoint: '1280px', // For screens larger than 1024px
        numVisible: 6,
        showThumbnails: true,
        showIndicators: true,
    },
    {
        breakpoint: '1024px', // For screens larger than 1024px
        numVisible: 5,
        showThumbnails: true,
        showIndicators: true,
    },
    {
        breakpoint: '768px', // For screens between 768px and 1024px (Tablets)
        numVisible: 5,
        showThumbnails: true,
        showIndicators: true,
    },
    {
        breakpoint: '540px', // For screens between 768px and 1024px (Tablets)
        numVisible: 4,
        showThumbnails: true,
        showIndicators: true,
    },
    {
        breakpoint: '450px', // For screens between 480px and 768px (Mobile landscape)
        numVisible: 3,
        showThumbnails: false,
        showIndicators: false,
    },
    {
        breakpoint: '360px', // For screens smaller than 480px (Mobile portrait)
        numVisible: 2,
        showThumbnails: false,
        showIndicators: false,
    },
    {
        breakpoint: '310px', // For screens smaller than 480px (Mobile portrait)
        numVisible: 1,
        showItemNavigators: false,
        showThumbnails: false,
        showIndicators: false,
    },
    {
        breakpoint: '240px', // For screens smaller than 480px (Mobile portrait)
        numVisible: 0,
        showItemNavigators: false,
        showThumbnails: false,
        showIndicators: false,
    },
]);

export function useImageHeights(windowWidth, hImgFactor, hFactor) {
    const imageHeight = computed(() => {
        let baseHeight; // Declare baseHeight outside of conditional blocks

        // Determine baseHeight based on windowWidth
        if (windowWidth.value <= 360) {
            baseHeight = 20; // Value in pixels, corresponding to '2rem'
        } else if (windowWidth.value <= 480) {
            baseHeight = 35; // and so on...
        } else if (windowWidth.value <= 768) {
            baseHeight = 70;
        } else if (windowWidth.value <= 1024) {
            baseHeight = 90;
        } else if (windowWidth.value <= 1280) {
            baseHeight = 120;
        } else if (windowWidth.value <= 1600) {
            baseHeight = 160;
        } else if (windowWidth.value <= 2000) {
            baseHeight = 200;
        } else if (windowWidth.value <= 2300) {
            baseHeight = 230;
        } else {
            baseHeight = 250;
        }

        // Calculate the final height after applying h-factor
        let calculatedImgHeight = `${baseHeight * hImgFactor.value}px`;

        // Log the calculated height
        console.log('imageHeight:', calculatedImgHeight);

        // Return the calculated height
        return calculatedImgHeight;
    });

    const imageMaxWidth = computed(() => {
        // Assuming imageHeight is returned as a string with 'px' at the end
        // Extract the numeric part and calculate 75% of it
        const heightInPixels = parseFloat(imageHeight.value);
        return `${heightInPixels * 1.2}px`; // 120% of the image height
    });

    const canvasHeight = computed(() => {
        let baseHeight; // Base height value before applying the h-factor

        if (windowWidth.value <= 280) {
            baseHeight = 50;
        } else if (windowWidth.value <= 446) {
            baseHeight = 65;
        } else if (windowWidth.value <= 480) {
            baseHeight = 85;
        } else if (windowWidth.value <= 768) {
            baseHeight = 130;
        } else if (windowWidth.value <= 1024) {
            baseHeight = 160;
        } else if (windowWidth.value <= 1600) {
            baseHeight = 200;
        } else if (windowWidth.value <= 2000) {
            baseHeight = 320;
        } else {
            baseHeight = 340;
        }

        let calculatedHeight = `${baseHeight * hFactor.value}px`; // Apply the h-factor
        console.log('canvasHeight:', calculatedHeight); // Log the calculated height

        return calculatedHeight; // Return the calculated height
    });

    return { imageHeight, imageMaxWidth, canvasHeight };
}
