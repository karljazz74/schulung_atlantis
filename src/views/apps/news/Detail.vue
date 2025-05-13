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
          multimedia {
              id
          }
          profile {
              id
          }
          title
          description
          textarea
          translations {
              title
              description
              textarea
              languages_code
          }
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

        // Log the entire response object
        console.log('Full Response:', JSON.stringify(response, null, 2));

        // Log just the 'data' field of the response
        console.log('Response Data Field:', response.data);

        // Check for the existence of 'data' and 'posts_by_id' fields
        console.log('Response.data Exists:', response.data);
        console.log('Response.data.posts_by_id Exists:', response.data?.posts_by_id);

        // Updated line here
        const rawData = response.posts_by_id || null;

        // Additional log for rawData
        console.log('Raw Data:', rawData);

        console.log('Data Destructured:', rawData);
        console.log('Raw GraphQL Data:', JSON.stringify(rawData, null, 2)); //

        if (rawData && rawData.fk_comments) {
            // Insert the filtering code here.
            const filteredTranslations = rawData.translations.filter((translation) => translation.languages_code === 'de-DE');
            rawData.translations = filteredTranslations; // Assign the filtered data back
            console.log(
                'Image IDs in fk_comments:',
                rawData.fk_comments.map((comment) => (comment.image ? comment.image.id : null))
            );
            // Transform the single post object
            const formattedDate = new Intl.DateTimeFormat('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'UTC',
            })
                .format(new Date(rawData.date))
                .replace(/\//g, '.');

            // New code starts here
            const commentsWithImages = rawData.fk_comments.map((comment) => ({
                name: comment.name,
                description: comment.description,
                image: comment.image ? generateDirectusImage(comment.image.id) : null, // This line is updated
                date: new Date(comment.date).toLocaleDateString(),
            }));
            // New code ends here

            totalPosts.value = {
                coverImage: rawData.coverImage ? generateDirectusImage(rawData.coverImage.id) : null,
                videoFile: rawData.multimedia ? generateDirectusImage(rawData.multimedia.id) : null,
                profile: rawData.profile ? generateDirectusImage(rawData.profile.id) : null,
                title: rawData.title,
                description: rawData.description,
                textarea: rawData.textarea,
                comment: rawData.comment,
                share: rawData.share,
                date: formattedDate,
                author: rawData.author,
                translations: rawData.translations,
                fk_comments: commentsWithImages,
            };
        } else {
            totalPosts.value = null;
        }
        console.log('totalPosts:', totalPosts.value);
    } catch (error) {
        console.error('Failed to fetch posts:', error);
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
                <div class="text-xxl text-900 mb-4 mt-4 md:mt-0 text-center md:text-left font-semibold md:pr-4">{{ totalPosts.translations[0]?.title }}</div>
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
                <Avatar :image="totalPosts.profile" shape="circle" class="cardImage flex w-4rem h-4rem" alt="Avatar"></Avatar>
                <!-- below is the "author" span component that needs to appear below the "Avatar" -->
                <span class="mt-3 font-bold text-900 text-center white-space-nowrap">{{ totalPosts.author }}</span>
            </div>
        </div>
        <!-- Div for Video and Multimedia HTML5 frame element -->
        <div class="text-center my-6 video-container">
            <video controls class="w-full">
                <source :src="totalPosts.videoFile" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
        <div class="text-2xl text-900 mb-4 font-semibold">{{ totalPosts.translations[0]?.description }}</div>
        <p class="line-height-3 mb-0 my-3" v-html="totalPosts.translations[0]?.textarea"></p>

        <!-- display the filteredTranslation values for "title", "description" and "textarea" here -->
        <div v-if="totalPosts.translations">
            <div class="text-2xl text-900 mb-4 font-semibold">{{ totalPosts.translations[0]?.title }}</div>
            <div class="line-height-3 mb-0 my-3">{{ totalPosts.translations[0]?.description }}</div>
            <p class="line-height-3 mb-0 my-3" v-html="totalPosts.translations[0]?.textarea"></p>
        </div>

        <div class="flex align-items-center mb-4 font-bold">
            <span class="text-xl text-900 mr-4">Comments</span>
            <span class="inline-flex align-items-center justify-content-center w-2rem h-2rem border-1 surface-border border-round">{{ totalPosts.comment }}</span>
        </div>

        <ul class="list-none p-0 m-0">
            <li v-for="(comment, i) in totalPosts.fk_comments" :key="comment.id" class="flex p-3 mb-3 border-1 surface-border border-round">
                <img :src="comment.image ? generateDirectusImage(comment.image.id) : null" class="w-3rem h-3rem mr-3 flex-shrink-0" :alt="'Image' + i" />

                <div>
                    <span class="font-semibold text-900">{{ comment.name }}</span>
                    <p class="font-semibold text-600 m-0 text-sm">{{ comment.date }}</p>
                    <p class="line-height-3 mb-0 my-3" v-html="comment.description"></p>
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
<style scoped>
.text-xxl {
    font-size: 1.75rem !important;
}
</style>
