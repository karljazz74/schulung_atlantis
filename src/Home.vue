<template>
    <div class="card flex justify-content-center custom-padding">
        <div class="flex items-left w-full">
            <!-- Logo Image -->
            <!-- <a href="https://www.bcdh.uni-bonn.de/de/forschung/uxulmassgrave" target="_blank" class="custom-link" @mouseover="showOverlay" @mouseout="hideOverlay">-->
            <div>
                <img :alt="'logo1'" :src="assetsURL" height="120" class="mr-2" />
                <div class="overlay-text" v-show="hovered">{{ t('logo.hover') }}</div>
            </div>
            <div>
                <img :alt="'logo2'" :src="assetsURL2" height="120" class="mr-2" />
                <div class="overlay-text" v-show="hovered">{{ t('logo.hover') }}</div>
            </div>
            <!--</a>-->
            <!-- Menubar for Navigation -->
            <Menubar :model="items" class="flex-grow" :class="menubarTheme.root.class.join(' ')">
                <!-- Add logos here -->
            </Menubar>

            <!-- Language Selector (Dropdown) -->
            <Dropdown v-model="selectedCountry" :options="countries" optionLabel="name" :placeholder="t('menu.selectLanguage')" class="language-dropdown w-full md:w-14rem mr-4 centered-dropdown">
                <template #value="slotProps">
                    <div v-if="slotProps.value" class="flex align-items-center">
                        <div :class="`mr-2 flag flag-${slotProps.value.code.toLowerCase()}`" style="width: 18px; height: 12px"></div>
                        <div>{{ slotProps.value.name }}</div>
                    </div>
                    <span v-else>
                        {{ slotProps.placeholder }}
                    </span>
                </template>
            </Dropdown>
            <!-- User Login Section -->
            <!-- User Details Card when Logged In -->

            <div class="user-login-section flex flex-row justify-content-between">
                <!-- this is line 47 -->
                <!-- If the user is logged in -->
                <Button icon="pi-power-off" v-if="isLoggedIn" :label="t('menu.ausloggen')" @click="handleLogout" class="login-button" />

                <!-- Button to trigger the OverlayPanel -->
                <Button icon="pi pi-user" v-else :label="t('menu.einloggen')" @click="toggleOverlayPanel" aria-haspopup="true" aria-controls="overlay_menu" class="login-button" />

                <div>
                    <!-- this is for the overlay setup, though it seems there might be missing content here -->
                    <!-- Login Popup -->
                    <div>
                        <!-- this is line 67 -->
                        <OverlayPanel ref="overlayPanel">
                            <div class="flex flex-column md:flex-row">
                                <div class="w-full md:w-6 flex flex-column align-items-center justify-content-center gap-3 py-5">
                                    <div class="flex align-items-center gap-2">
                                        <label>{{ t('menu.email') }}</label>
                                        <InputText v-model="email" id="username" />
                                    </div>
                                    <div class="flex align-items-center gap-2">
                                        <label>{{ t('menu.password') }}</label>
                                        <Password v-model="password" toggleMask id="password" class="w-full" />
                                    </div>
                                    <!-- this is line 78 -->
                                    <Button :label="t('menu.einloggen')" icon="pi pi-user" class="w-10rem" @click="handleLogin"></Button>
                                </div>
                                <!-- this is line 80 -->
                            </div>
                        </OverlayPanel>
                    </div>
                    <!-- this is line 83 -->
                </div>
                <Card v-if="isLoggedIn" class="w-15rem md:w-1/3 lg:w-1/4">
                    <div class="card">
                        <!-- this is line 37 -->
                        <div class="flex flex-wrap gap-5 ml-4 w-15rem">
                            <div class="flex-auto">
                                <h5>{{ t('menu.greeting') + ' ' + directus_users.firstname + '!' }}</h5>
                                <Avatar :image="directus_users.avatar" class="mr-2" size="xlarge" shape="circle" />
                                <h3>{{ directus_users.role }}</h3>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </div>

    <Card class="galleria-card">
        <!-- You can set the title if required -->
        <template #content>
            <div class="card-galleria md:flex md:justify-content-center">
                <Galleria
                    class="galleria-contents"
                    :value="galleriaImages"
                    :responsiveOptions="responsiveOptions"
                    :numVisible="4"
                    :showThumbnails="false"
                    :showIndicators="true"
                    :showItemNavigators="true"
                    :changeItemOnIndicatorHover="true"
                    :indicatorsPosition="inside"
                    containerStyle="max-width: 640px"
                    :circular="true"
                    :autoPlay="true"
                    :transitionInterval="1700"
                >
                    <template #item="slotProps">
                        <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" style="height: 100%; width: auto; display: block" />
                    </template>

                    <template #thumbnail="slotProps">
                        <img class="galleria-thumbnail" :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" style="height: 100%; width: auto; display: block" />
                    </template>
                </Galleria>
            </div>
        </template>
    </Card>
    <div class="page-headers p-col-6">
        <h1 class="large-h1">{{ t('project.Title') }}</h1>
        <h3 class="large-h3">{{ t('project.subTitle') }}</h3>
    </div>
    <div class="p-grid">
        <div class="p-col-6 left-column">
            <Card style="width: 30em">
                <template #header>
                    <img alt="Directus CMS" :src="cardURL" class="card-image" style="width: 45em" />
                </template>
                <template #title> {{ t('project.cardHeader') }} </template>
                <template #subtitle> {{ t('project.cardSubtitle') }} </template>
                <template #content>
                    <p class="larger-text">
                        {{ t('project.cardCaption') }}
                        <a :href="'https://directus.io/'" target="_blank">https://directus.io/</a>
                    </p>
                </template>
            </Card>
        </div>
        <div class="page-headers2 p-col-6 right-column">
            <h4 class="header-key">
                {{ t('project.ProjectDirection-Key') }} &nbsp; <span class="header-value">{{ t('project.ProjectDirection-Value') }}</span>
            </h4>
            <h4 class="header-key">
                {{ t('project.ProjectStaff-Key') }} &nbsp; <span class="header-value">{{ t('project.ProjectStaff-Value') }}</span>
            </h4>
            <h4 class="header-key">
                {{ t('project.ProjectLinks-Key') }} &nbsp;
                <span class="header-value"
                    ><a :href="'https://www.uni-bonn.de/de/forschung-lehre/forschungsprofil/transdisziplinaere-forschungsbereiche/tra5/research-profile'" target="_blank">
                        {{ t('project.ProjectLinks-Value1') }}
                    </a>
                    &nbsp;
                    <a :href="'https://www.uni-bonn.de/de'" target="_blank">
                        {{ t('project.ProjectLinks-Value2') }}
                    </a></span
                >
            </h4>
            <p class="project-description">{{ t('project.projectDescription') }}</p>

            <Accordion headerClass="accordion-header" :multiple="false">
                <AccordionTab headerClass="accordion-header" :header="t('project.furtherInformation')">
                    <h3 class="header-key">{{ t('project.header1') }}</h3>
                    <span class="header-value content-text"> {{ t('project.content1') }} </span>

                    <h3 class="header-key">{{ t('project.header2') }}</h3>
                    <span class="header-value content-text"> {{ t('project.content2') }} </span>

                    <h3 class="header-key">{{ t('project.header3') }}</h3>
                    <span class="header-value content-text"> {{ t('project.content3') }} </span>

                    <h3 class="header-key">{{ t('project.header4') }}</h3>
                    <span class="header-value content-text"> {{ t('project.content4') }} </span>
                </AccordionTab>
            </Accordion>
        </div>
    </div>
    <div class="p-grid">
        <div class="p-col-4" v-for="person in participants" :key="person.id">
            <Card>
                <img :src="person.imageSrc" alt="Profile Picture" />
                <h3>{{ person.name }}</h3>
                <p>{{ person.role }}</p>
                <p>{{ person.email }}</p>
                <p>{{ person.phone }}</p>
            </Card>
        </div>
    </div>
