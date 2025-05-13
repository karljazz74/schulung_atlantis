<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { createDirectus, graphql } from '@directus/sdk';
import DOMPurify from 'dompurify';
import { selectedLanguage, setLanguage, getStoredLanguage } from '@/service/languageState'; // Adjust path as needed

const VITE_APP_ACCESS_TOKEN = import.meta.env.VITE_APP_ACCESS_TOKEN;
const VITE_APP_GRAPHQL_ENDPOINT = import.meta.env.VITE_APP_GRAPHQL_ENDPOINT;
console.log(`Directus Endpoint: ${VITE_APP_GRAPHQL_ENDPOINT}`);
// console.log(`Assets Endpoint: ${VITE_APP_ASSETS_ENDPOINT}`);

const client = createDirectus(VITE_APP_GRAPHQL_ENDPOINT).with(graphql());
console.log('Directus client initialized:', client);

const router = useRouter();

// added i18n
const { locale, t } = useI18n({
    inheritLocale: true,
    useScope: 'global',
});

function getFlagCode(lang) {
    if (!lang || !lang.code) {
        console.warn('Invalid language data:', lang);
        return 'default'; // Return a default flag if data is missing or incorrect
    }

    // Change flag code for Spanish to 'mx' for Mexico
    if (lang.lang === 'es-MX') {
        return 'mx';  // Using 'mx' for the Mexican flag
    }
    return lang.code.toLowerCase();  // Use the country code as the flag code
}

// Update the countries array
const languages = computed(() => [
    { name: t('language.german'), code: 'DE', lang: 'de-DE' },
    { name: t('language.english'), code: 'US', lang: 'en-US' },
    { name: t('language.spanish'), code: 'ES', lang: 'es-MX' },
    // ... other languages
]);

// Replace selectedCountry with centralized selectedLanguage
function onLanguageChange(newLangCode) {
    const foundLang = languages.value.find((lang) => lang.code === newLangCode.code);
    if (foundLang) {
        setLanguage(foundLang); // Update the centralized language state
        locale.value = foundLang.lang; // Update i18n locale
        fetchNews(foundLang.lang); // Fetch posts with new language
    }
}

const navigateToDetail = (id) => {
    console.log("Navigating with ID:", id); // Add this line to check the id
    if (id) {
        router.push({ name: 'Detail', params: { id: id } });
    } else {
        console.error("Invalid ID:", id);
    }
};

const generateDirectusImage = (id) => {
    return `https://directus.uxulmassgrave.uni-bonn.de/assets/${id}?key=bild-med`;
};

// Sorting logic
const sortOrder = ref(-1);
const sortField = ref(null);
const sortKey = ref(null);
const sortOptions = [
    { label: 'Most Shared', value: 'shares' },
    { label: 'Most Commented', value: 'comments' },
];

const onSortChange = (event) => {
    const value = event.value.value;
    const sortValue = event.value;

    if (value.indexOf('!') === 0) {
        sortOrder.value = 1;
        sortField.value = value.substring(1, value.length);
        sortKey.value = sortValue;
    } else {
        sortOrder.value = -1;
        sortField.value = value;
        sortKey.value = sortValue;
    }
};


const totalNews = ref([]);

