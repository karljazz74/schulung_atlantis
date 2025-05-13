// dataService2.js
import { createDirectus, graphql } from '@directus/sdk';
import { ref } from 'vue'; // Import Vue's ref for reactivity
// for global language selection 
import { selectedLanguage } from '@/service/languageState.js';

const VITE_APP_ACCESS_TOKEN = import.meta.env.VITE_APP_ACCESS_TOKEN;
const VITE_APP_GRAPHQL_ENDPOINT = import.meta.env.VITE_APP_GRAPHQL_ENDPOINT;

export const client = createDirectus(VITE_APP_GRAPHQL_ENDPOINT).with(graphql());
console.log('Directus client initialized:', client);

// Add your fetchImageFromDirectus function here
export const fetchImageFromDirectus = (id, key = 'bild-small') => {
    const baseURL = 'https://directus.uxulmassgrave.uni-bonn.de/assets/';
    const fullURL = `${baseURL}${id}?${key}`;
    console.log('Constructed image URL:', fullURL);
    return fullURL;
};

export async function fetchData(languageCode = selectedLanguage.value) {
    try {
        const query = `query {
            records(limit: 500) {
                  id_record
                  find_location
                  lote_number
                  translations_records(filter: { languages_code: { code: { _eq: "${languageCode}" } } }) { 
                      languages_code {
                          code
                      }
                      tr_description
                      tr_informe_designation
                      tr_obj_label
                      tr_obj_name
                  }
                  fk_category {
                      TranslationCat: translations(filter: { languages_code: { code: { _eq: "${languageCode}" } } }) {
                          obj_categories
                          obj_description
                          
                      }
          
                  }
                  obj_designation
                  date_documented_clean
                  fk_files_images {
                      directus_files_id {
                          id
                          image_number
                          translations(filter: {languages_code: {code: {_eq: "${languageCode}"}}}) {
                              figure_caption_name
                              languages_code {
                                  code
                              }
                          }
                      }
                  }
              }
          }
        `;
        // Fetch data using `fetch` with Authorization header
        const response = await fetch(VITE_APP_GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${VITE_APP_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({ query }),
        });
        console.log('Token:', VITE_APP_ACCESS_TOKEN);
        console.log('Full GraphQL Response:', response); // Add this line to log the response

        // Change this block of code
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const jsonResponse = await response.json(); // Parse the JSON from the response
        console.log('Parsed JSON Response:', jsonResponse); // Log the parsed JSON response

        const recordsData = jsonResponse?.data?.records || null; // Access records data from the parsed JSON

        console.log('response.data structure:', JSON.stringify(recordsData, null, 2)); // <-- Add this line
        console.log('response.data.records:', recordsData); // <-- Add this line

        // Check if records data exists
        if (recordsData) {
            console.log('Returning from fetchData:', recordsData); // <-- Add this line here
            return recordsData;
        } else {
            console.error('records not found in response:', response);
            throw new Error('records data not found');
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
        const apiData = await fetchData();

        // Find the translation object that matches the specified language code
        const translationData = apiData.translations.find((translation) => {
            return translation.languages_code === languageCode;
        });

        // Return the data if found, otherwise return null or a default object
        return ref(translationData || null);
    } catch (error) {
        console.error('Error in fetchrecordsData: ', error);
        throw error;
    }
}
