import { createDirectus, graphql } from '@directus/sdk';

const VITE_APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const VITE_APP_ACCESS_TOKEN = import.meta.env.VITE_APP_ACCESS_TOKEN;

console.log('GraphQL Endpoint:', VITE_APP_BASE_URL);
console.log('Access Token:', VITE_APP_ACCESS_TOKEN);

export const client = createDirectus(VITE_APP_BASE_URL).with(
    graphql({
        headers: {
            Authorization: `Bearer ${VITE_APP_ACCESS_TOKEN}`,
        },
    })
);
console.log('Directus client initialized:', client);
