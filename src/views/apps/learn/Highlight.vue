<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createDirectus, graphql } from '@directus/sdk';

const client = createDirectus('https://graphql.openmuseum.uni-bonn.de/graphql').with(graphql());

const generateDirectusImage = (id) => {
    return `https://graphql.openmuseum.uni-bonn.de/assets/${id}?key=preset-1`;
};

// Define windowWidth as a reactive reference
const windowWidth = ref(window.innerWidth);

const totalPosts = ref(null);

const fetchPosts = async () => {
    const query = `
  query {
        highlights_by_id(id: "6") {
          coverImage {
              id
          }
          multimedia {
              id
          }
          profile {
              id
          }
           profile2 {
              id
          }  
          translations {
              title
              multimedia_label
              iframe_label
              object_information
              textarea
              description
              textarea2
              history
              textarea3
              languages_code
          }
          comment
          share
          date
          author
          author2
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

        // Check for the existence of 'data' and 'highlights_by_id' fields
        console.log('Response.data Exists:', response.data);
        console.log('Response.data.highlights_by_id Exists:', response.data?.highlights_by_id);

        // Updated line here
        const rawData = response.highlights_by_id || null;

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
                profile2: rawData.profile ? generateDirectusImage(rawData.profile2.id) : null,
                title: rawData.title,
                multimedia_label: rawData.multimedia_label,
                iframe_label: rawData.iframe_label,
                object_information: rawData.object_information,
                textarea: rawData.textarea,
                description: rawData.description,
                textarea2: rawData.textarea2,
                history: rawData.history,
                textarea3: rawData.textarea3,
                comment: rawData.comment,
                share: rawData.share,
                date: formattedDate,
                author: rawData.author,
                author2: rawData.author2,
                translations: rawData.translations,
                fk_comments: rawData.fk_comments.map((comment) => ({
                    name: comment.name,
                    description: comment.description,
                    image: comment.image ? generateDirectusImage(comment.image.id) : null, // These array images are failing
                    date: new Date(comment.date).toLocaleDateString(),
                })),
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

const handleResize = () => {
    windowWidth.value = window.innerWidth;
    console.log('Updated window width:', windowWidth.value);
};

onMounted(() => {
    console.log('Initial window width:', windowWidth.value);
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', () => {
        windowWidth.value = window.innerWidth;
    });
});
</script>
<template>
    <div v-if="totalPosts">
        <div class="flex flex-col md:flex-row justify-between items-center mb-4">
            <!-- Title -->
            <div class="text-xxl text-900 mb-4 mt-4 md:mt-0 text-center md:text-left font-semibold md:pr-4">
                {{ totalPosts.translations[0]?.title }}
            </div>
            <div class="flex flex-wrap justify-content-center md:justify-content-start gap-3">
                <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round" style="height: 3rem; align-items: center">
                    <i class="pi pi-clock text-primary mr-2"></i>
                    <span class="text-900">{{ totalPosts.date }}</span>
                </span>
                <div class="flex flex-nowrap">
                    <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round" style="height: 3rem; align-items: center">
                        <i class="pi pi-comments text-primary mr-2"></i>
                        <span class="text-900">{{ totalPosts.comment }}</span>
                    </span>
                    <span class="inline-flex align-items-center py-2 px-3 font-medium border-1 surface-border border-round" style="height: 3rem; align-items: center">
                        <i class="pi pi-eye text-primary mr-2"></i>
                        <span class="text-900">{{ totalPosts.views }}</span>
                    </span>
                </div>
            </div>
            <!-- Avatars and Authors -->
            <div class="flex flex-col md:flex-row justify-center md:justify-end items-center gap-4">
                <div class="flex flex-col items-center">
                    <Avatar :image="totalPosts.profile" shape="circle" class="cardImage flex w-4rem h-4rem" alt="Avatar"></Avatar>
                    <span class="mt-3 font-bold text-700 text-center white-space-nowrap">{{ totalPosts.author }}</span>
                </div>
                <div class="flex flex-col items-center">
                    <Avatar :image="totalPosts.profile2" shape="circle" class="cardImage flex w-4rem h-4rem" alt="Avatar"></Avatar>
                    <span class="mt-3 font-bold text-700 text-center white-space-nowrap">{{ totalPosts.author2 }}</span>
                </div>
            </div>
        </div>
        <!-- Div for Video and Multimedia HTML5 frame element -->
        <div class="text-2xl text-500 text-primary custom-transparency mb-4 font-semibold">{{ totalPosts.translations[0]?.multimedia_label }}</div>
        <div class="text-left my-1 video-container">
            <video controls class="middle-size">
                <source :src="totalPosts.videoFile" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>

        <!--  Sketchfab 3D Model-->
        <div class="text-2xl text-500 text-primary custom-transparency mb-4 font-semibold">{{ totalPosts.translations[0]?.iframe_label }}</div>
        <div class="sketchfab-embed-wrapper">
            <iframe
                title="Group of five musicians"
                class="large-sketchfab"
                frameborder="0"
                allowfullscreen
                mozallowfullscreen="true"
                webkitallowfullscreen="true"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                xr-spatial-tracking
                execution-while-out-of-viewport
                execution-while-not-rendered
                web-share
                src="https://sketchfab.com/models/caf009077f78441d9e77b577b18c9f62/embed"
            >
            </iframe>
            <p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4a4a4a">
                <a
                    href="https://sketchfab.com/3d-models/group-of-five-musicians-caf009077f78441d9e77b577b18c9f62?utm_medium=embed&utm_campaign=share-popup&utm_content=caf009077f78441d9e77b577b18c9f62"
                    target="_blank"
                    rel="nofollow"
                    style="font-weight: bold; color: #1caad9"
                >
                    Group of five musicians
                </a>
                by
                <a href="https://sketchfab.com/bcdh?utm_medium=embed&utm_campaign=share-popup&utm_content=caf009077f78441d9e77b577b18c9f62" target="_blank" rel="nofollow" style="font-weight: bold; color: #1caad9">
                    Bonn Center for Digital Humanities
                </a>
                on <a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=caf009077f78441d9e77b577b18c9f62" target="_blank" rel="nofollow" style="font-weight: bold; color: #1caad9">Sketchfab</a>
            </p>
        </div>

        <!-- display the filteredTranslation values for "title", "description" and "textarea" here -->
        <div v-if="totalPosts.translations">
            <div class="text-3xl text-1100 mb-4 font-semibold">{{ totalPosts.translations[0]?.title }}</div>
            <div class="text-2xl text-500 text-primary custom-transparency mb-4 font-semibold">{{ totalPosts.translations[0]?.object_information }}</div>
            <p class="line-height-3 mb-0 my-3" v-html="totalPosts.translations[0]?.textarea"></p>
            <div class="text-2xl text-500 text-primary custom-transparency mb-4 font-semibold">{{ totalPosts.translations[0]?.description }}</div>
            <p class="line-height-3 mb-0 my-3" v-html="totalPosts.translations[0]?.textarea2"></p>
            <div class="text-2xl text-500 text-primary custom-transparency mb-4 font-semibold">{{ totalPosts.translations[0]?.history }}</div>
            <p class="line-height-3 mb-0 my-3" v-html="totalPosts.translations[0]?.textarea3"></p>
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
.text-600 {
    color: #1caad9cc !important;
}

.custom-transparency {
    color: rgba(var(--text-primary-color), 0.5); /* 0.5 is the alpha value for 50% transparency */
}

.link-color {
    color: #ff5733 !important; /* Color for light theme */
    text-decoration: underline !important; /* Remove underline if desired */
}
.text-xxl {
    font-size: 1.75rem !important;
}

/* video settings */

.my-1.video-container .middle-size {
    width: 100rem;
}
.large-sketchfab {
    width: 60rem; /* Adjust as needed */
    height: 45rem; /* Adjust as needed */
}

@media (max-width: 1420px) {
    .my-1.video-container .middle-size {
        width: 75rem;
    }
}

@media (max-width: 1280px) {
    .my-1.video-container .middle-size {
        width: 65rem;
    }
}

@media (max-width: 1024px) {
    .my-1.video-container .middle-size {
        width: 60rem;
    }
}

@media (max-width: 860px) {
    .my-1.video-container .middle-size {
        width: 50rem;
    }
    .large-sketchfab {
        width: 50rem; /* Adjust as needed */
        height: 37.5rem; /* Adjust as needed */
    }
}

@media (max-width: 770px) {
    .my-1.video-container .middle-size {
        width: 47rem;
    }
    .large-sketchfab {
        width: 40rem; /* Adjust as needed */
        height: 30rem; /* Adjust as needed */
    }
}

@media (max-width: 560px) {
    .my-1.video-container .middle-size {
        width: 35rem;
    }
    .large-sketchfab {
        width: 30rem;
        height: 22.5rem;
    }
}

@media (max-width: 370px) {
    .my-1.video-container .middle-size {
        width: 25rem;
    }
    .large-sketchfab {
        width: 23rem;
        height: 17.25rem;
    }
}

@media (max-width: 300px) {
    .my-1.video-container .middle-size {
        width: 12rem;
    }
    .large-sketchfab {
        width: 12rem;
        height: 9rem;
    }
}

@media (max-width: 200px) {
    .my-1.video-container .middle-size {
        width: 5rem;
    }
    .large-sketchfab {
        width: 5rem;
        height: 3.75rem;
    }
}

@media (max-width: 100px) {
    .my-1.video-container .middle-size {
        width: 2.5rem;
    }
    .large-sketchfab {
        width: 2.5rem;
        height: 1.875rem;
    }
}
/* ...and so on for other breakpoints */

/* In your CSS file or in a <style> block */
</style>
