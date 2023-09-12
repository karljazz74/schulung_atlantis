<script setup>
import { ref, onMounted } from 'vue'
import { createDirectus, graphql } from '@directus/sdk';

// Initialize Directus SDK
const client = createDirectus('https://graphql.openmuseum.uni-bonn.de/graphql').with(graphql());

const postId = ref("2");  // The post ID you want to query for
const totalData = ref(null);  // Store the entire fetched object
const loading = ref(true);  // To manage loading state
const error = ref(null);  // To manage error state

const generateDirectusImage = (id) => {
  return `https://graphql.openmuseum.uni-bonn.de/assets/${id}?key=preset-1`;
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;

  const query = `
  query {
        posts_by_id(id: "2") {
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
          views
          fk_comments {
              name
              description
              image { 
                  id
                  }
             date
          }
        }
      }
  `;

  try {
    const response = await client.query(query);
    console.log("Raw GraphQL Response:", JSON.stringify(response, null, 2)); // Debug 1

    const rawData = response.data ? response.data.posts_by_id : null;
    console.log("Data Object Response:", JSON.stringify(rawData, null, 2)); // Debug 1

    if (!rawData) {
      throw new Error('Data is empty or not in the expected format');
    }

    // Transform the raw data here
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(data.date)).replace(/\//g, '.');

    totalData.value = {
      coverImage: generateDirectusImage(rawData.coverImage.id),
      profile: rawData.profile ? generateDirectusImage(rawData.profile.id) : null,
      title: rawData.title,
      description: rawData.description,
      comment: rawData.comment,
      share: rawData.share,
      date: formattedDate,
      author: rawData.author,
      views: rawData.views,
      fk_comments: rawData.fk_comments.map(comment => ({
        name: comment.name,
        description: comment.description,
        image: comment.image ? generateDirectusImage(comment.image.id) : null,
        date: new Date(comment.date).toLocaleDateString(),
      }))
    };
    loading.value = false;
    
} catch (err) {
  error.value = err;
  loading.value = false;
}
};

onMounted(() => {
  fetchData();
});
</script>
<template>

    <div class="card">
         <div class="flex justify-content-between flex-column-reverse md:flex-row align-items-center">
            <div>
                <div class="text-xl text-900 mb-4 mt-4 md:mt-0 text-center md:text-left font-semibold md:pr-4">{{ data.title }}</div>
                <div class="flex flex-wrap justify-content-center md:justify-content-start gap-3">
                    <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round">
                        <i class="pi pi-clock text-primary mr-2"></i>
                        <span class="text-900">{{ data.date }}</span>
                    </span>
                    <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round">
                        <i class="pi pi-comments text-primary mr-2"></i>
                        <span class="text-900">{{ data.comment }}</span>
                    </span>
                    <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round">
                        <i class="pi pi-eye text-primary mr-2"></i>
                        <span class="text-900">{{ data.views }}</span>
                    </span>
                    <!-- Add other spans here -->
                </div>
            </div>
            <div class="flex flex-column align-items-center justify-content-center">
                <img class="w-4rem h-4rem" :src="data.profile" alt="Avatar" />
                <span class="mt-3 font-bold text-900 text-center white-space-nowrap">{{ data.author }}</span>
            </div>
        </div>
        <pre>{{ result }}</pre>
        <!-- Add more content here -->
        
        <div class="flex align-items-center mb-4 font-bold">
            <span class="text-xl text-900 mr-4">Comments</span>
            <span class="inline-flex align-items-center justify-content-center w-2rem h-2rem border-1 surface-border border-round">{{ data.comment }}</span>
        </div>
        
        <ul class="list-none p-0 m-0">
            <li v-for="(comment, i) in data.fk_comments" :key="comment.id" class="flex p-3 mb-3 border-1 surface-border border-round">
                <img :src="comment.image.id" class="w-3rem h-3rem mr-3 flex-shrink-0" :alt="'Image' + i" />
                <div>
                    <span class="font-semibold text-900">{{ comment.name }}</span>
                    <p class="font-semibold text-600 m-0 text-sm">{{ comment.date }}</p>
                    <p class="line-height-3 mb-0 my-3">{{ comment.description }}</p>
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
  </template>
  

        