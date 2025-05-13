// dataService2.js
import { createDirectus, graphql } from '@directus/sdk';
import { ref } from 'vue'; // Import Vue's ref for reactivity
// for global language selection
import { selectedLanguage } from '@/service/languageState';

const VITE_APP_ACCESS_TOKEN = import.meta.env.VITE_APP_ACCESS_TOKEN;
const VITE_APP_GRAPHQL_ENDPOINT = import.meta.env.VITE_APP_GRAPHQL_ENDPOINT;

// from Home.vue

export const client = createDirectus(VITE_APP_GRAPHQL_ENDPOINT).with(graphql());
console.log('Directus client initialized:', client);

// Modified fetchImageFromDirectus function
export const fetchImageFromDirectus = (id, key = 'bild-galleria') => {
    const baseURL = 'https://directus.uxulmassgrave.uni-bonn.de/assets/';
    const fullURL = `${baseURL}${id}?${key}`;
    console.log('Constructed image URL:', fullURL);
    return fullURL;
};

export async function fetchPosts(recordId, languageCode = selectedLanguage.value.lang) {
    languageCode = languageCode || 'en-US';
    console.log('languageCodeVar:', languageCode);
    if (!recordId || !languageCode) {
        console.error('Invalid input parameters:', { recordId, languageCode }); // this is line 25
        return null;
    }
    try {
        const query = `query GetRecordById($recordId: ID!, $languageCode: String!) {
            records_by_id(id: $recordId) {
                  id_record
                  find_location
                  lote_number
                  set_timestamp
                  sketchfab
                  sketchfab_source
                  fk_users {
                    first_name
                    last_name
                    avatar {
                        id
                    }
                }
                  translations_records(filter: { languages_code: { code: { _eq: $languageCode } } }) { 
                      languages_code {
                          code
                      }
                      tr_description
                      tr_informe_designation
                      tr_obj_label
                      tr_obj_name
                  }
                  fk_category {
                      TranslationCat: translations(filter: { languages_code: { code: { _eq: $languageCode } } }) {
                          obj_categories
                          obj_description
                          
                      }
          
                  }
                  obj_designation
                  date_documented_clean_new
                  fk_files_images {
                      directus_files_id {
                          id
                          image_number
                          translations(filter: {languages_code: {code: { _eq: $languageCode }}}) {
                              figure_caption_name
                              meta_object
                              meta_caption
                              meta_author
                              languages_code {
                                  code
                              }
                          }
                      }
                  }
              }
          }
        `;
        const variables = {
            recordId: recordId, // Replace with actual record ID
            languageCode: languageCode, // Use the languageCode parameter
        };
        // Fetch data using `fetch` with Authorization header
        const response = await fetch(VITE_APP_GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${VITE_APP_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({ query, variables }),
        });
        console.log('Token:', VITE_APP_ACCESS_TOKEN);
        console.log('Full GraphQL Response:', response); // Add this line to log the response

        // Change this block of code
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const jsonResponse = await response.json();
        console.log('Full JSON Response2:', jsonResponse); // Add this line to log the full response

        const recordData = jsonResponse?.data?.records_by_id || null; // Access records data from the parsed JSON
        if (!recordData) {
            console.warn('No data found for record ID:', recordId);
            return null; // or return a default object structure
        }

        console.log('response.data structure:', JSON.stringify(recordData, null, 2)); // <-- Add this line
        console.log('response.data.records:', recordData); // <-- Add this line

        // Check if records data exists
        if (recordData) {
            console.log('Returning from fetchPosts:', recordData); // <-- Add this line here
            return recordData;
        } else {
            console.error('records_by_id not found in response:', response); // this is line 97
            throw new Error('records_by_id data not found');
        }
    } catch (error) {
        console.error('Client State: ', client);
        console.error('Error fetching data: ', error);
        throw error;
    }
}

export async function fetchrecordsData(languageCode = 'de-DE') {
    // Default language
    try {
        const apiData = await fetchPosts();

        // Find the translation object that matches the specified language code
        const translationData = apiData.translations.find((translation) => {
            return translation.languages_code === languageCode;
        });

        // Return the data if found, otherwise return null or a default object
        return ref(translationData || null);
    } catch (error) {
        console.error('Error in fetchPosts: ', error);
        throw error;
    }
}
