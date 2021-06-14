import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null    // 追記
  },
  mutations: {
    setUser(state, user) {    // 追記
      state.user = user    // 追記
    }    // 追記
  },
  actions: {
  },
  modules: {
  }
})
