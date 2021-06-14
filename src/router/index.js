import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import store from '../store'
import { AmplifyEventBus, AmplifyPlugin, components } from 'aws-amplify-vue'
import * as AmplifyModules from 'aws-amplify'
Vue.use(AmplifyPlugin, AmplifyModules)
Vue.use(VueRouter)
let user

function getUser() {
  return Vue.prototype.$Amplify.Auth.currentAuthenticatedUser()
    .then((data) => {
      if (data && data.signInUserSession) {
        store.commit('setUser', data);
        return data;
      }
    }).catch(() => {
      store.commit('setUser', null);
      return null;
    });
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'auth',
    component: components.Authenticator
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// ユーザー管理
getUser().then((user) => {
  if (user) {
    router.push({ path: '/' }, () => { }, () => { });
  }
});

// ログイン状態管理
AmplifyEventBus.$on('authState', async (state) => {
  if (state === 'signedOut') {
    user = null;
    store.commit('setUser', null);
    router.push({ path: '/auth' }, () => { }, () => { });
  } else if (state === 'signedIn') {
    user = await getUser();
    router.push({ path: '/' }, () => { }, () => { });
  }
});

router.beforeResolve(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    user = await getUser();
    if (!user) {
      return next({
        path: "/auth",
        query: {
          redirect: to.fullPath
        }
      });
    }
    return next();
  }
  return next();
});

export default router
