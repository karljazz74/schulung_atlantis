<script setup>
import { ref, onMounted } from 'vue';
import { createDirectus, graphql } from '@directus/sdk';

const client = createDirectus('https://graphql.openmuseum.uni-bonn.de/graphql').with(graphql());

const generateDirectusImage = (id) => {
    return `https://graphql.openmuseum.uni-bonn.de/assets/${id}?key=preset-1`;
};


const totalPosts = ref(null);

const fetchPosts = async () => {
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
    console.log("Full Response:", response);
    const rawData = response.data ? response.data.posts_by_id : null; // Changed this line
    console.log("Data Destructured:", rawData);
    console.log("Raw GraphQL Data:", JSON.stringify(rawData, null, 2));  //

    
    if (rawData) {
      // Transform the single post object
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(rawData.date)).replace(/\//g, '.');

      totalPosts.value = {
        coverImage: generateDirectusImage(rawData.coverImage.id),
        profile: rawData.profile ? generateDirectusImage(rawData.profile.id) : null,
        title: rawData.title,
        description: rawData.description,
        comment: rawData.comment,
        share: rawData.share,
        date: formattedDate,
        author: rawData.author,
        fk_comments: rawData.fk_comments.map(comment => ({
          name: comment.name,
          description: comment.description,
          image: comment.image ? generateDirectusImage(comment.image.id) : null,
          date: new Date(comment.date).toLocaleDateString(),
        })),
      };
    } else {
      totalPosts.value = null;
    }
    console.log("totalPosts:", totalPosts.value);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }
};


onMounted(() => {
  fetchPosts();
});



</script>
<template>
    <div v-if="totalPosts">
        <div class="flex justify-content-between flex-column-reverse md:flex-row align-items-center">
           <div>
               <div class="text-xl text-900 mb-4 mt-4 md:mt-0 text-center md:text-left font-semibold md:pr-4">{{ totalPosts.title }}</div>
               <div class="flex flex-wrap justify-content-center md:justify-content-start gap-3">
                   <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round">
                       <i class="pi pi-clock text-primary mr-2"></i>
                       <span class="text-900">{{ totalPosts.date }}</span>
                   </span>
                   <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round">
                       <i class="pi pi-comments text-primary mr-2"></i>
                       <span class="text-900">{{ totalPosts.comment }}</span>
                   </span>
                   <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round">
                       <i class="pi pi-eye text-primary mr-2"></i>
                       <span class="text-900">{{ totalPosts.views }}</span>
                   </span>
                   <!-- Add other spans here -->
               </div>
           </div>
           <div class="flex flex-column align-items-center justify-content-center">
               <img class="w-4rem h-4rem" :src="totalPosts.profile" alt="Avatar" />
               <span class="mt-3 font-bold text-900 text-center white-space-nowrap">{{ totalPosts.author }}</span>
           </div>
       </div>
      
       <div class="flex align-items-center mb-4 font-bold">
           <span class="text-xl text-900 mr-4">Comments</span>
           <span class="inline-flex align-items-center justify-content-center w-2rem h-2rem border-1 surface-border border-round">{{ totalPosts.comment }}</span>
       </div>
       
       <ul class="list-none p-0 m-0">
           <li v-for="(comment, i) in totalPosts.fk_comments" :key="comment.id" class="flex p-3 mb-3 border-1 surface-border border-round">
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
     <div v-else>
        <!-- Add a loading or error state here -->
        <p>Loading...</p>
      </div>
       
  </template>
  

        