</template>
<script>
import { ref, watch, computed, onMounted } from 'vue';
// to store API variables & session tokens
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { createDirectus } from '@directus/sdk';
import { authentication } from '@directus/sdk/auth';
import OverlayPanel from 'primevue/overlaypanel';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Dropdown from 'primevue/dropdown';
import Menubar from 'primevue/menubar';
import Galleria from 'primevue/galleria';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Card from 'primevue/card';

const client = createDirectus('https://directus.uxulmassgrave.uni-bonn.de').with(authentication());

export default {
    name: 'YourComponentName', // generic name, update for prod version
    client,
    components: {
        Dropdown,
        Menubar,
        Button,
        Galleria,
        Accordion,
        AccordionTab,
        Card,
        OverlayPanel, // <-- Add this line
        InputText, // <-- Add this line
        Password,
    },

    setup() {
        const directus_users = ref({
            firstname: '',
            lastname: '',
            avatar: '', //assuming Directus has an avatar or profile picture field
            role: '', // this may need further adjustment depending on the exact schema of your Directus users
        });
        // eslint-disable-next-line no-unused-vars
        const email = ref(''); // User's email
        // eslint-disable-next-line no-unused-vars
        const password = ref(''); // User's password
        const overlayPanel = ref(null);
        const toggleOverlayPanel = (event) => {
            console.log('Current value of overlayPanel:', overlayPanel.value);
            if (overlayPanel.value) {
                overlayPanel.value.toggle(event);
            } else {
                console.warn('overlayPanel is not set correctly.');
            }
        };

        watch(overlayPanel, (newVal) => {
            console.log('overlayPanel ref changed:', newVal);
        });
        // Reactive reference to track login state (if needed)
        const isLoggedIn = ref(false);
        const { locale, t } = useI18n({
            inheritLocale: true,
            useScope: 'global',
        });

        const selectedCountry = ref();
        // this is line 163

        const countries = computed(() => [
            { name: t('language.german'), code: 'DE', lang: 'de' },
            { name: t('language.english'), code: 'US', lang: 'en' },
            { name: t('language.spanish'), code: 'MX', lang: 'es' },
            { name: t('language.french'), code: 'FR', lang: 'fr' },
            // ... other languages
        ]);

        // New code to add: watch isLoggedIn for changes
        watch(isLoggedIn, (newVal) => {
            if (newVal === true) {
                // Close the overlay panel
                overlayPanel.value.hide();
            }
        });

        // Set default value for selectedCountry
        const defaultCountry = countries.value.find((country) => country.code === 'DE');
        selectedCountry.value = defaultCountry;

        // For holding the assets URL requests to Directus CMS
        const assetsURL = ref(null);
        const assetsURL2 = ref(null); // new logo added

        const cardURL = ref(null);
        const galleriaImages = ref([]);

        // Directus SDK, State for error message
        const error = ref('');

        const jwtToken = ref(''); // to store the JWT token

        const handleLogin = async () => {
            console.log('handleLogin triggered');
            console.log(client);

            try {
                console.log('Attempting to login with', email.value, password.value);
                const response = await client.login(email.value, password.value);
                isLoggedIn.value = true;
                jwtToken.value = response.data.access_token;

                await fetchUserAndRoleDetails();

                // New code: Update the store state when the login is successful
                if (isLoggedIn.value) {
                    // Assuming you have 'setUser' mutation and 'user' state in your store
                    // For this, you would also need to import the store if you haven't
                    // e.g., import store from "@/store"; at the top of your script
                    // store.commit('setUser', directus_users.value);
                }
            } catch (err) {
                console.error('Login error:', err);
                error.value = 'Failed to login. Please check your credentials and try again.';
            }
        };

        const fetchUserAndRoleDetails = async () => {
            try {
                // Use the JWT token to fetch user details
                const userResponse = await fetch('https://directus.uxulmassgrave.uni-bonn.de/users/me', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${jwtToken.value}`,
                    },
                });
                const userData = await userResponse.json();

                const { firstname, lastname, avatar, role } = userData.data; // Assuming Directus returns an avatar field, adjust if not.

                // Update the directus_users ref with the user details
                directus_users.value.firstname = firstname;
                directus_users.value.lastname = lastname;
                directus_users.value.avatar = avatar; // Adjust this if Directus returns a different field for user images.

                // Use the foreign key from user details to fetch the role details
                const roleResponse = await fetch(`https://directus.uxulmassgrave.uni-bonn.de/roles/${role}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${jwtToken.value}`,
                    },
                });
                const roleData = await roleResponse.json();

                // Assuming roleData contains a field called 'name' which denotes the name of the role.
                directus_users.value.role = roleData.data.name;
                console.log('Updated directus_users:', directus_users.value);
            } catch (err) {
                console.error('Failed to fetch user details and role:', err);
            }
        };

        // This method fetches an image from Directus based on its asset ID
        // Fetch image function with the Bearer Token

        const fetchImageFromDirectus = async (id, key = null) => {
            const baseURL = 'https://directus.uxulmassgrave.uni-bonn.de/assets/';
            const fullURL = `${baseURL}${id}?${key}`;

            try {
                const response = await fetch(fullURL);
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            } catch (error) {
                console.error('Error fetching image:', error);
                return null;
            }
        };

        onMounted(async () => {
            console.log(overlayPanel.value);
            console.log('User First Name:', directus_users.value.firstname);
            console.log('User Role:', directus_users.value.role);
            // Fetching the logosetMenuItems
            assetsURL.value = await fetchImageFromDirectus('d81380dc-6cb4-4670-98cc-120499cddda2?preset-1');
            assetsURL2.value = await fetchImageFromDirectus('cb2a7a11-2ed6-40d5-be86-9afc69669a5b?preset-1');
            // Fetching the image for the Card
            cardURL.value = await fetchImageFromDirectus('6447a2a7-cd03-43fd-b15b-c32589e630e8'); // Replace ASSET_ID_FOR_THE_CARD with the actual asset ID.

            // List of asset IDs for Galleria images
            const galleriaAssetIDs = ['ab0075c0-2d81-418c-8fa6-b7055ffcd7e7', '03c6ec0b-9761-48eb-b2a4-009d1bb89560', 'ce9bd069-7922-4bed-b102-5c444a7e70fe', '6e451d7c-aea3-4c06-bb84-0e2b990d77cf'];

            // Fetching images for Galleria
            for (const assetID of galleriaAssetIDs) {
                const imageUrl = await fetchImageFromDirectus(assetID);
                const thumbnailUrl = await fetchImageFromDirectus(assetID, true);
                if (imageUrl && thumbnailUrl) {
                    galleriaImages.value.push({
                        itemImageSrc: imageUrl,
                        thumbnailImageSrc: thumbnailUrl,
                        alt: 'Description', // Modify as needed
                    });
                }
            }
        });

        // mouse hover event
        const hovered = ref(false);

        const showOverlay = () => {
            hovered.value = true;
        };

        const hideOverlay = () => {
            hovered.value = false;
        };

        const menubarTheme = ref({
            root: {
                class: ['p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-blue-900/40 rounded-md', 'flex items-center relative'],
            },
            // ... other styles as required
        });
        const router = useRouter();
        const navigateToLearn = () => {
            console.log('Trying to navigate to /learn');
            router.replace({ path: '/learn' }).catch((err) => console.error(err));
        };

        function setMenuItems() {
            return [
                { label: t('menu.home'), icon: 'pi pi-fw pi-home', class: 'custom-menu-item' },
                {
                    label: t('menu.basaCollection'),
                    icon: 'pi pi-fw pi-images',
                    class: 'custom-menu-item',
                    command: () => {
                        window.open('https://www.iak.uni-bonn.de/de/museen/basa-museum-bonner-amerikas-sammlung');
                    },
                },
                {
                    label: t('menu.directusCMS'),
                    icon: 'pi pi-fw pi-database',
                    class: 'custom-menu-item',
                    command: () => {
                        window.open('https://directus.uxulmassgrave.uni-bonn.de', '_blank');
                    },
                },
                {
                    label: t('menu.learningMaterials'),
                    icon: 'pi pi-fw pi-folder',
                    class: 'custom-menu-item',
                    command: () => {
                        console.log('Attempting to navigate to /learn');
                        router.replace({ path: '/learn' }).catch((err) => {
                            console.error('Failed to navigate:', err);
                        });
                    },
                },
            ];
        }

        const items = ref(setMenuItems());

        function findCountryByLang(lang) {
            return countries.value.find((country) => country.lang === lang);
        }

        watch(selectedCountry, (newCountry) => {
            if (newCountry) {
                // Update the locale
                locale.value = newCountry.lang;
            }
        });

        watch(locale, async () => {
            // Refresh menu items
            items.value = setMenuItems();

            // Update selectedCountry to reference the object from the new countries array
            if (selectedCountry.value) {
                const currentLang = selectedCountry.value.lang;
                selectedCountry.value = findCountryByLang(currentLang);
            }
        });

        // Galleria (Carousel)
        const images = ref([
            { itemImageSrc: 'path/to/image1.jpg', thumbnailImageSrc: 'path/to/thumb1.jpg', alt: 'Description 1' },
            //... other images
        ]);
        const responsiveOptions = ref([
            // Define your responsive breakpoints and settings here if needed
        ]);

        // Project Description & Accordion
        const yourImageSrc = ref('path/to/projectImage.jpg');
        const imageCaption = ref(t('Your image caption here'));
        const projectHeader = ref(t('Your project title'));
        const projectDescription = ref(t('Brief project description here'));
        const extendedInfo = ref(t('Extended project information here'));

        // Contact Section

        const participants = ref([
            {
                id: 1,
                imageSrc: 'path/to/person1.jpg',
                name: 'John Doe',
                role: 'Project Manager',
                email: 'john@example.com',
                phone: '123-456-7890',
            },
            // ... other participants
        ]);

        return {
            items,
            images,
            responsiveOptions,
            yourImageSrc,
            imageCaption,
            projectHeader,
            projectDescription,
            extendedInfo,
            participants,
            selectedCountry,
            countries,
            menubarTheme,
            t, // <--- Return the t function here
            assetsURL, // <--- to fetch assets from Directus CMS
            assetsURL2, // new logo added uni-bonn
            cardURL, // <--- to fetch assets from Directus CMS
            hovered,
            fetchImageFromDirectus,
            fetchUserAndRoleDetails,
            showOverlay,
            hideOverlay,
            galleriaImages,
            error,
            email,
            password,
            isLoggedIn,
            handleLogin,
            overlayPanel,
            toggleOverlayPanel,
            directus_users,
            navigateToLearn,
        };
    },
};
</script>
