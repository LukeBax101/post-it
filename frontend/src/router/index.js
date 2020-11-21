import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/results',
    name: 'Results',
    // route level code-splitting
    // this generates a separate chunk (sessions.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "sessions" */ '../views/Results.vue'),
    // meta: {
    //   Legend: 'slide-right',
    //   Settings: 'slide-right',
    // },
  },
  {
    path: '/play-area',
    name: 'PlayArea',
    // route level code-splitting
    // this generates a separate chunk (live.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "live" */ '../views/PlayArea.vue'),
    // meta: {
    //   Graph: 'slide-left',
    //   Settings: 'slide-right',
    // },
  },
  {
    path: '/lobby',
    name: 'Lobby',
    // route level code-splitting
    // this generates a separate chunk (settings.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "settings" */ '../views/Lobby.vue'),
    // meta: {
    //   Legend: 'slide-left',
    //   Graph: 'slide-left',
    // },
  },
];

const router = new VueRouter({
  routes,
});

export default router;
