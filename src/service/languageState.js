// languageState.js
import { ref, reactive } from 'vue';

export const selectedLanguage = ref('en-US'); // Default language
export const languageEventBus = reactive({ currentLanguage: 'en-US' });
export const imageMetadata = reactive({ data: [] }); // Store image metadata

// Create an event emitter

export function setLanguage(langObject) {
    selectedLanguage.value = langObject;
    localStorage.setItem('selectedLanguage', langObject.lang);
    languageEventBus.currentLanguage = langObject.lang; // Make sure langObject.lang is 'en', 'de', 'es', 'fr', etc.
    console.log('Language set to:', langObject.lang); // For debugging
}

export function setImageMetadata(metadata) {
    imageMetadata.data = metadata;
    console.log('setImageMetadata called:', imageMetadata.data);
}

export function getImageMetadata() {
    console.log('getImageMetadata returned:', imageMetadata.data);
    return imageMetadata.data;
}

export function getStoredLanguage() {
    return localStorage.getItem('selectedLanguage') || 'en-US';
}
