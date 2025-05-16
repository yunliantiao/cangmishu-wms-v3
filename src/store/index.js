import { createStore } from 'vuex'
import router from '../router'
import { Notify } from 'quasar'
// 创建store实例
export default createStore({
  state: {
    leftDrawerOpen: true, // 侧边栏默认打开
    token: "",
    btnLoading: false,
    updateGlobalLoading: false,
    userInfo: {},
    areaTypeOptions: [
      { label: "拣货区", value: "picking" },
      { label: "备货区", value: "staging" },
      { label: "不良品区", value: "defective" },
      { label: "转运区", value: "transit" },
    ],
    countries: [],
    // 搜索类型选项
    searchTypeOptions: [
      { label: '名字搜索', value: 'name' },
      { label: 'SKU搜索', value: 'sku' }
    ],

    // 搜索模式选项
    searchModeOptions: [
      { label: '精确搜索', value: 'exact' },
      { label: '模糊搜索', value: 'fuzzy' },
      { label: '前缀搜索', value: 'prefix' }
    ],
    dateTypeOptions: [
      { label: '创建时间', value: 'created_at' },
      { label: '更新时间', value: 'updated_at' }
    ],
    timezones: [],
    language: 'zh_CN',
  },
  getters: {
    isLeftDrawerOpen: (state) => state.leftDrawerOpen,
    getToken: (state) => state.token,
    getUserInfo: (state) => state.userInfo,
  },
  mutations: {
    setTransform(state, data) {
      state.transform = data
    },
    changeLanguage(state, data) {
      state.language = data
    },
    updateGlobalLoading(state, data) {
      state.globalLoading = data
    },
    updateGlobalBtnLoading(state, data) {
      state.btnLoading = data
    },
    // 设置侧边栏状态
    SET_LEFT_DRAWER(state, isOpen) {
      state.leftDrawerOpen = isOpen
    },
    // 切换侧边栏状态
    TOGGLE_LEFT_DRAWER(state) {
      state.leftDrawerOpen = !state.leftDrawerOpen
    },
    // 更新token
    UPDATE_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem('updateToken', token)
    },
    // 更新用户信息
    UPDATE_USER_INFO(state, user) {
      state.userInfo = user;
      localStorage.setItem('updateUserInfo', JSON.stringify(user))
    },
    // 清除token
    CLEAR_TOKEN(state) {
      state.token = "";
      localStorage.removeItem('updateToken');
      localStorage.removeItem('warehouseId')
    },
    // 清除用户信息
    CLEAR_USER_INFO(state) {
      state.userInfo = {};
      localStorage.removeItem('updateUserInfo');
    },
    DESTROY_TOKEN(state, data) {
      state.token = ''
      localStorage.removeItem('updateUserInfo')
      localStorage.removeItem('updateToken')
      localStorage.removeItem('warehouseId')
      Notify.create({
        message: '登录失败',
        color: 'negative',
      })
      router.push('/login')
    },
    SET_COUNTRIES(state, data) {
      state.countries = data
    },
    SET_TIMEZONES(state, data) {
      state.timezones = data
    },
  },
  actions: {
    initApp({ commit }) {
      if (localStorage.getItem('updateToken')) {
        commit('UPDATE_TOKEN', localStorage.getItem('updateToken'))
      }
    },
    initLoginAfterInfo({ commit }) {
      let userInfo = localStorage.getItem('updateUserInfo')
      if (userInfo) {
        commit('UPDATE_USER_INFO', JSON.parse(userInfo))
      }
    },
    // 设置侧边栏状态的异步操作
    setLeftDrawer({ commit }, isOpen) {
      commit('SET_LEFT_DRAWER', isOpen)
    },
    // 切换侧边栏状态的异步操作
    toggleLeftDrawer({ commit }) {
      commit("TOGGLE_LEFT_DRAWER");
    },
    // 更新token的异步操作
    updateToken({ commit }, token) {
      commit("UPDATE_TOKEN", token);
    },
    // 登出操作
    logout({ commit }) {
      commit("CLEAR_TOKEN");
      commit("CLEAR_USER_INFO");
      router.push('/login');
    },
  },
  modules: {},
});

