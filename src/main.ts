import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Vuetify, {createVuetify} from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
// @ts-ignore
import App from './App.vue';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';


const vuetify = createVuetify({
    components,
    directives,
});



const app = createApp(App);

app.use(createPinia());
app.use(vuetify);

app.mount('#app');
