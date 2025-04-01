import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './views/FishWelcome.vue';
import FishingHole from 'C:/vueapps/vue-project/trilobyte/src/views/FishingHole.vue';
import CollectionBook from 'C:/vueapps/vue-project/trilobyte/src/views/CollectionBook.vue';
import Login from './views/FishLogin.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/fishing', component: FishingHole },
  { path: '/collection', component: CollectionBook },
  { path: '/login', component: Login }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;