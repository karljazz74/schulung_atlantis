<script setup>
import { ref, onMounted } from 'vue';
import { createDirectus, graphql } from '@directus/sdk';

const client = createDirectus('https://graphql.openmuseum.uni-bonn.de/graphql').with(graphql());

const generateDirectusImage = (id) => {
    return `https://graphql.openmuseum.uni-bonn.de/assets/${id}?key=preset-1`;
};

// Sorting logic
const sortOrder = ref(-1);
const sortField = ref(null);
const sortKey = ref(null);
const sortOptions = [
    { label: 'Most Shared', value: 'share' },
    { label: 'Most Commented', value: 'comment' },
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

const totalPosts = ref([]);

const fetchPosts = async () => {
  const query = `
    query {
      posts {
        coverImage {
          id
        }
        profile {
          id
        }
        title
        description
        comment
        share
        date
        author
      }
    }
  `;

  try {
    const response = await client.query(query);
    console.log("Full Response:", response);
    const data = response.data ? response.data : response;
    console.log("Data Destructured:", data);
    console.log("Raw GraphQL Data:", JSON.stringify(data, null, 2));  // Pretty print the raw data

    
    if (data && data.posts) {
      // Transform the raw data
      const transformedPosts = data.posts.map(blog => {
        // Format the date using Intl.DateTimeFormat
        const formattedDate = new Intl.DateTimeFormat('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(new Date(blog.date)).replace(/\//g, '.');

        return {
          coverImage: generateDirectusImage(blog.coverImage.id),
          profile: blog.profile ? generateDirectusImage(blog.profile.id) : null,
          title: blog.title,
          description: blog.description,
          comment: blog.comment,
          share: blog.share,
          date: formattedDate, // use the formatted date here
          author: blog.author,
        };
      });

      totalPosts.value = transformedPosts;
    } else {
      totalPosts.value = [];
    }

    console.log("totalPosts:", totalPosts.value);  // Log the transformed array
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }
};

onMounted(() => {
  fetchPosts();
});
</script>


<template>
    <div class="card">
        <DataView :value="totalPosts" paginator :rows="3" layout="grid" :sortOrder="sortOrder" :sortField="sortField">
            <template #header>
                <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
                    <span class="text-xl text-900 font-semibold">Articles</span>
                    <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
                </div>
            </template>
            <template #grid="{ data }">
                <div class="col-12 md:col-4">
                    <div class="p-3">
                        <div class="border-1 surface-border cursor-pointer z-index border-round">
                            <div class="relative">
                                <!-- Use the coverImage.id and profile.id to construct the image URLs -->
                                <img :src="data.coverImage" class="w-full" :alt="data.description.split(' ', 1)" />
                                <Avatar :image="data.profile" shape="circle" class="cardImage flex absolute w-4rem h-4rem"></Avatar>
                                </div>
                            <div class="p-3">
                                <div class="text-900 font-semibold text-xl mb-3">{{ data.title }}</div>
                                <p class="text-700 text-lg mt-0 mb-5">{{ data.description }}</p>

                                <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
                                    <span class="flex align-items-center text-900">
                                        <i class="pi pi-comment mr-2"></i>
                                        <span class="font-semibold">{{ data.comment }}</span>
                                    </span>
                                    <span class="flex align-items-center text-900">
                                        <i class="pi pi-share-alt mr-2"></i>
                                        <span class="font-semibold">{{ data.share }}</span>
                                    </span>
                                    <span class="flex align-items-center text-900">
                                        <i class="pi pi-calendar mr-2"></i>
                                        <span class="font-semibold mr-1">{{ data.date }}</span>
                                    </span>
                                    <div class="flex mt-4">
                                        <Avatar :image="data.profile" shape="circle"></Avatar>
                                        <div class="ml-2">
                                            <div class="text-xs font-bold text-900 mb-1">{{ data.author || 'Unknown Author' }}</div>
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

    <div class="card">
        <div class="surface-section px-4 py-8 md:px-6 lg:px-8">
            <div class="font-bold text-5xl text-900 mb-3">Recent Articles</div>
            <div class="text-700 text-xl line-height-3 mb-5">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
            <div class="grid nogutter">
                <div class="col-12 lg:col-4 p-4">
                    <div class="border-top-3 border-blue-600"></div>
                    <div class="text-blue-600 font-medium my-2">Animals</div>
                    <div class="text-900 font-medium text-xl line-height-3 mb-4">Why Earth&lsquo;s most beloved creatures are headed toward extinction</div>
                    <div class="font-sm text-700 line-height-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
                    <div class="flex mt-4">
                        <Avatar image="/demo/images/avatar/circle/avatar-f-1.png" shape="circle"></Avatar>
                        <div class="ml-2">
                            <div class="text-xs font-bold text-900 mb-1">Anna Miles</div>
                            <div class="text-xs flex align-items-center text-700">
                                <i class="pi pi-calendar mr-1 text-xs"></i>
                                <span>Apr 9, 2021</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12 lg:col-4 p-4">
                    <div class="border-top-3 border-pink-600"></div>
                    <div class="text-pink-600 font-medium my-2">Oxygen</div>
                    <div class="text-900 font-medium text-xl line-height-3 mb-4">Only one-third of tropical rainforests remain intact, study says</div>
                    <div class="font-sm text-700 line-height-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
                    <div class="flex mt-4">
                        <Avatar image="/demo/images/avatar/circle/avatar-f-2.png" shape="circle"></Avatar>
                        <div class="ml-2">
                            <div class="text-xs font-bold text-900 mb-1">Arlene Miles</div>
                            <div class="text-xs flex align-items-center text-700">
                                <i class="pi pi-calendar mr-1 text-xs"></i>
                                <span>Apr 9, 2021</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12 lg:col-4 p-4">
                    <div class="border-top-3 border-orange-600"></div>
                    <div class="text-orange-600 font-medium my-2">Nature</div>
                    <div class="text-900 font-medium text-xl line-height-3 mb-4">Does planting a tree really offset your carbon footprint?</div>
                    <div class="font-sm text-700 line-height-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
                    <div class="flex mt-4">
                        <Avatar image="/demo/images/avatar/circle/avatar-f-3.png" shape="circle"></Avatar>
                        <div class="ml-2">
                            <div class="text-xs font-bold text-900 mb-1">Diane Miles</div>
                            <div class="text-xs flex align-items-center text-700">
                                <i class="pi pi-calendar mr-1 text-xs"></i>
                                <span>Apr 9, 2021</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cardImage {
    bottom: -1.5rem;
    right: 1.5rem;
}
</style>