const fetchNews = async (languageCode) => {
  const query = `
  query {
      news_items {
        card_image {
          id
        }
        user_updated {
          first_name
          last_name
          avatar {
            id
          }
        }
        translations_news(filter: { languages_code: { code: { _eq: "${languageCode}" } } }) {
            cardHeader
            cardSubtitle
            cardCaption
            cardMaintext
        }
        comments
        shares
        date_updated
      }
    }
  `;

  try {
    const response = await client.query(query);
    console.log("Full Response:", response);
    const data = response.data ? response.data : response;
    console.log("Data Destructured:", data);
    console.log("Raw GraphQL Data:", JSON.stringify(data, null, 2));  // Pretty print the raw data

    if (data && data.news_items) {
      // Transform the raw data
      const transformedNews = data.news_items.map(news_item => {
      // Apply sanitization right here
      const sanitizedCardCaption = DOMPurify.sanitize(news_item.translations_news?.[0]?.cardCaption) || 'No caption';

      // const cardCaption = news_item.translations_news?.[0]?.cardCaption ?? 'No caption';
      const cardHeader = news_item.translations_news?.[0]?.cardHeader ?? 'No header';
      
        // Format the date using Intl.DateTimeFormat
        console.log('Date before:', news_item.date_updated); // Add this to debug
        const formattedDate = new Intl.DateTimeFormat('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(new Date(news_item.date_updated)).replace(/\//g, '.');

        return {
          id: news_item.id, 
          card_image: generateDirectusImage(news_item.card_image.id),
          avatar: generateDirectusImage(news_item?.user_updated.avatar?.id),
          cardHeader: cardHeader,
          cardCaption: sanitizedCardCaption, // Use the sanitized version
          comments: news_item.comments ?? 'No comments',
          shares: news_item.shares ?? 'No shares',
          date: formattedDate ?? 'No date', // Adjust according to your data structure
          user_updated: [news_item.user_updated.first_name, news_item.user_updated.last_name].filter(Boolean).join(' '),
        };
      });

      totalNews.value = transformedNews;
    } else {
      totalNews.value = [];
    }

    console.log("totalNews:", totalNews.value);  // Log the transformed array
  } catch (error) {
    console.error("Failed to fetch news:", error);
  }
};

onMounted(async () => {
    const storedLanguageCode = getStoredLanguage(); // Retrieve stored language
    selectedLanguage.value = languages.value.find((lang) => lang.lang === storedLanguageCode) || { name: 'English', code: 'US', lang: 'en-US' };
    locale.value = selectedLanguage.value.lang;
    await fetchNews(selectedLanguage.value.lang); // Load data based on stored language
});

watch(selectedLanguage, async (newLang) => {
    locale.value = newLang.lang;
    localStorage.setItem('selectedLanguage', JSON.stringify(newLang));
    await fetchNews(newLang.lang);
});
</script>


<template>
    <div class="grid">
        <div class="col-12">
  <!-- Language Selector (Dropdown) -->
  <Dropdown v-model="selectedLanguage" :options="languages" @change="onLanguageChange" optionLabel="name" :placeholder="t('menu.selectLanguage')">
                <template #value="slotProps">
                    <div v-if="slotProps.value" class="flex align-items-center">
                        <div :class="`mr-2 flag flag-${getFlagCode(slotProps.value)}`" style="width: 18px; height: 12px"></div>
                        <div>{{ slotProps.value.name }}</div>
                    </div>
                    <span v-else>
                        {{ slotProps.placeholder }}
                    </span>
                </template>
            </Dropdown>
    <div class="card">
        <DataView :value="totalNews" paginator :rows="6" layout="grid" :sortOrder="sortOrder" :sortField="sortField">
            <template #header>
                <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
                    <span class="text-xl text-900 font-semibold">News</span>
                    <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
                </div>
            </template>
            <template #grid="{ data }">
                <div class="col-12 md:col-4" @click="navigateToDetail(data.id)">
                    <div class="p-3">
                        <div class="border-1 surface-border cursor-pointer z-index border-round">
                            <div class="relative">
                                <!-- Use the coverImage.id and profile.id to construct the image URLs -->
                                <img :src="data.card_image" class="w-full" :alt="data.cardCaption" />
                                <Avatar :image="data.avatar" shape="circle" class="cardImage flex absolute w-4rem h-4rem"></Avatar>
                                </div>
                            <div class="p-3">
                                <div class="text-900 font-semibold text-xl mb-3">{{ data.cardHeader }}</div>
                                <p v-html="data.cardCaption" class="text-700 text-lg mt-0 mb-5"></p>

                                <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
                                    <span class="flex align-items-center text-900">
                                        <i class="pi pi-comment mr-2"></i>
                                        <span class="font-semibold">{{ data.comments }}</span>
                                    </span>
                                    <span class="flex align-items-center text-900">
                                        <i class="pi pi-share-alt mr-2"></i>
                                        <span class="font-semibold">{{ data.shares }}</span>
                                    </span>
                                    <span class="flex align-items-center text-900">
                                        <i class="pi pi-calendar mr-2"></i>
                                        <span class="font-semibold mr-1">{{ data.date }}</span>
                                    </span>
                                    <div class="flex mt-4">
                                        <Avatar :image="data.avatar" shape="circle"></Avatar>
                                        <div class="ml-2">
                                            <div class="text-xs font-bold text-900 mb-1">{{ data.user_updated || 'Unknown Author' }}</div>
                                        </div>
                                    </div>
                                </div>
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

    
<style scoped>

:deep(.light-red-link) {
    color: lightcoral !important; /* or any specific color you prefer */
}

.align-right {
  display: flex;
  justify-content: flex-end; /* Aligns children to the right */
  width: 100%; /* Ensure the container takes full width to allow right alignment */
}

.text-content {
  margin-left: 1rem; /* Optional, for spacing between avatar and text */
}
.cardImage {
    bottom: -1.5rem;
    right: 1.5rem;
}
</style>
