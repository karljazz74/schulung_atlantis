// useThemeToggle.js
import { ref } from 'vue';
import { useLayout } from '@/layout/composables/layout';

export default function useThemeToggle() {
    const { layoutConfig } = useLayout();
    const colorScheme = ref(layoutConfig.colorScheme.value);

    const changeColorScheme = (scheme) => {
        const themeLink = document.getElementById('theme-link');
        if (!themeLink) return;

        const themeLinkHref = themeLink.getAttribute('href');
        const currentColorScheme = 'theme-' + layoutConfig.colorScheme.value;
        const newColorScheme = 'theme-' + scheme;
        const newHref = themeLinkHref.replace(currentColorScheme, newColorScheme);

        // Replace the stylesheet link
        themeLink.setAttribute('href', newHref);
        layoutConfig.colorScheme.value = scheme;

        // If you want to ensure the theme persists across sessions, you can store it in localStorage
        localStorage.setItem('theme', scheme);
    };

    const toggleTheme = () => {
        const newScheme = colorScheme.value === 'dark' ? 'light' : 'dark';
        changeColorScheme(newScheme);
        colorScheme.value = newScheme;
    };

    return {
        colorScheme,
        changeColorScheme,
        toggleTheme,
    };
}
